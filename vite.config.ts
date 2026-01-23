import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap' // 可选: 'sunburst' | 'treemap' | 'network'
    })
  ],
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
    minify: 'esbuild',
    rollupOptions: {
      external: ['vue', '@vue/shared'],
      output: {
        globals: {
          vue: 'Vue',
          '@vue/shared': 'VueShared'
        }
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false
      }
    }
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.jsx', '.tsx']
  }
})
