import * as fs from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const envPrefix = join(fs.realpathSync('src-tauri'), 'forge')
const setupPath = fs.realpathSync('setup')
const backendPath = fs.realpathSync('src-backend')
const environmentPath = fs.realpathSync(join(setupPath, 'environment.yml'))
const environmentName = 'pyenv'
const miniForgeScriptName = 'Miniforge3-Linux-x86_64.sh'

if (process.platform === 'linux') {
  LinuxSetup()
} else if (process.platform === 'win32') {
  WindowsSetup()
} else {
  console.log('Unsupported OS')
  process.exit(1)
}

function LinuxSetup() {
  console.log('Running Linux setup')

  const linuxSetupPath = join(setupPath, 'linux')
  const miniforgeSetup = join(linuxSetupPath, miniForgeScriptName)

  // check if linux setup directory exists
  if (!fs.existsSync(linuxSetupPath)) {
    console.log(`${linuxSetupPath} not found`)
    process.exit(1)
  }
  if (!fs.existsSync(miniforgeSetup)) {
    try {
      // check if curl is installed
      execSync('which curl', { encoding: 'utf-8' })

      // download miniforge
      execSync(
        `curl "https://github.com/conda-forge/miniforge/releases/latest/download/${miniForgeScriptName}" -o ${miniforgeSetup}`,
        { encoding: 'utf-8' }
      )
      execSync(`chmod +x ${miniforgeSetup}`, { encoding: 'utf-8' })
    } catch (e) {
      console.error(e.stderr)
      process.exit(1)
    }
  }
  if (!fs.existsSync(envPrefix)) {
    // install miniforge
    execSync(`bash ${miniforgeSetup} -b -p ${envPrefix}`, { encoding: 'utf-8' })
  }
  console.log('Miniforge installed')

  if (!fs.existsSync(join(envPrefix, 'envs', environmentName))) {
    execSync(`bash ${linuxSetupPath}/create_env.sh ${envPrefix} ${environmentPath}`, {
      encoding: 'utf-8'
    })
  }
  console.log('Environment created')

  // Run the server
  console.log('Starting server...')
  execSync(`bash ${linuxSetupPath}/run_server.sh ${envPrefix} ${environmentName} ${backendPath}`, {
    encoding: 'utf-8',
    stdio: 'inherit'
  })
}

function WindowsSetup() {
  console.log('Running Windows setup')
}
