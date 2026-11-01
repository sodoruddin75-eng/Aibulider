import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { Plan } from '../types/index.js';
import { X, CheckCircle2, ShieldCheck, MessageCircle, ArrowRight, Copy, Check, Clock, AlertCircle } from 'lucide-react';

export const PurchasePlanModal: React.FC = () => {
  const { selectedPlanForPurchase, setSelectedPlanForPurchase, token, setAuthModal } = useAuth();
  const { settings, plans } = useSettings();

  const [activePlan, setActivePlan] = useState<Plan | null>(selectedPlanForPurchase);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPurchaseId, setSubmittedPurchaseId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (selectedPlanForPurchase) {
      setActivePlan(selectedPlanForPurchase);
      setSubmittedPurchaseId(null);
      setError(null);
      setPaymentReference('');
    }
  }, [selectedPlanForPurchase]);

  if (!selectedPlanForPurchase || !activePlan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setSelectedPlanForPurchase(null);
      setAuthModal('login');
      return;
    }

    if (!paymentReference.trim()) {
      setError('Please provide a payment reference or transaction ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: activePlan.id,
          paymentReference: paymentReference.trim(),
          paymentNote: paymentNote.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit purchase request');
      } else {
        setSubmittedPurchaseId(data.purchaseId);
      }
    } catch (err: any) {
      setError(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Facebook link logic from Admin Settings
  const isFbEnabled = settings.facebook_button_enabled === '1' || settings.facebook_button_enabled === 'true';
  const fbUrl = settings.facebook_messenger_url || settings.facebook_page_url;
  const fbBtnText = settings.facebook_button_text || 'Contact for Payment';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white relative">
          <button
            onClick={() => setSelectedPlanForPurchase(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Official Manual Purchase Gateway</span>
          </div>

          <h3 className="text-2xl font-black tracking-tight">Upgrade Your Plan</h3>
          <p className="text-xs text-indigo-100 mt-1">
            Activate professional AI generation tools and premium credit allowances.
          </p>
        </div>

        {/* Plan Selector tabs */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePlan(p);
                  setSubmittedPurchaseId(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center ${
                  activePlan.id === p.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{p.name.replace(' Plan', '')}</span>
                <span className="text-[11px] font-black">${p.price}</span>
              </button>
            ))}
          </div>

          {submittedPurchaseId ? (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold">
                  Payment Status: Pending Admin Verification
                </span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  Purchase Request Submitted!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Your request has been registered in our database. The Admin will verify your payment reference and activate your {activePlan.name} (+{activePlan.credits.toLocaleString()} credits).
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Purchase ID</div>
                  <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {submittedPurchaseId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyId(submittedPurchaseId)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>

              {/* Direct Facebook button if enabled */}
              {isFbEnabled && fbUrl && (
                <div className="pt-2">
                  <a
                    href={fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center space-x-2 text-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{fbBtnText} (Send Purchase ID)</span>
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedPlanForPurchase(null)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Plan Summary Card */}
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {activePlan.name}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    +{activePlan.credits.toLocaleString()} AI Generation Credits
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ${activePlan.price}
                  </span>
                  <span className="text-xs text-slate-500 block">USD One-Time</span>
                </div>
              </div>

              {/* Contact Admin for Payment Instructions Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-start space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      Manual Payment Instructions
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                      Send ${activePlan.price} USD via Bank Wire, PayPal, or Crypto USDT, or contact our team directly on Facebook/Messenger. Then paste your transaction ID / reference below.
                    </p>
                  </div>
                </div>

                {isFbEnabled ? (
                  fbUrl ? (
                    <a
                      href={fbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{fbBtnText}</span>
                    </a>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic text-center py-1">
                      Facebook contact information is currently unavailable.
                    </div>
                  )
                ) : null}
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Reference / Transaction ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-998273842 or PayPal Conf #8271"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Sender name, payment method used, or receipt details..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="text-xs">Submitting Request...</span>
                ) : (
                  <>
                    <span>Submit Purchase for Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
