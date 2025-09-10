import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'supabase-vendor': ['@supabase/supabase-js']
          }
        }
      }
    },
    define: {
      __SUPABASE_URL__: JSON.stringify('https://xuvmolypqreekoetjked.supabase.co'),
      __SUPABASE_ANON_KEY__: JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dm1vbHlwcXJlZWtvZXRqa2VkIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTc1Mjc0NDEsImV4cCI6MjA3MzEwMzQ0MX0.rONiTJsWdaLdqQPeBT0NYNKNbb3BkReCXblYgr68dGs')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
