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

export type DocumentChunkSchema = {
	content_id: number
	document_id: number
	sequence_number: number
	plain_text: string
}

export type DocumentContentSchema = {
	document_id: number
	content: string
}

export type DroppedDocument = {
	title: string
	mime: string
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

export type ServerResponse = {
	id: number
	isQuery: boolean
	vector: number[]
}

export type SearchDocument = {
	timestamp: number
	documents: ResultType[]
}

export type ResultType = DocumentChunkSchema & { distance: number }

export enum View {
	PREVIEW = 'PREVIEW',
	EDIT = 'EDIT',
	SPLIT = 'SPLIT'
}

export type ServerMessage =
	| {
			kind: 'DATA'
			id: number
			data: string
	  }
	| {
			kind: 'COMMAND'
			// TODO: Change the command to an enum instead of string
			command: string
	  }
	| {
			kind: 'QUERY'
			data: string
	  }
