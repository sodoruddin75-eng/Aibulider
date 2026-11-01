import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Smartphone,
  Globe,
  Coins,
  Share2,
  Lock,
  Download,
  Sliders,
  Zap,
  Layers,
  Database
} from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    {
      title: '6 Powerful AI Builders in One',
      desc: 'Seamlessly switch between Website, Web App, Android Compose, Landing Page, E-commerce, and Code generators.',
      icon: Layers,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      title: 'True Android Kotlin Projects',
      desc: 'Generates real AndroidManifest.xml, build.gradle.kts, and Jetpack Compose 35 code ready for Android Studio.',
      icon: Smartphone,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      title: 'Atomic Credit Ledger & Escrow',
      desc: 'Every credit transaction is permanently journaled in SQLite with atomic rollbacks on failed generations.',
      icon: Database,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60'
    },
    {
      title: 'Lucrative Referral System',
      desc: 'Earn up to $350 cash commission on every referred plan purchase with transparent click & signup tracking.',
      icon: Share2,
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/60'
    },
    {
      title: 'Manual Plan Payment Gateway',
      desc: 'Secure payment review process with unique purchase IDs and direct admin verification before plan activation.',
      icon: ShieldCheck,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60'
    },
    {
      title: 'Instant Multi-File ZIP Export',
      desc: 'Download your complete project tree as a structured ZIP file with clean semantic structure and assets.',
      icon: Download,
      color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/60'
    },
    {
      title: 'Live Responsive Device Frames',
      desc: 'Test your generated projects on smartphone, tablet, and desktop viewport sizes inside the interactive sandbox.',
      icon: Sliders,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60'
    },
    {
      title: 'Owner-Only Complete Admin Panel',
      desc: 'Total management of users, subscriptions, manual purchases, payout requests, pricing, and Facebook settings.',
      icon: Lock,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
    }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Enterprise-Grade Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Everything You Need To Build &amp; Monetize
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Engineered with full-stack reliability, persistent relational storage, and real AI models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
