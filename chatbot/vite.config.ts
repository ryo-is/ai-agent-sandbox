import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import preact from '@preact/preset-vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: {
          aladdinGenerateAiClient: resolve(__dirname, 'src/main.tsx'),
        },
      },
      chunkSizeWarningLimit: 100,
    },
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      jsxInject: `import { h, Fragment } from 'preact'`,
    },
    plugins: [
      cssInjectedByJsPlugin({
        styleId: 'cssInjectedByJsPlugin',
      }),
      preact(),
      vanillaExtractPlugin(),
    ],
  };
});
