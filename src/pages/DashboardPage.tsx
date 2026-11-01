import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import {
  Coins,
  Share2,
  Download,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  User,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  FolderCode,
  ExternalLink,
  LifeBuoy,
  Settings,
  Plus
} from 'lucide-react';

interface DashboardPageProps {
  initialTab?: string;
  onNavigate: (view: string, extra?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ initialTab = 'overview', onNavigate }) => {
  const { user, credits, token, triggerOutOfCreditsModal } = useAuth();
  const { settings, plans } = useSettings();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Data states
  const [projects, setProjects] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [creditLedger, setCreditLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Payout request modal/form state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutFullName, setPayoutFullName] = useState(user?.name || '');
  const [payoutEmail, setPayoutEmail] = useState(user?.email || '');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [payoutMessage, setPayoutMessage] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  // Profile update state
  const [editName, setEditName] = useState(user?.name || '');
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const referralLink = `${window.location.origin}/?ref=${user?.referral_code || ''}`;

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [projRes, purRes, refRes, payRes, ledRes] = await Promise.all([
        fetch('/api/ai/projects', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/purchases/my', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/referrals/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/payouts/my', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/credits/ledger', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (projRes.ok) setProjects(await projRes.json());
      if (purRes.ok) setPurchases(await purRes.json());
      if (refRes.ok) setReferralStats(await refRes.json());
      if (payRes.ok) setPayouts(await payRes.json());
      if (ledRes.ok) {
        const ledData = await ledRes.json();
        setCreditLedger(ledData.ledger || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Submit manual payout request
  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);
    setPayoutError(null);
    setPayoutSuccessMsg(null);

    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: payoutFullName,
          registeredEmail: payoutEmail,
          referralCode: user?.referral_code,
          commissionAmount: payoutAmount,
          paymentMethod: payoutMethod,
          paymentAccountDetails: payoutDetails,
          message: payoutMessage
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setPayoutError(data.error || 'Failed to submit payout request');
      } else {
        setPayoutSuccessMsg(`Payout request ${data.payoutId} submitted successfully! Admin will process your transfer.`);
        fetchDashboardData();
        setTimeout(() => {
          setShowPayoutModal(false);
          setPayoutSuccessMsg(null);
          setPayoutAmount('');
          setPayoutDetails('');
        }, 3000);
      }
    } catch (err: any) {
      setPayoutError(err.message || 'Connection failed');
    } finally {
      setPayoutLoading(false);
    }
  };

  // Profile update submit
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          currentPassword: currPassword || undefined,
          newPassword: newPassword || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProfileMsg('Profile updated successfully!');
        setCurrPassword('');
        setNewPassword('');
      } else {
        setProfileMsg(data.error || 'Update failed');
      }
    } catch (err: any) {
      setProfileMsg(err.message || 'Error updating profile');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Section */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Verified Account: {user?.email}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome Back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
              Track your AI project generations, credit usage history, active subscriptions, and cash referral payouts from your command center.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10">
            <button
              onClick={() => onNavigate('builders')}
              className="px-5 py-3 bg-white text-indigo-900 hover:bg-slate-100 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <FolderCode className="w-4 h-4 text-indigo-600" />
              <span>Launch AI Studio</span>
            </button>
            <button
              onClick={triggerOutOfCreditsModal}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Credits</span>
            </button>
          </div>
        </div>

        {/* 4 Core Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Remaining Credits */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Remaining Balance</span>
              <Coins className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {credits.balance.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Earned: {credits.totalEarned.toLocaleString()}</span>
              <span>Used: {credits.totalUsed.toLocaleString()}</span>
            </div>
          </div>

          {/* Current Subscription */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Plan</span>
              <CreditCard className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {purchases.find(p => p.status === 'approved')?.plan_name || 'Free Starter Tier'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {purchases.some(p => p.status === 'approved') ? 'Active Lifetime Access' : '250 Free Credits Active'}
            </div>
          </div>

          {/* Referral Earnings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Referral Commissions</span>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ${referralStats?.totalEarned?.toLocaleString() || '0'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Pending: ${referralStats?.pendingPayout || 0}</span>
              <span>Paid: ${referralStats?.paidTotal || 0}</span>
            </div>
          </div>

          {/* Generated Projects */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">AI Projects Saved</span>
              <FolderCode className="w-5 h-5 text-violet-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {projects.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Across all 6 builder engines
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Projects & Generations' },
            { id: 'referrals', label: 'Referrals & Cash Commissions' },
            { id: 'payouts', label: 'Payout Requests' },
            { id: 'purchases', label: 'Purchase Invoices' },
            { id: 'ledger', label: 'Credit Ledger' },
            { id: 'settings', label: 'Account Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & Projects */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Your Generated Projects</h3>
              <button
                onClick={() => onNavigate('builders')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>New Project</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <FolderCode className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No projects generated yet
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your 250 free credits are waiting. Build your first responsive website or Android app in seconds.
                </p>
                <button
                  onClick={() => onNavigate('builders')}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Start Building Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[10px]">
                          {proj.tool_type}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(proj.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {proj.prompt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Cost: {proj.credits_used} credits
                      </span>
                      <button
                        onClick={() => onNavigate('builders', { toolType: proj.tool_type, projectId: proj.id })}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg hover:bg-indigo-100 transition flex items-center space-x-1"
                      >
                        <span>Open Studio</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Referrals & Commissions */}
        {activeTab === 'referrals' && (
          <div className="space-y-8">
            {/* Referral Link & Stats banner */}
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Your Unlimited Referral System</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Earn $100 (Starter), $200 (Growth), or $350 (Enterprise) when your friends purchase an approved plan.
                  </p>
                </div>

                {referralStats?.pendingPayout > 0 && (
                  <button
                    onClick={() => setShowPayoutModal(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Request Commission Payout (${referralStats.pendingPayout})</span>
                  </button>
                )}
              </div>

              {/* Link copy field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Your Shareable Referral Link
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 select-all"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
                    >
                      {copiedLink ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Referral Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={user?.referral_code || ''}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-indigo-600 select-all uppercase"
                    />
                    <button
                      onClick={copyReferralCode}
                      className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold shrink-0 transition"
                    >
                      {copiedCode ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Referral Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {referralStats?.totalClicks || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Link Clicks
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {referralStats?.totalSignups || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Referred Users
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                    ${referralStats?.pendingPayout || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Pending Payout
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    ${referralStats?.paidTotal || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Paid Commissions
                  </div>
                </div>
              </div>
            </div>

            {/* Commissions list */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h4 className="text-base font-bold">Commission Ledger Records</h4>

              {(!referralStats?.commissions || referralStats.commissions.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No referred purchases yet. Share your referral link to earn your first commission!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                        <th className="py-2.5">Buyer</th>
                        <th>Plan</th>
                        <th>Plan Price</th>
                        <th>Your Commission</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {referralStats.commissions.map((comm: any) => (
                        <tr key={comm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 font-semibold">{comm.referee_name}</td>
                          <td>{comm.plan_name}</td>
                          <td>${comm.plan_price}</td>
                          <td className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            +${comm.commission_amount}
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              comm.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : comm.status === 'approved'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}>
                              {comm.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-slate-400">
                            {new Date(comm.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Payout Requests */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Manual Payout Requests</h3>
                <p className="text-xs text-slate-500">Track the status of your commission payout transfers.</p>
              </div>
              <button
                onClick={() => setShowPayoutModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Submit New Payout Request
              </button>
            </div>

            {payouts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No payout requests submitted yet.
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <tr>
                        <th className="p-4">Payout ID</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Account Details</th>
                        <th>Status</th>
                        <th>Transaction Ref</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {payouts.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-mono font-bold text-indigo-600">{pay.id}</td>
                          <td className="font-bold text-slate-900 dark:text-white">${pay.commission_amount}</td>
                          <td>{pay.payment_method}</td>
                          <td className="truncate max-w-xs">{pay.payment_account_details}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pay.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : pay.status === 'approved'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : pay.status === 'rejected'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}>
                              {pay.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="font-mono text-slate-500">{pay.transaction_reference || '—'}</td>
                          <td className="text-slate-400">{new Date(pay.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Purchases Invoices */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Plan Purchase Invoices &amp; Manual Verification</h3>

            {purchases.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No purchases submitted yet.
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <tr>
                        <th className="p-4">Purchase ID</th>
                        <th>Plan Name</th>
                        <th>Amount</th>
                        <th>Payment Reference</th>
                        <th>Status</th>
                        <th>Admin Note</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {purchases.map((pur) => (
                        <tr key={pur.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-4 font-mono font-bold text-indigo-600">{pur.id}</td>
                          <td className="font-semibold">{pur.plan_name}</td>
                          <td className="font-bold">${pur.amount}</td>
                          <td className="font-mono text-slate-600 dark:text-slate-300">{pur.payment_reference}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pur.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : pur.status === 'rejected'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}>
                              {pur.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-slate-500">{pur.admin_note || '—'}</td>
                          <td className="text-slate-400">{new Date(pur.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Credit Ledger */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Immutable Credit Ledger Audit Trail</h3>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="p-4">Transaction Reason</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                      <th>Description</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {creditLedger.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {row.reason}
                        </td>
                        <td className={`font-black ${row.amount > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {row.amount > 0 ? `+${row.amount}` : row.amount}
                        </td>
                        <td className="font-bold">{row.balance_after}</td>
                        <td className="text-slate-500">{row.description || '—'}</td>
                        <td className="text-slate-400">{new Date(row.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Account Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-lg font-bold">Profile &amp; Security Settings</h3>

            {profileMsg && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Registered Email (Fixed)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Change Password
                </h4>
                <div>
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm mb-2"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Manual Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Request Referral Commission Payout
                </h3>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {payoutError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                {payoutError}
              </div>
            )}

            {payoutSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold">
                {payoutSuccessMsg}
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutFullName}
                    onChange={(e) => setPayoutFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Registered Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={payoutEmail}
                    onChange={(e) => setPayoutEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Commission Amount ($ USD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 200"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Preferred Payment Method <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Wise">Wise</option>
                    <option value="Crypto USDT">Crypto (USDT TRC20/ERC20)</option>
                    <option value="Other">Other Direct Wire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Payment Account Details (IBAN, PayPal Email, or Wallet Address) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide Bank Name, Account Number/IBAN, SWIFT or PayPal email address..."
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Optional Note for Admin
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please process before Friday"
                  value={payoutMessage}
                  onChange={(e) => setPayoutMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {payoutLoading ? 'Submitting...' : 'Submit Payout Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
