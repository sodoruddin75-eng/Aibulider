import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import JSZip from 'jszip';
import {
  db,
  initDatabase,
  getUserCredits,
  recordCreditTransaction
} from './server/db.js';
import {
  hashPassword,
  generateToken,
  authenticate,
  requireAuth,
  requireAdmin,
  AuthenticatedRequest
} from './server/auth.js';
import {
  generateProjectWithAi,
  isAiConfigured
} from './server/ai.js';
import {
  createSourceCodeZip,
  createSourceCodeTarGz,
  createAllInOneSourceText,
  createShellDownloaderScript,
  getAllProjectFiles,
  readProjectFile
} from './server/sourceArchive.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite schema & default records
initDatabase();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(authenticate as any);

// --- HELPER FOR AUDIT LOGGING ---
function logAdminAction(adminId: string, action: string, targetType: string, targetId?: string, details?: any, req?: Request) {
  try {
    const id = 'log_' + crypto.randomUUID();
    const ip = req?.ip || req?.socket.remoteAddress || '127.0.0.1';
    db.prepare(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, adminId, action, targetType, targetId || null, details ? JSON.stringify(details) : null, ip);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// ----------------------------------------------------------------
// 1. PUBLIC SETTINGS & STATUS
// ----------------------------------------------------------------
app.get('/api/settings/public', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT key, value FROM admin_settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }

  const plans = db.prepare('SELECT * FROM plans WHERE is_active = 1 ORDER BY price ASC').all() as any[];
  const formattedPlans = plans.map(p => ({
    ...p,
    features: JSON.parse(p.features)
  }));

  res.json({
    settings,
    plans: formattedPlans,
    isAiConfigured: isAiConfigured()
  });
});

// ----------------------------------------------------------------
// DIRECT CODEBASE DOWNLOADS & RAW FILE SERVING (ZIP & NON-ZIP)
// ----------------------------------------------------------------

// 1. Download full platform source code as ZIP
app.get([
  '/download',
  '/download.zip',
  '/api/download',
  '/api/download/source',
  '/api/download/codebase',
  '/api/system/download-codebase'
], (req: Request, res: Response) => {
  try {
    const buffer = createSourceCodeZip();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="buildai-pro-full-source.zip"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.end(buffer);
  } catch (err: any) {
    console.error('Error generating codebase zip:', err);
    res.status(500).json({ error: 'Failed to generate codebase zip archive' });
  }
});

// 2. Download full platform source code as TAR.GZ (NO ZIP)
app.get([
  '/download.tar.gz',
  '/download.tar',
  '/api/download/tar',
  '/api/download/targz'
], (req: Request, res: Response) => {
  try {
    const buffer = createSourceCodeTarGz();
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', 'attachment; filename="buildai-pro-full-source.tar.gz"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.end(buffer);
  } catch (err: any) {
    console.error('Error generating codebase tar.gz:', err);
    res.status(500).json({ error: 'Failed to generate tar.gz archive' });
  }
});

// 3. Download All-in-One Plain Text file (NO ZIP / NO COMPRESSION AT ALL)
app.get([
  '/download.txt',
  '/download/all-files.txt',
  '/api/download/text',
  '/api/download/all-in-one'
], (req: Request, res: Response) => {
  try {
    const text = createAllInOneSourceText();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="buildai-pro-all-code.txt"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(text);
  } catch (err: any) {
    console.error('Error generating all-in-one text:', err);
    res.status(500).json({ error: 'Failed to generate all-in-one text file' });
  }
});

// 4. Download One-Command Shell Script (Extracts files directly without zip)
app.get([
  '/download.sh',
  '/install.sh',
  '/api/download/script'
], (req: Request, res: Response) => {
  try {
    const host = req.get('host') || 'localhost:3000';
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const baseUrl = `${proto}://${host}`;
    const script = createShellDownloaderScript(baseUrl);
    res.setHeader('Content-Type', 'text/x-shellscript; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="download.sh"');
    res.send(script);
  } catch (err: any) {
    console.error('Error generating shell downloader:', err);
    res.status(500).json({ error: 'Failed to generate shell downloader script' });
  }
});

// 5. Get file tree metadata for in-app code explorer
app.get('/api/files/tree', (req: Request, res: Response) => {
  try {
    const files = getAllProjectFiles();
    res.json({ files, count: files.length });
  } catch (err: any) {
    console.error('Error listing project files:', err);
    res.status(500).json({ error: 'Failed to read project tree' });
  }
});

// 6. Get single file content as JSON
app.get('/api/files/content', (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }

  const result = readProjectFile(filePath);
  if (!result) {
    return res.status(404).json({ error: 'File not found or access denied' });
  }

  res.json({
    path: result.info.path,
    name: result.info.name,
    size: result.info.size,
    content: result.content
  });
});

// 7. Direct Raw File Stream (e.g. /raw/server.ts, /raw/src/App.tsx)
app.get('/raw/:path(*)', (req: Request, res: Response) => {
  const filePath = req.params.path;
  if (!filePath) {
    return res.status(400).send('File path required');
  }

  const result = readProjectFile(filePath);
  if (!result) {
    return res.status(404).send('File not found or access denied');
  }

  const isDownload = req.query.download === '1';
  res.setHeader('Content-Type', result.info.mimeType);
  if (isDownload) {
    res.setHeader('Content-Disposition', `attachment; filename="${result.info.name}"`);
  } else {
    res.setHeader('Content-Disposition', 'inline');
  }
  res.send(result.content);
});

// 8. One-Click Instant Download Webpage (/dl)
app.get(['/dl', '/download-page', '/direct-download'], (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BuildAI Pro - One-Click Download</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 20px;
      max-width: 650px;
      width: 100%;
      padding: 36px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      background: #3b82f6;
      color: white;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      margin-bottom: 8px;
      color: #ffffff;
    }
    p.sub {
      color: #94a3b8;
      font-size: 15px;
      margin-bottom: 28px;
      line-height: 1.5;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s ease;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .btn-primary {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: #0ea5e9;
      color: #ffffff;
      box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);
    }
    .btn-secondary:hover {
      background: #0284c7;
      transform: translateY(-2px);
    }
    .btn-accent {
      background: #475569;
      color: #f1f5f9;
      border: 1px solid #64748b;
    }
    .btn-accent:hover {
      background: #334155;
      transform: translateY(-2px);
    }
    .tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.2);
    }
    .curl-box {
      margin-top: 24px;
      background: #090d16;
      border: 1px solid #1e293b;
      padding: 14px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 13px;
      color: #38bdf8;
      word-break: break-all;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Direct One-Click Download</span>
    <h1>BuildAI Pro সোর্স কোড ডাউনলোড</h1>
    <p class="sub">নিচের যেকোনো বাটনে ক্লিক করলেই কোনো পাসওয়ার্ড বা অতিরিক্ত স্টেপ ছাড়াই সাথে সাথে সরাসরি ফাইল ডাউনলোড শুরু হবে:</p>
    
    <div class="btn-group">
      <!-- 1. Tar.gz No Zip -->
      <a href="/download.tar.gz" class="btn btn-primary" download>
        <span>
          <strong style="display:block; font-size:16px;">১. ডিরেক্ট TAR.GZ ডাউনলোড (কোনো ZIP নয়)</strong>
          <small style="opacity: 0.85; font-weight:normal;">সব ফাইল সুরক্ষিত কম্প্রেসড ফরম্যাটে (.tar.gz)</small>
        </span>
        <span class="tag">এক-ক্লিকে ডাউনলোড</span>
      </a>

      <!-- 2. Plain Text No Zip -->
      <a href="/download.txt" class="btn btn-secondary" download>
        <span>
          <strong style="display:block; font-size:16px;">২. অল-ইন-ওয়ান টেক্সট ফাইল (.txt)</strong>
          <small style="opacity: 0.85; font-weight:normal;">কোনো সফটওয়্যার ছাড়াই নোটপ্যাডে পড়া ও কপি করা যায়</small>
        </span>
        <span class="tag">প্লেইন ফাইল</span>
      </a>

      <!-- 3. ZIP -->
      <a href="/download.zip" class="btn btn-accent" download>
        <span>
          <strong style="display:block; font-size:16px;">৩. স্ট্যান্ডার্ড ZIP ফাইল (.zip)</strong>
          <small style="opacity: 0.85; font-weight:normal;">উইন্ডোজ এবং মোবাইলের স্ট্যান্ডার্ড জিপ আর্কাইভ</small>
        </span>
        <span class="tag">ZIP ফরম্যাট</span>
      </a>
    </div>

    <div class="curl-box">
      <strong>টার্মিনাল / কার্ল (Curl) কমান্ড:</strong><br>
      curl -O https://${req.get('host') || 'ais-pre-ayamlfab3fhadxkya4batf-134595030299.asia-east1.run.app'}/download.tar.gz
    </div>

    <div class="footer">
      <a href="/">← প্ল্যাটফর্মের হোমপেজে ফিরে যান</a>
    </div>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});


// ----------------------------------------------------------------
// 2. USER AUTHENTICATION
// ----------------------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name, referralCode } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  // Handle referral tracking
  let referringUserId: string | null = null;
  if (referralCode) {
    const cleanRef = referralCode.trim().toUpperCase();
    const refUser = db.prepare('SELECT id FROM users WHERE UPPER(referral_code) = ?').get(cleanRef) as any;
    if (refUser) {
      referringUserId = refUser.id;
    }
  }

  const userId = 'usr_' + crypto.randomUUID().slice(0, 10);
  const userReferralCode = 'BAI' + crypto.randomBytes(3).toString('hex').toUpperCase();
  const passwordHash = hashPassword(password);

  // Check anti-abuse for free credits (check if ip or device already claimed, or email)
  const freeCreditsToAward = 250;

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, status, email_verified, free_credits_claimed, referral_code, referred_by)
    VALUES (?, ?, ?, ?, 'user', 'active', 1, 1, ?, ?)
  `).run(userId, normalizedEmail, passwordHash, name.trim(), userReferralCode, referringUserId);

  // Award the 250 free credits strictly once
  recordCreditTransaction(
    userId,
    freeCreditsToAward,
    'signup_bonus',
    'Welcome Bonus: 250 Free AI Generation Credits'
  );

  const token = generateToken({ id: userId, email: normalizedEmail, role: 'user' });
  const credits = getUserCredits(userId);

  res.json({
    token,
    user: {
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      role: 'user',
      status: 'active',
      referral_code: userReferralCode,
      referred_by: referringUserId,
      email_verified: 1,
      free_credits_claimed: 1
    },
    credits
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const hash = hashPassword(password);
  if (user.password_hash !== hash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended. Please contact support.' });
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const credits = getUserCredits(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      referral_code: user.referral_code,
      referred_by: user.referred_by,
      email_verified: user.email_verified,
      free_credits_claimed: user.free_credits_claimed
    },
    credits
  });
});

app.get('/api/auth/me', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const credits = getUserCredits(user.id);
  const activeSub = db.prepare(`
    SELECT s.*, p.name as plan_name 
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.user_id = ? AND s.status = 'active'
    ORDER BY s.created_at DESC LIMIT 1
  `).get(user.id);

  res.json({
    user,
    credits,
    subscription: activeSub || null
  });
});

app.post('/api/auth/update-profile', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const { name, currentPassword, newPassword } = req.body;
  const user = req.user!;

  if (name && name.trim()) {
    db.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE id = ?').run(name.trim(), user.id);
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to set a new password' });
    }
    const fullUser = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as any;
    if (fullUser.password_hash !== hashPassword(currentPassword)) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }
    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(hashPassword(newPassword), user.id);
  }

  const updatedUser = db.prepare('SELECT id, email, name, role, status, referral_code, email_verified, free_credits_claimed FROM users WHERE id = ?').get(user.id);
  res.json({ user: updatedUser, message: 'Profile updated successfully' });
});

// ----------------------------------------------------------------
// 3. CREDIT MANAGEMENT & LEDGER
// ----------------------------------------------------------------
app.get('/api/credits/ledger', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const ledger = db.prepare(`
    SELECT id, amount, balance_after, reason, description, reference_id, created_at
    FROM credit_ledger
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).all(user.id);

  const balance = getUserCredits(user.id);
  res.json({ balance, ledger });
});

// ----------------------------------------------------------------
// 4. SUBSCRIPTION PLANS & MANUAL PURCHASE APPROVAL SYSTEM
// ----------------------------------------------------------------
app.get('/api/plans', (req: Request, res: Response) => {
  const plans = db.prepare('SELECT * FROM plans WHERE is_active = 1 ORDER BY price ASC').all() as any[];
  const formatted = plans.map(p => ({
    ...p,
    features: JSON.parse(p.features)
  }));
  res.json(formatted);
});

// Submit manual purchase request
app.post('/api/purchases', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const { planId, paymentReference, paymentNote } = req.body;
  const user = req.user!;

  if (!planId || !paymentReference) {
    return res.status(400).json({ error: 'Plan ID and Payment Reference are required' });
  }

  const plan = db.prepare('SELECT * FROM plans WHERE id = ? AND is_active = 1').get(planId) as any;
  if (!plan) {
    return res.status(404).json({ error: 'Selected plan was not found' });
  }

  // Create unique purchase ID
  const purchaseId = 'PUR-' + Math.floor(100000 + Math.random() * 900000);

  db.prepare(`
    INSERT INTO purchases (id, user_id, plan_id, amount, payment_reference, payment_note, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(purchaseId, user.id, plan.id, plan.price, paymentReference.trim(), paymentNote?.trim() || null);

  res.json({
    success: true,
    purchaseId,
    status: 'pending',
    message: 'Your purchase request has been submitted. Admin will review and verify your payment before activating your plan.'
  });
});

app.get('/api/purchases/my', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const purchases = db.prepare(`
    SELECT p.*, pl.name as plan_name, pl.credits as plan_credits
    FROM purchases p
    JOIN plans pl ON p.plan_id = pl.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(user.id);

  res.json(purchases);
});

// ----------------------------------------------------------------
// 5. UNLIMITED REFERRAL SYSTEM & COMMISSIONS
// ----------------------------------------------------------------
app.post('/api/referrals/click', (req: Request, res: Response) => {
  const { referralCode } = req.body;
  if (!referralCode) return res.status(400).json({ error: 'Code required' });

  const referrer = db.prepare('SELECT id FROM users WHERE UPPER(referral_code) = ?').get(referralCode.trim().toUpperCase()) as any;
  if (referrer) {
    const id = 'clk_' + crypto.randomUUID();
    db.prepare('INSERT INTO referral_clicks (id, referrer_id, user_agent) VALUES (?, ?, ?)').run(
      id,
      referrer.id,
      req.headers['user-agent'] || 'unknown'
    );
  }
  res.json({ success: true });
});

app.get('/api/referrals/stats', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  // Referral clicks
  const totalClicksRow = db.prepare('SELECT COUNT(*) as count FROM referral_clicks WHERE referrer_id = ?').get(user.id) as any;
  const totalClicks = totalClicksRow?.count || 0;

  // Referred users
  const referredUsers = db.prepare(`
    SELECT id, name, email, created_at
    FROM users
    WHERE referred_by = ?
    ORDER BY created_at DESC
  `).all(user.id);

  // Referral commissions
  const commissions = db.prepare(`
    SELECT c.*, u.name as referee_name, u.email as referee_email, p.name as plan_name
    FROM commissions c
    JOIN users u ON c.referee_id = u.id
    JOIN plans p ON c.plan_id = p.id
    WHERE c.referrer_id = ?
    ORDER BY c.created_at DESC
  `).all(user.id);

  const earningsRow = db.prepare(`
    SELECT 
      SUM(CASE WHEN status IN ('approved', 'paid') THEN commission_amount ELSE 0 END) as totalEarned,
      SUM(CASE WHEN status = 'approved' THEN commission_amount ELSE 0 END) as pendingPayout,
      SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END) as paidTotal
    FROM commissions
    WHERE referrer_id = ?
  `).get(user.id) as any;

  res.json({
    referralCode: user.referral_code,
    totalClicks,
    totalSignups: referredUsers.length,
    referredUsers,
    commissions,
    totalEarned: earningsRow?.totalEarned || 0,
    pendingPayout: earningsRow?.pendingPayout || 0,
    paidTotal: earningsRow?.paidTotal || 0
  });
});

// ----------------------------------------------------------------
// 6. PAYOUT REQUESTS
// ----------------------------------------------------------------
app.post('/api/payouts/request', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const { fullName, registeredEmail, referralCode, purchasedPlan, commissionAmount, paymentMethod, paymentAccountDetails, message } = req.body;
  const user = req.user!;

  if (!fullName || !registeredEmail || !commissionAmount || !paymentMethod || !paymentAccountDetails) {
    return res.status(400).json({ error: 'Please fill in all required payout fields' });
  }

  const amount = parseInt(commissionAmount, 10);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid commission amount' });
  }

  // Check approved earnings available
  const availableRow = db.prepare(`
    SELECT SUM(commission_amount) as approvedAmount
    FROM commissions
    WHERE referrer_id = ? AND status = 'approved'
  `).get(user.id) as any;
  const approvedTotal = availableRow?.approvedAmount || 0;

  // Pending requested payouts
  const pendingRequestsRow = db.prepare(`
    SELECT SUM(commission_amount) as pendingRequested
    FROM payout_requests
    WHERE user_id = ? AND status IN ('pending', 'approved')
  `).get(user.id) as any;
  const alreadyRequested = pendingRequestsRow?.pendingRequested || 0;

  const currentAvailable = approvedTotal - alreadyRequested;
  if (amount > currentAvailable) {
    return res.status(400).json({
      error: `Requested amount ($${amount}) exceeds your available approved commission balance ($${Math.max(0, currentAvailable)}).`
    });
  }

  const payoutId = 'PAY-' + Math.floor(10000 + Math.random() * 90000);

  db.prepare(`
    INSERT INTO payout_requests (id, user_id, full_name, registered_email, referral_code, purchased_plan, commission_amount, payment_method, payment_account_details, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    payoutId,
    user.id,
    fullName.trim(),
    registeredEmail.trim(),
    referralCode?.trim() || user.referral_code,
    purchasedPlan?.trim() || 'Referral Commission',
    amount,
    paymentMethod.trim(),
    paymentAccountDetails.trim(),
    message?.trim() || null
  );

  res.json({
    success: true,
    payoutId,
    status: 'pending',
    message: 'Your payout request has been registered. Admin will review and process your payment manually.'
  });
});

app.get('/api/payouts/my', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const payouts = db.prepare(`
    SELECT * FROM payout_requests
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(user.id);
  res.json(payouts);
});

// ----------------------------------------------------------------
// 7. AI BUILDERS & PROJECT MANAGEMENT
// ----------------------------------------------------------------
app.post('/api/ai/generate', requireAuth as any, async (req: AuthenticatedRequest, res: Response) => {
  const { toolType, prompt, framework, theme } = req.body;
  const user = req.user!;

  if (!toolType || !prompt) {
    return res.status(400).json({ error: 'Tool type and prompt are required' });
  }

  // Credit cost lookup
  const costKey = `cost_${toolType}`;
  const costSetting = db.prepare('SELECT value FROM admin_settings WHERE key = ?').get(costKey) as any;
  const estimatedCost = costSetting ? parseInt(costSetting.value, 10) : 15;

  // Atomic credit deduction
  const deductResult = recordCreditTransaction(
    user.id,
    -estimatedCost,
    'generation_cost',
    `AI ${toolType.toUpperCase()} Builder generation`
  );

  if (!deductResult.success) {
    return res.status(402).json({
      error: 'Insufficient credits balance. Please upgrade to a plan to continue generating projects.',
      code: 'INSUFFICIENT_CREDITS',
      balance: deductResult.newBalance,
      required: estimatedCost
    });
  }

  try {
    const aiResult = await generateProjectWithAi(toolType, prompt, { framework, theme });

    const projectId = 'prj_' + crypto.randomUUID().slice(0, 10);
    db.prepare(`
      INSERT INTO ai_projects (id, user_id, tool_type, title, prompt, framework, files, preview_html, credits_used)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      user.id,
      toolType,
      aiResult.title,
      prompt,
      framework || 'html-tailwind',
      JSON.stringify(aiResult.files),
      aiResult.previewHtml,
      estimatedCost
    );

    const updatedCredits = getUserCredits(user.id);

    res.json({
      success: true,
      project: {
        id: projectId,
        toolType,
        title: aiResult.title,
        prompt,
        framework: framework || 'html-tailwind',
        files: aiResult.files,
        previewHtml: aiResult.previewHtml,
        summary: aiResult.summary,
        isRealAi: aiResult.isRealAi,
        modelUsed: aiResult.modelUsed,
        creditsUsed: estimatedCost
      },
      credits: updatedCredits,
      isAiConfigured: isAiConfigured()
    });
  } catch (err: any) {
    console.error('Generation failure, issuing atomic refund:', err);
    // Refund credits on failure!
    recordCreditTransaction(
      user.id,
      estimatedCost,
      'generation_refund',
      `Refund for failed AI ${toolType} generation`
    );
    const updatedCredits = getUserCredits(user.id);
    return res.status(500).json({
      error: 'Generation failed: ' + (err.message || 'Server error'),
      refunded: true,
      credits: updatedCredits
    });
  }
});

app.get('/api/ai/projects', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const projects = db.prepare(`
    SELECT id, tool_type, title, prompt, framework, credits_used, is_favorite, created_at, updated_at
    FROM ai_projects
    WHERE user_id = ?
    ORDER BY updated_at DESC
  `).all(user.id);

  res.json(projects);
});

app.get('/api/ai/projects/:id', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const project = db.prepare('SELECT * FROM ai_projects WHERE id = ? AND user_id = ?').get(req.params.id, user.id) as any;
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({
    ...project,
    files: JSON.parse(project.files)
  });
});

app.put('/api/ai/projects/:id', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { title, files, previewHtml, isFavorite } = req.body;

  const project = db.prepare('SELECT id FROM ai_projects WHERE id = ? AND user_id = ?').get(req.params.id, user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (title) {
    db.prepare('UPDATE ai_projects SET title = ?, updated_at = datetime(\'now\') WHERE id = ?').run(title, req.params.id);
  }
  if (files) {
    db.prepare('UPDATE ai_projects SET files = ?, updated_at = datetime(\'now\') WHERE id = ?').run(JSON.stringify(files), req.params.id);
  }
  if (previewHtml !== undefined) {
    db.prepare('UPDATE ai_projects SET preview_html = ?, updated_at = datetime(\'now\') WHERE id = ?').run(previewHtml, req.params.id);
  }
  if (isFavorite !== undefined) {
    db.prepare('UPDATE ai_projects SET is_favorite = ?, updated_at = datetime(\'now\') WHERE id = ?').run(isFavorite ? 1 : 0, req.params.id);
  }

  res.json({ success: true });
});

app.delete('/api/ai/projects/:id', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  db.prepare('DELETE FROM ai_projects WHERE id = ? AND user_id = ?').run(req.params.id, user.id);
  res.json({ success: true });
});

// ----------------------------------------------------------------
// 8. LIVE SUPPORT TICKETS
// ----------------------------------------------------------------
app.post('/api/support/tickets', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const { subject, message, priority } = req.body;
  const user = req.user!;

  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const ticketId = 'TCK-' + Math.floor(10000 + Math.random() * 90000);
  db.prepare(`
    INSERT INTO support_tickets (id, user_id, user_name, user_email, subject, message, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
  `).run(ticketId, user.id, user.name, user.email, subject.trim(), message.trim(), priority || 'medium');

  res.json({ success: true, ticketId });
});

app.get('/api/support/tickets', requireAuth as any, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const tickets = db.prepare('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
  res.json(tickets);
});

// ----------------------------------------------------------------
// 9. COMPLETE ADMIN PANEL
// ----------------------------------------------------------------

// Admin Metrics
app.get('/api/admin/metrics', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const usersCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any)?.c || 0;
  const activeUsersCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'active'").get() as any)?.c || 0;

  const revenueRow = db.prepare("SELECT SUM(amount) as rev, COUNT(*) as count FROM purchases WHERE status = 'approved'").get() as any;
  const pendingPurchases = (db.prepare("SELECT COUNT(*) as c FROM purchases WHERE status = 'pending'").get() as any)?.c || 0;

  const commissionsRow = db.prepare(`
    SELECT 
      SUM(CASE WHEN status IN ('approved', 'paid') THEN commission_amount ELSE 0 END) as totalCommissions,
      SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END) as paidCommissions,
      SUM(CASE WHEN status = 'approved' THEN commission_amount ELSE 0 END) as pendingCommissions
    FROM commissions
  `).get() as any;

  const pendingPayouts = (db.prepare("SELECT COUNT(*) as c FROM payout_requests WHERE status = 'pending'").get() as any)?.c || 0;
  const totalProjects = (db.prepare('SELECT COUNT(*) as c FROM ai_projects').get() as any)?.c || 0;
  const openTickets = (db.prepare("SELECT COUNT(*) as c FROM support_tickets WHERE status = 'open'").get() as any)?.c || 0;

  res.json({
    totalUsers: usersCount,
    activeUsers: activeUsersCount,
    totalRevenue: revenueRow?.rev || 0,
    totalPurchases: revenueRow?.count || 0,
    pendingPurchases,
    totalCommissions: commissionsRow?.totalCommissions || 0,
    paidCommissions: commissionsRow?.paidCommissions || 0,
    pendingCommissions: commissionsRow?.pendingCommissions || 0,
    pendingPayouts,
    totalProjects,
    openTickets
  });
});

// Admin Users
app.get('/api/admin/users', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const search = req.query.search ? `%${req.query.search}%` : '%';
  const users = db.prepare(`
    SELECT u.id, u.email, u.name, u.role, u.status, u.referral_code, u.referred_by, u.created_at,
      COALESCE((SELECT SUM(amount) FROM credit_ledger WHERE user_id = u.id), 0) as balance,
      (SELECT name FROM plans WHERE id = (SELECT plan_id FROM subscriptions WHERE user_id = u.id AND status = 'active' LIMIT 1)) as active_plan
    FROM users u
    WHERE u.email LIKE ? OR u.name LIKE ? OR u.referral_code LIKE ?
    ORDER BY u.created_at DESC
  `).all(search, search, search);

  res.json(users);
});

// Admin Adjust User Credits
app.post('/api/admin/users/:id/credits', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const { amount, reason, description } = req.body;
  const targetUserId = req.params.id;
  const admin = req.user!;

  const numAmount = parseInt(amount, 10);
  if (isNaN(numAmount) || numAmount === 0) {
    return res.status(400).json({ error: 'Valid non-zero amount required' });
  }

  const result = recordCreditTransaction(
    targetUserId,
    numAmount,
    reason || 'admin_adjustment',
    description || `Adjusted by admin ${admin.name}`
  );

  logAdminAction(admin.id, 'ADJUST_CREDITS', 'user', targetUserId, { amount: numAmount, reason, newBalance: result.newBalance }, req);
  res.json(result);
});

// Admin Toggle User Status
app.post('/api/admin/users/:id/toggle-status', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const targetUserId = req.params.id;
  const admin = req.user!;

  const user = db.prepare('SELECT id, email, status FROM users WHERE id = ?').get(targetUserId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.email.toLowerCase() === 'tanvirahamedapon99@gmail.com') {
    return res.status(400).json({ error: 'Cannot suspend the Super Admin account' });
  }

  const nextStatus = user.status === 'active' ? 'suspended' : 'active';
  db.prepare('UPDATE users SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(nextStatus, targetUserId);

  logAdminAction(admin.id, 'UPDATE_USER_STATUS', 'user', targetUserId, { oldStatus: user.status, nextStatus }, req);
  res.json({ success: true, status: nextStatus });
});

// Admin Purchases (Manual Plan Payment Review)
app.get('/api/admin/purchases', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const purchases = db.prepare(`
    SELECT p.*, u.name as user_name, u.email as user_email, u.referred_by, pl.name as plan_name, pl.credits as plan_credits
    FROM purchases p
    JOIN users u ON p.user_id = u.id
    JOIN plans pl ON p.plan_id = pl.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(purchases);
});

// Admin Approve / Reject Purchase
app.post('/api/admin/purchases/:id/review', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const purchaseId = req.params.id;
  const { status, adminNote } = req.body; // 'approved' or 'rejected'
  const admin = req.user!;

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  const purchase = db.prepare('SELECT * FROM purchases WHERE id = ?').get(purchaseId) as any;
  if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

  if (purchase.status !== 'pending') {
    return res.status(400).json({ error: `Purchase has already been ${purchase.status}` });
  }

  const executeApproval = db.transaction(() => {
    // 1. Update purchase status
    db.prepare(`
      UPDATE purchases 
      SET status = ?, admin_note = ?, reviewed_by = ?, reviewed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(status, adminNote || null, admin.id, purchaseId);

    if (status === 'approved') {
      const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(purchase.plan_id) as any;
      if (plan) {
        // 2. Award plan credits to user
        recordCreditTransaction(
          purchase.user_id,
          plan.credits,
          'plan_purchase',
          `Plan Activated: ${plan.name} (+${plan.credits} credits)`,
          purchaseId
        );

        // 3. Create or update user subscription
        const subId = 'sub_' + crypto.randomUUID();
        db.prepare(`
          INSERT INTO subscriptions (id, user_id, plan_id, status, credits_awarded, purchase_id)
          VALUES (?, ?, ?, 'active', ?, ?)
        `).run(subId, purchase.user_id, plan.id, plan.credits, purchaseId);

        // 4. Referral Commission attribution!
        const buyer = db.prepare('SELECT id, referred_by FROM users WHERE id = ?').get(purchase.user_id) as any;
        if (buyer && buyer.referred_by && buyer.referred_by !== buyer.id) {
          // Check commission rates from admin settings
          // Starter: $100, Growth: $200, Enterprise: $350
          const rateKey = `commission_${plan.id}`;
          const customRate = db.prepare('SELECT value FROM admin_settings WHERE key = ?').get(rateKey) as any;
          const defaultRate = plan.id === 'starter' ? 100 : plan.id === 'growth' ? 200 : 350;
          const commissionAmount = customRate ? parseInt(customRate.value, 10) : defaultRate;

          // Prevent duplicate commissions
          const existingComm = db.prepare('SELECT id FROM commissions WHERE purchase_id = ?').get(purchaseId);
          if (!existingComm) {
            const commId = 'com_' + crypto.randomUUID();
            db.prepare(`
              INSERT INTO commissions (id, referrer_id, referee_id, purchase_id, plan_id, plan_price, commission_amount, status, approved_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', datetime('now'))
            `).run(commId, buyer.referred_by, buyer.id, purchaseId, plan.id, plan.price, commissionAmount);
          }
        }
      }
    }
  });

  executeApproval();
  logAdminAction(admin.id, 'REVIEW_PURCHASE', 'purchase', purchaseId, { status, adminNote }, req);

  res.json({ success: true, status });
});

// Admin Referral & Commission Management
app.get('/api/admin/commissions', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const commissions = db.prepare(`
    SELECT c.*, 
      r.name as referrer_name, r.email as referrer_email, r.referral_code,
      b.name as buyer_name, b.email as buyer_email,
      p.name as plan_name
    FROM commissions c
    JOIN users r ON c.referrer_id = r.id
    JOIN users b ON c.referee_id = b.id
    JOIN plans p ON c.plan_id = p.id
    ORDER BY c.created_at DESC
  `).all();
  res.json(commissions);
});

// Admin Payouts Management
app.get('/api/admin/payouts', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const payouts = db.prepare(`
    SELECT p.*, u.name as user_name, u.email as user_email
    FROM payout_requests p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(payouts);
});

// Review Payout: approve, reject, or mark as paid
app.post('/api/admin/payouts/:id/review', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const payoutId = req.params.id;
  const { status, transactionReference, paymentDate, adminNotes } = req.body; // 'approved', 'rejected', 'paid'
  const admin = req.user!;

  const payout = db.prepare('SELECT * FROM payout_requests WHERE id = ?').get(payoutId) as any;
  if (!payout) return res.status(404).json({ error: 'Payout request not found' });

  const executePayoutReview = db.transaction(() => {
    db.prepare(`
      UPDATE payout_requests
      SET status = ?, 
          transaction_reference = COALESCE(?, transaction_reference),
          payment_date = COALESCE(?, payment_date),
          admin_internal_notes = COALESCE(?, admin_internal_notes),
          reviewed_by = ?,
          reviewed_at = datetime('now'),
          paid_at = CASE WHEN ? = 'paid' THEN datetime('now') ELSE paid_at END,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      status,
      transactionReference || null,
      paymentDate || null,
      adminNotes || null,
      admin.id,
      status,
      payoutId
    );

    // If marked Paid, mark matching user commissions as 'paid'
    if (status === 'paid') {
      db.prepare(`
        UPDATE commissions
        SET status = 'paid', paid_at = datetime('now'), updated_at = datetime('now')
        WHERE referrer_id = ? AND status = 'approved'
      `).run(payout.user_id);
    }
  });

  executePayoutReview();
  logAdminAction(admin.id, 'REVIEW_PAYOUT', 'payout', payoutId, { status, transactionReference, paymentDate }, req);

  res.json({ success: true, status });
});

// Admin Plan Management
app.put('/api/admin/plans/:id', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const planId = req.params.id;
  const { name, price, credits, features, badge, isActive } = req.body;
  const admin = req.user!;

  const plan = db.prepare('SELECT id FROM plans WHERE id = ?').get(planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  db.prepare(`
    UPDATE plans
    SET name = COALESCE(?, name),
        price = COALESCE(?, price),
        credits = COALESCE(?, credits),
        features = COALESCE(?, features),
        badge = ?,
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name,
    price !== undefined ? parseInt(price, 10) : null,
    credits !== undefined ? parseInt(credits, 10) : null,
    features ? JSON.stringify(features) : null,
    badge !== undefined ? badge : null,
    isActive !== undefined ? (isActive ? 1 : 0) : null,
    planId
  );

  logAdminAction(admin.id, 'UPDATE_PLAN', 'plan', planId, { name, price, credits, isActive }, req);
  res.json({ success: true });
});

// Admin Settings (Facebook links, button text, commissions, costs, policies)
app.get('/api/admin/settings', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const rows = db.prepare('SELECT key, value FROM admin_settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  res.json(settings);
});

app.post('/api/admin/settings', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const settings = req.body;
  const admin = req.user!;

  const updateStmt = db.prepare(`
    INSERT INTO admin_settings (key, value, updated_at) 
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);

  const saveTx = db.transaction(() => {
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string' || typeof value === 'number') {
        updateStmt.run(key, String(value));
      }
    }
  });

  saveTx();
  logAdminAction(admin.id, 'UPDATE_SETTINGS', 'settings', undefined, Object.keys(settings), req);

  res.json({ success: true });
});

// Admin Support Tickets
app.get('/api/admin/support', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const tickets = db.prepare('SELECT * FROM support_tickets ORDER BY created_at DESC').all();
  res.json(tickets);
});

app.post('/api/admin/support/:id/reply', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const ticketId = req.params.id;
  const { adminReply, status } = req.body;
  const admin = req.user!;

  db.prepare(`
    UPDATE support_tickets
    SET admin_reply = ?,
        status = COALESCE(?, status),
        replied_at = datetime('now'),
        updated_at = datetime('now')
    WHERE id = ?
  `).run(adminReply, status || 'resolved', ticketId);

  logAdminAction(admin.id, 'REPLY_TICKET', 'ticket', ticketId, { status }, req);
  res.json({ success: true });
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdmin as any, (req: AuthenticatedRequest, res: Response) => {
  const logs = db.prepare(`
    SELECT a.*, u.name as admin_name, u.email as admin_email
    FROM audit_logs a
    LEFT JOIN users u ON a.admin_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 100
  `).all();
  res.json(logs);
});

// ----------------------------------------------------------------
// 10. VITE DEV MIDDLEWARE OR PRODUCTION STATIC FILES
// ----------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BuildAI Pro] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[BuildAI Pro] Server startup error:', err);
});
