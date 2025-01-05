import { ElectronAPI } from '@electron-toolkit/preload'
import { ServerStatus, SearchDocument, DocumentSchema } from '$shared/types'

declare global {
	interface Window {
		electron: ElectronAPI
		api: {
			newDocument: () => Promise<number>
			serverStatus: ServerStatus
			fetchDocuments: () => Promise<DocumentSchema[]>
			getDocument: (id: number) => Promise<string>
			saveDocument: (documentData: DocumentSchema, content: string) => void
			deleteDocument: (id: number) => Promise<void>
			searchDocument: (query: string) => Promise<void>
			onSearchResult: (callback: (data: SearchDocument) => void) => void
			maximizeWindow: () => Promise<void>
			minimizeWindow: () => Promise<void>
			closeWindow: () => Promise<void>
		}
	}
}
