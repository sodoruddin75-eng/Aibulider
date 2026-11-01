import React from 'react';
import { MessageSquareCode, Cpu, Laptop, DownloadCloud, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Enter Your Prompt',
      desc: 'Describe what you want to create in natural language. Choose your target platform: Website, Web App, Android, Landing Page, or E-commerce.',
      icon: MessageSquareCode,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      num: '02',
      title: 'AI Architect & Compile',
      desc: 'Our Gemini AI engine scaffolds complete source files, responsive components, CSS styling, and reactive logic within seconds.',
      icon: Cpu,
      color: 'from-indigo-600 to-violet-600'
    },
    {
      num: '03',
      title: 'Live Sandbox & Code Editor',
      desc: 'Test your interactive project in our live device simulator. Edit files directly in our multi-file code editor with instant real-time reload.',
      icon: Laptop,
      color: 'from-violet-600 to-purple-600'
    },
    {
      num: '04',
      title: 'Export & Deploy Anywhere',
      desc: 'Download your full project as a structured ZIP archive. Open Android projects in Android Studio or deploy web projects to any hosting provider.',
      icon: DownloadCloud,
      color: 'from-purple-600 to-pink-600'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            How BuildAI Pro Works
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            From raw idea to production digital assets in 4 straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Step number badge */}
                <span className="text-4xl font-black text-slate-200 dark:text-slate-800 absolute top-6 right-6 select-none group-hover:text-indigo-500/20 transition-colors">
                  {s.num}
                </span>

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${s.color} text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
