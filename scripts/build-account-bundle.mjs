import { build } from 'esbuild';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const outJs = resolve(root, 'assets/js/gogo-account.js');
const srcCss = resolve(root, 'assets/css/gogo-account.css');

await build({
  entryPoints: [resolve(root, 'src/gogo-account.ts')],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: true,
  sourcemap: false,
  outfile: outJs,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

console.log('[build-account-bundle] Built /assets/js/gogo-account.js successfully.');

// Also copy into upstream source clones if present so their local href/src tests pass
const fletchDir = '/tmp/Fletch_Game';
if (existsSync(fletchDir)) {
  mkdirSync(resolve(fletchDir, 'js'), { recursive: true });
  mkdirSync(resolve(fletchDir, 'css'), { recursive: true });
  copyFileSync(outJs, resolve(fletchDir, 'js/gogo-account.js'));
  copyFileSync(srcCss, resolve(fletchDir, 'css/gogo-account.css'));
  console.log('[build-account-bundle] Synced gogo-account bundle to /tmp/Fletch_Game.');
}

const crystalDir = '/tmp/crystal-quest-web';
if (existsSync(crystalDir)) {
  mkdirSync(resolve(crystalDir, 'js'), { recursive: true });
  copyFileSync(outJs, resolve(crystalDir, 'js/gogo-account.js'));
  copyFileSync(srcCss, resolve(crystalDir, 'gogo-account.css'));
  console.log('[build-account-bundle] Synced gogo-account bundle to /tmp/crystal-quest-web.');
}
