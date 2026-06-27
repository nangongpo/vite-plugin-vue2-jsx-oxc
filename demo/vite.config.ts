import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'
import vue2JsxOxc from 'vite-plugin-vue2-jsx-oxc'

export default defineConfig({
  base: process.env.DEMO_BASE || '/',
  plugins: [
    vue2(),
    vue2JsxOxc({
      compositionAPI: 'native',
      vOn: false,
      fragment: 'array',
      hmr: true,
      ssr: true,
      dependencyScan: true
    })
  ],
  server: {
    port: 5178
  },
  build: {
    sourcemap: true
  }
})
