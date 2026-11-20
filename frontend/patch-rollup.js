import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rollupNativePath = path.join(__dirname, 'node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(rollupNativePath)) {
  let content = fs.readFileSync(rollupNativePath, 'utf8');
  if (content.includes("if (error instanceof Error && error.code === 'ERR_DLOPEN_FAILED') {") && !content.includes('@rollup/wasm-node/dist/native.js')) {
    content = content.replace(
      "if (error instanceof Error && error.code === 'ERR_DLOPEN_FAILED') {\n\t\t\tthrow error;\n\t\t}",
      "if (error instanceof Error && error.code === 'ERR_DLOPEN_FAILED') {\n\t\t\ttry { return require('@rollup/wasm-node/dist/native.js'); } catch(e) { throw error; }\n\t\t}"
    );
    fs.writeFileSync(rollupNativePath, content, 'utf8');
    console.log('✓ Successfully patched Rollup for Windows WDAC / AppLocker environment');
  }
}
