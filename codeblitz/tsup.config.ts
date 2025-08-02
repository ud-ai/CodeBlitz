import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    background: 'src/background.ts',
    contentScript: 'src/contentScript.ts',
  },
  format: ['iife'],
  target: 'chrome112',
  outDir: 'dist',
  minify: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  define: {
    'import.meta.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
  },
});
