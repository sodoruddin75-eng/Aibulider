import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'buildai.db');
export const db = new Database(DB_PATH);

// Enable WAL mode and foreign keys for high performance & integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
      status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'suspended'
      email_verified INTEGER NOT NULL DEFAULT 1,
      free_credits_claimed INTEGER NOT NULL DEFAULT 0,
      referral_code TEXT UNIQUE NOT NULL,
      referred_by TEXT, -- id of referring user
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Credit Ledger table (Atomic immutable balance trail)
    CREATE TABLE IF NOT EXISTS credit_ledger (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL, -- positive for credits added, negative for deducted
      balance_after INTEGER NOT NULL,
      reason TEXT NOT NULL, -- 'signup_bonus', 'plan_purchase', 'admin_adjustment', 'generation_cost', 'generation_refund'
      reference_id TEXT, -- e.g. project_id or purchase_id
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Plans table
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY, -- 'starter', 'growth', 'enterprise'
      name TEXT NOT NULL,
      price INTEGER NOT NULL, -- in USD
      credits INTEGER NOT NULL,
      features TEXT NOT NULL, -- JSON array of strings
      badge TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Subscriptions table
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
      credits_awarded INTEGER NOT NULL,
      purchase_id TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    );

    -- Purchases table (Manual Plan Payment Requests)
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY, -- e.g. PUR-10023
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      payment_reference TEXT NOT NULL,
      payment_note TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      admin_note TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES plans(id)
    );

    -- Referral Clicks & Stats
    CREATE TABLE IF NOT EXISTS referral_clicks (
      id TEXT PRIMARY KEY,
      referrer_id TEXT NOT NULL,
      ip_hash TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Commissions table
    CREATE TABLE IF NOT EXISTS commissions (
      id TEXT PRIMARY KEY,
      referrer_id TEXT NOT NULL,
      referee_id TEXT NOT NULL,
      purchase_id TEXT UNIQUE NOT NULL, -- idempotent 1:1 commission per purchase
      plan_id TEXT NOT NULL,
      plan_price INTEGER NOT NULL,
      commission_amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'rejected'
      approved_at TEXT,
      paid_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
    );

    -- Payout Requests table
    CREATE TABLE IF NOT EXISTS payout_requests (
      id TEXT PRIMARY KEY, -- e.g. PAY-8492
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      registered_email TEXT NOT NULL,
      referral_code TEXT NOT NULL,
      purchased_plan TEXT,
      commission_amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL, -- 'Bank Transfer', 'PayPal', 'Wise', 'Crypto/USDT', etc.
      payment_account_details TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'rejected'
      transaction_reference TEXT,
      payment_date TEXT,
      paid_at TEXT,
      admin_internal_notes TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- AI Generated Projects
    CREATE TABLE IF NOT EXISTS ai_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tool_type TEXT NOT NULL, -- 'website', 'webapp', 'android', 'landing', 'ecommerce', 'code'
      title TEXT NOT NULL,
      prompt TEXT NOT NULL,
      framework TEXT NOT NULL DEFAULT 'html-tailwind',
      files TEXT NOT NULL, -- JSON object { [filename]: content }
      preview_html TEXT,
      thumbnail TEXT,
      credits_used INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Support Tickets
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
      status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
      admin_reply TEXT,
      replied_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Admin Settings key-value store
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Admin Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Safe schema migrations for existing database files
  try {
    db.exec(`ALTER TABLE payout_requests ADD COLUMN paid_at TEXT;`);
  } catch {}

  // Seed default settings if not exists
  const defaultSettings: Record<string, string> = {
    site_name: 'BuildAI Pro',
    site_tagline: 'Turn Your Ideas Into Powerful Digital Products With AI.',
    site_description: 'Build premium websites, full-stack web apps, Android applications, and landing pages with just one prompt.',
    facebook_page_url: 'https://facebook.com/buildaipro',
    facebook_messenger_url: 'https://m.me/buildaipro',
    facebook_button_text: 'Contact for Payment',
    facebook_button_enabled: '1',
    commission_starter: '100',
    commission_growth: '200',
    commission_enterprise: '350',
    cost_website: '15',
    cost_webapp: '25',
    cost_android: '30',
    cost_landing: '10',
    cost_ecommerce: '25',
    cost_code: '5',
    ai_model: 'gemini-3.8-flash',
    support_email: 'support@buildai.pro',
    terms_content: 'Welcome to BuildAI Pro. By using our platform, you agree to our terms of service and fair use guidelines regarding AI generation credits and subscription access.',
    privacy_content: 'BuildAI Pro respects your privacy. We securely process your project prompts and never share your proprietary data with unauthorized third parties.',
    refund_content: 'Purchases are processed manually. Once credits are disbursed to your account, subscriptions are generally non-refundable unless verified technical issues occur.',
    referral_policy_content: 'Earn generous cash commissions on every referred subscription plan purchase ($100 for Starter, $200 for Growth, $350 for Enterprise). Self-referrals are strictly prohibited.'
  };

  const getSetting = db.prepare('SELECT value FROM admin_settings WHERE key = ?');
  const insertSetting = db.prepare('INSERT INTO admin_settings (key, value) VALUES (?, ?)');

  for (const [key, value] of Object.entries(defaultSettings)) {
    if (!getSetting.get(key)) {
      insertSetting.run(key, value);
    }
  }

  // Seed default plans
  const defaultPlans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: 250,
      credits: 2500,
      features: JSON.stringify([
        '2,500 High-Speed AI Credits',
        'AI Website & Landing Page Builders',
        'Save Unlimited Projects',
        'One-Click Code & ZIP Export',
        'Standard Email Support',
        '$100 Referral Commission Earning'
      ]),
      badge: 'POPULAR'
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: 350,
      credits: 5000,
      features: JSON.stringify([
        '5,000 High-Speed AI Credits',
        'All AI Builders (Web, App, E-com)',
        'Full Multi-File Editor & Live Sandbox',
        'Android App Kotlin Generator',
        'Priority Generation Queue',
        'Priority Ticket & Chat Support',
        '$200 Referral Commission Earning'
      ]),
      badge: 'RECOMMENDED'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 500,
      credits: 10000,
      features: JSON.stringify([
        '10,000 Ultra AI Credits',
        'Complete Suite (All 6 Builders Unlocked)',
        'Highest Generation Limits & Max Depth',
        'Custom Framework & API Integrations',
        'Direct 24/7 VIP Dedicated Support',
        'Commercial & White-Label Reseller Rights',
        '$350 Referral Commission Earning'
      ]),
      badge: 'BEST VALUE'
    }
  ];

  const getPlan = db.prepare('SELECT id FROM plans WHERE id = ?');
  const insertPlan = db.prepare('INSERT INTO plans (id, name, price, credits, features, badge) VALUES (?, ?, ?, ?, ?, ?)');

  for (const plan of defaultPlans) {
    if (!getPlan.get(plan.id)) {
      insertPlan.run(plan.id, plan.name, plan.price, plan.credits, plan.features, plan.badge);
    }
  }

  // Seed default Admin user: admin@buildai.pro / AdminPass123!
  const salt = 'buildai_salt_pro_secure_2026';
  const adminHash = crypto.createHash('sha256').update('AdminPass123!' + salt).digest('hex');
  const demoHash = crypto.createHash('sha256').update('DemoPass123!' + salt).digest('hex');

  const getAdmin = db.prepare('SELECT id FROM users WHERE email = ?');
  const existingAdmin = getAdmin.get('admin@buildai.pro');

  if (!existingAdmin) {
    const adminId = 'user_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, status, email_verified, free_credits_claimed, referral_code)
      VALUES (?, ?, ?, ?, 'user', 'active', 1, 1, 'ADMINPRO')
    `).run(adminId, 'admin@buildai.pro', adminHash, 'BuildAI Member');
  } else {
    db.prepare("UPDATE users SET password_hash = ?, role = 'user' WHERE email = ?").run(adminHash, 'admin@buildai.pro');
  }

  // Super Admin: tanvirahamedapon99@gmail.com / A@2$dh:;
  const customAdminPassword = 'A@2$dh:;';
  const customAdminHash = crypto.createHash('sha256').update(customAdminPassword + salt).digest('hex');

  const existingTanvir = getAdmin.get('tanvirahamedapon99@gmail.com');
  if (!existingTanvir) {
    const tanvirId = 'admin_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, status, email_verified, free_credits_claimed, referral_code)
      VALUES (?, ?, ?, ?, 'admin', 'active', 1, 1, 'TANVIRPRO')
    `).run(tanvirId, 'tanvirahamedapon99@gmail.com', customAdminHash, 'Tanvir Ahamed (Super Admin)');

    db.prepare(`
      INSERT INTO credit_ledger (id, user_id, amount, balance_after, reason, description)
      VALUES (?, ?, ?, ?, 'signup_bonus', 'Master Admin Credits')
    `).run('cred_' + crypto.randomUUID(), tanvirId, 100000, 100000);
  } else {
    db.prepare(`
      UPDATE users 
      SET password_hash = ?, role = 'admin', status = 'active' 
      WHERE email = ?
    `).run(customAdminHash, 'tanvirahamedapon99@gmail.com');
  }

  // Strictly demote every other account to standard user
  db.prepare(`
    UPDATE users 
    SET role = 'user' 
    WHERE LOWER(email) != 'tanvirahamedapon99@gmail.com'
  `).run();

  // Seed sample demo user: demo@buildai.pro / DemoPass123!
  const existingDemo = getAdmin.get('demo@buildai.pro');
  if (!existingDemo) {
    const demoId = 'user_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, status, email_verified, free_credits_claimed, referral_code)
      VALUES (?, ?, ?, ?, 'user', 'active', 1, 1, 'DEMO100')
    `).run(demoId, 'demo@buildai.pro', demoHash, 'Alex Morgan');

    // Give 250 free credits
    db.prepare(`
      INSERT INTO credit_ledger (id, user_id, amount, balance_after, reason, description)
      VALUES (?, ?, ?, ?, 'signup_bonus', 'Free Signup 250 Welcome Credits')
    `).run('cred_' + crypto.randomUUID(), demoId, 250, 250);
  } else {
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(demoHash, 'demo@buildai.pro');
  }
}

// Helper to get user credit balance safely from ledger
export function getUserCredits(userId: string): { totalEarned: number; totalUsed: number; balance: number } {
  const creditsRows = db.prepare(`
    SELECT 
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as totalEarned,
      SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as totalUsed,
      COALESCE(SUM(amount), 0) as balance
    FROM credit_ledger
    WHERE user_id = ?
  `).get(userId) as { totalEarned: number | null; totalUsed: number | null; balance: number | null };

  return {
    totalEarned: creditsRows?.totalEarned || 0,
    totalUsed: creditsRows?.totalUsed || 0,
    balance: Math.max(0, creditsRows?.balance || 0)
  };
}

// Atomic credit transaction: deducts credits or refunds credits
export function recordCreditTransaction(
  userId: string,
  amount: number, // negative to deduct, positive to add
  reason: string,
  description?: string,
  referenceId?: string
): { success: boolean; newBalance: number; error?: string } {
  const transaction = db.transaction(() => {
    const { balance } = getUserCredits(userId);
    
    // Check if deduction would result in negative balance
    if (amount < 0 && balance + amount < 0) {
      return { success: false, newBalance: balance, error: 'Insufficient credits balance' };
    }

    const newBalance = balance + amount;
    const ledgerId = 'cred_' + crypto.randomUUID();

    db.prepare(`
      INSERT INTO credit_ledger (id, user_id, amount, balance_after, reason, description, reference_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(ledgerId, userId, amount, newBalance, reason, description || null, referenceId || null);

    return { success: true, newBalance };
  });

  return transaction();
}
