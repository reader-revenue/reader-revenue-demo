import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoRoot = path.resolve(__dirname, '..');
const swgJsRoot = process.argv[2] ? path.resolve(demoRoot, process.argv[2]) : path.resolve(demoRoot, '../swg-js');

if (!fs.existsSync(swgJsRoot)) {
  console.error(`Error: swg-js repository not found at ${swgJsRoot}`);
  process.exit(1);
}

console.log(`Found swg-js at ${swgJsRoot}`);

console.log('Building swg-js (IIFE)...');
execSync('npm run build', { cwd: swgJsRoot, stdio: 'inherit' });

console.log('Building swg-js (ESM)...');
['basic', 'classic', 'gaa'].forEach(target => {
  execSync(`npx vite build -- --target=${target} --esm`, { cwd: swgJsRoot, stdio: 'inherit' });
});

const variants = [
  { src: 'subscriptions.max.js', dest: 'swg-local.js' },
  { src: 'subscriptions-gaa.max.js', dest: 'swg-gaa-local.js' },
  { src: 'basic-subscriptions.max.js', dest: 'swg-basic-local.js' },
  { src: 'subscriptions.mjs', dest: 'swg-local.mjs' },
  { src: 'subscriptions-gaa.mjs', dest: 'swg-gaa-local.mjs' },
  { src: 'basic-subscriptions.mjs', dest: 'swg-basic-local.mjs' }
];

console.log('Creating symbolic links for JS...');
const publicJsDir = path.resolve(demoRoot, 'public/js');
if (!fs.existsSync(publicJsDir)) {
  fs.mkdirSync(publicJsDir, { recursive: true });
}

variants.forEach(variant => {
  const srcPath = path.resolve(swgJsRoot, 'dist', variant.src);
  const destPath = path.resolve(publicJsDir, variant.dest);
  
  try {
    if (fs.lstatSync(destPath)) {
      fs.unlinkSync(destPath);
    }
  } catch (e) {
    // File doesn't exist, ignore
  }
  
  try {
    fs.symlinkSync(srcPath, destPath);
    console.log(`  Linked JS: ${variant.dest} -> ${variant.src}`);
  } catch (e) {
    console.error(`  Failed to link JS ${variant.dest}: ${e.message}`);
  }
});

console.log('Creating symbolic link for assets...');
const publicAssetsDir = path.resolve(demoRoot, 'public/assets');
const srcAssetsPath = path.resolve(swgJsRoot, 'assets');

try {
  if (fs.lstatSync(publicAssetsDir)) {
    fs.unlinkSync(publicAssetsDir);
  }
} catch (e) {
  // File doesn't exist, ignore
}

try {
  fs.symlinkSync(srcAssetsPath, publicAssetsDir);
  console.log(`  Linked Assets: public/assets -> swg-js/assets`);
} catch (e) {
  console.error(`  Failed to link assets: ${e.message}`);
}

console.log('Updating .env file...');
const envPath = path.resolve(demoRoot, '.env');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

if (!envContent.includes('SWG_OVERRIDE=local')) {
  if (envContent && !envContent.endsWith('\n')) envContent += '\n';
  envContent += 'SWG_OVERRIDE=local\n';
}

if (!envContent.includes('ENV_OVERRIDES=')) {
  envContent += 'ENV_OVERRIDES=SWG_OVERRIDE\n';
} else if (!envContent.includes('SWG_OVERRIDE')) {
  envContent = envContent.replace(/ENV_OVERRIDES=(.*)/, 'ENV_OVERRIDES=$1,SWG_OVERRIDE');
}

fs.writeFileSync(envPath, envContent);
console.log('Done! Please restart your demo server if it is currently running.');
