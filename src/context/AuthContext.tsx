import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CreditBalance, Plan, User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  credits: CreditBalance;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUserAndCredits: () => Promise<void>;
  updateUserCreditsLocally: (credits: CreditBalance) => void;
  authModal: 'login' | 'register' | null;
  setAuthModal: (modal: 'login' | 'register' | null) => void;
  selectedPlanForPurchase: Plan | null;
  setSelectedPlanForPurchase: (plan: Plan | null) => void;
  triggerOutOfCreditsModal: () => void;
}

const defaultCredits: CreditBalance = { totalEarned: 0, totalUsed: 0, balance: 0 };
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('buildai_token'));
  const [credits, setCredits] = useState<CreditBalance>(defaultCredits);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<Plan | null>(null);

  // Check URL parameters for referral code and persist to session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('buildai_pending_ref', ref.toUpperCase());
      // Track referral click in background
      fetch('/api/referrals/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: ref })
      }).catch(() => {});
    }
  }, []);

  const refreshUserAndCredits = async () => {
    const currentToken = localStorage.getItem('buildai_token');
    if (!currentToken) {
      setUser(null);
      setCredits(defaultCredits);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.credits) {
          setCredits(data.credits);
        }
      } else {
        localStorage.removeItem('buildai_token');
        setToken(null);
        setUser(null);
        setCredits(defaultCredits);
      }
    } catch (err) {
      console.error('Failed to authenticate session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserAndCredits();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to login' };
      }

      localStorage.setItem('buildai_token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.credits) setCredits(data.credits);
      setAuthModal(null);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error' };
    }
  };

  const register = async (name: string, email: string, password: string, referralCode?: string) => {
    try {
      const pendingRef = referralCode || localStorage.getItem('buildai_pending_ref') || undefined;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, referralCode: pendingRef })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to register' };
      }

      localStorage.setItem('buildai_token', data.token);
      localStorage.removeItem('buildai_pending_ref');
      setToken(data.token);
      setUser(data.user);
      if (data.credits) setCredits(data.credits);
      setAuthModal(null);

      // Celebrate 250 free credits!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('buildai_token');
    setToken(null);
    setUser(null);
    setCredits(defaultCredits);
  };

  const updateUserCreditsLocally = (newCredits: CreditBalance) => {
    setCredits(newCredits);
    if (newCredits.balance <= 0) {
      triggerOutOfCreditsModal();
    }
  };

  const triggerOutOfCreditsModal = () => {
    // When credits hit zero, fetch first active plan or show pricing modal
    fetch('/api/plans')
      .then(r => r.json())
      .then(plans => {
        if (Array.isArray(plans) && plans.length > 0) {
          setSelectedPlanForPurchase(plans[0]);
        }
      })
      .catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        token,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
        refreshUserAndCredits,
        updateUserCreditsLocally,
        authModal,
        setAuthModal,
        selectedPlanForPurchase,
        setSelectedPlanForPurchase,
        triggerOutOfCreditsModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
