const commonPaths = {
  relativeRoot: { path: '../..' },
  python: { path: 'setup/python' },
  temp: { path: 'setup/temp' },
  backend: { path: 'backend' },
  requirements: { path: 'resources/common/requirements.txt' }
}

const productionPaths = {
  relativeRoot: { path: '../../../..' },
  resources: { path: 'resources' },
  python: { path: 'python' },
  temp: { path: 'temp' },
  backend: { path: 'backend' },
  requirements: { path: 'resources/requirements.txt' }
}

export const Directories = {
  development: {
    win32: {
      ...commonPaths,
      resources: { path: 'resources/win32' }
    },
    linux: {
      ...commonPaths,
      resources: { path: 'resources/linux' }
    }
  },
  production: {
    win32: {
      ...productionPaths
    },
    linux: {
      ...productionPaths
    }
  }
}
