import { defineConfig } from 'vite'

import viteTsConfigPaths from 'vite-tsconfig-paths'
import dts from 'vite-plugin-dts'
import { join } from 'path'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import mdPlugin, { Mode } from 'vite-plugin-markdown'

export default defineConfig({
  assetsInclude: ['**/*.vrm', '**/*.svg'],
  resolve: {
    alias: {
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      url: 'rollup-plugin-node-polyfills/polyfills/url',
      querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
    },
  },
  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
    mdPlugin({ mode: [Mode.HTML, Mode.TOC, Mode.REACT] }),
    dts({
      tsConfigFilePath: join(__dirname, 'tsconfig.lib.json'),
      // Faster builds by skipping tests. Set this to false to enable type checking.
      skipDiagnostics: true,
    }),

    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  viteTsConfigPaths({
  //    root: '../../',
  //  }),
  // },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: false,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'client-core',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forgot to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [],
      plugins: [rollupNodePolyFill()],
    },
  },
})
