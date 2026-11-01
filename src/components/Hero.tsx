import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Sparkles,
  ArrowRight,
  Globe,
  Layers,
  Smartphone,
  ShoppingCart,
  Code,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Play,
  Download
} from 'lucide-react';

interface HeroProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { isAuthenticated, setAuthModal } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedTool, setSelectedTool] = useState('website');

  const tools = [
    { id: 'website', label: 'Website', icon: Globe, placeholder: 'e.g. Modern SaaS platform for autonomous robotic fleet management with live telematics' },
    { id: 'webapp', label: 'Web App', icon: Layers, placeholder: 'e.g. Financial budgeting dashboard with real-time expense charts, category tagging and savings goals' },
    { id: 'android', label: 'Android App', icon: Smartphone, placeholder: 'e.g. Fitness tracking Android app in Kotlin Compose with workout timers and step counters' },
    { id: 'landing', label: 'Landing Page', icon: Sparkles, placeholder: 'e.g. High-converting AI copywriting tool launch page with pricing toggle and testimonial bento' },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, placeholder: 'e.g. Minimalist artisan coffee store with cart drawer, subscription options and roast picker' },
    { id: 'code', label: 'Code Gen', icon: Code, placeholder: 'e.g. TypeScript rate-limiter middleware with Redis sliding window and unit tests' },
  ];

  const currentTool = tools.find((t) => t.id === selectedTool) || tools[0];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrompt = prompt.trim() || currentTool.placeholder.replace('e.g. ', '');
    onNavigate('builders', { toolType: selectedTool, initialPrompt: finalPrompt, autoStart: true });
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-white dark:bg-slate-950 transition-colors">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top welcome chip */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6 shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            <span>Turn Your Ideas Into Powerful Digital Products With AI</span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase">
              250 Free Credits
            </span>
          </div>

          {/* Main Hero Header */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-5xl mx-auto leading-tight sm:leading-none">
            Build Websites &amp; Apps <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400">
              With Just One Prompt.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Generate production-ready responsive websites, full-stack web applications, Android Kotlin apps, and high-converting landing pages. Complete with editable source files, live previews, and instant ZIP export.
          </p>

          {/* CTA Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  onNavigate('builders');
                } else {
                  setAuthModal('register');
                }
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center space-x-2 text-base group"
            >
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Start Building Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('home', { section: 'how-it-works' })}
              className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition flex items-center justify-center space-x-2 text-sm"
            >
              <Play className="w-4 h-4 fill-current text-indigo-600 dark:text-indigo-400" />
              <span>See How It Works</span>
            </button>

            <a
              href="/download.tar.gz"
              download="buildai-pro-full-source.tar.gz"
              className="w-full sm:w-auto px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl transition flex items-center justify-center space-x-2 text-sm shadow-lg shadow-emerald-600/25 active:scale-95"
              title="Download entire codebase (.tar.gz) without zip"
            >
              <Download className="w-4 h-4" />
              <span>এক ক্লিকে সোর্স কোড ডাউনলোড</span>
            </a>
          </div>

          {/* Interactive Hero Prompt Box */}
          <div className="mt-12 w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden">
            {/* Tool pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              {tools.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTool(t.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Prompt input field */}
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={currentTool.placeholder}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant preview • Full multi-file code editor • ZIP export included</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center space-x-2 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate {currentTool.label} Project</span>
                </button>
              </div>
            </form>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto w-full text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                250
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Free Credits on Signup
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                6 Builders
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Web, Android, Landing &amp; Apps
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                $350
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Max Referral Commission
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Persistent Database
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
