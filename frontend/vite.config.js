import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/order': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
