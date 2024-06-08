import { dirname, resolve } from 'path'
import {
  existsSync,
  mkdirSync,
  rmSync,
  appendFileSync,
  writeFileSync,
  unlinkSync,
  statSync,
  readFileSync
} from 'fs'
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

  private _win32CheckInstall = (): boolean => {
    const pythonDir = resolve(this.resolvedRootDir, this.directoryGroup.python.path, 'python.exe')
    return existsSync(pythonDir)
  }

  private _win32Install = async (): Promise<boolean> => {
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
      console.error(`Could not download python executable\nGot http response code: ${response[0]}`)
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

  private _win32CheckEnvironment = (): boolean => {
    // check if packages listed in requirements.txt are installed
    const pythonPath = resolve(
      this.resolvedRootDir,
      this.directoryGroup.python.path,
      './python.exe'
    )
    const requirementsPath = resolve(this.resolvedRootDir, this.directoryGroup.requirements.path)
    const requirements = readFileSync(requirementsPath, { encoding: 'utf-8' }).split('\n')

    try {
      const installedPackages = execSync(`${pythonPath} -m pip list`, { encoding: 'utf-8' })
        .split('\n')
        .map((line) => line.split(' ')[0])

      return requirements.every((req) => installedPackages.includes(req))
    } catch (error) {
      console.error(error)
      return false
    }
  }

  private _win32EnvironmentSetup = async (): Promise<void> => {
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

  private _win32StartBackend = (): void => {
    const pythonPath = resolve(this.resolvedRootDir, this.directoryGroup.python.path, 'python.exe')
    spawn(
      pythonPath,
      [resolve(this.resolvedRootDir, this.directoryGroup.backend.path, 'main.py')],
      {
        cwd: resolve(this.resolvedRootDir, this.directoryGroup.backend.path),
        shell: true
      }
    )
  }

  private _linuxCheckInstall = (): boolean => {
    const pythonDir = resolve(
      this.resolvedRootDir,
      this.directoryGroup.python.path,
      'bin',
      'python'
    )
    return existsSync(pythonDir)
  }

  private _linuxInstall = async (): Promise<boolean> => {
    const forgeScript = 'Miniforge3-Linux-x86_64.sh'

    const tempDir = resolve(this.resolvedRootDir, this.directoryGroup.temp.path)
    const pythonPrefix = resolve(this.resolvedRootDir, this.directoryGroup.python.path)
    mkdirSync(tempDir, { recursive: true })
    mkdirSync(pythonPrefix, { recursive: true })

    const downloadResult = await this.downloadFile(
      `https://github.com/conda-forge/miniforge/releases/latest/download/${forgeScript}`,
      resolve(this.resolvedRootDir, tempDir, forgeScript)
    )

    if (downloadResult !== 0) {
      return false
    }
    execSync(`chmod +x ${forgeScript}`, {
      cwd: resolve(this.resolvedRootDir, tempDir),
      encoding: 'utf-8',
      stdio: 'inherit'
    })

    execSync(
      `bash ${resolve(this.resolvedRootDir, tempDir, forgeScript)} -bufs -p ${pythonPrefix}`,
      {
        encoding: 'utf-8',
        stdio: 'inherit'
      }
    )
    return true
  }

  private _linuxCheckEnvironment = (): boolean => {
    const condaDir = resolve(this.resolvedRootDir, this.directoryGroup.python.path)
    return existsSync(resolve(condaDir, 'envs/pyenv'))
  }

  private _linuxEnvironmentSetup = async (): Promise<void> => {
    const condaDir = resolve(this.resolvedRootDir, this.directoryGroup.python.path)
    const envScript = resolve(
      this.resolvedRootDir,
      this.directoryGroup.resources.path,
      'create_env.sh'
    )
    const envConfig = resolve(
      this.resolvedRootDir,
      this.directoryGroup.resources.path,
      'environment.yml'
    )
    execSync(`bash ${envScript} ${condaDir} ${envConfig}`, { stdio: 'inherit' })
  }

  private _linuxStartBackend = (): void => {
    const condaDir = resolve(this.resolvedRootDir, this.directoryGroup.python.path)
    const startScript = resolve(
      this.resolvedRootDir,
      this.directoryGroup.resources.path,
      'run_server.sh'
    )
    execSync(`bash ${startScript} ${condaDir} pyenv ${this.directoryGroup.backend.path}`, {})
  }

  public startBackend = (): void => {
    this.platformSetup[this.platform].startBackend()
  }

  private platformSetup = {
    win32: {
      checkInstall: this._win32CheckInstall,
      install: this._win32Install,
      checkEnvironment: this._win32CheckEnvironment,
      environmentSetup: this._win32EnvironmentSetup,
      startBackend: this._win32StartBackend
    },
    linux: {
      checkInstall: this._linuxCheckInstall,
      install: this._linuxInstall,
      checkEnvironment: this._linuxCheckEnvironment,
      environmentSetup: this._linuxEnvironmentSetup,
      startBackend: this._linuxStartBackend
    }
  }

  constructor(mode: Mode) {
    this.mode = mode
    this.platform = process.platform
    this.directoryGroup = Directories[this.mode][this.platform]

    // Resolve project root directory based on mode
    this.resolvedRootDir = resolve(
      dirname(fileURLToPath(import.meta.url)),
      this.directoryGroup.relativeRoot.path
    )
  }

  public async init(): Promise<boolean> {
    // Check for existence of embedded python on current platform
    if (!this.platformSetup[this.platform].checkInstall()) {
      // Install embedded python on current platform
      const success = await this.platformSetup[this.platform].install()
      if (!success) {
        console.error('Could not install python')
        return false
      }
    }
    // Setup python environment
    if (!this.platformSetup[this.platform].checkEnvironment()) {
      await this.platformSetup[this.platform].environmentSetup()
    }
    return true
  }

  private async downloadFile(url: string, location: string): Promise<number> {
    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer'
      })
      if (response.status !== 200) {
        console.error(`Could not download file\nGot http response code: ${response.status}`)
        return response.status
      }
      const totalLength = response.headers['content-length']
      console.log(`Content-Length: ${totalLength}`)
      if (existsSync(location) && statSync(location).size === parseInt(totalLength)) {
        return 0
      }
      writeFileSync(location, response.data)
      const downloadedLength = response.data.byteLength
      console.log(`Downloaded ${downloadedLength} bytes`)
      if (downloadedLength !== parseInt(totalLength)) {
        console.error('Downloaded file is corrupt')
        unlinkSync(location)
        return 1
      }
      return 0
    } catch (error) {
      console.error(error)
      return 1
    }
  }
}

export { Backend }
