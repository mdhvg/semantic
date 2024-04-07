import { dirname, resolve } from 'path'
import { existsSync, mkdirSync, createWriteStream, rmSync, appendFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

import AdmZip from 'adm-zip'
import axios from 'axios'

import type { ModeType } from './MyTypes'

/*
 * The backend class sets up the python backend for the application as follows:
 * - In development mode:
 * root
 *  ├─ resources
 *  │  ├─ ${os}
 *  │  │  └─ *Files and scripts to install python on ${os}*
 *  │  └─ setup (x)
 *  │     ├─ python
 *  │     │  └─ *Python files*
 *  │     └─ temp
 *  │        └─ *Temporary files*
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
  private location: string
  private resourcesPath: string

  constructor(mode: ModeType) {
    const __dirname = dirname(fileURLToPath(import.meta.url))
    if (mode === 'development') {
      console.log('startBackend in development mode')
      this.location = resolve(__dirname, '../../setup/python')
    } else {
      console.log('startBackend in production mode')
      this.location = resolve(__dirname, 'python')
    }
    console.log('location:', this.location)

    if (!existsSync(this.location)) this.setupBackend()
  }

  private setupBackend(): void {
    this.resourcesPath = resolve(this.location, '../resources')

    const platform = process.platform
    if (platform === 'win32') {
      console.log('Setting up for Windows')
      this.setupWindows()
    } else if (platform === 'linux') {
      console.log('Setting up for Linux')
    } else if (platform === 'darwin') {
      console.log('Setting up for macOS')
    }
  }

  private async setupWindows(): Promise<void> {
    console.log('setupWindows')
    const tempDir = resolve(this.location, '../temp')
    mkdirSync(tempDir, { recursive: true })
    mkdirSync(this.location, { recursive: true })

    const zipPath = resolve(tempDir, './python.zip')
    const getPipPath = resolve(this.location, './get-pip.py')
    const downloads = [
      this.downloadFile(
        'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip',
        zipPath
      ),
      this.downloadFile('https://github.com/pypa/get-pip', getPipPath)
    ]
    await downloads[0]
    const zip = new AdmZip(zipPath)

    zip.extractAllTo(this.location, true)
    rmSync(zipPath)
    rmSync(tempDir, { recursive: true })

    // Install pip
    const pythonPath = resolve(this.location, './python.exe')
    execSync(`${pythonPath} ${getPipPath}`)
    // Enable pip
    const pythonPthFile = resolve(this.location, './python311._pth')
    appendFileSync(pythonPthFile, '\nimport site\n')

    // Install pip packages
    const requirementsPath = resolve(this.resourcesPath, './requirements.txt')
    execSync(`${pythonPath} -m pip install -r ${requirementsPath}`)
  }

  private async downloadFile(url: string, location: string): Promise<void> {
    const writer = createWriteStream(location)
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    })
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }
}

export { Backend }
