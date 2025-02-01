import sqlite3 from 'sqlite3'
import { config, log, logError } from './utils'

const sql3: sqlite3.sqlite3 = sqlite3.verbose()
export const db: sqlite3.Database = new sql3.Database(config.dbFile, connection)

function connection(err): void {
	if (err) {
		logError(err)
		return
	}
	log('Connected to database')
}
