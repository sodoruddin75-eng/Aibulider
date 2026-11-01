import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { SupportTicket } from '../types/index.js';
import {
  LifeBuoy,
  MessageCircle,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { user, token, isAuthenticated, setAuthModal } = useAuth();
  const { settings } = useSettings();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isFbEnabled = settings.facebook_button_enabled === '1' || settings.facebook_button_enabled === 'true';
  const fbUrl = settings.facebook_messenger_url || settings.facebook_page_url;
  const fbBtnText = settings.facebook_button_text || 'Contact for Payment';

  const fetchTickets = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/support/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthModal('login');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subject, message, priority })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit ticket');
      } else {
        setSuccessMsg(`Ticket ${data.ticketId} created! Our technical team will review and reply.`);
        setSubject('');
        setMessage('');
        fetchTickets();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Support Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <LifeBuoy className="w-4 h-4" />
            <span>24/7 Dedicated Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            How Can We Assist You Today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Submit a support ticket or reach out on Facebook Messenger for quick payment verification.
          </p>
        </div>

        {/* Facebook Direct Connect Box */}
        {isFbEnabled && fbUrl && (
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-base">Instant Live Messenger Assistance</h3>
              </div>
              <p className="text-xs text-blue-100">
                Direct chat with BuildAI Pro account managers for immediate manual purchase confirmation.
              </p>
            </div>

            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-blue-600 font-extrabold rounded-2xl shadow-md hover:bg-blue-50 transition flex items-center space-x-2 text-xs shrink-0"
            >
              <span>{fbBtnText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Support Form & Ticket History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Ticket */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-lg font-bold">Open a Support Ticket</h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding Android Kotlin generation"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Escalation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Message Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide all relevant details, error codes, or purchase references..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-xs disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          </div>

          {/* Ticket History */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Your Previous Tickets</h3>

            {!isAuthenticated ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Please sign in to view your support tickets.
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No active or historical support tickets found.
              </div>
            ) : (
              tickets.map((tck) => (
                <div
                  key={tck.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-indigo-500 font-bold">{tck.id}</span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {tck.subject}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tck.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : tck.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {tck.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tck.message}
                  </p>

                  {tck.admin_reply && (
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200">
                      <span className="font-bold block mb-1">Admin Response:</span>
                      {tck.admin_reply}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 pt-1">
                    Created on {new Date(tck.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
