export enum ServerStatus {
	RUNNING = 'RUNNING',
	STOPPED = 'STOPPED'
}

export type Document = {
	id: string
	title: string
	content: string
}

export const vectorSize = 768

export type DocumentSchema = {
	document_id: number
	title: string
	mime: string
	deleted: boolean
	deleted_time_left: number
}

export type DocumentContentSchema = {
	content_id: number
	document_id: number
	sequence_number: number
	content: string
}

export type DocumentMap = {
	[key: string]: Partial<DocumentSchema[]>
}

export type DocumentStatus =
	| {
			[key: string]: {
				loaded: true
				content: string
			}
	  }
	| {
			[key: string]: {
				loaded: false
			}
	  }

export type ServerRequest = {
	id: number
	content: string
	size: number
	isQuery: boolean
}

export type ServerResponse = {
	id: number
	isQuery: boolean
	vector: number[]
}

export type SearchDocument = {
	timestamp: number
	documents: ResultType[]
}

export type ResultType = Partial<DocumentSchema> &
	Pick<DocumentSchema, 'document_id' | 'title' | 'mime'> & { distance: number }

export enum View {
	PREVIEW = 'PREVIEW',
	EDIT = 'EDIT',
	SPLIT = 'SPLIT'
}

export type ContentSchemanAndString = {
	content: DocumentContentSchema[]
	contentString: string
	dirty: boolean
}
