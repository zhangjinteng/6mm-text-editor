import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { bilibiliPlugin } from './server/bilibili.ts';

export default defineConfig(({ mode }) => ({
  optimizeDeps: { entries: ['index.html'] },
  plugins: [vue(), bilibiliPlugin({ ...loadEnv(mode, process.cwd(), 'BILI_'), ...process.env })]
}));
