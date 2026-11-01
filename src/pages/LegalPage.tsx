import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext.js';
import { ShieldCheck, FileText, RefreshCw, Users, Mail, MessageCircle, ExternalLink } from 'lucide-react';

interface LegalPageProps {
  initialPage?: string;
  onNavigate: (view: string, extra?: any) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialPage = 'terms', onNavigate }) => {
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState<string>(initialPage);

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'refund', label: 'Refund Policy', icon: RefreshCw },
    { id: 'referral_policy', label: 'Referral Policy', icon: Users },
    { id: 'contact', label: 'Contact Us', icon: Mail }
  ];

  const isFbEnabled = settings.facebook_button_enabled === '1' || settings.facebook_button_enabled === 'true';
  const fbUrl = settings.facebook_messenger_url || settings.facebook_page_url;
  const fbBtnText = settings.facebook_button_text || 'Contact for Payment';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = currentPage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentPage(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {currentPage === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black">Terms of Service</h2>
              <p className="text-xs text-slate-400">Last updated: November 2026</p>
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  {settings.terms_content ||
                    'Welcome to BuildAI Pro. By creating an account, acquiring subscription plans, or utilizing our automated AI builder tools, you agree to comply with these terms.'}
                </p>
                <h4 className="font-bold text-slate-900 dark:text-white text-base pt-2">
                  1. AI Generation Credits &amp; Fair Use
                </h4>
                <p>
                  Every registered account receives 250 welcome credits strictly once. Attempting to artificially generate multiple accounts to bypass credit limits or game the referral system is strictly prohibited.
                </p>
                <h4 className="font-bold text-slate-900 dark:text-white text-base pt-2">
                  2. Manual Purchase Approval
                </h4>
                <p>
                  Subscriptions are activated strictly after admin verification of payment references. BuildAI Pro reserves the right to reject false or invalid payment claims.
                </p>
                <h4 className="font-bold text-slate-900 dark:text-white text-base pt-2">
                  3. Ownership of Generated Output
                </h4>
                <p>
                  You own 100% of the code, websites, Android applications, and landing pages generated through BuildAI Pro. You have full commercial deployment rights.
                </p>
              </div>
            </div>
          )}

          {currentPage === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black">Privacy Policy</h2>
              <p className="text-xs text-slate-400">Last updated: November 2026</p>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  {settings.privacy_content ||
                    'BuildAI Pro respects your digital privacy. We store user credentials using cryptographic salt hashing and protect project files in isolated database schemas.'}
                </p>
                <h4 className="font-bold text-slate-900 dark:text-white text-base pt-2">
                  Data Confidentiality
                </h4>
                <p>
                  We never sell, rent, or trade your personal information, generation prompts, or affiliate payout details to advertisers or unauthorized third parties.
                </p>
              </div>
            </div>
          )}

          {currentPage === 'refund' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black">Refund Policy</h2>
              <p className="text-xs text-slate-400">Last updated: November 2026</p>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  {settings.refund_content ||
                    'Because digital AI generation resources and credits are allocated upon admin verification, subscription purchases are non-refundable once credits are expended.'}
                </p>
                <h4 className="font-bold text-slate-900 dark:text-white text-base pt-2">
                  Failed Generations Refund Guarantee
                </h4>
                <p>
                  If any AI builder job fails to compile or return valid code, our database automatically refunds the deducted credits back to your ledger instantaneously.
                </p>
              </div>
            </div>
          )}

          {currentPage === 'referral_policy' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black">Referral &amp; Commission Policy</h2>
              <p className="text-xs text-slate-400">Last updated: November 2026</p>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  {settings.referral_policy_content ||
                    'BuildAI Pro provides an unlimited, high-yield affiliate commission system ($100 for Starter, $200 for Growth, $350 for Enterprise).'}
                </p>
                <h4 className="font-bold text-slate-900 dark:text-white text-base pt-2">
                  Anti-Fraud Guidelines
                </h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Self-referrals (referring your own accounts) are automatically blocked.</li>
                  <li>Commissions are attributed strictly after the referred purchase has been reviewed and verified by an Admin.</li>
                  <li>Payout requests are processed manually to ensure accuracy and compliance.</li>
                </ul>
              </div>
            </div>
          )}

          {currentPage === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">Contact BuildAI Pro</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Have questions or need manual wire instructions? Connect with our dedicated support team directly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base">Email &amp; Ticket Support</h4>
                  <p className="text-xs text-slate-500">
                    Submit a support ticket from our platform for guaranteed reply within hours.
                  </p>
                  <button
                    onClick={() => onNavigate('support')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Go to Support Desk →
                  </button>
                </div>

                {isFbEnabled && fbUrl && (
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-base">Direct Facebook / Messenger</h4>
                    <p className="text-xs text-slate-500">
                      Chat directly with our administrative team for payment verification.
                    </p>
                    <a
                      href={fbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1877F2] hover:underline"
                    >
                      <span>{fbBtnText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
