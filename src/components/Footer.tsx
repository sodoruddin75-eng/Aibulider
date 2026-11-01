import React from 'react';
import { useSettings } from '../context/SettingsContext.js';
import { Sparkles, MessageCircle, ShieldCheck, Heart, ExternalLink, Download } from 'lucide-react';



interface FooterProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useSettings();

  const isFbEnabled = settings.facebook_button_enabled === '1' || settings.facebook_button_enabled === 'true';
  const fbUrl = settings.facebook_messenger_url || settings.facebook_page_url;
  const fbBtnText = settings.facebook_button_text || 'Contact for Payment';

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                BuildAI <span className="text-indigo-400">Pro</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings.site_tagline || 'Turn Your Ideas Into Powerful Digital Products With AI.'} Generate production-grade websites, web apps, Android Kotlin apps, and landing pages with a single prompt.
            </p>

            {/* Configurable Facebook Contact Button */}
            {isFbEnabled && fbUrl && (
              <div className="pt-2">
                <a
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{fbBtnText}</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            )}
          </div>

          {/* AI Builders */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">
              AI Builders
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('builders', { toolType: 'website' })}
                  className="hover:text-white transition"
                >
                  AI Website Builder
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('builders', { toolType: 'webapp' })}
                  className="hover:text-white transition"
                >
                  AI Web App Builder
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('builders', { toolType: 'android' })}
                  className="hover:text-white transition"
                >
                  AI Android App Builder
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('builders', { toolType: 'landing' })}
                  className="hover:text-white transition"
                >
                  AI Landing Page Builder
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('builders', { toolType: 'ecommerce' })}
                  className="hover:text-white transition"
                >
                  AI E-commerce Builder
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('builders', { toolType: 'code' })}
                  className="hover:text-white transition"
                >
                  AI Code Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Referral */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('home', { section: 'pricing' })} className="hover:text-white transition">
                  Pricing Plans ($250, $350, $500)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', { section: 'referrals' })} className="hover:text-white transition">
                  Referral Commissions ($100-$350)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', { section: 'how-it-works' })} className="hover:text-white transition">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('support')} className="hover:text-white transition">
                  Support Center &amp; Tickets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { page: 'contact' })} className="hover:text-white transition">
                  Contact Us
                </button>
              </li>
              <li className="pt-2 border-t border-slate-900/60 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Source Downloads (No ZIP)
                </div>
                <div>
                  <a
                    href="/download.tar.gz"
                    download="buildai-pro-full-source.tar.gz"
                    className="inline-flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-semibold transition"
                    title="Download Unix/Linux/macOS TAR.GZ archive (Not a ZIP)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .TAR.GZ (No ZIP)</span>
                  </a>
                </div>
                <div>
                  <a
                    href="/download/all-files.txt"
                    download="buildai-pro-all-code.txt"
                    className="inline-flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition"
                    title="Single all-in-one plain text file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Plain Text (.txt)</span>
                  </a>
                </div>
                <div>
                  <a
                    href="/download.zip"
                    download="buildai-pro-full-source.zip"
                    className="inline-flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ZIP Archive</span>
                  </a>
                </div>
              </li>
            </ul>
          </div>


          {/* Legal Pages */}
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">
              Legal &amp; Policy
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('legal', { page: 'terms' })} className="hover:text-white transition">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { page: 'privacy' })} className="hover:text-white transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { page: 'refund' })} className="hover:text-white transition">
                  Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal', { page: 'referral_policy' })} className="hover:text-white transition">
                  Referral Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BuildAI Pro. All rights reserved. Persistent Relational Architecture.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Manual Approval Escrow</span>
            </span>
            <span>•</span>
            <span>250 Free Credits Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
