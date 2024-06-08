export type Mode = 'development' | 'production'

export type DirectoryFields = { path: string }

export type PlatformDirectories = {
  resources: DirectoryFields
  python: DirectoryFields
  temp: DirectoryFields
  backend: DirectoryFields
  requirements: DirectoryFields
  relativeRoot: DirectoryFields
}

export type DirectoryGroup = {
  [mode in Mode]: {
    [platform in NodeJS.Platform]: PlatformDirectories
  }
}

export type platformSetupFunction = {
  checkInstall: (resolvedRootDir: string, directoryGroup: PlatformDirectories) => boolean
  install: () => Promise<void>
  environmentSetup: () => Promise<void>
  startBackend: () => Promise<void>
}
