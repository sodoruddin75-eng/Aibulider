import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import {
  Share2,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  Award
} from 'lucide-react';

interface ReferralSectionProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, setAuthModal } = useAuth();
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(5);

  const starterCommission = parseInt(settings.commission_starter || '100', 10);
  const growthCommission = parseInt(settings.commission_growth || '200', 10);
  const enterpriseCommission = parseInt(settings.commission_enterprise || '350', 10);

  // Approximate average commission: blend of starter, growth, enterprise
  const avgCommission = Math.round((starterCommission + growthCommission * 2 + enterpriseCommission) / 4);
  const estimatedEarnings = referralCount * avgCommission;

  const currentRefCode = user?.referral_code || 'YOURCODE';
  const referralLink = `${window.location.origin}/?ref=${currentRefCode}`;

  const copyLink = () => {
    if (!isAuthenticated) {
      setAuthModal('login');
      return;
    }
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="referrals" className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/60 dark:to-slate-950 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>Unlimited Referral Program</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Earn Up To <span className="text-emerald-600 dark:text-emerald-400">$350 Cash</span> Per Referral
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Share your unique referral link with creators, agencies, and businesses. When they purchase an approved subscription plan, you get paid direct cash commissions.
          </p>
        </div>

        {/* Commission Table Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Starter Plan ($250)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              ${starterCommission}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Cash commission paid to you for every verified Starter Plan purchase.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800/90 dark:to-slate-900 border-2 border-indigo-600 shadow-xl space-y-4 relative">
            <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase">
              Most Popular
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Growth Plan ($350)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
              ${growthCommission}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Highest volume referral plan. Earn $200 per verified growth customer.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Enterprise Plan ($500)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              ${enterpriseCommission}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Maximum cash earnings. Get $350 for every high-tier enterprise upgrade.
            </p>
          </div>
        </div>

        {/* Interactive Calculator & Referral Link Box */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Earnings calculator */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Earnings Simulator</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              How much can you earn?
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                <span>Monthly Referred Upgrades:</span>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg text-base font-black">
                  {referralCount} Customers
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={referralCount}
                onChange={(e) => setReferralCount(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>1 customer</span>
                <span>25 customers</span>
                <span>50 customers</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                  Estimated Cash Commission
                </span>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ${estimatedEarnings.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold max-w-[140px] text-right">
                Request manual payouts via Bank, PayPal, or Crypto!
              </span>
            </div>
          </div>

          {/* User Referral Link card */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Your Personal Referral Link
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Share this link on social media, blogs, YouTube, or with clients. Every signup is permanently tracked in our relational database.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 select-all"
              />
              <button
                type="button"
                onClick={copyLink}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    onNavigate('dashboard', { tab: 'referrals' });
                  } else {
                    setAuthModal('register');
                  }
                }}
                className="w-full py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>View My Referral Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
