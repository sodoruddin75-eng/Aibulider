/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { Hero } from './components/Hero.js';
import { BuildersIntro } from './components/BuildersIntro.js';
import { HowItWorks } from './components/HowItWorks.js';
import { Features } from './components/Features.js';
import { PricingSection } from './components/PricingSection.js';
import { ReferralSection } from './components/ReferralSection.js';
import { FaqSection } from './components/FaqSection.js';
import { ContactSection } from './components/ContactSection.js';
import { AuthModal } from './components/AuthModal.js';
import { PurchasePlanModal } from './components/PurchasePlanModal.js';
import { BuildersPage } from './pages/BuildersPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { SupportPage } from './pages/SupportPage.js';
import { LegalPage } from './pages/LegalPage.js';
import { DirectDownloadBanner } from './components/DirectDownloadBanner.js';
import { SourceModal } from './components/SourceModal.js';

function MainApp() {
  const [currentView, setCurrentView] = useState<'home' | 'builders' | 'dashboard' | 'admin' | 'support' | 'legal'>('home');
  const [viewParams, setViewParams] = useState<any>({});
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  const handleNavigate = (view: string, extra?: any) => {
    // If navigation targets a section on home
    if (view === 'home' && extra?.section) {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(extra.section);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    setCurrentView(view as any);
    setViewParams(extra || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <DirectDownloadBanner onOpenSourceModal={() => setIsSourceModalOpen(true)} />
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero onNavigate={handleNavigate} />
            <BuildersIntro onNavigate={handleNavigate} />
            <HowItWorks />
            <Features />
            <PricingSection />
            <ReferralSection onNavigate={handleNavigate} />
            <FaqSection />
            <ContactSection onNavigate={handleNavigate} />
          </>
        )}

        {currentView === 'builders' && (
          <BuildersPage
            initialTool={viewParams.toolType || 'website'}
            initialPrompt={viewParams.initialPrompt || ''}
            autoStart={Boolean(viewParams.autoStart)}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            initialTab={viewParams.tab || 'overview'}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'admin' && <AdminPage />}

        {currentView === 'support' && <SupportPage />}

        {currentView === 'legal' && (
          <LegalPage
            initialPage={viewParams.page || 'terms'}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Interactive Global Modals */}
      <AuthModal />
      <PurchasePlanModal />
      <SourceModal isOpen={isSourceModalOpen} onClose={() => setIsSourceModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SettingsProvider>
  );
}
