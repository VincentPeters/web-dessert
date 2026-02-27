const { execSync, spawn } = require('child_process');
const { watch } = require('fs');
const path = require('path');

const WATCH_DIRS = ['posts', 'templates', 'src'];

function build() {
  try {
    execSync('node build.js', { stdio: 'inherit' });
  } catch (e) {
    console.error('Build failed:', e.message);
  }
}

// Initial build
build();

// Start browser-sync
const bs = spawn('npx', ['browser-sync', 'start', '--server', 'dist', '--files', 'dist/**/*', '--no-open'], {
  stdio: 'inherit',
  shell: true,
});

// Watch source files and rebuild on change
let debounce = null;
for (const dir of WATCH_DIRS) {
  watch(path.join(__dirname, dir), { recursive: true }, () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      console.log('\nFile changed, rebuilding...');
      build();
    }, 200);
  });
}

console.log(`\nWatching: ${WATCH_DIRS.join(', ')}`);

process.on('SIGINT', () => {
  bs.kill();
  process.exit();
});
