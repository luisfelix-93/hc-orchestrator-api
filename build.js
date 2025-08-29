const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'], // O ponto de entrada da sua aplicação
  bundle: true,
  platform: 'node',
  target: 'node18', // A versão do Node que você está usando
  outfile: 'dist/bundle.js', // O arquivo de saída único
  external: ['node_modules/*'], // Opcional: para não incluir node_modules no bundle
}).catch(() => process.exit(1));