import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { ServerConnector } from './ServerConnector'
import { config, splitContent } from './utils'
import {
	ServerStatus,
	ServerRequest,
	ServerResponse,
	DocumentSchema,
	DocumentContentSchema
} from '$shared/types'
import { setupPythonServer, startEmbeddingServer } from './Backend'
import { Delay } from './utils'
import { db } from './Connector'
import { BatchMatches, Index, MetricKind } from 'usearch'
import { existsSync } from 'fs'
import type { ResultType, SearchDocument } from '$shared/types'

let mainWindow: BrowserWindow
let serverConnector: ServerConnector
let index: Index
const requestQ: ServerRequest[] = []

// let metadb: lancedb.Connection
// const schema = new arrow.Schema([
// 	new arrow.Field('id', new arrow.Utf8(), false),
// 	new arrow.Field('title', new arrow.Utf8(), true),
// 	new arrow.Field('mime', new arrow.Utf8(), true),
// 	new arrow.Field('deleted', new arrow.Bool(), false),
// 	new arrow.Field('deletedTimeLeft', new arrow.Int32(), false),
// 	new arrow.Field(
// 		'vector',
// 		new arrow.FixedSizeList(768, new arrow.Field('item', new arrow.Float32(), true))
// 	)
// ])
// let table: lancedb.Table

function createWindow(): void {
	// Create the browser window.
	console.time('mainWindow.show')
	mainWindow = new BrowserWindow({
		width: 1600,
		height: 900,
		minWidth: 800,
		minHeight: 600,
		show: false,
		frame: true,
		autoHideMenuBar: true,
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			sandbox: false,
			devTools: is.dev
		}
	})

	mainWindow.on('ready-to-show', () => {
		mainWindow.show()
		mainWindow.setMenuBarVisibility(false)
		if (is.dev) mainWindow.webContents.openDevTools()
		console.timeEnd('mainWindow.show')
	})

	mainWindow.on('show', () => {
		setupPythonServer(is.dev).then((value: boolean) => {
			startEmbeddingServer(value)
		})
		serverConnector.connect(config.serverAddress.port, config.serverAddress.host).then(() => {
			console.log('Connected to server')
		})
	})

	mainWindow.on('close', () => {
		serverConnector.connected && serverConnector.sendCommand('Quit')
		index.save(config.indexFile)
		mainWindow.destroy()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		console.log(process.env['ELECTRON_RENDERER_URL'])
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
	// Set app user model id for windows
	electronApp.setAppUserModelId('com.semantic.app')

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	// IPC test
	// ipcMain.on('ping', () => console.log('pong'))
	//ipcMain.on('embedding-server', (_, args: ServerMessageData) => {
	//serverConnector.send(args)
	//})

	// ipcMain.on('db', (event) => {
	//   if (db) {
	//     event.returnValue = db.id
	//   }

	// startStatusNotifier()
	ipcMain.handle('close-window', () => {
		app.quit()
	})
	ipcMain.handle('minimize-window', () => {
		mainWindow.minimize()
	})
	ipcMain.handle('maximize-window', () => {
		if (mainWindow.isMaximized()) {
			mainWindow.unmaximize()
		} else {
			mainWindow.maximize()
		}
	})
	ipcMain.handle('server-status', getDBStatus)
	ipcMain.handle('fetch-documents', fetchDocuments)
	ipcMain.handle('get-document', (_, id: number) => getDocument(id))
	ipcMain.handle('save-document', (_, documentData: DocumentSchema, content: string) => {
		saveDocument(documentData, content)
	})
	ipcMain.handle('delete-document', (_, id: number) => {
		deleteDocument(id)
	})
	ipcMain.handle('new-document', () => {
		return createNewDocument()
	})
	ipcMain.handle('search-document', (_, term: string) => {
		console.log('Searching for:', term)
		newRequest({ id: 0, isQuery: true, content: term, size: term.length })
	})

	createWindow()

	index = new Index(768, MetricKind.Cos)
	if (existsSync(config.indexFile)) {
		index.load(config.indexFile)
	}

	serverConnector = ServerConnector.getInstance()
	serverConnector.onData(async (data: ServerResponse): Promise<void> => {
		if (data.isQuery) {
			await sendSearchResult(data)
		} else {
			if (index.contains(BigInt(data.id))) {
				index.remove(BigInt(data.id))
			}
			index.add(BigInt(data.id), new Float32Array(data.vector))
		}
	})

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})

	// TODO: Implement the startEmbeddingServer which will pull the server from repository, setup the environment and start the server. And only start the server for all the subsequent runs.
	// startEmbeddingServer()
	// connectToEmbeddingServer()

	// startStatusNotifier()
	db.serialize(() => {
		db.run(`
			CREATE TABLE IF NOT EXISTS Documents (
			document_id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT DEFAULT '',
			mime TEXT NOT NULL DEFAULT 'text/plain',
			deleted BOOLEAN NOT NULL DEFAULT 0,
			deleted_time_left INTEGER DEFAULT 0
			);
			`)

		db.run(`
			CREATE TABLE IF NOT EXISTS DocumentContent (
			content_id INTEGER PRIMARY KEY AUTOINCREMENT,
			document_id INTEGER NOT NULL,
			sequence_number INTEGER NOT NULL,
			content TEXT NOT NULL DEFAULT '',
			FOREIGN KEY (document_id) REFERENCES Documents(document_id) ON DELETE CASCADE
			);
			`)

		// db.run(`
		// 	CREATE VIRTUAL TABLE IF NOT EXISTS DocumentContentFTS USING fts5(
		// 	content,
		// 	content_id UNINDEXED
		// 	);
		// 	`)
	})
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// async function startStatusNotifier(): Promise<void> {
// 	console.log('startStatusNotifier')
// 	while (app)
// 		while (!dbStatus) {
// 			if (mainWindow) {
// 				mainWindow.webContents.send('status', { dbStatus })
// 			}
// 			await new Promise((resolve) => setTimeout(resolve, 1000))
// 		}
// 	if (mainWindow) {
// 		mainWindow.webContents.send('status', { dbStatus })
// 	}
// }

function getDBStatus(): ServerStatus {
	return ServerStatus.RUNNING
	//return ServerStatus[dbStatus ? 'RUNNING' : 'STOPPED']
}

async function fetchDocuments(): Promise<DocumentSchema[]> {
	return new Promise((resolve, reject) => {
		db.all<DocumentSchema>('SELECT * FROM Documents', (err, rows) => {
			if (err) {
				console.log(err)
				reject(err)
			} else {
				console.log(rows)
				resolve(rows)
			}
		})
	})
}

function getDocument(id: number): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		db.all<DocumentContentSchema>(
			`SELECT * FROM DocumentContent
			WHERE document_id = ?
			ORDER BY sequence_number ASC`,
			[id],
			(err, rows) => {
				if (err) {
					console.log(err)
					reject(err)
				} else {
					const content = rows.map((row) => row.content).join(' ')
					console.log(`Sending ${content} for document ${id}`)
					resolve(content)
				}
			}
		)
	})
}

function saveDocument(documentData: DocumentSchema, content: string): void {
	const partitions = splitContent(content, 200) // TODO: Change this to fetch from model currently loaded
	db.serialize(() => {
		db.run('BEGIN TRANSACTION')
		db.run(
			`UPDATE Documents
			SET title = ?, mime = ?, deleted = ?, deleted_time_left = ?
			WHERE document_id = ?`,
			[
				documentData.title,
				documentData.mime,
				documentData.deleted,
				documentData.deleted_time_left,
				documentData.document_id
			],
			(err) => {
				if (err) {
					console.log(err)
				}
			}
		)
		db.run(
			`DELETE FROM DocumentContent
			WHERE document_id = ?`,
			[documentData.document_id],
			(err) => {
				if (err) {
					console.log(err)
				}
			}
		)
		const stmt = db.prepare(
			`INSERT INTO DocumentContent (document_id, sequence_number, content)
			VALUES (?, ?, ?)`
		)
		for (let i = 0; i < partitions.length; i++) {
			stmt.run([documentData.document_id, i, partitions[i]])
		}
		stmt.finalize()
		db.run('END TRANSACTION')
	})
	newRequest({
		id: documentData.document_id,
		size: content.length,
		isQuery: false,
		content: content
	})
}

async function deleteDocument(id: number): Promise<void> {
	db.serialize(() => {
		db.run(
			`UPDATE Documents
			SET deleted = 1, deleted_time_left = 30
			WHERE document_id = ?`,
			[id],
			(err) => {
				if (err) {
					console.log(err)
				}
			}
		)
	})
	// table.update({
	// 	values: {
	// 		deleted: true,
	// 		deletedTimeLeft: 30
	// 	},
	// 	where: `id = ${id}`
	// })
	// console.log(`Document with id: ${id} will be deleted after 30 days`)
}

async function pollRequests(): Promise<void> {
	while (requestQ.length > 0) {
		if (!serverConnector.connected) {
			await Delay(1000)
		} else {
			const request = requestQ.shift()
			if (request) {
				await serverConnector.sendData(request, request.isQuery)
			}
		}
	}
}

function newRequest(request: ServerRequest): void {
	requestQ.push(request)
	pollRequests()
}

async function createResult(key: number, distance: number): Promise<ResultType> {
	return new Promise<ResultType>((resolve, reject) => {
		db.get<Pick<DocumentSchema, 'document_id' | 'mime' | 'title'>>(
			`SELECT document_id, title, mime
			FROM Documents WHERE document_id=?`,
			[key],
			(err, row) => {
				if (err) {
					console.log(err)
					reject(err)
				} else {
					resolve({ ...row, distance })
				}
			}
		)
	})
}

async function sendSearchResult(data: ServerResponse): Promise<void> {
	const response: SearchDocument = { timestamp: Date.now(), documents: [] }
	const result = index.search(new Float32Array(data.vector), 10)
	for (let i = 0; i < result.keys.length; i++) {
		const key = Number(result.keys[i])
		const distance = Number(result.distances[i])
		response.documents.push(await createResult(key, distance))
	}
	mainWindow.webContents.send('search-result', response)
	console.log('Sending search result')
}

function createNewDocument(): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		db.serialize(() => {
			db.run(`INSERT INTO Documents DEFAULT VALUES`, (err) => {
				if (err) {
					reject(err)
				}
			})

			db.get<{ seq: number }>(
				`SELECT seq
				FROM sqlite_sequence
				WHERE name = 'Documents'`,
				(err, row) => {
					if (err) {
						reject(err)
					} else {
						resolve(row.seq)
					}
				}
			)
		})
	})
}
