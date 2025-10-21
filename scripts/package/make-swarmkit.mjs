import { createWriteStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import archiver from 'archiver';

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const outputName = 'SwarmKit.zip';
  const outputPath = resolve(outputName);
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = createWriteStream(outputPath);

  archive.pipe(stream);

  const directories = ['src', 'pages', 'netlify', 'scrolls', 'docs', 'supabase'];
  for (const dir of directories) {
    const full = resolve(dir);
    if (await exists(full)) {
      archive.directory(full, dir);
    }
  }

  const files = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'next-env.d.ts',
    'README.md',
    'README.deploy.md',
    'Codex-Index-Scroll.md',
    'Codex-Main-Scroll.md',
    'CHANGELOG.md',
    'Makefile',
    'netlify.toml'
  ];

  for (const file of files) {
    const full = resolve(file);
    if (await exists(full)) {
      archive.file(full, { name: file });
    }
  }

  for (const artifact of ['out', '.next']) {
    const full = resolve(artifact);
    if (await exists(full)) {
      archive.directory(full, artifact.replace(/^[.]/, ''));
    }
  }

  await archive.finalize();

  await new Promise((resolveStream, rejectStream) => {
    stream.on('close', resolveStream);
    stream.on('error', rejectStream);
  });

  console.log(JSON.stringify({
    ritual: 'swarmkit-zip',
    status: 'sealed',
    artifact: outputName,
    sizeBytes: archive.pointer()
  }));
}

main().catch((error) => {
  console.error(JSON.stringify({ ritual: 'swarmkit-zip', status: 'error', message: error.message }));
  process.exitCode = 1;
});
