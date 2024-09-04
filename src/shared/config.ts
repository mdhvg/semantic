import { existsSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

export const config = {
  notesDir: join(homedir(), 'Semantic'),
  // NOTE: This directory will contain the markdown stripped plaintext from of notes.
  notesPlaintextDir: join(homedir(), 'Semantic', 'plaintext'),
  dbFile: 'db.msp'
}

if (!existsSync(config.notesDir)) {
  console.log(`Creating notes directory at ${config.notesDir}`)
  mkdirSync(config.notesDir)
}
