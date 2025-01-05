import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
		resolve: {
			alias: {
				$shared: resolve(__dirname, './src/shared')
			}
		}
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
		resolve: {
			alias: {
				$shared: resolve(__dirname, './src/shared')
			}
		}
	},
	renderer: {
		plugins: [react()],
		resolve: {
			alias: {
				$shared: resolve(__dirname, './src/shared'),
				'@renderer': resolve('src/renderer/src'),
				'@': resolve(__dirname, 'src/renderer/src')
			}
		}
	}
})
