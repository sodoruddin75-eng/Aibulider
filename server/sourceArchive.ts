import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export const ROOT_FILES = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  '.env.example',
  '.gitignore',
  'metadata.json',
  'README.md',
  'server.ts'
];

export const INCLUDE_DIRS = ['src', 'server'];

export interface ProjectFileInfo {
  path: string;
  name: string;
  size: number;
  category: string;
  mimeType: string;
}

// Traverse directories recursively ignoring unwanted folders
function walkDir(dir: string, baseDir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file.endsWith('.sqlite') || file.endsWith('.sqlite-journal')) {
      continue;
    }
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath, baseDir, fileList);
    } else {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      fileList.push(relPath);
    }
  }

  return fileList;
}

export function getAllProjectFiles(): ProjectFileInfo[] {
  const allRelPaths: string[] = [];

  for (const f of ROOT_FILES) {
    if (fs.existsSync(path.join(ROOT_DIR, f))) {
      allRelPaths.push(f);
    }
  }

  for (const d of INCLUDE_DIRS) {
    const fullDirPath = path.join(ROOT_DIR, d);
    walkDir(fullDirPath, ROOT_DIR, allRelPaths);
  }

  return allRelPaths.sort().map(relPath => {
    const fullPath = path.join(ROOT_DIR, relPath);
    const stat = fs.statSync(fullPath);
    const ext = path.extname(relPath).toLowerCase();

    let mimeType = 'text/plain; charset=utf-8';
    if (ext === '.json') mimeType = 'application/json';
    else if (ext === '.html') mimeType = 'text/html; charset=utf-8';
    else if (ext === '.css') mimeType = 'text/css; charset=utf-8';
    else if (ext === '.ts' || ext === '.tsx') mimeType = 'text/typescript; charset=utf-8';
    else if (ext === '.js' || ext === '.mjs') mimeType = 'text/javascript; charset=utf-8';

    let category = 'Configuration';
    if (relPath.startsWith('src/pages')) category = 'Frontend Pages';
    else if (relPath.startsWith('src/components')) category = 'UI Components';
    else if (relPath.startsWith('src/context')) category = 'State Management';
    else if (relPath.startsWith('src/types')) category = 'TypeScript Types';
    else if (relPath.startsWith('server/')) category = 'Backend Server';
    else if (relPath === 'server.ts') category = 'Server Entrypoint';
    else if (relPath.startsWith('src/')) category = 'Frontend Core';

    return {
      path: relPath,
      name: path.basename(relPath),
      size: stat.size,
      category,
      mimeType
    };
  });
}

// Safely read a project file preventing directory traversal
export function readProjectFile(relPath: string): { content: string; buffer: Buffer; info: ProjectFileInfo } | null {
  const safeRelPath = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(ROOT_DIR, safeRelPath);

  if (!fullPath.startsWith(ROOT_DIR)) {
    return null;
  }

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    return null;
  }

  const buffer = fs.readFileSync(fullPath);
  const content = buffer.toString('utf-8');
  const stat = fs.statSync(fullPath);

  return {
    content,
    buffer,
    info: {
      path: safeRelPath.replace(/\\/g, '/'),
      name: path.basename(safeRelPath),
      size: stat.size,
      category: 'File',
      mimeType: 'text/plain; charset=utf-8'
    }
  };
}

// Generate ZIP buffer
export function createSourceCodeZip(): Buffer {
  const zip = new AdmZip();

  for (const fileName of ROOT_FILES) {
    const filePath = path.join(ROOT_DIR, fileName);
    if (fs.existsSync(filePath)) {
      zip.addLocalFile(filePath, '');
    }
  }

  for (const dirName of INCLUDE_DIRS) {
    const dirPath = path.join(ROOT_DIR, dirName);
    if (fs.existsSync(dirPath)) {
      zip.addLocalFolder(dirPath, dirName);
    }
  }

  return zip.toBuffer();
}

// Generate TAR.GZ buffer (NON-ZIP alternative)
export function createSourceCodeTarGz(): Buffer {
  const tempTarPath = path.join('/tmp', `buildai-pro-${Date.now()}.tar.gz`);
  try {
    const rootFiles = ROOT_FILES.filter(f => fs.existsSync(path.join(ROOT_DIR, f))).join(' ');
    const cmd = `tar --exclude="node_modules" --exclude="dist" --exclude=".git" --exclude="*.sqlite*" -czf "${tempTarPath}" ${rootFiles} src server`;
    execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe' });
    const buffer = fs.readFileSync(tempTarPath);
    if (fs.existsSync(tempTarPath)) {
      fs.unlinkSync(tempTarPath);
    }
    return buffer;
  } catch (err) {
    if (fs.existsSync(tempTarPath)) {
      try { fs.unlinkSync(tempTarPath); } catch {}
    }
    throw err;
  }
}

// Generate single plain text file containing all code files
export function createAllInOneSourceText(): string {
  const files = getAllProjectFiles();
  let output = `================================================================================\n`;
  output += `BUILDAI PRO - COMPLETE SOURCE CODE EXPORT (ALL-IN-ONE TEXT FORMAT)\n`;
  output += `Export Date: ${new Date().toISOString()}\n`;
  output += `Total Files: ${files.length}\n`;
  output += `Format: Plain Text (No Zip / No Decompression Software Required)\n`;
  output += `================================================================================\n\n`;

  for (const f of files) {
    const fileData = readProjectFile(f.path);
    if (fileData) {
      output += `\n################################################################################\n`;
      output += `### FILE: ${f.path} (${f.size} bytes)\n`;
      output += `################################################################################\n\n`;
      output += fileData.content;
      output += `\n\n`;
    }
  }

  return output;
}

// Generate bash script to download and write all files directly
export function createShellDownloaderScript(baseUrl: string): string {
  const files = getAllProjectFiles();

  let script = `#!/usr/bin/env bash
# ==============================================================================
# BuildAI Pro - Automated Source Code Downloader (Zero ZIP / Direct Files)
# Usage: curl -sSL "${baseUrl}/download.sh" | bash
# ==============================================================================
set -e

TARGET_DIR="buildai-pro"
echo "=========================================================="
echo "🚀 Downloading BuildAI Pro Source Code (Direct Plain Files)..."
echo "Target directory: ./$TARGET_DIR"
echo "=========================================================="

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

`;

  // Create subdirectories
  const dirSet = new Set<string>();
  for (const f of files) {
    const dir = path.dirname(f.path);
    if (dir && dir !== '.') {
      dirSet.add(dir);
    }
  }

  for (const d of Array.from(dirSet).sort()) {
    script += `mkdir -p "${d}"\n`;
  }

  script += `\necho "📥 Fetching files..."\n`;

  for (const f of files) {
    script += `echo " -> ${f.path}"\n`;
    script += `curl -fsSL "${baseUrl}/raw/${f.path}" -o "${f.path}"\n`;
  }

  script += `
echo ""
echo "=========================================================="
echo "✅ All ${files.length} project files downloaded successfully!"
echo "To get started:"
echo "  1. cd $TARGET_DIR"
echo "  2. npm install"
echo "  3. npm run dev"
echo "=========================================================="
`;

  return script;
}
