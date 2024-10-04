import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/common/icon.png?asset'
import { Orama, insert, search, update, create, Results, getByID } from '@orama/orama'
import { connectToEmbeddingServer } from './ServerHandler'
import { persistToFile, restoreFromFile } from '@orama/plugin-data-persistence/server'
import { ServerConnector } from './ServerConnector'
import type { ServerMessageData } from './ServerConnector'
import { existsSync, readFileSync, writeFile } from 'fs'
import { config } from '$shared/config'
import {
  FetchDocument,
  ServerStatus,
  MetadataSchema,
  ServerRequest,
  ServerResponse,
  vectorSize
} from '$shared/types'
import { readFile } from 'fs'
import { setupPythonServer, startEmbeddingServer } from './Backend'
import { Delay } from './utils'

let metadb: Orama<typeof MetadataSchema>
let dbStatus: boolean = false
let mainWindow: BrowserWindow
let serverConnector: ServerConnector
const requestQ: ServerRequest[] = []

function createWindow(): void {
  // Create the browser window.
  console.time('mainWindow.show')
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
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
    setupPythonServer(is.dev).then((value: boolean) => {
      startEmbeddingServer(value)
    })
    serverConnector.connect(config.serverAddress.port, config.serverAddress.host).then(() => {
      console.log('Connected to server')
    })
  })

  mainWindow.on('close', () => {
    persistToFile(metadb, 'binary', config.dbFile)
    serverConnector.sendCommand('Quit')
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
  ipcMain.handle('get-document', (_, id: string) => getDocument(id))
  ipcMain.handle(
    'save-document',
    (_, id: string, documentData: ReturnType<FetchDocument>, content: string) => {
      saveDocument(id, documentData, content)
    }
  )
  ipcMain.handle('delete-document', (_, id: string) => {
    deleteDocument(id)
  })
  ipcMain.handle('search-document', (_, term: string) => {
    newRequest({ id: '1', isQuery: true, content: term, size: term.length })
  })

  createWindow()

  serverConnector = ServerConnector.getInstance()
  serverConnector.onData(async (data: ServerResponse): Promise<void> => {
    console.log(`Received data from server: ${data.vector.length}`)
    console.log(data.id, data.isQuery)
    if (data.isQuery) {
      await sendSearchResult(data)
    } else {
      const document = await getByID<Orama<typeof MetadataSchema>, ReturnType<FetchDocument>>(
        metadb,
        data.id
      )
      if (document) {
        document.vector = data.vector
        update<Orama<typeof MetadataSchema>>(metadb, data.id, document)
        return
      }
      console.log(`Document with id: ${data.id} not found`)
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
  metadb = await createOrLoadDB()
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

ipcMain.on('save', async function (event, args): Promise<void> {
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

function getDBStatus(): ServerStatus {
  return ServerStatus.RUNNING
  //return ServerStatus[dbStatus ? 'RUNNING' : 'STOPPED']
}

async function fetchDocuments(): Promise<FetchDocument[]> {
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

async function saveDocument(
  id: string,
  documentData: Partial<ReturnType<FetchDocument>>,
  content: string
): Promise<void> {
  const document = await getByID<Orama<typeof MetadataSchema>, ReturnType<FetchDocument>>(
    metadb,
    id
  )
  delete documentData.vector
  if (document) {
    update<Orama<typeof MetadataSchema>>(metadb, id, documentData)
  } else {
    insert<Orama<typeof MetadataSchema>>(metadb, documentData)
  }
  console.log(id)
  console.log(documentData)
  console.log(content)
  const filePath = join(config.notesDir, `${id}.txt`)
  writeFile(filePath, content, (err) => {
    if (err) {
      console.log(err)
    }
  })
  newRequest({ id, content, size: content.length, isQuery: false })
}

async function deleteDocument(id: string): Promise<void> {
  const document = await getByID<Orama<typeof MetadataSchema>, ReturnType<FetchDocument>>(
    metadb,
    id
  )
  if (document) {
    document.deleted = true
    document.deletedTimeLeft = 30
    update<Orama<typeof MetadataSchema>>(metadb, id, document)
    console.log(`Document with id: ${id} will be deleted after 30 days`)
    return
  }
  console.log(`Document with id: ${id} not found`)
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

async function sendSearchResult(data: ServerResponse): Promise<void> {
  const result = await search<Orama<typeof MetadataSchema>, ReturnType<FetchDocument>>(metadb, {
    mode: 'vector',
    includeVectors: false,
    vector: {
      value: data.vector,
      property: 'vector'
    },
    similarity: 0.2
  })
  console.log(result)
  const response = { timestamp: Date.now(), documents: result.hits }
  mainWindow.webContents.send('search-result', response)
}
