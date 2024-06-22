import type { AnyOrama, Orama, PartialSchemaDeep, TypedDocument } from '@orama/orama'
import { create, insert, search } from '@orama/orama'
import { restoreFromFile, persistToFile } from '@orama/plugin-data-persistence/server'
import { existsSync } from 'fs'

export const vectorSize = 1000

export const testVector = Array.from({ length: vectorSize }, () => Math.random())

export const dbPath: string = 'db.msp'

export enum MimeType {
  Markdown = 'text/markdown',
  PlainText = 'text/plain',
  HTML = 'text/html'
}

export const VectorSchema = {
  id: 'string',
  document: 'string',
  vector: `vector[${vectorSize}]`,
  title: 'string',
  mime: 'enum',
  displayText: 'string',
  deleted: 'boolean',
  deletedTimeLeft: 'number'
} as const

export async function createOrLoadDB(
  Schema: typeof VectorSchema
): Promise<Orama<typeof VectorSchema>> {
  let db: Orama<typeof VectorSchema>
  if (existsSync(dbPath)) {
    // start time for restore
    console.time('restore')
    db = await restoreFromFile('binary', dbPath)
    console.timeEnd('restore')
  } else {
    console.time('create')
    db = await create({ schema: Schema })
    console.timeEnd('create')
  }
  return db
}
