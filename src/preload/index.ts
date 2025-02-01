import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron'
import { SearchDocument, DocumentSchema, DocumentContentSchema } from '$shared/types'

// Custom APIs for renderer
const api = {
	newDocument: (): Promise<number> => ipcRenderer.invoke('new-document'),
	// serverStatus: (): ServerStatus => ipcRenderer.invoke('server-status'),
	fetchDocuments: (): Promise<DocumentSchema[]> => ipcRenderer.invoke('fetch-documents'),
	getDocument: (id: number): Promise<DocumentContentSchema[]> =>
		ipcRenderer.invoke('get-document', id),
	saveDocument: (documentData: DocumentSchema, content: string): Promise<void> =>
		ipcRenderer.invoke('save-document', documentData, content),
	deleteDocument: (id: number): Promise<void> => ipcRenderer.invoke('delete-document', id),
	searchDocument: (query: string): Promise<void> => ipcRenderer.invoke('search-document', query),
	onSearchResult: (callback: (data: SearchDocument) => void): void => {
		ipcRenderer.on('search-result', (_, data) => callback(data))
	},
	maximizeWindow: (): Promise<void> => ipcRenderer.invoke('maximize-window'),
	minimizeWindow: (): Promise<void> => ipcRenderer.invoke('minimize-window'),
	closeWindow: (): Promise<void> => ipcRenderer.invoke('close-window')
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
