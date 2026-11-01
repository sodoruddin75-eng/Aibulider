import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileCode,
  Folder,
  Terminal,
  Copy,
  Check,
  FileText,
  ExternalLink,
  Layers,
  Search,
  Sparkles,
  Archive,
  Code
} from 'lucide-react';

interface FileItem {
  path: string;
  name: string;
  size: number;
  category: string;
  mimeType: string;
}

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'explorer'>('downloads');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('server.ts');
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Load file list
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/files/tree')
      .then(res => res.json())
      .then(data => {
        if (data.files) {
          setFiles(data.files);
        }
      })
      .catch(err => console.error('Failed to load file tree:', err));
  }, [isOpen]);

  // Load selected file content
  useEffect(() => {
    if (!isOpen || !selectedFilePath) return;

    setLoadingContent(true);
    fetch(`/api/files/content?path=${encodeURIComponent(selectedFilePath)}`)
      .then(res => res.json())
      .then(data => {
        setSelectedFileContent(data.content || '');
      })
      .catch(err => {
        console.error('Failed to load file content:', err);
        setSelectedFileContent('// Failed to load file content');
      })
      .finally(() => setLoadingContent(false));
  }, [isOpen, selectedFilePath]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredFiles = files.filter(f => 
    f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(filteredFiles.map(f => f.category)));

  // Base URL for current origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const bashCommand = `curl -sSL "${origin}/download.sh" | bash`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold">Source Code & Direct Downloads</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  Zero ZIP Options Available
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download as TAR.GZ, single raw files, plain text, or browse complete code in-browser
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('downloads')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'downloads'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Download Options
              </button>
              <button
                onClick={() => setActiveTab('explorer')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'explorer'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                In-Browser Code Explorer ({files.length} files)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Toggle */}
        <div className="flex sm:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 p-1">
          <button
            onClick={() => setActiveTab('downloads')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg text-center ${
              activeTab === 'downloads'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Download Options
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg text-center ${
              activeTab === 'explorer'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Code Explorer ({files.length})
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'downloads' ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Highlight Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Looking for downloads without a ZIP file?</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Below are 4 direct non-zip alternatives: TAR.GZ archive, single All-in-One Plain Text file, direct terminal command, or individual raw file downloads.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('explorer')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Browse Files Individually</span>
                </button>
              </div>

              {/* Grid of Non-Zip & Download Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method 1: TAR.GZ (NO ZIP) */}
                <div className="p-5 rounded-2xl border-2 border-indigo-500/30 bg-white dark:bg-slate-800/60 shadow-sm flex flex-col justify-between hover:border-indigo-500 transition group">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Archive className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                        NON-ZIP ARCHIVE
                      </span>
                    </div>
                    <h4 className="text-base font-bold mt-3">Download .TAR.GZ Archive</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Standard Unix/Linux/macOS compressed tarball format. Zero zip software needed; natively unpacks on Linux, Mac, Termux, and Windows.
                    </p>
                    <div className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">
                      tar -xzf buildai-pro-full-source.tar.gz
                    </div>
                  </div>
                  <a
                    href="/download.tar.gz"
                    download="buildai-pro-full-source.tar.gz"
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .tar.gz (74 KB)</span>
                  </a>
                </div>

                {/* Method 2: All-in-One Plain Text File */}
                <div className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-white dark:bg-slate-800/60 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition group">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                        100% PLAIN TEXT
                      </span>
                    </div>
                    <h4 className="text-base font-bold mt-3">All-in-One Plain Text (.txt)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Every source code file merged into a single clean text file with file headers. No extraction or unzipping required whatsoever.
                    </p>
                    <div className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 p-2 rounded-lg truncate">
                      File: server.ts, App.tsx, package.json...
                    </div>
                  </div>
                  <a
                    href="/download/all-files.txt"
                    download="buildai-pro-all-code.txt"
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Plain Text (.txt)</span>
                  </a>
                </div>

                {/* Method 3: One-line Terminal Command (Zero-ZIP) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400">
                        DIRECT TERMINAL
                      </span>
                    </div>
                    <h4 className="text-base font-bold mt-3">One-Line Terminal Script</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Fetches all project files directly into a clean <code className="font-mono">buildai-pro</code> folder on your computer without touching any zip file.
                    </p>
                    <div className="mt-3 bg-slate-950 text-slate-200 p-2.5 rounded-xl font-mono text-xs flex items-center justify-between gap-2 border border-slate-800">
                      <span className="truncate">{bashCommand}</span>
                      <button
                        onClick={() => handleCopy(bashCommand, 'cmd')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 text-[11px] flex items-center space-x-1"
                      >
                        {copiedText === 'cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedText === 'cmd' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                  <a
                    href="/download.sh"
                    download="download.sh"
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download download.sh Script</span>
                  </a>
                </div>

                {/* Method 4: Standard ZIP Archive (Optional) */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                        <Folder className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        STANDARD ZIP
                      </span>
                    </div>
                    <h4 className="text-base font-bold mt-3">Download ZIP Archive</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Standard ZIP package containing the complete project code, ready to extract anywhere.
                    </p>
                    <div className="mt-3 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">
                      buildai-pro-full-source.zip
                    </div>
                  </div>
                  <a
                    href="/download.zip"
                    download="buildai-pro-full-source.zip"
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ZIP Archive</span>
                  </a>
                </div>
              </div>

              {/* Quick Individual Files List */}
              <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-indigo-500" />
                    <span>Download Key Files Individually (Zero Archive)</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('explorer')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <span>View all {files.length} files</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'server.ts',
                    'src/App.tsx',
                    'src/main.tsx',
                    'package.json',
                    'server/db.ts',
                    'server/auth.ts',
                    'server/ai.ts',
                    'src/pages/AdminPage.tsx',
                    'src/pages/BuildersPage.tsx'
                  ].map((pathName) => (
                    <div
                      key={pathName}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono truncate mr-2">{pathName}</span>
                      <div className="flex items-center space-x-1">
                        <a
                          href={`/raw/${pathName}?download=1`}
                          download={pathName.split('/').pop()}
                          title="Direct file download"
                          className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`/raw/${pathName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View raw in browser tab"
                          className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Interactive In-Browser Code Explorer */
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* File Sidebar */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-3">
                  {categories.map((cat) => {
                    const catFiles = filteredFiles.filter(f => f.category === cat);
                    if (catFiles.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {cat}
                        </div>
                        {catFiles.map((file) => (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFilePath(file.path)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-mono flex items-center justify-between transition ${
                              selectedFilePath === file.path
                                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                                : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="truncate mr-1">{file.name}</span>
                            <span className={`text-[10px] shrink-0 ${selectedFilePath === file.path ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {(file.size / 1024).toFixed(1)}k
                            </span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Code Viewer */}
              <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
                {/* Code Header Bar */}
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-mono text-xs font-bold text-white truncate">{selectedFilePath}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleCopy(selectedFileContent, selectedFilePath)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5"
                      title="Copy all code in this file"
                    >
                      {copiedText === selectedFilePath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === selectedFilePath ? 'Copied Code' : 'Copy File'}</span>
                    </button>

                    <a
                      href={`/raw/${selectedFilePath}?download=1`}
                      download={selectedFilePath.split('/').pop()}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                      title="Download this single file directly without ZIP"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>

                    <a
                      href={`/raw/${selectedFilePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Open raw code in new browser tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Code Body */}
                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 select-text">
                  {loadingContent ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      Loading {selectedFilePath}...
                    </div>
                  ) : (
                    <pre className="whitespace-pre leading-relaxed">{selectedFileContent}</pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
