import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  define: {
    'process.env': {},
    'process.platform': JSON.stringify('browser'),
    'process.version': JSON.stringify(''),
    'process.versions': JSON.stringify({}),
    'process.browser': true,
    'process.node': false
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TinySchemaRenderer',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue', '@vue/shared'],
      output: {
        globals: {
          vue: 'Vue',
          '@vue/shared': 'VueShared'
        }
      }
    }
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.jsx', '.tsx']
  },
  optimizeDeps: {
    exclude: ['@babel/core', '@babel/types']
  }
})
