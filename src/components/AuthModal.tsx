import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { X, Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, Gift } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModal, setAuthModal, login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(authModal === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode with prop
  React.useEffect(() => {
    if (authModal) {
      setIsRegister(authModal === 'register');
      setError(null);
    }
  }, [authModal]);

  if (!authModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register(name, email, password, referralCode);
        if (!res.success) setError(res.error || 'Failed to register');
      } else {
        const res = await login(email, password);
        if (!res.success) setError(res.error || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setIsRegister(false);
      setEmail('tanvirahamedapon99@gmail.com');
      setPassword('A@2$dh:;');
    } else {
      setIsRegister(false);
      setEmail('demo@buildai.pro');
      setPassword('DemoPass123!');
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top bar banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white relative">
          <button
            onClick={() => setAuthModal(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>250 Free Credits for New Accounts</span>
          </div>

          <h3 className="text-2xl font-black tracking-tight">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            {isRegister
              ? 'Join BuildAI Pro and transform ideas into digital reality.'
              : 'Sign in to access your projects, credits & earnings.'}
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Quick Demo Test:</span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md font-semibold hover:bg-amber-500/20 transition"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('user')}
              className="px-2 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-md font-semibold hover:bg-indigo-500/20 transition"
            >
              Demo User
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. DEMO100"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="text-xs">Processing...</span>
            ) : (
              <>
                <span>{isRegister ? 'Claim 250 Free Credits' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Register with 250 Free Credits"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
