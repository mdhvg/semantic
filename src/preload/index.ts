import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron'
import { FetchDocument, ServerStatus } from '$shared/types'

// Custom APIs for renderer
const api = {
  serverStatus: (): ServerStatus => ipcRenderer.invoke('server-status'),
  fetchDocuments: (): Promise<FetchDocument[]> => ipcRenderer.invoke('fetch-documents'),
  getDocument: (id: string): string => ipcRenderer.invoke('get-document', id),
  saveDocument: (id: string, content: string): Promise<void> =>
    ipcRenderer.invoke('save-document', id, content)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
