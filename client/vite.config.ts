import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Element Plus 自动导入
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia','@vueuse/core'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    // Element Plus 组件自动导入
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  // Monaco Editor 配置
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['monaco-editor/esm/vs/language/json/json.worker', 'monaco-editor/esm/vs/language/css/css.worker', 'monaco-editor/esm/vs/language/html/html.worker', 'monaco-editor/esm/vs/language/typescript/ts.worker', 'monaco-editor/esm/vs/editor/editor.worker', 'sucrase']
  },
  // 性能优化配置
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
          utils: ['axios', 'highlight.js', 'markdown-it'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "element-plus/theme-chalk/src/index.scss" as *;
        `,
      },
    },
  },
});