import React from 'react';
import { Globe, Smartphone, Sparkles, Check, ArrowRight, Layers, ShoppingCart, Code } from 'lucide-react';

interface BuildersIntroProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const BuildersIntro: React.FC<BuildersIntroProps> = ({ onNavigate }) => {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Intro Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Builder Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Designed for Creators, Agencies &amp; Developers
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Whether you need a high-converting web presence or a production Android application, BuildAI Pro writes clean, human-readable code in seconds.
          </p>
        </div>

        {/* Feature 1: AI Website & Web App Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Globe className="w-6 h-6" />
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              AI Website &amp; Web App Builder
            </h3>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Generate responsive multi-page websites and interactive web applications with modern Tailwind CSS styling, responsive viewports, and clean JavaScript architecture.
            </p>

            <ul className="space-y-3">
              {[
                'Full responsive design for mobile, tablet, laptop, and desktop',
                'Interactive state management, filtering, and live search components',
                'Editable source code with real-time sandbox preview',
                'Ready-to-deploy clean semantic HTML5 & modern CSS'
              ].map((feat, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('builders', { toolType: 'website' })}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center space-x-2"
              >
                <span>Launch Website Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-slate-400">preview-sandbox.html</span>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                Live Iframe
              </span>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-100 dark:border-slate-700 space-y-3">
              <div className="h-5 w-24 bg-indigo-600/20 rounded-md" />
              <div className="h-8 w-3/4 bg-slate-900/10 dark:bg-white/10 rounded-lg" />
              <div className="h-4 w-full bg-slate-900/5 dark:bg-white/5 rounded-md" />
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="h-20 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-xl border border-indigo-500/20" />
                <div className="h-20 bg-purple-500/10 dark:bg-purple-400/10 rounded-xl border border-purple-500/20" />
                <div className="h-20 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl border border-emerald-500/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: AI Android App Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Showcase Card */}
          <div className="order-2 lg:order-1 p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl relative flex items-center justify-center">
            <div className="w-64 h-[440px] bg-black rounded-[36px] p-2.5 border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col">
              {/* Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto" />
              <div className="p-4 flex-1 space-y-3 bg-slate-900 rounded-[28px] mt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">Android Studio Ready</span>
                  <span className="text-[10px] text-emerald-400">Kotlin Compose</span>
                </div>
                <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
                  <div className="text-xs font-bold text-indigo-300">MainActivity.kt</div>
                  <div className="text-[10px] text-indigo-200 mt-1">@Composable fun AppContent()</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold text-slate-300">AndroidManifest.xml</div>
                  <div className="text-[10px] text-slate-400 mt-1">SDK 35 • Material 3 Components</div>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold text-slate-300">build.gradle.kts</div>
                  <div className="text-[10px] text-slate-400 mt-1">androidx.compose.material3</div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              AI Android App Builder
            </h3>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Transform natural language app ideas into real Kotlin code and Jetpack Compose layouts ready to open, test, and build directly inside Android Studio.
            </p>

            <ul className="space-y-3">
              {[
                'Generates AndroidManifest.xml, build.gradle.kts, and strings/colors resources',
                'Modern Jetpack Compose 35 declarative UI with Material Design 3',
                'Integrated interactive smartphone simulator preview in browser',
                'One-click ZIP download of complete Android project tree'
              ].map((feat, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('builders', { toolType: 'android' })}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center space-x-2"
              >
                <span>Launch Android App Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
