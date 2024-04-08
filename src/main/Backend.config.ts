export const Directories = {
  development: {
    win32: {
      resources: { path: 'resources/win32' },
      python: { path: 'setup/python' },
      temp: { path: 'setup/temp' },
      backend: { path: 'backend' },
      requirements: { path: 'resources/common/requirements.txt' }
    },
    linux: {
      resources: { path: 'resources/linux' },
      python: { path: 'setup/python' },
      temp: { path: 'setup/temp' },
      backend: { path: 'backend' },
      requirements: { path: 'resources/common/requirements.txt' }
    }
  },
  production: {
    win32: {
      resources: { path: 'resources/win32' },
      python: { path: 'python' },
      temp: { path: 'temp' },
      backend: { path: 'backend' },
      requirements: { path: 'resources/requirements.txt' }
    },
    linux: {
      resources: { path: 'resources/linux' },
      python: { path: 'python' },
      temp: { path: 'temp' },
      backend: { path: 'backend' },
      requirements: { path: 'resources/requirements.txt' }
    }
  }
}
