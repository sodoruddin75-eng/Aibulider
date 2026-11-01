import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useSettings } from '../context/SettingsContext.js';
import { Plan } from '../types/index.js';
import { Check, Sparkles, ShieldCheck, ArrowRight, Zap, Coins } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const { plans } = useSettings();
  const { setSelectedPlanForPurchase, setAuthModal, isAuthenticated } = useAuth();

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) {
      setAuthModal('login');
    } else {
      setSelectedPlanForPurchase(plan);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Simple, Transparent Plans For Every Ambition
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            All plans include high-speed AI generations, project saving, and manual escrow purchase security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isGrowth = plan.id === 'growth';
            const isEnterprise = plan.id === 'enterprise';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 ${
                  isGrowth
                    ? 'bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/20 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/20 border-2 border-indigo-600 shadow-2xl scale-105 z-10'
                    : 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl'
                }`}
              >
                {/* Popular or Recommended Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold ml-2">
                      USD / One-Time
                    </span>
                  </div>

                  <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{plan.credits.toLocaleString()} AI Generation Credits</span>
                  </div>
                </div>

                {/* Features list */}
                <div className="flex-1 space-y-3.5 py-6 border-y border-slate-200/60 dark:border-slate-800">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-3 text-xs sm:text-sm">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 space-y-3">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2 shadow-lg ${
                      isGrowth
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                    }`}
                  >
                    <span>Select {plan.name.replace(' Plan', '')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Manual Purchase Approval Workflow</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
