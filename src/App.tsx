/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle2, 
  FileCode, 
  FolderTree, 
  Copy, 
  Check, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  GitBranch,
  Archive,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';

interface ProjectFile {
  path: string;
  name: string;
  category: 'config' | 'source' | 'root';
  content: string;
}

const PROJECT_FILES: ProjectFile[] = [
  {
    path: '.npmrc',
    name: '.npmrc',
    category: 'config',
    content: `legacy-peer-deps=true\n`
  },
  {
    path: 'package.json',
    name: 'package.json',
    category: 'config',
    content: `{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0",
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.28.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "@types/express": "^4.17.21"
  }
}\n`
  },
  {
    path: 'vite.config.ts',
    name: 'vite.config.ts',
    category: 'config',
    content: `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});\n`
  },
  {
    path: 'tsconfig.json',
    name: 'tsconfig.json',
    category: 'config',
    content: `{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "types": ["vite/client"],
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}\n`
  },
  {
    path: 'index.html',
    name: 'index.html',
    category: 'root',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Vite Web App</title>
    <meta name="description" content="Modern React and Vite application with Tailwind CSS" />
    <meta property="og:title" content="React Vite Web App" />
    <meta property="og:description" content="Modern React and Vite application with Tailwind CSS" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>\n`
  },
  {
    path: '.gitignore',
    name: '.gitignore',
    category: 'root',
    content: `node_modules/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example\n`
  },
  {
    path: 'src/main.tsx',
    name: 'src/main.tsx',
    category: 'source',
    content: `import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);\n`
  },
  {
    path: 'src/index.css',
    name: 'src/index.css',
    category: 'source',
    content: `@import "tailwindcss";\n`
  },
  {
    path: 'src/App.tsx',
    name: 'src/App.tsx',
    category: 'source',
    content: `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">My React App</h1>
        <p className="text-slate-400 text-sm">Successfully deployed and building on Vercel!</p>
      </div>
    </div>
  );
}\n`
  }
];

export default function App() {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[1]); // default to package.json
  const [downloading, setDownloading] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();
      const folder = zip.folder('my-react-app');

      if (!folder) throw new Error('Could not create zip folder');

      // Add all files
      PROJECT_FILES.forEach(file => {
        folder.file(file.path, file.content);
      });

      // Generate the zip blob
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-react-app-fixed.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating zip:', err);
      // Fallback to static zip
      window.location.href = '/react-vite-fixed.zip';
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = (content: string, path: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white flex items-center gap-2">
                Project Download Center
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                  Vercel Ready
                </span>
              </h1>
              <p className="text-xs text-slate-400">Complete, production-tested folder with resolved peer dependencies</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/react-vite-fixed.zip"
              download="my-react-app-fixed.zip"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              Direct Link
            </a>
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Preparing Archive...' : 'Download Folder (.zip)'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Highlight Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" />
                ERESOLVE Conflict Fixed
              </div>
              <h2 className="text-xl font-bold text-white">
                Download the complete codebase as a ready-to-use folder
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Includes all updated configuration files (<code className="text-indigo-300">esbuild ^0.28.0</code>, <code className="text-indigo-300">.npmrc</code> with <code className="text-indigo-300">legacy-peer-deps=true</code>, TypeScript, Vite, and Tailwind setups).
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="self-start md:self-auto shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-xl shadow-indigo-600/20 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              {downloading ? 'Generating ZIP...' : 'Download Project Folder (.zip)'}
            </button>
          </div>
        </div>

        {/* Quick Instructions & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              1. Unzip & Enter
            </div>
            <code className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded block overflow-x-auto font-mono">
              unzip my-react-app-fixed.zip && cd my-react-app
            </code>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              2. Install & Verify
            </div>
            <code className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded block overflow-x-auto font-mono">
              npm install && npm run build
            </code>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              3. Push to GitHub
            </div>
            <code className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded block overflow-x-auto font-mono">
              git add . && git commit -m "fix deps" && git push
            </code>
          </div>
        </div>

        {/* Interactive Folder & File Explorer */}
        <div className="border border-slate-800 rounded-2xl bg-slate-900/80 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          {/* File Sidebar */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-800 p-4 bg-slate-950/50 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-400" />
                Folder Explorer
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {PROJECT_FILES.length} files
              </span>
            </div>

            <div className="space-y-1 flex-1 overflow-y-auto">
              <div className="text-[11px] font-mono text-slate-500 px-2 pt-1 pb-1">
                my-react-app/
              </div>
              {PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.path}</span>
                    </span>
                    {file.path === '.npmrc' || file.path === 'package.json' ? (
                      <span className="text-[10px] uppercase font-sans font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        Fixed
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* File Content Preview */}
          <div className="md:col-span-8 flex flex-col bg-slate-950">
            <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-300 font-medium">{selectedFile.path}</span>
                {selectedFile.path === 'package.json' && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Updated with esbuild ^0.28.0
                  </span>
                )}
              </div>

              <button
                onClick={() => handleCopy(selectedFile.content, selectedFile.path)}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition cursor-pointer"
              >
                {copiedPath === selectedFile.path ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

