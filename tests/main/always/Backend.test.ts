// test('Extracts the server files', async () => {
// 	await extractServer()
// 	expect(existsSync('server')).toBe(true)
// 	expect(statSync('server').isDirectory()).toBe(true)
// 	expect(statSync(join('server', 'server.py')).size).toBeGreaterThan(0)
// })

import { expect, test } from 'vitest'
import { setupPythonServer } from '../../../src/main/Backend'
import { existsSync } from 'fs'
import { config } from '../../../src/main/utils'
import { join } from 'path'

test('Test python setup on Windows', async () => {
	await setupPythonServer(false)
	expect(existsSync(config.win32.python.path)).toBe(true)
	expect(existsSync(join(config.win32.python.path, 'python.exe'))).toBe(true)
	expect(existsSync(config.win32.python.zip)).toBe(true)
	expect(existsSync(config.win32.getpip.path)).toBe(true)
	expect(existsSync(join(config.win32.python.path, '.installed'))).toBe(true)
})
