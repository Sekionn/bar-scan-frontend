import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_TARGET || 'https://localhost:8080',
          changeOrigin: true,
          secure: env.VITE_DEV_API_SECURE !== 'false',
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
      },
    },
    preview: { host: true, port: 3000 },
    test: { environment: 'jsdom', setupFiles: './src/setupTests.ts' },
  };
});
