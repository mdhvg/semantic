import { dirname, join } from 'path'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import * as https from 'https'
import { execSync, spawn } from 'child_process'
import AdmZip from 'adm-zip'
import { config } from './utils'

/*
 * The backend class sets up the python backend for the application as follows:
 * - In development mode:
 * root
 *  ├─ resources
 *  │  └─ ${ os }
 *  │     └─ * Files and scripts to install python on ${ os }*
 *  ├─ setup(x)
 *  │  ├─ python
 *  │  │  └─ * Python files *
 *  │  └─ temp
 *  │     └─ * Temporary files *
 *  └─ backend
 *     └─ * Backend python files *
 *
 * - In production mode:
 * root
 *  ├─ resources
 *  │  └─ * Files and scripts to install python on ${ os }*
 *  ├─ python(x)
 *  │  └─ * Python files *
 *  ├─ temp(x)
 *  │  └─ * Temporary files *
 *  └─ backend
 *     └─ * Backend python files *
 *
 * (x) - These directories are created during the setup process
 */

async function downloadServer(): Promise<boolean> {
	const fileName = 'server.zip'
	const url = 'https://codeload.github.com/mdhvg/semantic-server/zip/refs/tags/v0.1.0'
	return downloadFile(url, fileName)
}

export async function downloadFile(url: string, filePath: string): Promise<boolean> {
	const file = createWriteStream(filePath)
	return new Promise((resolve, reject) => {
		https
			.get(url, (response) => {
				if (response.statusCode !== 200) {
					return reject(false)
				}
				response.pipe(file)
				file.on('finish', () => {
					file.close()
					console.log('Download complete')
					return resolve(true)
				})
			})
			.on('error', (error) => {
				console.error(`Error while downloading server\n${error}`)
				return reject(false)
			})
	})
}

export async function extractFileToDir(
	filePath: string,
	destinationPath: string
): Promise<boolean> {
	const zip = new AdmZip(filePath)
	return new Promise((resolve, reject) => {
		try {
			const enteries = zip.getEntries()
			enteries.forEach((entry) => {
				// find first / in the entry name
				const index = entry.entryName.indexOf('/')
				const extractedPath = entry.entryName.substring(index + 1)
				if (extractedPath.length) {
					zip.extractEntryTo(entry, destinationPath, false, true, true)
				}
			})
			console.log(`Extracted ${filePath}`)
			return resolve(true)
		} catch (error) {
			console.error(`Error while extracting ${filePath}\n${error}`)
			return reject(false)
		}
	})
}

async function extractServer(): Promise<boolean> {
	return extractFileToDir('server.zip', 'server')
}

export async function setupPythonServer(isdev: boolean): Promise<boolean> {
	if (isdev) {
		return new Promise((_, reject) => reject(false))
	}
	console.log('Setting up python server')
	switch (process.platform) {
		case 'win32':
			return setupPythonServerOnWindows()
		case 'linux':
			return setupPythonServerOnLinux()
		default:
			console.log(`${process.platform} is not supported`)
			return new Promise((_, reject) => reject(false))
	}
}

async function setupPythonServerOnWindows(): Promise<boolean> {
	console.log('[Step 1/3]: Checking for python installation')
	if (existsSync(join(config.win32.embeddedPython.path, 'python.exe'))) {
		console.log('Found python')
	} else {
		console.log('Downloading python')
		if (!existsSync(config.win32.embeddedPython.path) || !existsSync(config.win32.getpip.path)) {
			mkdirSync(config.win32.embeddedPython.path, { recursive: true })
			mkdirSync(dirname(config.win32.getpip.path), { recursive: true })
		}
		if (
			!(await downloadFile(config.win32.embeddedPython.url, config.win32.embeddedPython.zip)) ||
			!(await downloadFile(config.win32.getpip.url, config.win32.getpip.path))
		) {
			return new Promise((_, reject) => reject(false))
		}

		console.log('Extracting python')
		if (
			!(await extractFileToDir(config.win32.embeddedPython.zip, config.win32.embeddedPython.path))
		) {
			return new Promise((_, reject) => reject(false))
		}

		const response = execSync(
			`${join(config.win32.embeddedPython.path, 'python.exe')} ${config.win32.getpip.path}`
		).toString()
		console.log(response)
	}
	return new Promise((resolve) => resolve(true))
}

async function setupPythonServerOnLinux(): Promise<boolean> {
	return new Promise((resolve, reject) => {
		console.log('[Step 1/3]: Checking for python installation')
		try {
			const response = execSync('python --version').toString()
			if (response.startsWith('Python')) {
				console.log(`Found python: ${response}`)
			}
		} catch (error) {
			console.log(`Error while checking for python installation\n${error}`)
			return reject(false)
		}

		console.log(`[Step 2/3]: Checking for existing virtual environment in ${config.pythonEnvDir}`)
		const binDir = join(config.pythonEnvDir, 'bin')
		if (existsSync(join(binDir, 'python')) || existsSync(join(binDir, 'python3'))) {
			console.log('Found existing virtual environment')
			return resolve(true)
		}

		try {
			execSync(`python -m venv ${config.pythonEnvDir}`).toString()
			console.log('Success ✨')
		} catch (error) {
			console.log(`Error while creating virtual environment\n${error}`)
			return reject(false)
		}

		console.log(`[Step 3/3]: Installing dependencies listed in ${config.requirementsFile}`)
		try {
			const response = execSync(
				`chmod +x ${config.setupScript} && bash ${config.setupScript} "${config.serverDir}" "pip install -r ${config.requirementsFile}"`
			).toString()
			console.log(response)
			console.log('Success ✨')
		} catch (error) {
			console.log(`Error while installing dependencies\n${error}`)
			return reject(false)
		}
		return resolve(true)
	})
}

export async function startEmbeddingServer(shouldRun: boolean): Promise<void> {
	if (!shouldRun) {
		return
	}
	console.log('Starting embedding server')
	try {
		const pythonProcess = spawn(
			join(config.pythonEnvDir, 'bin', 'python'),
			[config.pythonServerFile],
			{ stdio: 'inherit' }
		)
		pythonProcess.on('close', (code) => {
			console.log(`Python server exited with code ${code}`)
		})
		console.log('Success ✨')
	} catch (error) {
		console.error(`Error while starting python embedding server\n${error}`)
	}
}
