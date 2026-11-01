import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import {
  Sparkles,
  Zap,
  Coins,
  Shield,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Layers,
  Smartphone,
  Globe,
  ShoppingCart,
  Code,
  Share2,
  HelpCircle,
  Plus,
  Download
} from 'lucide-react';

import { SourceModal } from './SourceModal.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, extra?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, credits, isAuthenticated, isAdmin, logout, setAuthModal, triggerOutOfCreditsModal } = useAuth();
  const { theme, toggleTheme, settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [buildersDropdownOpen, setBuildersDropdownOpen] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);

  const isSoleSuperAdmin = isAuthenticated && isAdmin && user?.email?.toLowerCase() === 'tanvirahamedapon99@gmail.com';

  const builders = [
    { id: 'website', name: 'AI Website Builder', icon: Globe, desc: 'Responsive multi-section websites' },
    { id: 'webapp', name: 'AI Web App Builder', icon: Layers, desc: 'Full-stack dynamic applications' },
    { id: 'android', name: 'AI Android App Builder', icon: Smartphone, desc: 'Native Kotlin & Jetpack Compose' },
    { id: 'landing', name: 'AI Landing Page Builder', icon: Sparkles, desc: 'High-converting sales funnels' },
    { id: 'ecommerce', name: 'AI E-commerce Builder', icon: ShoppingCart, desc: 'Online stores with cart & checkout' },
    { id: 'code', name: 'AI Code Generator', icon: Code, desc: 'Production APIs, schemas & logic' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition duration-200">
            <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                BuildAI
              </span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white tracking-wider">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold -mt-0.5 tracking-tight hidden sm:block">
              AI App &amp; Website SaaS
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          {/* Builders dropdown */}
          <div className="relative">
            <button
              onClick={() => setBuildersDropdownOpen(!buildersDropdownOpen)}
              onBlur={() => setTimeout(() => setBuildersDropdownOpen(false), 200)}
              className={`px-3 py-2 rounded-xl flex items-center space-x-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition ${
                currentView === 'builders' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : ''
              }`}
            >
              <span>AI Builders</span>
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>

            {buildersDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 grid grid-cols-1 gap-1">
                {builders.map((b) => {
                  const Icon = b.icon;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        onNavigate('builders', { toolType: b.id });
                        setBuildersDropdownOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition flex items-start space-x-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {b.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {b.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('home', { section: 'how-it-works' })}
            className="px-3 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            How It Works
          </button>

          <button
            onClick={() => onNavigate('home', { section: 'pricing' })}
            className="px-3 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Pricing Plans
          </button>

          <button
            onClick={() => onNavigate('home', { section: 'referrals' })}
            className="px-3 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center space-x-1"
          >
            <span>Refer &amp; Earn</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold rounded-md">
              $350
            </span>
          </button>

          <button
            onClick={() => onNavigate('support')}
            className={`px-3 py-2 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 transition ${
              currentView === 'support' ? 'text-indigo-600 dark:text-indigo-400' : ''
            }`}
          >
            Support
          </button>

          {/* Discreet Admin navigation link - strictly for sole owner */}
          {isSoleSuperAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                currentView === 'admin'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40'
                  : 'hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300'
              }`}
              title="Access Admin Dashboard"
            >
              <Shield className="w-3.5 h-3.5 opacity-60" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Source Code & Downloads (Zero-ZIP and TAR/Raw options) */}
          <button
            onClick={() => setSourceModalOpen(true)}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition"
            title="Download source code (TAR.GZ, Single Raw Files, Plain Text, or ZIP)"
          >
            <Code className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Get Code</span>
            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold rounded-md">
              No ZIP
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Credits Pill */}
              <button
                onClick={triggerOutOfCreditsModal}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center space-x-2 shadow-xs hover:border-indigo-400 transition"
                title="Click to view plans & add credits"
              >
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>{credits.balance.toLocaleString()} Credits</span>
                <Plus className="w-3 h-3 text-indigo-500" />
              </button>

              {/* Admin Panel button (strictly if sole super admin) */}
              {isSoleSuperAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                    currentView === 'admin'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 hover:bg-amber-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      <div className="mt-1.5 flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Ref Code:</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {user?.referral_code}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition flex items-center space-x-2"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>User Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('builders');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition flex items-center space-x-2"
                      >
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>AI Builders Studio</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('dashboard', { tab: 'referrals' });
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition flex items-center space-x-2"
                      >
                        <Share2 className="w-4 h-4 text-emerald-500" />
                        <span>Referrals &amp; Commissions</span>
                      </button>

                      <a
                        href="/download"
                        download="buildai-pro-full-source.zip"
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4 text-sky-500" />
                        <span>Download Full Source ZIP</span>
                      </a>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setAuthModal('login')}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthModal('register')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Start Building Free</span>
              </button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
          <button
            onClick={() => {
              onNavigate('builders');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2.5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            AI Builders Studio
          </button>
          <button
            onClick={() => {
              onNavigate('home', { section: 'pricing' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2.5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Pricing Plans ($250, $350, $500)
          </button>
          <button
            onClick={() => {
              onNavigate('home', { section: 'referrals' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2.5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Referral Program
          </button>
          <button
            onClick={() => {
              onNavigate('support');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2.5 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Live Support
          </button>
          <button
            onClick={() => {
              setSourceModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left p-2.5 rounded-xl font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>Download Code (No ZIP)</span>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
              TAR / Raw / Text
            </span>
          </button>
          {isAuthenticated && (
            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              My Dashboard
            </button>
          )}
          {isSoleSuperAdmin && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
            >
              <Shield className="w-4 h-4 opacity-60" />
              <span>Admin</span>
            </button>
          )}
        </div>
      )}

      {/* Zero-ZIP Source Code and Downloads Explorer Modal */}
      <SourceModal
        isOpen={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
      />
    </header>
  );
};
