import { readFileSync } from 'fs'

export type Config = {
  [key: string]: {
    filename: string
  }
}

export function configReader(): Config {
  return JSON.parse(readFileSync('config.json', 'utf8'))
}

export const Delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))
