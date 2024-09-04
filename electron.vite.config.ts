import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        $shared: path.resolve(__dirname, './src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        $shared: path.resolve(__dirname, './src/shared')
      }
    }
  },
  renderer: {
    plugins: [svelte()],
    resolve: {
      alias: {
        $lib: path.resolve(__dirname, './src/renderer/src/lib'),
        $shared: path.resolve(__dirname, './src/shared')
      }
    }
  }
})
