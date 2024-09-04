import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/common/icon.png?asset'
import { Orama, insert, search, update, create, Results, Result, TypedDocument } from '@orama/orama'
import { connectToEmbeddingServer, startEmbeddingServer } from './ServerHandler'
import { persistToFile, restoreFromFile } from '@orama/plugin-data-persistence/server'
import { ServerConnector } from './ServerConnector'
import type { ServerMessageData } from './ServerConnector'
import { existsSync, readFileSync, writeFile } from 'fs'
import { config } from '$shared/config'
import { FetchDocument, ServerStatus, MetadataSchema } from '$shared/types'
import { readFile } from 'fs'

let metadb: Orama<typeof MetadataSchema>
let dbStatus: boolean = false
let mainWindow: BrowserWindow
let serverConnector: ServerConnector

function createWindow(): void {
  // Create the browser window.
  console.time('mainWindow.show')
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      devTools: is.dev
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (is.dev) mainWindow.webContents.openDevTools()
    console.timeEnd('mainWindow.show')
  })

  mainWindow.on('close', () => {
    persistToFile(metadb, 'binary', 'metaDb.msp')
    mainWindow.destroy()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
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
  ipcMain.handle('server-status', getDBStatus)
  ipcMain.handle('fetch-documents', fetchDocuments)
  ipcMain.handle('get-document', (_, id: string) => getDocument(id))
  ipcMain.handle('save-document', (_, id: string, content: string) => {
    saveDocument(id, content)
  })

  createWindow()

  //serverConnector = ServerConnector.getInstance()
  //serverConnector.connect()

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // TODO: Implement the startEmbeddingServer which will pull the server from repository, setup the environment and start the server. And only start the server for all the subsequent runs.
  // startEmbeddingServer()
  // connectToEmbeddingServer()

  // startStatusNotifier()
  metadb = await createOrLoadDB()
  await insert(metadb, {
    id: 'nig',
    title: 'omg',
    mime: 'text/plain',
    deleted: false,
    deletedTimeLeft: 1,
    vector: [...Array(1000).keys()]
  })

  fetchDocuments()
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

async function startStatusNotifier(): Promise<void> {
  console.log('startStatusNotifier')
  while (app)
    while (!dbStatus) {
      if (mainWindow) {
        mainWindow.webContents.send('status', { dbStatus })
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  if (mainWindow) {
    mainWindow.webContents.send('status', { dbStatus })
  }
}

async function createOrLoadDB(): Promise<Orama<typeof MetadataSchema>> {
  let db: Orama<typeof MetadataSchema>
  if (existsSync(config.dbFile)) {
    // start time for restore
    console.time('restore')
    db = await restoreFromFile('binary', config.dbFile)
    console.timeEnd('restore')
  } else {
    console.time('create')
    db = await create({
      schema: MetadataSchema,
      components: {}
    })
    console.timeEnd('create')
  }
  dbStatus = true
  return db
}

ipcMain.on('save', async function(event, args): Promise<void> {
  if (metadb) {
    const exists = await search(metadb, { exact: true, where: { id: args.id } })
    if (exists.count > 0) {
      update(metadb, args.id, args)
    } else {
      insert(metadb, args)
    }
  }
  event.returnValue = 'DB not loaded'
})

ipcMain.on('search', async function(event, args): Promise<void> {
  if (metadb) {
    const result = await search(metadb, {
      term: args.term,
      mode: 'vector'
    })
    event.returnValue = result
  }
})

function getDBStatus(): ServerStatus {
  return ServerStatus.RUNNING
  //return ServerStatus[dbStatus ? 'RUNNING' : 'STOPPED']
}

async function fetchDocuments(): Promise<FetchDocument[]> {
  await insert(metadb, {
    id: Math.random().toString(36).substring(7),
    title: 'title1',
    mime: 'text/plain',
    deleted: false,
    deletedTimeLeft: 1,
    vector: [...Array(1000).keys()]
  })
  const allDocument: Results<FetchDocument> = await search(metadb, {
    term: '',
    mode: 'fulltext'
  })
  return allDocument.hits.map((hit): FetchDocument => hit.document)
}

function getDocument(id: string): string {
  if (!id.length) {
    return ''
  }
  const filePath = join(config.notesDir, `${id}.txt`)
  if (!existsSync(filePath)) {
    return ''
  }
  const content = readFileSync(filePath, 'utf-8')
  return content
}

function saveDocument(id: string, content: string): void {
  console.log(id)
  console.log(content)
  const filePath = join(config.notesDir, `${id}.txt`)
  writeFile(filePath, content, (err) => {
    if (err) {
      console.log(err)
    }
  })
}
