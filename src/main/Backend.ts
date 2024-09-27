import { dirname, join, resolve } from 'path'
import { existsSync, mkdirSync, rmSync, appendFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { execSync, spawn } from 'child_process'

import type { Mode, PlatformDirectories } from './MyTypes'
import { Directories } from './Backend.config'
import { config } from '$shared/config'

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

export async function setupPythonServer(isdev: boolean): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (isdev) {
      return resolve(false)
    }

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
