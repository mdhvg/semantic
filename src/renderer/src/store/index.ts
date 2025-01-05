import { atom } from 'jotai'
import { DocumentSchema, SearchDocument } from '$shared/types'

export const DocumentsAtom = atom<DocumentSchema[]>([])

export const ActiveDocumentIDAtom = atom<number | null>(null)

export const ActiveDocumentAtom = atom(
	(get) => {
		const activeDocumentID = get(ActiveDocumentIDAtom)
		const documents = get(DocumentsAtom)
		return documents.find((document) => document.document_id === activeDocumentID)
	},
	(get, set, updatedDocument: DocumentSchema) => {
		const documents = get(DocumentsAtom)
		const updatedDocuments = documents.map((doc) =>
			doc.document_id === updatedDocument.document_id ? updatedDocument : doc
		)
		set(DocumentsAtom, updatedDocuments)
	}
)

export const DocumentContentsAtom = atom<Record<number, string>>({})

export const ActiveDocumentContentAtom = atom(
	(get) => {
		const activeDocumentID = get(ActiveDocumentIDAtom)
		const documentContents = get(DocumentContentsAtom)
		return activeDocumentID !== null ? documentContents[activeDocumentID] : ''
	},
	(get, set, newContent: string) => {
		console.log('setting content', newContent)
		const activeDocumentID = get(ActiveDocumentIDAtom)
		if (activeDocumentID !== null) {
			const documentContents = get(DocumentContentsAtom)
			set(DocumentContentsAtom, { ...documentContents, [activeDocumentID]: newContent })
		}
	}
)

export const CommandAtom = atom<boolean>(false)

export const SearchResultsAtom = atom<SearchDocument['documents']>([])
