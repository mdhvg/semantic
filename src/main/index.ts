import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { newRequest, ServerConnector } from './ServerConnector'
import { config } from './utils'
import { ServerResponse, DocumentSchema } from '$shared/types'
// import { setupPythonServer, startEmbeddingServer } from './Backend'
import { log } from './utils'
import { db } from './Connector'
import { Index } from 'usearch'
import type { ServerMessage } from '$shared/types'
import { initiliazeBackend } from './Backend'
import { startServer, stopServer } from './ExtensionServer'
import http from 'http'
import {
	createNewDocument,
	deleteDocument,
	fetchDocuments,
	getDocument,
	saveDocument,
	sendSearchResult
} from './DocumentHandler'
import { loadIndex, saveIndex } from './IndexHandler'

let mainWindow: BrowserWindow
let serverConnector: ServerConnector
let index: Index
let extensionServer: http.Server
const requestQ: ServerMessage[] = []

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
			preload: join(__dirname, '../preload/index.mjs'),
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
		initiliazeBackend(is.dev)
		serverConnector.connect(config.serverAddress.port, config.serverAddress.host).then(() => {
			log('Connected to server')
		})
	})

	mainWindow.on('close', () => {
		serverConnector.connected && serverConnector.sendMessage({ kind: 'COMMAND', command: 'close' })
		saveIndex(index)
		stopServer(extensionServer)
		mainWindow.destroy()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		log(process.env['ELECTRON_RENDERER_URL'])
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
	// ipcMain.on('ping', () => log('pong'))
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
	// ipcMain.handle('server-status', getDBStatus)
	ipcMain.handle('fetch-documents', fetchDocuments)
	ipcMain.handle('get-document', (_, id: number) => getDocument(id))
	ipcMain.handle('save-document', (_, documentData: DocumentSchema, content: string) => {
		saveDocument(documentData, content, index, requestQ)
	})
	ipcMain.handle('delete-document', (_, id: number) => {
		deleteDocument(id)
	})
	ipcMain.handle('new-document', () => {
		return createNewDocument()
	})
	ipcMain.handle('search-document', (_, term: string) => {
		log('Searching for:', term)
		newRequest({ kind: 'QUERY', data: term }, requestQ)
	})

	createWindow()

	startServer().then((server) => {
		extensionServer = server
	})

	index = loadIndex()

	serverConnector = ServerConnector.getInstance()
	serverConnector.onData(async (data: ServerResponse): Promise<void> => {
		if (data.isQuery) {
			await sendSearchResult(data, index, mainWindow)
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

	// TODO: Implement the startEmbeddingServer which will pull the server from repository,
	// setup the environment and start the server. And only start the server for all the subsequent runs.
	// startEmbeddingServer()
	// connectToEmbeddingServer()

	// startStatusNotifier()
	db.serialize(() => {
		db.run(`BEGIN TRANSACTION`)
		db.run(`
			CREATE TABLE IF NOT EXISTS Documents (
			document_id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT DEFAULT '',
			mime TEXT NOT NULL DEFAULT 'text/markdown',
			deleted BOOLEAN NOT NULL DEFAULT 0,
			deleted_time_left INTEGER DEFAULT 0
			);
			`)

		db.run(`
			CREATE TABLE IF NOT EXISTS DocumentContent (
			document_id INTEGER PRIMARY KEY,
			content TEXT NOT NULL DEFAULT '',
			FOREIGN KEY (document_id) REFERENCES Documents(document_id) ON DELETE CASCADE
			);
			`)

		// This database will only be use
		db.run(`
			CREATE TABLE IF NOT EXISTS DocumentChunk (
			content_id INTEGER PRIMARY KEY AUTOINCREMENT,
			document_id INTEGER NOT NULL,
			sequence_number INTEGER NOT NULL,
			plain_text TEXT NOT NULL DEFAULT '',
			UNIQUE (content_id, document_id, sequence_number),
			FOREIGN KEY (document_id) REFERENCES Documents(document_id) ON DELETE CASCADE
			);
			`)

		// db.run(`
		// 	CREATE VIRTUAL TABLE IF NOT EXISTS DocumentChunkFTS USING fts5(
		// 	content,
		// 	content_id UNINDEXED
		// 	);
		// 	`)
	})
	db.run('END TRANSACTION')
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
// 	log('startStatusNotifier')
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

// function getDBStatus(): ServerStatus {
// 	return ServerStatus.RUNNING
//	return ServerStatus[dbStatus ? 'RUNNING' : 'STOPPED']
// }
