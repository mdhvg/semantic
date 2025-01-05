import { downloadServer, extractServer } from '../../../src/main/Backend'
import { createDB } from '../../../src/main/index'
import { existsSync, statSync } from 'fs'
import { join } from 'path'
import { test, expect } from 'vitest'

test('Extracts the server files', async () => {
	await extractServer()
	expect(existsSync('server')).toBe(true)
	expect(statSync('server').isDirectory()).toBe(true)
	expect(statSync(join('server', 'server.py')).size).toBeGreaterThan(0)
})
