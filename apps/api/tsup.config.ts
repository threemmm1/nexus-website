import { defineConfig } from 'tsup';

// The workspace packages (@vesioh/types, @vesioh/utils) are source-only — their
// package.json "main" points at .ts files, which Node cannot run directly. We
// bundle them into the server output and keep real node_modules dependencies
// external so they resolve normally at runtime.
export default defineConfig({
  entry: { server: 'src/server.ts' },
  outDir: 'dist',
  format: ['cjs'],
  target: 'node20',
  platform: 'node',
  noExternal: [/@vesioh\//],
  clean: true,
  sourcemap: true,
  minify: false,
  // Surfaced by env validation at boot; no need for type-decl emit on a server.
  dts: false,
});
