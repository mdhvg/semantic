import { join, resolve } from 'path'
import {
	appendFileSync,
	createWriteStream,
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	statSync
} from 'fs'
import Redirects from 'follow-redirects'
import { exec, spawn } from 'child_process'
import AdmZip from 'adm-zip'
import { config, log, logError } from './utils'
import { promisify } from 'util'

const execAsync = promisify(exec)

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

export async function downloadFile(url: string, filePath: string): Promise<boolean> {
	const file = createWriteStream(filePath)
	return new Promise((resolve, reject) => {
		Redirects.https
			.get(url, (response) => {
				if (response.statusCode !== 200) {
					return reject(false)
				}
				response.pipe(file)
				file.on('finish', () => {
					file.close()
					log('Download complete')
					return resolve(true)
				})
			})
			.on('error', (error) => {
				logError(`Error while downloading ${filePath}\n${error}`)
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
			log(`Extracted ${filePath}`)
			return resolve(true)
		} catch (error) {
			logError(`Error while extracting ${filePath}\n${error}`)
			return reject(false)
		}
	})
}

export async function setupPythonServer(isdev: boolean): Promise<boolean> {
	if (isdev) {
		false
	}

	if (existsSync(join(config.serverSource.path, '.installed'))) {
		log('Python server already installed')
		return true
	}

	log('Setting up server')
	if (existsSync(config.serverSource.path)) {
		rmSync(config.serverSource.path, { recursive: true })
	}
	mkdirSync(config.serverSource.path, { recursive: true })

	if (!existsSync(config.serverSource.zip) || statSync(config.serverSource.zip).size === 0) {
		const download = await downloadFile(config.serverSource.url, config.serverSource.zip)
		if (!download) {
			return false
		}
	}
	const extracted = await extractFileToDir(config.serverSource.zip, config.serverSource.path)
	if (!extracted) {
		return false
	}
	appendFileSync(join(config.serverSource.path, '.installed'), '')

	log('Setting up python')
	switch (process.platform) {
		case 'win32':
			return setupPythonServerOnWindows()
		case 'linux':
			return setupPythonServerOnLinux()
		default:
			log(`${process.platform} is not supported`)
			return false
	}
}

async function setupPythonServerOnWindows(): Promise<boolean> {
	log('[Step 1/3]: Checking for python installation')
	const binaryPath = config.win32.python.binary
	const installFlag = config.win32.python.flag
	if (existsSync(installFlag)) {
		log('Python already installed')
		return true
	}
	if (!existsSync(binaryPath)) {
		log('Python not found')
		log('Downloading and installing python')

		mkdirSync(config.win32.python.path, { recursive: true })

		let pythonDownloaded = false
		let pipDownloaded = false

		if (!existsSync(config.win32.python.zip) || statSync(config.win32.python.zip).size === 0) {
			;[pythonDownloaded, pipDownloaded] = await Promise.all([
				downloadFile(config.win32.python.url, config.win32.python.zip),
				downloadFile(config.win32.getpip.url, config.win32.getpip.path)
			])
		} else {
			;[pythonDownloaded, pipDownloaded] = [
				true,
				await downloadFile(config.win32.getpip.url, config.win32.getpip.path)
			]
		}

		if (!pythonDownloaded || !pipDownloaded) {
			return false
		}

		log('Extracting python')
		const extracted = await extractFileToDir(config.win32.python.zip, config.win32.python.path)
		if (!extracted) {
			return false
		}

		log('Installing pip')

		// Check https://stackoverflow.com/a/48906746 for explanation
		// find files ending with ._pth in the python directory using fs
		const files = readdirSync(config.win32.python.path).filter((file) => file.endsWith('._pth'))
		// Append 'import site' to the pythonxx._pth files
		files.forEach((file) => {
			appendFileSync(join(config.win32.python.path, file), 'import site')
		})
		try {
			const response = await execAsync(
				`${resolve(config.win32.python.binary)} ${config.win32.getpip.path}`,
				{ windowsHide: true }
			)
			log(response.stdout)

			const installResponse = await execAsync(
				`${resolve(config.win32.python.binary)} -m pip install -r ${resolve(config.serverSource.requirements)}`,
				{ windowsHide: true }
			)
			log(installResponse.stdout)

			appendFileSync(installFlag, '')

			log('Success ✨')
		} catch (error) {
			logError(`Error while installing pip\n${error}`)
			return false
		}
	}
	return true
}

async function setupPythonServerOnLinux(): Promise<boolean> {
	log('[Step 1/3]: Checking for python installation')
	const binaryPath = config.linux.python.binary
	const installFlag = config.linux.python.flag
	let response: { stdout: string; stderr: string } = { stdout: '', stderr: '' }
	if (existsSync(installFlag)) {
		log('Python already installed')
		return true
	}
	if (!existsSync(binaryPath)) {
		log('Python not found')
		log('Installing python')
		response = await execAsync('python --version')
		if (response.stdout.startsWith('Python')) {
			log(`Found python: ${response.stdout}`)
		}
		if (response.stderr) {
			log(`Error while checking for python installation\n${response.stderr}`)
			return false
		}

		log(`[Step 2/3]: Checking for existing virtual environment in ${config.linux.python.path}`)
		if (existsSync(resolve(config.linux.python.binary))) {
			log('Found existing virtual environment')
			return true
		}

		response = await execAsync(`python -m venv ${config.linux.python.path}`)
		if (response.stderr) {
			log(`Error while creating virtual environment\n${response.stderr}`)
			return false
		}
		log('Success ✨')

		log(`[Step 3/3]: Installing dependencies listed in ${config.serverSource.requirements}`)
		response = await execAsync(
			`${resolve(config.linux.python.binary)} -m pip install -r ${resolve(config.serverSource.requirements)}`
		)
		if (response.stderr) {
			log(`Error while getting python executable\n${response.stderr}`)
			return false
		}
		log(response.stdout)

		appendFileSync(installFlag, '')
	}
	return true
}

export async function startEmbeddingServer(): Promise<boolean> {
	log('Starting embedding server')
	switch (process.platform) {
		case 'win32':
			return startEmbeddingServerOnWindows()
		case 'linux':
			return startEmbeddingServerOnLinux()
		default:
			log(`${process.platform} is not supported`)
			return new Promise((_, reject) => reject(false))
	}
}

async function startEmbeddingServerOnLinux(): Promise<boolean> {
	try {
		const pythonProcess = spawn(
			join(config.linux.python.binary),
			[resolve(config.pythonServerFile)],
			{ stdio: 'inherit', shell: false }
		)
		pythonProcess.on('close', (code) => {
			log(`Python server exited with code ${code}`)
		})
		log('Success ✨')
		return true
	} catch (error) {
		logError(`Error while starting python embedding server\n${error}`)
		return false
	}
}

async function startEmbeddingServerOnWindows(): Promise<boolean> {
	try {
		const pythonProcess = spawn(
			join(config.win32.python.binary),
			[resolve(config.pythonServerFile)],
			{ stdio: 'inherit', shell: false }
		)
		pythonProcess.on('close', (code) => {
			log(`Python server exited with code ${code}`)
		})
		log('Success ✨')
		return true
	} catch (error) {
		logError(`Error while starting python embedding server\n${error}`)
		return false
	}
}

export async function initiliazeBackend(isDev: boolean): Promise<void> {
	setupPythonServer(isDev)
		.then(async (value: boolean) => {
			if (value) {
				const embeddingStarted = await startEmbeddingServer()
				if (!embeddingStarted) {
					throw new Error('Failed to start server')
				}
			}
		})
		.catch((error) => {
			log(`Error initializing backend: ${error.message}`)
		})
}
