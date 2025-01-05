import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      $shared: path.resolve(__dirname, 'src/shared')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      exclude: [
        '!src/.{js,ts,cjs}',
        'out/**/*',
        'node_modules/**/*',
        'resources/**/*',
        'tests/**/*',
        'dist/**/*'
      ]
    }
  }
})
