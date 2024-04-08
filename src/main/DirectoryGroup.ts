import { Mode, PlatformDirectories } from './MyTypes'

export type DirectoryGroup = {
  [mode: Mode]: {
    [platform: NodeJS.Platform]: PlatformDirectories
  }
}
