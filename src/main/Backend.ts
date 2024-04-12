import { dirname, resolve } from 'path'
import { existsSync, mkdirSync, rmSync, appendFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { execSync, spawn } from 'child_process'

import AdmZip from 'adm-zip'
import axios from 'axios'

import type { Mode, PlatformDirectories } from './MyTypes'
import { Directories } from './Backend.config'

/*
 * The backend class sets up the python backend for the application as follows:
 * - In development mode:
 * root
 *  ├─ resources
 *  │  └─ ${os}
 *  │     └─ *Files and scripts to install python on ${os}*
 *  ├─ setup (x)
 *  │  ├─ python
 *  │  │  └─ *Python files*
 *  │  └─ temp
 *  │     └─ *Temporary files*
 *  └─ backend
 *     └─ *Backend python files*
 *
 * - In production mode:
 * root
 *  ├─ resources
 *  │  └─ *Files and scripts to install python on ${os}*
 *  ├─ python (x)
 *  │  └─ *Python files*
 *  ├─ temp (x)
 *  │  └─ *Temporary files*
 *  └─ backend
 *     └─ *Backend python files*
 *
 *  (x) - These directories are created during the setup process
 */

class Backend {
  private mode: Mode
  private platform: NodeJS.Platform
  private resolvedRootDir: string
  private directoryGroup: PlatformDirectories

  constructor(mode: Mode) {
    console.log(resolve(dirname(fileURLToPath(import.meta.url))))
    this.mode = mode
    this.platform = process.platform
    this.directoryGroup = Directories[this.mode][this.platform]

    // Resolve project root directory based on mode
    this.resolvedRootDir = resolve(
      dirname(fileURLToPath(import.meta.url)),
      this.mode === 'development' ? '../..' : '../../../..'
    )
  }

  public async init(): Promise<boolean> {
    // Check for existence of embedded python
    const pythonDir = resolve(this.resolvedRootDir, this.directoryGroup.python.path, 'python.exe')
    if (!existsSync(pythonDir)) {
      const success = await this.setupPython()
      if (!success) {
        console.error('Could not set up Python environment')
        return false
      }
    }
    // Whatever this function runs doesn't return anything, just always makes sure all python dependencies are installed
    this.setPythonEnvironment()
    return true
  }

  // This function needs to run synchronously
  private setPythonEnvironment(): void {
    if (this.platform === 'win32') {
      // install pip
      const pythonPath = resolve(
        this.resolvedRootDir,
        this.directoryGroup.python.path,
        './python.exe'
      )
      const getPipPath = resolve(
        this.resolvedRootDir,
        this.directoryGroup.python.path,
        './get-pip.py'
      )
      execSync(`${pythonPath} ${getPipPath}`)

      // enable pip
      appendFileSync(
        resolve(this.resolvedRootDir, this.directoryGroup.python.path, 'python311._pth'),
        '\nimport site\n'
      )

      // install pip packages
      const requirementsPath = resolve(this.resolvedRootDir, this.directoryGroup.requirements.path)
      execSync(`${pythonPath} -m pip install -r ${requirementsPath}`)
    }
    if (this.platform === 'linux') {
      console.log('Setting up for Linux')
    }
  }

  private async setupPython(): Promise<boolean> {
    if (this.platform === 'win32') {
      console.log('Setting up for Windows')
      const pythonDir = resolve(this.resolvedRootDir, this.directoryGroup.python.path)
      const tempDir = resolve(this.resolvedRootDir, this.directoryGroup.temp.path)

      mkdirSync(pythonDir, { recursive: true })
      mkdirSync(tempDir, { recursive: true })

      const zipPath = resolve(tempDir, './python.zip')
      const getPipPath = resolve(pythonDir, './get-pip.py')

      const downloads = [
        this.downloadFile(
          'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip',
          zipPath
        ),
        this.downloadFile('https://bootstrap.pypa.io/get-pip.py', getPipPath)
      ]
      const response = await Promise.all(downloads)
      if (response[0]) {
        console.error(
          `Could not download python executable\nGot http response code: ${response[0]}`
        )
        return false
      }
      if (response[1]) {
        console.error(`Could not download pip\nGot http response code: ${response[1]}`)
        return false
      }
      const zip = new AdmZip(zipPath)

      zip.extractAllTo(pythonDir, true)
      rmSync(zipPath)
      rmSync(tempDir, { recursive: true })
      return true
    }
    if (this.platform === 'linux') {
      return true
    }
    console.error('Unsupported platform (For now)')
    return false
  }

  private async downloadFile(url: string, location: string): Promise<number> {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer'
      })
      if (response.status !== 200) {
        return response.status
      }
      writeFileSync(location, Buffer.from(response.data))
      return 0
    } catch (error) {
      console.error(error)
      return 1
    }
  }

  public startBackend(): void {
    console.log('Starting backend')
    if (this.platform === 'win32') {
      const pythonPath = resolve(
        this.resolvedRootDir,
        this.directoryGroup.python.path,
        'python.exe'
      )
      spawn(
        pythonPath,
        [resolve(this.resolvedRootDir, this.directoryGroup.backend.path, 'main.py')],
        {
          cwd: resolve(this.resolvedRootDir, this.directoryGroup.backend.path),
          shell: true
        }
      )
    }
  }
}

export { Backend }
