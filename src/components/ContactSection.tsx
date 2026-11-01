import React from 'react';
import { useSettings } from '../context/SettingsContext.js';
import { MessageCircle, Mail, ShieldCheck, ExternalLink, LifeBuoy, ArrowRight } from 'lucide-react';

interface ContactSectionProps {
  onNavigate: (view: string, extra?: any) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onNavigate }) => {
  const { settings } = useSettings();

  const isFbEnabled = settings.facebook_button_enabled === '1' || settings.facebook_button_enabled === 'true';
  const fbUrl = settings.facebook_messenger_url || settings.facebook_page_url;
  const fbBtnText = settings.facebook_button_text || 'Contact for Payment';

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md">
          <LifeBuoy className="w-4 h-4 text-indigo-400" />
          <span>Live Support &amp; Manual Payment Assistance</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto">
          Need Help With A Payment Or Custom Project?
        </h2>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Our dedicated team is online to assist with manual wire verifications, subscription activations, custom AI builders, and referral payouts.
        </p>

        {/* Action card */}
        <div className="max-w-xl mx-auto bg-slate-800/80 border border-slate-700/80 p-6 sm:p-8 rounded-3xl backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isFbEnabled ? (
              fbUrl ? (
                <a
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold rounded-2xl shadow-xl shadow-blue-500/25 transition flex items-center justify-center space-x-2 text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{fbBtnText}</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>
              ) : (
                <div className="p-3 bg-slate-700/50 rounded-xl text-xs text-slate-300 italic">
                  Contact information is currently unavailable. Please check back later.
                </div>
              )
            ) : null}

            <button
              onClick={() => onNavigate('support')}
              className="w-full sm:w-auto px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition flex items-center justify-center space-x-2 text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Open Support Ticket</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center space-x-6 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Manual Support</span>
            </span>
            <span>•</span>
            <span>Average response: &lt; 15 mins</span>
          </div>
        </div>
      </div>
    </section>
  );
};
