import { downloadServer, extractServer } from '../../src/main/Backend'
import { existsSync, statSync } from 'fs'
import { join } from 'path'
import { test, expect } from 'vitest'

test('Downlaods the server files', async () => {
	await downloadServer()
	expect(existsSync('server.zip')).toBe(true)
	expect(statSync('server.zip').size).toBeGreaterThan(0)
})

test('Extracts the server files', async () => {
	await extractServer()
	expect(existsSync('server')).toBe(true)
	expect(statSync('server').isDirectory()).toBe(true)
	expect(statSync(join('server', 'server.py')).size).toBeGreaterThan(0)
})
