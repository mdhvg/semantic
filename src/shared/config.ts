import { existsSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

export const config = {
  notesDir: join(homedir(), 'Semantic'),
  // NOTE: This directory will contain the markdown stripped plaintext from of notes.
  notesPlaintextDir: join(homedir(), 'Semantic', 'plaintext'),
  dbFile: 'db.msp',
  serverDir: 'server',
  pythonEnvDir: 'server/.env',
  requirementsFile: 'server/requirements.txt',
  pythonServerFile: 'server/server.py',
  setupScript: 'server/setup.sh',
  serverAddress: {
    host: '127.0.0.1',
    port: 5096
  },
  maxMessageLen: 4096
}

if (!existsSync(config.notesDir)) {
  console.log(`Creating notes directory at ${config.notesDir}`)
  mkdirSync(config.notesDir)
}
