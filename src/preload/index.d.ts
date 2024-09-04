import { ElectronAPI } from '@electron-toolkit/preload'
import { ServerStatus, FetchDocument } from '$shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      serverStatus: ServerStatus
      fetchDocuments: Promise<FetchDocument[]>
      getDocument: (id: string) => Promise<string>
      saveDocument: (id: string, content: string) => Promise<void>
    }
  }
}
