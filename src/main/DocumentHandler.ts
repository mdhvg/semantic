import {
	DocumentChunkSchema,
	DocumentContentSchema,
	DocumentSchema,
	ResultType,
	SearchDocument,
	ServerMessage,
	ServerResponse
} from '$shared/types'
import { log } from 'console'
import { db } from './Connector'
import { logError, tokenizeText } from './utils'
import { Index } from 'usearch'
import { BrowserWindow } from 'electron'
import { newRequest } from './ServerConnector'

export async function fetchDocuments(): Promise<DocumentSchema[]> {
	return new Promise((resolve, reject) => {
		db.all<DocumentSchema>('SELECT * FROM Documents', (err, rows) => {
			if (err) {
				logError(err)
				reject(err)
			} else {
				log(rows)
				resolve(rows)
			}
		})
	})
}

export function getDocument(id: number): Promise<DocumentContentSchema> {
	return new Promise<DocumentContentSchema>((resolve, reject) => {
		db.all<DocumentContentSchema>(
			`SELECT * FROM DocumentContent
			WHERE document_id = ?`,
			[id],
			(err, rows) => {
				if (err) {
					logError(err)
					reject(err)
				} else {
					resolve(rows[0])
				}
			}
		)
	})
}

export async function saveDocument(
	documentData: DocumentSchema,
	content: string,
	index: Index,
	requestQ: ServerMessage[]
): Promise<void> {
	const textTokens = await tokenizeText(content, 200, documentData.mime)
	db.serialize(() => {
		db.run('BEGIN TRANSACTION')
		// Set value in Documents table
		db.run(
			`UPDATE Documents
			SET title = ?, mime = ?, deleted = ?, deleted_time_left = ?
			WHERE document_id = ?`,
			[
				documentData.title,
				documentData.mime,
				documentData.deleted,
				documentData.deleted_time_left,
				documentData.document_id
			],
			(err) => {
				if (err) {
					logError(err)
				}
			}
		)
		// Get the content_id from the DocumentChunk table
		db.all<{ content_id: number }>(
			`SELECT content_id
				FROM DocumentChunk
				WHERE document_id = ?`,
			[documentData.document_id],
			(err, rows) => {
				if (err) {
					logError(err)
				}
				// Delete those rows from the index
				for (const row of rows) {
					if (row) {
						index.remove(BigInt(row.content_id))
					}
				}
			}
		)
		// Delete the rows from the DocumentChunk table
		db.run(
			`DELETE FROM DocumentChunk
			WHERE document_id = ?`,
			[documentData.document_id],
			(err) => {
				if (err) {
					logError(err)
				}
			}
		)
		// Insert the new content into the DocumentChunk table
		const saveStatemenet = db.prepare(
			`INSERT INTO DocumentChunk (document_id, sequence_number, plain_text)
			VALUES (?, ?, ?) RETURNING content_id`
		)
		for (let i = 0; i < textTokens.length; i++) {
			log(`Partition ${i}: ${textTokens[i]}`)
			saveStatemenet.get<{ content_id: number }>(
				[documentData.document_id, i, textTokens[i]],
				(err, row) => {
					if (row) {
						log(
							`Data: ${JSON.stringify({ kind: 'DATA', id: row.content_id, data: textTokens[i] })}`
						)
						newRequest({ kind: 'DATA', id: row.content_id, data: textTokens[i] }, requestQ)
					} else {
						logError(err)
					}
				}
			)
		}
		saveStatemenet.finalize()
		// Set the content in the DocumentContent table
		db.run(
			`INSERT OR REPLACE INTO DocumentContent
			(document_id, content) VALUES (?, ?)`,
			[documentData.document_id, content],
			(err) => {
				if (err) {
					logError(err)
				}
			}
		)
		db.run('END TRANSACTION')
	})
}

export async function deleteDocument(id: number): Promise<void> {
	db.serialize(() => {
		db.run(
			`UPDATE Documents
			SET deleted = 1, deleted_time_left = 30
			WHERE document_id = ?`,
			[id],
			(err) => {
				if (err) {
					logError(err)
				}
			}
		)
	})
}

export async function createResult(key: number, distance: number): Promise<ResultType> {
	return new Promise<ResultType>((resolve, reject) => {
		db.get<DocumentChunkSchema>(
			`SELECT * FROM
			DocumentChunk
			WHERE content_id = ?`,
			[key],
			(err, row) => {
				if (err) {
					logError(err)
					reject(err)
				} else {
					resolve({ ...row, distance })
				}
			}
		)
	})
}

export async function sendSearchResult(
	data: ServerResponse,
	index: Index,
	mainWindow: BrowserWindow
): Promise<void> {
	const response: SearchDocument = { timestamp: Date.now(), documents: [] }
	const result = index.search(new Float32Array(data.vector), 10)
	for (let i = 0; i < result.keys.length; i++) {
		const key = Number(result.keys[i])
		const distance = Number(result.distances[i])
		response.documents.push(await createResult(key, distance))
	}
	mainWindow.webContents.send('search-result', response)
	log('Sending search result')
}

export function createNewDocument(): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		db.serialize(() => {
			db.run(`INSERT INTO Documents DEFAULT VALUES`, (err) => {
				if (err) {
					reject(err)
				}
			})

			db.get<{ seq: number }>(
				`SELECT seq FROM sqlite_sequence
				WHERE name = 'Documents'`,
				(err, row) => {
					if (err) {
						reject(err)
					} else {
						resolve(row.seq)
					}
				}
			)
		})
	})
}
