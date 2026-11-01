export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  referral_code: string;
  referred_by?: string | null;
  email_verified: number;
  free_credits_claimed: number;
}

export interface CreditBalance {
  totalEarned: number;
  totalUsed: number;
  balance: number;
}

export interface CreditLedgerItem {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  description: string;
  reference_id?: string;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  badge?: string;
  is_active: number;
}

export interface Purchase {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  plan_id: string;
  plan_name?: string;
  plan_credits?: number;
  amount: number;
  payment_reference: string;
  payment_note?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralStats {
  referralCode: string;
  totalClicks: number;
  totalSignups: number;
  referredUsers: { id: string; name: string; email: string; created_at: string }[];
  commissions: Commission[];
  totalEarned: number;
  pendingPayout: number;
  paidTotal: number;
}

export interface Commission {
  id: string;
  referrer_id: string;
  referrer_name?: string;
  referee_id: string;
  referee_name?: string;
  referee_email?: string;
  buyer_name?: string;
  buyer_email?: string;
  purchase_id: string;
  plan_id: string;
  plan_name?: string;
  plan_price: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approved_at?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  full_name: string;
  registered_email: string;
  referral_code: string;
  purchased_plan?: string;
  commission_amount: number;
  payment_method: string;
  payment_account_details: string;
  message?: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  transaction_reference?: string;
  payment_date?: string;
  admin_internal_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AiProject {
  id: string;
  user_id?: string;
  tool_type: 'website' | 'webapp' | 'android' | 'landing' | 'ecommerce' | 'code';
  toolType?: string;
  title: string;
  prompt: string;
  framework: string;
  files: Record<string, string>;
  preview_html?: string;
  previewHtml?: string;
  summary?: string;
  credits_used?: number;
  creditsUsed?: number;
  is_favorite?: number;
  isRealAi?: boolean;
  modelUsed?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_reply?: string;
  replied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  facebook_page_url: string;
  facebook_messenger_url: string;
  facebook_button_text: string;
  facebook_button_enabled: string;
  commission_starter: string;
  commission_growth: string;
  commission_enterprise: string;
  cost_website: string;
  cost_webapp: string;
  cost_android: string;
  cost_landing: string;
  cost_ecommerce: string;
  cost_code: string;
  ai_model: string;
  support_email: string;
  terms_content: string;
  privacy_content: string;
  refund_content: string;
  referral_policy_content: string;
}
