import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the 250 free credits offer work?',
      a: 'Every newly registered account automatically receives 250 free AI generation credits strictly once upon signup. You can use these credits immediately to test all AI Builders including Websites, Web Apps, Android Kotlin projects, and Landing Pages.'
    },
    {
      q: 'How does the manual plan payment system operate?',
      a: 'To guarantee payment security and prevent fraud, users submit a purchase request with their payment transaction reference. Our Admin reviews the payment details in the Admin Panel. Once verified, the subscription is activated and credits are deposited directly into your balance.'
    },
    {
      q: 'How do referral commissions work and how much can I earn?',
      a: 'You receive an uncapped referral link. When someone registers through your link and purchases a plan that is approved by Admin, you earn generous cash commissions: $100 for Starter, $200 for Growth, and $350 for Enterprise. You can request manual payouts anytime via your dashboard.'
    },
    {
      q: 'Can I download the generated Android App and open it in Android Studio?',
      a: 'Yes! Our AI Android App Builder generates structured Android projects containing AndroidManifest.xml, MainActivity.kt (with modern Jetpack Compose), build.gradle.kts, and resources. You can download the complete project as a ZIP archive and immediately open it in Android Studio.'
    },
    {
      q: 'What happens if an AI generation fails or encounters an error?',
      a: 'We use atomic server-side credit ledger transactions. If a generation job fails for any reason, the system automatically refunds the deducted credits back into your account balance and logs the refund.'
    },
    {
      q: 'How can I contact customer support or submit payment proof?',
      a: 'You can use our in-app Support Ticket system, or click our official Facebook / Messenger contact button to chat directly with our team.'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Everything you need to know about BuildAI Pro credits, builders, and referral payouts.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between text-base font-bold text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
