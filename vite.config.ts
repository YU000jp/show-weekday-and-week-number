import { defineConfig } from 'vite';
import { string } from 'rollup-plugin-string';
import logseqDevPlugin from 'vite-plugin-logseq';

export default defineConfig(({ command, mode, ssrBuild }) => {
  const forProd = mode === 'production';

  return {
    plugins: [
      // Makes HMR available for development
      logseqDevPlugin(),
      {
        ...string({
          include: '**/*.css',
        }),
        enforce: 'pre',
      },
    ],
    build: {
      sourcemap: !forProd,
      target: 'esnext',
      minify: forProd ? 'esbuild' : false,
    },
  };
});
