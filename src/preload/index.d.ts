import { ElectronAPI } from '@electron-toolkit/preload'
import { ServerStatus, FetchDocument, SearchDocument } from '$shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      serverStatus: ServerStatus
      fetchDocuments: Promise<FetchDocument[]>
      getDocument: (id: string) => Promise<string>
      saveDocument: (
        id: string,
        documentData: ReturnType<FetchDocument>,
        content: string
      ) => Promise<void>
      deleteDocument: (id: string) => Promise<void>
      searchDocument: (query: string) => Promise<void>
      onSearchResult: (callback: (data: SearchDocument) => void) => void
      maximizeWindow: () => Promise<void>
      minimizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
    }
  }
}
