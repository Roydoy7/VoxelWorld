import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { spawn } from 'child_process';

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

const ROOT = import.meta.dir;
const PORT = 8080;

// Start bun build --watch in background
const build = spawn('bun', ['build', 'src/main.ts', '--outdir', 'dist', '--watch'], {
  cwd: ROOT,
  stdio: 'inherit',
});

build.on('error', (e) => console.error('Build process error:', e));

// Serve static files
Bun.serve({
  port: PORT,
  fetch(req) {
    let url = new URL(req.url).pathname;
    if (url === '/') url = '/public/index.html';

    const filePath = join(ROOT, url);
    if (!existsSync(filePath)) {
      return new Response('Not Found', { status: 404 });
    }

    const ext = extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    const body = readFileSync(filePath);

    return new Response(body, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  },
});

console.log(`Dev server running at http://localhost:${PORT}/`);
