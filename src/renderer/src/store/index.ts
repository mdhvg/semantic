import { atom } from 'jotai'
import {
	ContentSchemanAndString,
	DocumentContentSchema,
	DocumentSchema,
	SearchDocument,
	View
} from '$shared/types'

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

export const DocumentContentsAtom = atom<Record<number, ContentSchemanAndString>>({})

export const ActiveDocumentContentAtom = atom(
	(get) => {
		const activeDocumentID = get(ActiveDocumentIDAtom)
		const documentContents = get(DocumentContentsAtom)
		return activeDocumentID !== null
			? documentContents[activeDocumentID]
			: { content: [], contentString: '', dirty: false }
	},
	(get, set, newContent: DocumentContentSchema[] | string) => {
		console.log('setting content', newContent)
		const activeDocumentID = get(ActiveDocumentIDAtom)
		if (activeDocumentID !== null) {
			const documentContents = get(DocumentContentsAtom)
			if (typeof newContent === 'string') {
				set(DocumentContentsAtom, {
					...documentContents,
					[activeDocumentID]: {
						content: documentContents[activeDocumentID].content,
						contentString: newContent,
						dirty: true
					}
				})
			} else {
				set(DocumentContentsAtom, {
					...documentContents,
					[activeDocumentID]: {
						content: newContent,
						contentString: newContent.map((c) => c.content).join(''),
						dirty: false
					}
				})
			}
		}
	}
)

export const CommandAtom = atom<boolean>(false)

export const SearchResultsAtom = atom<SearchDocument['documents']>([])

export const ViewAtom = atom<View>(View.PREVIEW)

export const FocusAtom = atom<number | null>(null)
