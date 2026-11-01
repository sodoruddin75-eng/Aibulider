import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { AiProject } from '../types/index.js';
import {
  Globe,
  Layers,
  Smartphone,
  Sparkles,
  ShoppingCart,
  Code,
  Play,
  RotateCw,
  Download,
  Save,
  Check,
  Copy,
  ExternalLink,
  Laptop,
  Tablet,
  FileCode,
  Eye,
  History,
  AlertCircle,
  Coins,
  ChevronRight,
  Info
} from 'lucide-react';

interface BuildersPageProps {
  initialTool?: string;
  initialPrompt?: string;
  autoStart?: boolean;
  onNavigate: (view: string, extra?: any) => void;
}

export const BuildersPage: React.FC<BuildersPageProps> = ({
  initialTool = 'website',
  initialPrompt = '',
  autoStart = false,
  onNavigate
}) => {
  const { user, credits, token, isAuthenticated, setAuthModal, updateUserCreditsLocally, triggerOutOfCreditsModal } = useAuth();
  const { settings, isAiConfigured } = useSettings();

  const [toolType, setToolType] = useState<string>(initialTool);
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [currentProject, setCurrentProject] = useState<AiProject | null>(null);
  const [activeFile, setActiveFile] = useState<string>('index.html');
  const [editedFiles, setEditedFiles] = useState<Record<string, string>>({});
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [historyProjects, setHistoryProjects] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const toolDefs = [
    {
      id: 'website',
      name: 'AI Website Builder',
      shortName: 'Website',
      icon: Globe,
      cost: parseInt(settings.cost_website || '15', 10),
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60',
      sample: 'Modern cyber-security SaaS platform with interactive threat map, pricing tiers, and client testimonials'
    },
    {
      id: 'webapp',
      name: 'AI Web App Builder',
      shortName: 'Web App',
      icon: Layers,
      cost: parseInt(settings.cost_webapp || '25', 10),
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60',
      sample: 'Interactive cloud infrastructure monitoring dashboard with real-time CPU/memory charts and server logs'
    },
    {
      id: 'android',
      name: 'AI Android App Builder',
      shortName: 'Android App',
      icon: Smartphone,
      cost: parseInt(settings.cost_android || '30', 10),
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60',
      sample: 'Habit tracking and morning routine Android app in Jetpack Compose 35 with streak counters and sound reminders'
    },
    {
      id: 'landing',
      name: 'AI Landing Page Builder',
      shortName: 'Landing Page',
      icon: Sparkles,
      cost: parseInt(settings.cost_landing || '10', 10),
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/60',
      sample: 'High-converting pre-launch landing page for an AI smart ring with preorder deposit modal and FAQ accordion'
    },
    {
      id: 'ecommerce',
      name: 'AI E-commerce Builder',
      shortName: 'E-commerce',
      icon: ShoppingCart,
      cost: parseInt(settings.cost_ecommerce || '25', 10),
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60',
      sample: 'Luxury streetwear boutique store with animated slide-over shopping bag, currency selector, and filter tabs'
    },
    {
      id: 'code',
      name: 'AI Code Generator',
      shortName: 'Code Gen',
      icon: Code,
      cost: parseInt(settings.cost_code || '5', 10),
      color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/60',
      sample: 'Production TypeScript JWT refresh token rotation service with Redis cache and express route middleware'
    }
  ];

  const currentTool = toolDefs.find((t) => t.id === toolType) || toolDefs[0];

  // Load user generation history
  const loadHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/ai/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryProjects(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [token]);

  // Handle auto-start from homepage hero prompt
  useEffect(() => {
    if (autoStart && prompt && !isGenerating && !currentProject) {
      handleGenerate();
    }
  }, [autoStart]);

  // When current project changes, sync active file & files
  useEffect(() => {
    if (currentProject?.files) {
      setEditedFiles(currentProject.files);
      const fileNames = Object.keys(currentProject.files);
      if (fileNames.length > 0) {
        if (toolType === 'android') {
          const mainActivity = fileNames.find(f => f.includes('MainActivity')) || fileNames[0];
          setActiveFile(mainActivity);
        } else {
          setActiveFile(fileNames.includes('index.html') ? 'index.html' : fileNames[0]);
        }
      }
    }
  }, [currentProject]);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setAuthModal('login');
      return;
    }

    const currentPrompt = prompt.trim() || currentTool.sample;
    if (credits.balance < currentTool.cost) {
      triggerOutOfCreditsModal();
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationStage('Analyzing requirements...');

    // Visual progression stages
    const timer1 = setTimeout(() => setGenerationStage('Architecting blueprint & components...'), 1200);
    const timer2 = setTimeout(() => setGenerationStage('Compiling production-ready code with Gemini...'), 2600);
    const timer3 = setTimeout(() => setGenerationStage('Assembling live sandbox preview...'), 4200);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          toolType,
          prompt: currentPrompt,
          framework: toolType === 'android' ? 'kotlin-compose-35' : 'html-tailwind'
        })
      });

      const data = await res.json();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!res.ok) {
        if (data.code === 'INSUFFICIENT_CREDITS') {
          triggerOutOfCreditsModal();
        } else {
          setErrorMsg(data.error || 'Generation failed');
        }
        if (data.credits) {
          updateUserCreditsLocally(data.credits);
        }
      } else {
        setCurrentProject(data.project);
        if (data.credits) {
          updateUserCreditsLocally(data.credits);
        }
        loadHistory();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed');
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  const handleFileChange = (content: string) => {
    setEditedFiles((prev) => ({
      ...prev,
      [activeFile]: content
    }));
  };

  // Save modified files to backend
  const handleSaveProject = async () => {
    if (!currentProject || !token) return;
    try {
      const res = await fetch(`/api/ai/projects/${currentProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          files: editedFiles,
          previewHtml: editedFiles['index.html'] || currentProject.previewHtml
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  // Download project as full ZIP archive
  const handleDownloadZip = async () => {
    if (!currentProject) return;
    const zip = new JSZip();

    // Populate zip with all files
    for (const [filename, content] of Object.entries(editedFiles)) {
      zip.file(filename, content);
    }

    // Add README.md
    if (!editedFiles['README.md']) {
      zip.file(
        'README.md',
        `# ${currentProject.title}\n\nGenerated with BuildAI Pro (${(currentProject.toolType || currentProject.tool_type || 'web').toUpperCase()})\nPrompt: ${currentProject.prompt}\n\n## Instructions\n- For Web projects: Open index.html in any modern browser or host on Vercel/Netlify.\n- For Android projects: Open project root in Android Studio (Giraffe/Hedgehog/Ladybug) and sync Gradle.\n`
      );
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-buildai.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load a historical project
  const loadHistoricalProject = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/ai/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentProject({
          ...data,
          previewHtml: data.preview_html
        });
        setToolType(data.tool_type);
        setPrompt(data.prompt);
        setHistoryOpen(false);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const copyCurrentCode = () => {
    const code = editedFiles[activeFile] || '';
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getActiveFileContent = () => {
    return editedFiles[activeFile] || '';
  };

  // Determine preview HTML
  const getPreviewSource = () => {
    if (editedFiles['index.html']) {
      return editedFiles['index.html'];
    }
    return currentProject?.previewHtml || '<h1>No Preview Available</h1>';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors">
      {/* Top Builder Studio Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
            B
          </div>
          <div>
            <h1 className="text-sm font-extrabold flex items-center space-x-2">
              <span>BuildAI Pro Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
                v3.8 Flash
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">6 Specialized AI Generation Engines</p>
          </div>
        </div>

        {/* Right Studio Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1.5 text-slate-700 dark:text-slate-300"
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span>History ({historyProjects.length})</span>
          </button>

          {currentProject && (
            <>
              <button
                onClick={handleSaveProject}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition flex items-center space-x-1.5 text-slate-700 dark:text-slate-300"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleDownloadZip}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ZIP</span>
              </button>
            </>
          )}

          {/* Credits remaining indicator */}
          <button
            onClick={triggerOutOfCreditsModal}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1"
          >
            <Coins className="w-3 h-3 text-amber-500" />
            <span>{credits.balance.toLocaleString()}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Tool Configuration & Prompt Area */}
        <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col space-y-4 shrink-0 overflow-y-auto">
          {/* Tool Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select AI Builder Tool
            </label>
            <div className="grid grid-cols-2 gap-2">
              {toolDefs.map((tool) => {
                const Icon = tool.icon;
                const isSelected = toolType === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      setToolType(tool.id);
                      if (!prompt) setPrompt(tool.sample);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                        {tool.cost} pts
                      </span>
                    </div>
                    <span className="text-xs font-bold truncate">{tool.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Input Field */}
          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Prompt &amp; Concept
              </label>
              <button
                type="button"
                onClick={() => setPrompt(currentTool.sample)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Insert Sample
              </button>
            </div>

            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={currentTool.sample}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none leading-relaxed"
            />

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
              <span>Estimated Cost:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {currentTool.cost} Credits
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI Connectivity status note */}
          {!isAiConfigured && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 flex items-start space-x-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                Gemini API Key can be connected in Settings &gt; Secrets for live streaming LLM inference. High-grade scaffolding is active!
              </span>
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>{generationStage || 'Generating Project...'}</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate {currentTool.shortName}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Preview & Multi-File Code Editor */}
        <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden">
          {/* Top Preview/Code Switcher Bar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex space-x-1">
                <button
                  type="button"
                  onClick={() => setPreviewTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    previewTab === 'preview'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Sandbox</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    previewTab === 'code'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Code Files ({Object.keys(editedFiles).length})</span>
                </button>
              </div>

              {currentProject && (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-xs">
                  {currentProject.title}
                </span>
              )}
            </div>

            {/* Viewport switchers (only visible in preview tab) */}
            {previewTab === 'preview' && toolType !== 'android' && (
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1.5 rounded-lg transition ${
                    viewportMode === 'desktop'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Desktop View"
                >
                  <Laptop className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('tablet')}
                  className={`p-1.5 rounded-lg transition ${
                    viewportMode === 'tablet'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1.5 rounded-lg transition ${
                    viewportMode === 'mobile'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center animate-bounce">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {generationStage || 'Synthesizing Architecture...'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Writing clean code, designing responsive layouts, and bundling project files.
                  </p>
                </div>
              </div>
            ) : !currentProject ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Ready to Build Your Next Project
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Enter your prompt on the left and click Generate, or click below to launch a sample project.
                </p>
                <button
                  onClick={() => {
                    setPrompt(currentTool.sample);
                    handleGenerate();
                  }}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
                >
                  Launch Sample {currentTool.shortName}
                </button>
              </div>
            ) : previewTab === 'preview' ? (
              /* Live Sandbox Viewport */
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-200/60 dark:bg-slate-950">
                <div
                  className={`h-full transition-all duration-300 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col ${
                    toolType === 'android'
                      ? 'w-full max-w-md'
                      : viewportMode === 'mobile'
                      ? 'w-[375px]'
                      : viewportMode === 'tablet'
                      ? 'w-[768px]'
                      : 'w-full'
                  }`}
                >
                  <iframe
                    ref={previewIframeRef}
                    title="Live Project Preview"
                    srcDoc={getPreviewSource()}
                    className="w-full h-full border-none flex-1"
                    sandbox="allow-scripts allow-modals allow-forms"
                  />
                </div>
              </div>
            ) : (
              /* Code Files Editor View */
              <div className="flex-1 flex flex-col sm:flex-row overflow-hidden bg-slate-900 text-slate-100">
                {/* File Tree sidebar */}
                <div className="w-full sm:w-60 bg-slate-950 p-3 border-r border-slate-800 overflow-y-auto space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
                    Project Explorer
                  </div>
                  {Object.keys(editedFiles).map((filename) => (
                    <button
                      key={filename}
                      type="button"
                      onClick={() => setActiveFile(filename)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition flex items-center space-x-2 truncate ${
                        activeFile === filename
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{filename}</span>
                    </button>
                  ))}
                </div>

                {/* Editor & Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{activeFile}</span>
                    <button
                      type="button"
                      onClick={copyCurrentCode}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center space-x-1"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <textarea
                    value={getActiveFileContent()}
                    onChange={(e) => handleFileChange(e.target.value)}
                    className="flex-1 w-full p-4 bg-slate-900 text-slate-200 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generation History Drawer */}
        {historyOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-30 p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold uppercase text-slate-500">Generation History</h4>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {historyProjects.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">
                  No saved projects yet. Generate your first idea!
                </div>
              ) : (
                historyProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadHistoricalProject(p.id)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        {p.tool_type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition">
                      {p.title}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
