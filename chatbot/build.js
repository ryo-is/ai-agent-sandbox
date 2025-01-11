import preact from '@preact/preset-vite';
import child_process from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, loadEnv } from 'vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const env = loadEnv('production', '');
console.log(env.VITE_AI_API_ENDPOINT);
const modules = [
  {
    entry: resolve(__dirname, 'src/main.tsx'),
    dir: 'aladdinGenerateAiClient/1.1.7/js',
    fileName: 'index',
    exportAs: 'aladdinGenerateAiClient',
  },
];

const cmd = 'git log -n 1 --format=%h,%cd';
const result = child_process.execSync(cmd).toString().split(',');
const commitId = result[0];

async function buildPackages() {
  for (const module of modules) {
    const config = {
      build: {
        lib: {
          entry: module.entry,
          name: module.exportAs,
          fileName: module.fileName,
          formats: ['es'],
        },
        outDir: `dist/${module.dir}`,
        rollupOptions: {
          output: {
            banner: [
              '/*!',
              ` * name - ${module.fileName}`,
              ` * commit - ${commitId}`,
              ` * copyright - (c) ${new Date().getFullYear()} Sprocket, Inc.`,
              ' */',
            ].join('\n'),
          },
        },
        chunkSizeWarningLimit: 100,
      },
      esbuild: {
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        jsxInject: `import { h, Fragment } from 'preact'`,
      },
      configFile: false,
      plugins: [
        cssInjectedByJsPlugin({
          styleId: 'cssInjectedByJsPlugin',
        }),
        preact(),
        vanillaExtractPlugin(),
      ],
    };

    if (module.exportAs === 'aladdinGenerateAiClient') {
      config.define = {
        'process.env.NODE_ENV': `"production"`,
        'process.env': {},
      };
    }

    await build(config);
  }
}

buildPackages();
