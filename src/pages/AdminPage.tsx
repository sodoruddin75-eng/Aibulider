import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import {
  Shield,
  Users,
  CreditCard,
  Share2,
  DollarSign,
  Cpu,
  Settings as SettingsIcon,
  MessageCircle,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Plus,
  Minus,
  AlertCircle,
  Save,
  Check,
  RefreshCw,
  Sliders,
  LifeBuoy
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, token, isAdmin } = useAuth();
  const { refreshSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<string>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Users tab state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<any | null>(null);
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState<string>('');
  const [creditAdjustmentReason, setCreditAdjustmentReason] = useState<string>('Admin manual adjustment');

  // Plans tab state
  const [adminPlans, setAdminPlans] = useState<any[]>([]);

  // Purchases tab state (Manual Plan Payment Review)
  const [purchases, setPurchases] = useState<any[]>([]);
  const [selectedPurchaseForReview, setSelectedPurchaseForReview] = useState<any | null>(null);
  const [purchaseReviewNote, setPurchaseReviewNote] = useState<string>('');

  // Commissions & Referrals tab state
  const [commissions, setCommissions] = useState<any[]>([]);

  // Payouts tab state
  const [payouts, setPayouts] = useState<any[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [payoutTxRef, setPayoutTxRef] = useState<string>('');
  const [payoutNotes, setPayoutNotes] = useState<string>('');

  // Settings tab state
  const [adminSettings, setAdminSettings] = useState<Record<string, string>>({});
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Support tickets tab state
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState<string>('');

  // Audit logs tab state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchAdminData = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    try {
      const [metRes, usrRes, purRes, comRes, payRes, setRes, tckRes, logRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/purchases', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/commissions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/payouts', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/support', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (metRes.ok) setMetrics(await metRes.json());
      if (usrRes.ok) setUsersList(await usrRes.json());
      if (purRes.ok) setPurchases(await purRes.json());
      if (comRes.ok) setCommissions(await comRes.json());
      if (payRes.ok) setPayouts(await payRes.json());
      if (setRes.ok) setAdminSettings(await setRes.json());
      if (tckRes.ok) setSupportTickets(await tckRes.json());
      if (logRes.ok) setAuditLogs(await logRes.json());

      // Fetch plans
      const plansRes = await fetch('/api/plans');
      if (plansRes.ok) setAdminPlans(await plansRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token, userSearch]);

  const isSoleSuperAdmin = isAdmin && user?.email?.toLowerCase() === 'tanvirahamedapon99@gmail.com';

  if (!isSoleSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <Shield className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This Admin Panel is exclusively restricted to the platform owner (<span className="font-semibold text-slate-700 dark:text-slate-300">tanvirahamedapon99@gmail.com</span>). No other account can access this panel.
          </p>
        </div>
      </div>
    );
  }

  // Adjust User Credits
  const handleCreditAdjustment = async () => {
    if (!selectedUserForCredit || !creditAdjustmentAmount) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUserForCredit.id}/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: creditAdjustmentAmount,
          reason: 'admin_adjustment',
          description: creditAdjustmentReason
        })
      });

      if (res.ok) {
        setSelectedUserForCredit(null);
        setCreditAdjustmentAmount('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to adjust credits:', err);
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Review Purchase Request (Approve or Reject)
  const handleReviewPurchase = async (status: 'approved' | 'rejected') => {
    if (!selectedPurchaseForReview) return;
    try {
      const res = await fetch(`/api/admin/purchases/${selectedPurchaseForReview.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          adminNote: purchaseReviewNote
        })
      });

      if (res.ok) {
        setSelectedPurchaseForReview(null);
        setPurchaseReviewNote('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to review purchase:', err);
    }
  };

  // Review Payout Request (Approve, Mark as Paid, Reject)
  const handleReviewPayout = async (status: 'approved' | 'paid' | 'rejected') => {
    if (!selectedPayout) return;
    try {
      const res = await fetch(`/api/admin/payouts/${selectedPayout.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          transactionReference: payoutTxRef || undefined,
          adminNotes: payoutNotes || undefined,
          paymentDate: status === 'paid' ? new Date().toISOString() : undefined
        })
      });

      if (res.ok) {
        setSelectedPayout(null);
        setPayoutTxRef('');
        setPayoutNotes('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to review payout:', err);
    }
  };

  // Save Admin Settings (Facebook links, commissions, costs, policies)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(adminSettings)
      });

      if (res.ok) {
        setSettingsSaved(true);
        refreshSettings();
        setTimeout(() => setSettingsSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Reply to support ticket
  const handleReplyTicket = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    try {
      const res = await fetch(`/api/admin/support/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adminReply: ticketReplyText.trim(),
          status: 'resolved'
        })
      });

      if (res.ok) {
        setReplyTicketId(null);
        setTicketReplyText('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to reply ticket:', err);
    }
  };

  // Update Plan Price or Credits
  const handleUpdatePlan = async (planId: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchAdminData();
        refreshSettings();
      }
    } catch (err) {
      console.error('Failed to update plan:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight">BuildAI Pro Owner Command Center</h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 text-[10px] font-bold">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage users, manual purchase approvals, referral cash payouts, Facebook settings, and AI engine parameters.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center space-x-1.5 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh All Data</span>
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'metrics', label: 'Overview Metrics', icon: Sliders },
            { id: 'purchases', label: `Manual Purchases (${metrics?.pendingPurchases || 0} Pending)`, icon: CreditCard, alert: metrics?.pendingPurchases > 0 },
            { id: 'payouts', label: `Payout Requests (${metrics?.pendingPayouts || 0} Pending)`, icon: DollarSign, alert: metrics?.pendingPayouts > 0 },
            { id: 'users', label: 'User Accounts', icon: Users },
            { id: 'plans', label: 'Pricing Plans', icon: CreditCard },
            { id: 'commissions', label: 'Referral Commissions', icon: Share2 },
            { id: 'settings', label: 'Facebook & Site Settings', icon: SettingsIcon },
            { id: 'support', label: `Support Tickets (${metrics?.openTickets || 0})`, icon: LifeBuoy },
            { id: 'logs', label: 'Security Audit Logs', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview Metrics */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Users</span>
                <div className="text-2xl font-black mt-1">{metrics?.totalUsers || 0}</div>
                <div className="text-[11px] text-emerald-500 font-semibold">{metrics?.activeUsers || 0} active</div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Revenue</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ${metrics?.totalRevenue?.toLocaleString() || 0}
                </div>
                <div className="text-[11px] text-slate-400">{metrics?.totalPurchases || 0} approved orders</div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Pending Purchases</span>
                <div className="text-2xl font-black text-amber-500 mt-1">
                  {metrics?.pendingPurchases || 0}
                </div>
                <div className="text-[11px] text-slate-400">Requires manual review</div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Pending Payouts</span>
                <div className="text-2xl font-black text-rose-500 mt-1">
                  {metrics?.pendingPayouts || 0}
                </div>
                <div className="text-[11px] text-slate-400">Commission requests</div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">AI Projects Built</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {metrics?.totalProjects || 0}
                </div>
                <div className="text-[11px] text-slate-400">Generated across tools</div>
              </div>
            </div>

            {/* Quick Action Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pending Purchases Quick Box */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Pending Plan Purchases ({metrics?.pendingPurchases || 0})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {purchases.filter(p => p.status === 'pending').slice(0, 3).map((pur) => (
                  <div key={pur.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {pur.user_name} • ${pur.amount} ({pur.plan_name})
                      </div>
                      <div className="font-mono text-slate-400 text-[11px]">Ref: {pur.payment_reference}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPurchaseForReview(pur);
                        setActiveTab('purchases');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>

              {/* Pending Payouts Quick Box */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>Pending Commission Payouts ({metrics?.pendingPayouts || 0})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('payouts')}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {payouts.filter(p => p.status === 'pending').slice(0, 3).map((pay) => (
                  <div key={pay.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {pay.full_name} • ${pay.commission_amount}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate max-w-xs">{pay.payment_method}: {pay.payment_account_details}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPayout(pay);
                        setActiveTab('payouts');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700"
                    >
                      Process
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Purchases (Review & Escrow) */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold">Manual Plan Purchases Verification Gateway</h3>
              <p className="text-xs text-slate-500">
                Verify user transaction references. When you approve, the system atomically activates the subscription, disburses plan credits, and awards the referrer commission!
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="p-4">Purchase ID</th>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Payment Reference</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {purchases.map((pur) => (
                      <tr key={pur.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-indigo-600">{pur.id}</td>
                        <td>
                          <div className="font-semibold text-slate-900 dark:text-white">{pur.user_name}</div>
                          <div className="text-[11px] text-slate-400">{pur.user_email}</div>
                        </td>
                        <td>
                          <div className="font-bold">{pur.plan_name}</div>
                          <div className="text-[10px] text-slate-400">+{pur.plan_credits} credits</div>
                        </td>
                        <td className="font-extrabold">${pur.amount}</td>
                        <td>
                          <div className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                            {pur.payment_reference}
                          </div>
                          {pur.payment_note && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">
                              {pur.payment_note}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pur.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : pur.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {pur.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-slate-400">{new Date(pur.created_at).toLocaleDateString()}</td>
                        <td className="text-right p-4">
                          {pur.status === 'pending' ? (
                            <button
                              onClick={() => setSelectedPurchaseForReview(pur)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition"
                            >
                              Review &amp; Approve
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Payout Requests */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold">Commission Payout Request Management</h3>
              <p className="text-xs text-slate-500">
                Verify user commission balance, initiate external wire transfer, and enter transaction reference to mark as Paid.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="p-4">Payout ID</th>
                      <th>Affiliate</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Account Details</th>
                      <th>Status</th>
                      <th>Tx Reference</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payouts.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-indigo-600">{pay.id}</td>
                        <td>
                          <div className="font-semibold text-slate-900 dark:text-white">{pay.full_name}</div>
                          <div className="text-[11px] text-slate-400">{pay.registered_email}</div>
                        </td>
                        <td className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          ${pay.commission_amount}
                        </td>
                        <td>{pay.payment_method}</td>
                        <td className="max-w-xs truncate font-mono text-[11px]">{pay.payment_account_details}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            pay.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : pay.status === 'approved'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : pay.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {pay.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="font-mono text-slate-500">{pay.transaction_reference || '—'}</td>
                        <td className="text-right p-4">
                          <button
                            onClick={() => setSelectedPayout(pay)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs transition"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">User Accounts &amp; Credit Ledger Control</h3>
                <p className="text-xs text-slate-500">Search users, view credits, adjust balance, and suspend/activate accounts.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ref code..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="p-4">User</th>
                      <th>Role</th>
                      <th>Ref Code</th>
                      <th>Current Credits</th>
                      <th>Active Subscription</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.role === 'admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="font-mono font-bold text-indigo-600">{u.referral_code}</td>
                        <td className="font-black text-slate-900 dark:text-white">
                          {u.balance?.toLocaleString()}
                        </td>
                        <td>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            {u.active_plan || 'Free 250 Tier'}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {u.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="text-right p-4 space-x-2">
                          <button
                            onClick={() => setSelectedUserForCredit(u)}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-xs hover:bg-indigo-100"
                          >
                            ± Credits
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              u.status === 'active'
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Plan Management */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold">Subscription Plan Pricing &amp; Credit Configuration</h3>
              <p className="text-xs text-slate-500">
                All changes reflect across the platform immediately without code modification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {adminPlans.map((plan) => (
                <div key={plan.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {plan.id}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                      {plan.badge || 'ACTIVE'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Plan Name</label>
                    <input
                      type="text"
                      defaultValue={plan.name}
                      onBlur={(e) => handleUpdatePlan(plan.id, { name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Price ($ USD)</label>
                      <input
                        type="number"
                        defaultValue={plan.price}
                        onBlur={(e) => handleUpdatePlan(plan.id, { price: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Credit Amount</label>
                      <input
                        type="number"
                        defaultValue={plan.credits}
                        onBlur={(e) => handleUpdatePlan(plan.id, { credits: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 italic">
                    Features: {plan.features?.length || 0} features configured
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Referral Commissions Management */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold">All Referral Commissions &amp; Rates</h3>
              <p className="text-xs text-slate-500">Configure commission rates and audit all affiliate payouts.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="p-4">Affiliate (Referrer)</th>
                      <th>Customer (Referee)</th>
                      <th>Plan Purchased</th>
                      <th>Plan Price</th>
                      <th>Commission Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {commissions.map((comm) => (
                      <tr key={comm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">{comm.referrer_name}</div>
                          <div className="text-[11px] font-mono text-indigo-600">{comm.referral_code}</div>
                        </td>
                        <td>
                          <div className="font-semibold">{comm.buyer_name}</div>
                          <div className="text-[11px] text-slate-400">{comm.buyer_email}</div>
                        </td>
                        <td>{comm.plan_name}</td>
                        <td>${comm.plan_price}</td>
                        <td className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                          ${comm.commission_amount}
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            comm.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {comm.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-slate-400">{new Date(comm.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Facebook & Site Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
            {settingsSaved && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>All settings saved permanently in the database and applied site-wide!</span>
              </div>
            )}

            {/* Section 9: Facebook Contact Settings */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <MessageCircle className="w-5 h-5 text-[#1877F2]" />
                <div>
                  <h3 className="text-base font-extrabold">Facebook Contact Settings</h3>
                  <p className="text-xs text-slate-500">
                    Configure the Facebook Page and Messenger links for manual payment verification and live support.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={adminSettings.facebook_page_url || ''}
                    onChange={(e) => setAdminSettings({ ...adminSettings, facebook_page_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Facebook Messenger URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://m.me/yourpage"
                    value={adminSettings.facebook_messenger_url || ''}
                    onChange={(e) => setAdminSettings({ ...adminSettings, facebook_messenger_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="Contact for Payment"
                    value={adminSettings.facebook_button_text || ''}
                    onChange={(e) => setAdminSettings({ ...adminSettings, facebook_button_text: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enable/Disable Contact Button
                  </label>
                  <select
                    value={adminSettings.facebook_button_enabled || '1'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, facebook_button_enabled: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="1">Enabled (Visible Across Website)</option>
                    <option value="0">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Preview Button */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block">Button Preview:</span>
                  <span className="text-xs text-slate-500">This is how users see it on modals, checkout, and contact sections.</span>
                </div>
                <a
                  href={adminSettings.facebook_messenger_url || adminSettings.facebook_page_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{adminSettings.facebook_button_text || 'Contact for Payment'}</span>
                </a>
              </div>
            </div>

            {/* Referral Commission Rates */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold">Referral Commission Rates ($ USD)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Starter ($250)</label>
                  <input
                    type="number"
                    value={adminSettings.commission_starter || '100'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, commission_starter: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Growth ($350)</label>
                  <input
                    type="number"
                    value={adminSettings.commission_growth || '200'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, commission_growth: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Enterprise ($500)</label>
                  <input
                    type="number"
                    value={adminSettings.commission_enterprise || '350'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, commission_enterprise: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-black"
                  />
                </div>
              </div>
            </div>

            {/* Builder Tool Credit Costs */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold">AI Builder Tool Credit Costs (Credits per Generation)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Website</label>
                  <input
                    type="number"
                    value={adminSettings.cost_website || '15'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, cost_website: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Web App</label>
                  <input
                    type="number"
                    value={adminSettings.cost_webapp || '25'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, cost_webapp: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Android App</label>
                  <input
                    type="number"
                    value={adminSettings.cost_android || '30'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, cost_android: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Landing Page</label>
                  <input
                    type="number"
                    value={adminSettings.cost_landing || '10'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, cost_landing: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">E-commerce</label>
                  <input
                    type="number"
                    value={adminSettings.cost_ecommerce || '25'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, cost_ecommerce: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Code Gen</label>
                  <input
                    type="number"
                    value={adminSettings.cost_code || '5'}
                    onChange={(e) => setAdminSettings({ ...adminSettings, cost_code: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Legal Policies Editor */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold">Legal Policies Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Terms of Service</label>
                  <textarea
                    rows={3}
                    value={adminSettings.terms_content || ''}
                    onChange={(e) => setAdminSettings({ ...adminSettings, terms_content: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Refund Policy</label>
                  <textarea
                    rows={2}
                    value={adminSettings.refund_content || ''}
                    onChange={(e) => setAdminSettings({ ...adminSettings, refund_content: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Referral Policy</label>
                  <textarea
                    rows={2}
                    value={adminSettings.referral_policy_content || ''}
                    onChange={(e) => setAdminSettings({ ...adminSettings, referral_policy_content: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg transition flex items-center space-x-2 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save All Settings Permanently</span>
            </button>
          </form>
        )}

        {/* Tab 8: Support Tickets */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">User Support Tickets</h3>

            <div className="space-y-4">
              {supportTickets.map((tck) => (
                <div key={tck.id} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600">{tck.id}</span>
                      <h4 className="font-bold text-base mt-0.5">{tck.subject}</h4>
                      <p className="text-xs text-slate-400">
                        From: {tck.user_name} ({tck.user_email}) • Priority: {tck.priority.toUpperCase()}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      tck.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {tck.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl leading-relaxed">
                    {tck.message}
                  </p>

                  {tck.admin_reply && (
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200">
                      <div className="font-bold mb-1">Admin Response:</div>
                      {tck.admin_reply}
                    </div>
                  )}

                  {replyTicketId === tck.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={3}
                        placeholder="Write your response to this user..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReplyTicket(tck.id)}
                          className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs"
                        >
                          Send Response
                        </button>
                        <button
                          onClick={() => setReplyTicketId(null)}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyTicketId(tck.id)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
                    >
                      Reply to Ticket
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 9: Security Audit Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold">Admin Security &amp; Activity Audit Trail</h3>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <tr>
                      <th className="p-4">Action</th>
                      <th>Admin</th>
                      <th>Target</th>
                      <th>Details</th>
                      <th>IP</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-indigo-600">{log.action}</td>
                        <td>{log.admin_name}</td>
                        <td>{log.target_type} ({log.target_id || '—'})</td>
                        <td className="max-w-xs truncate font-mono text-slate-500">{log.details || '—'}</td>
                        <td className="text-slate-400">{log.ip_address}</td>
                        <td className="text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Review Purchase Request */}
        {selectedPurchaseForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="text-lg font-black">Verify Plan Purchase</h3>
                <button onClick={() => setSelectedPurchaseForReview(null)} className="text-slate-400">✕</button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-xs">
                <div><strong>Purchase ID:</strong> {selectedPurchaseForReview.id}</div>
                <div><strong>User:</strong> {selectedPurchaseForReview.user_name} ({selectedPurchaseForReview.user_email})</div>
                <div><strong>Selected Plan:</strong> {selectedPurchaseForReview.plan_name} (${selectedPurchaseForReview.amount})</div>
                <div><strong>Payment Reference:</strong> <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded">{selectedPurchaseForReview.payment_reference}</span></div>
                {selectedPurchaseForReview.payment_note && (
                  <div><strong>User Note:</strong> {selectedPurchaseForReview.payment_note}</div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Admin Note / Verification Log</label>
                <input
                  type="text"
                  placeholder="e.g. Verified via Bank Wire statement"
                  value={purchaseReviewNote}
                  onChange={(e) => setPurchaseReviewNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleReviewPurchase('approved')}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Approve &amp; Activate Plan
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewPurchase('rejected')}
                  className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Review / Pay Commission Payout */}
        {selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="text-lg font-black">Process Commission Payout</h3>
                <button onClick={() => setSelectedPayout(null)} className="text-slate-400">✕</button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-xs">
                <div><strong>Payout ID:</strong> {selectedPayout.id}</div>
                <div><strong>Affiliate:</strong> {selectedPayout.full_name} ({selectedPayout.registered_email})</div>
                <div><strong>Amount to Pay:</strong> <span className="font-extrabold text-emerald-600">${selectedPayout.commission_amount}</span></div>
                <div><strong>Payment Method:</strong> {selectedPayout.payment_method}</div>
                <div><strong>Account Details:</strong> <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded">{selectedPayout.payment_account_details}</span></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Bank / PayPal / Crypto Transaction Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-WIRE-773822 or PayPal Transaction ID"
                  value={payoutTxRef}
                  onChange={(e) => setPayoutTxRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleReviewPayout('paid')}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Mark as Paid (Disbursed)
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewPayout('approved')}
                  className="px-4 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs"
                >
                  Approve Only
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewPayout('rejected')}
                  className="px-4 py-3 bg-rose-600 text-white font-bold rounded-xl text-xs"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Adjust User Credits */}
        {selectedUserForCredit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="text-lg font-black">Adjust User Credits</h3>
                <button onClick={() => setSelectedUserForCredit(null)} className="text-slate-400">✕</button>
              </div>

              <div className="text-xs text-slate-500">
                User: <strong>{selectedUserForCredit.name}</strong> ({selectedUserForCredit.email})
                <br />Current Balance: <strong>{selectedUserForCredit.balance} credits</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Credit Change (Positive to Add, Negative to Deduct)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500 or -100"
                  value={creditAdjustmentAmount}
                  onChange={(e) => setCreditAdjustmentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Reason / Description</label>
                <input
                  type="text"
                  value={creditAdjustmentReason}
                  onChange={(e) => setCreditAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForCredit(null)}
                  className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreditAdjustment}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Apply Credit Adjustment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
