import { GoogleGenAI, Type } from '@google/genai';
import { db } from './db.js';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function isAiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '');
}

export interface GeneratedProjectResult {
  title: string;
  files: Record<string, string>;
  previewHtml: string;
  isRealAi: boolean;
  modelUsed: string;
  summary: string;
}

export async function generateProjectWithAi(
  toolType: 'website' | 'webapp' | 'android' | 'landing' | 'ecommerce' | 'code',
  prompt: string,
  options?: { framework?: string; theme?: string }
): Promise<GeneratedProjectResult> {
  const client = getAiClient();
  const configured = Boolean(client);

  // If Gemini API is configured, call Gemini 3.8 Flash!
  if (configured && client) {
    try {
      const systemInstruction = `You are BuildAI Pro's elite AI Software Architect.
Your task is to generate complete, production-grade, highly polished source files based on user prompts for the tool type: "${toolType}".

Requirements by toolType:
- "website": Generate a fully responsive multi-section or multi-page modern website using HTML5, Tailwind CSS (via CDN <script src="https://cdn.tailwindcss.com"></script>), Lucide icons (<script src="https://unpkg.com/lucide@latest"></script>), and vanilla JS. Must include navigation, hero, features/services, interactive components (filters, modals, contact form with validation), and polished footer.
- "webapp": Generate a complete interactive web application. Output index.html with Tailwind CSS, Lucide icons, and a rich JavaScript application logic (state management, interactive CRUD/dashboard, realistic mock data, search & filtering, stats charts using Canvas or SVG).
- "android": Generate a clean, modern Android Studio project. Required files: "app/src/main/AndroidManifest.xml", "app/src/main/java/com/buildai/app/MainActivity.kt" (Jetpack Compose or modern Kotlin), "app/build.gradle.kts", "app/src/main/res/values/strings.xml", "app/src/main/res/values/colors.xml", and "README.md". Also provide a preview HTML mockup that simulates this Android app running on a mobile device screen!
- "landing": Generate an ultra high-converting SaaS landing page with sticky glass header, hero with CTA, animated social proof, interactive pricing calculator/toggle, bento grid features, testimonials slider/grid, FAQ accordion, and footer.
- "ecommerce": Generate a full featured modern online store. Include product catalog with categories, search and sort, shopping cart slide-over drawer, quantity controls, quick product view modal, and checkout drawer.
- "code": Generate clean, fully commented, modern TypeScript/Node.js or Python production code, architecture breakdown, API endpoints, schema, and usage example.

Output MUST be strictly valid JSON according to this structure:
{
  "title": "Short descriptive title of the project",
  "summary": "2-3 sentences explaining what was built and its architecture",
  "files": {
    "filename.ext": "file content string"
  },
  "previewHtml": "Complete standalone HTML document that renders the project in an iframe preview. For Android, render an interactive smartphone mockup frame that displays the app UI visually."
}`;

      const userPrompt = `User Prompt: ${prompt}
Tool Type: ${toolType}
Target Framework: ${options?.framework || 'Modern HTML/Tailwind/JS'}
Requested Theme: ${options?.theme || 'Modern Clean SaaS'}

Generate the complete, robust, functional project files. Provide all code without skipping parts or using placeholder comments.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI inference timeout')), 12000)
      );

      const response = await Promise.race([
        client.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                files: {
                  type: Type.OBJECT,
                  description: 'Map of filename to full file content string'
                },
                previewHtml: { type: Type.STRING }
              },
              required: ['title', 'summary', 'files', 'previewHtml']
            }
          }
        }),
        timeoutPromise
      ]);

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      return {
        title: parsed.title || `${toolType.toUpperCase()} Project`,
        files: parsed.files && Object.keys(parsed.files).length > 0 ? parsed.files : { 'index.html': parsed.previewHtml || '<h1>Generated Project</h1>' },
        previewHtml: parsed.previewHtml || parsed.files?.['index.html'] || '<h1>Generated Preview</h1>',
        isRealAi: true,
        modelUsed: 'gemini-3.8-flash',
        summary: parsed.summary || 'Generated via BuildAI Pro Gemini 3.8 Flash'
      };
    } catch (err: any) {
      console.error('Error in Gemini generation:', err);
      // Fallback to high-grade generator template if Gemini call had an issue (e.g. rate limit)
    }
  }

  // Fallback high-fidelity intelligent template engine
  // This guarantees users can test all 6 builders immediately even before attaching a live Gemini Key,
  // while explicitly flagging whether live Gemini AI was used!
  return generateIntelligentProjectTemplate(toolType, prompt);
}

function generateIntelligentProjectTemplate(toolType: string, prompt: string): GeneratedProjectResult {
  const cleanPrompt = prompt.trim() || 'Modern Digital Solution';
  const title = prompt.length > 35 ? prompt.slice(0, 32) + '...' : prompt;

  if (toolType === 'android') {
    const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.buildai.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BuildAIApp">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.BuildAIApp">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    const mainActivity = `package com.buildai.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppScreen(title = "${escapeString(title)}")
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppScreen(title: String) {
    var searchQuery by remember { mutableStateOf("") }
    val items = remember {
        listOf(
            "Overview & Analytics",
            "Real-time Data Sync",
            "Smart AI Workflows",
            "Security & Permissions",
            "Account Settings"
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = title, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF1E293B),
                    titleContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("Search app resources...") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Dashboard Modules",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(12.dp))
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(items.filter { it.contains(searchQuery, ignoreCase = true) }) { item ->
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertizontally,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = item, fontWeight = FontWeight.Medium, fontSize = 15.sp)
                            Button(
                                onClick = { /* Action */ },
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Open")
                            }
                        }
                    }
                }
            }
        }
    }
}`;

    const gradleBuild = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.buildai.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.buildai.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.tooling.preview)
}`;

    const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${escapeXml(title)}</string>
    <string name="welcome_message">Welcome to ${escapeXml(title)}</string>
</resources>`;

    const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
</resources>`;

    const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { background-color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: system-ui, sans-serif; }
    .device-phone { width: 340px; height: 680px; background: #000; border-radius: 44px; padding: 12px; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.7), inset 0 0 2px 2px rgba(255,255,255,0.2); position: relative; }
    .screen { width: 100%; height: 100%; background: #ffffff; border-radius: 34px; overflow-y: auto; display: flex; flex-direction: column; position: relative; }
    .notch { width: 120px; height: 22px; background: #000; position: absolute; top: 0; left: 50%; transform: translateX(-50%); border-radius: 0 0 14px 14px; z-index: 50; }
  </style>
</head>
<body>
  <div class="device-phone">
    <div class="notch"></div>
    <div class="screen text-slate-800">
      <!-- Status bar -->
      <div class="pt-6 px-6 pb-2 flex justify-between items-center text-xs font-semibold text-slate-400">
        <span>9:41</span>
        <div class="space-x-1.5 flex items-center">
          <i class="fa-solid fa-signal"></i>
          <i class="fa-solid fa-wifi"></i>
          <i class="fa-solid fa-battery-full text-emerald-500"></i>
        </div>
      </div>

      <!-- App Header -->
      <div class="bg-indigo-600 px-5 py-4 text-white shadow-md">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-medium text-indigo-200 uppercase tracking-wider">Android App</span>
            <h1 class="text-lg font-bold truncate max-w-[200px]">${escapeXml(title)}</h1>
          </div>
          <button class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <i class="fa-solid fa-bell text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4 space-y-4 flex-1">
        <div class="bg-slate-100 rounded-xl p-2.5 flex items-center space-x-2 text-sm text-slate-500 border border-slate-200">
          <i class="fa-solid fa-magnifying-glass pl-1"></i>
          <input type="text" placeholder="Search in ${escapeXml(title)}..." class="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400">
        </div>

        <!-- Banner Card -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
          <div class="flex items-center space-x-2 text-xs text-indigo-200 mb-1">
            <i class="fa-solid fa-bolt"></i>
            <span>Instant Mobile UI</span>
          </div>
          <h2 class="font-bold text-base leading-snug">Android Kotlin &amp; Compose Ready</h2>
          <p class="text-xs text-indigo-100 mt-1">Compiled with Jetpack Compose 35 SDK.</p>
          <button class="mt-3 px-3 py-1.5 bg-white text-indigo-600 font-bold rounded-lg text-xs shadow-sm hover:bg-slate-100 transition">Get Started</button>
        </div>

        <!-- Quick actions -->
        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="p-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div class="w-9 h-9 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
              <i class="fa-solid fa-cube text-sm"></i>
            </div>
            <span class="text-[10px] font-medium text-slate-600">Assets</span>
          </div>
          <div class="p-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div class="w-9 h-9 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
              <i class="fa-solid fa-chart-line text-sm"></i>
            </div>
            <span class="text-[10px] font-medium text-slate-600">Stats</span>
          </div>
          <div class="p-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div class="w-9 h-9 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
              <i class="fa-solid fa-gear text-sm"></i>
            </div>
            <span class="text-[10px] font-medium text-slate-600">Settings</span>
          </div>
          <div class="p-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div class="w-9 h-9 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-1">
              <i class="fa-solid fa-shield-halved text-sm"></i>
            </div>
            <span class="text-[10px] font-medium text-slate-600">Secure</span>
          </div>
        </div>

        <!-- List Section -->
        <div>
          <h3 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Active Modules</h3>
          <div class="space-y-2">
            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 class="text-xs font-bold text-slate-800">Jetpack UI View</h4>
                  <p class="text-[10px] text-slate-400">MainActivity.kt</p>
                </div>
              </div>
              <span class="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-full">Active</span>
            </div>
            <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 class="text-xs font-bold text-slate-800">Network Sync</h4>
                  <p class="text-[10px] text-slate-400">Retrofit / OkHttp</p>
                </div>
              </div>
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-semibold rounded-full">Ready</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Android Navigation Bar -->
      <div class="border-t border-slate-200 bg-white px-6 py-2.5 flex justify-between items-center text-slate-500">
        <button class="flex flex-col items-center text-indigo-600">
          <i class="fa-solid fa-house text-sm"></i>
          <span class="text-[9px] mt-0.5 font-bold">Home</span>
        </button>
        <button class="flex flex-col items-center hover:text-indigo-600">
          <i class="fa-solid fa-compass text-sm"></i>
          <span class="text-[9px] mt-0.5">Explore</span>
        </button>
        <button class="flex flex-col items-center hover:text-indigo-600">
          <i class="fa-solid fa-bookmark text-sm"></i>
          <span class="text-[9px] mt-0.5">Saved</span>
        </button>
        <button class="flex flex-col items-center hover:text-indigo-600">
          <i class="fa-solid fa-user text-sm"></i>
          <span class="text-[9px] mt-0.5">Profile</span>
        </button>
      </div>
    </div>
  </div>
</body>
</html>`;

    return {
      title,
      summary: `Complete Android Jetpack Compose project architecture generated for "${cleanPrompt}". Contains AndroidManifest.xml, MainActivity.kt, Gradle script, and strings/colors resources.`,
      files: {
        'app/src/main/AndroidManifest.xml': androidManifest,
        'app/src/main/java/com/buildai/app/MainActivity.kt': mainActivity,
        'app/build.gradle.kts': gradleBuild,
        'app/src/main/res/values/strings.xml': stringsXml,
        'app/src/main/res/values/colors.xml': colorsXml
      },
      previewHtml,
      isRealAi: false,
      modelUsed: 'BuildAI Engine (Compose 35)',
    };
  }

  // Web/Landing/Ecommerce/Webapp/Code:
  const isEcommerce = toolType === 'ecommerce';
  const isLanding = toolType === 'landing';
  const isWebApp = toolType === 'webapp';

  const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
  <!-- Top notification bar -->
  <div class="bg-indigo-600 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center space-x-2">
    <span class="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">New Release</span>
    <span>Generated by BuildAI Pro Engine • Customized for: <strong>${escapeXml(title)}</strong></span>
  </div>

  <!-- Navigation -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md">
          B
        </div>
        <span class="font-extrabold text-xl tracking-tight text-slate-900">${escapeXml(title)}</span>
      </div>

      <nav class="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
        <a href="#features" class="hover:text-indigo-600 transition">Features</a>
        <a href="#solutions" class="hover:text-indigo-600 transition">Solutions</a>
        ${isEcommerce ? '<a href="#catalog" class="hover:text-indigo-600 transition">Catalog</a>' : '<a href="#pricing" class="hover:text-indigo-600 transition">Pricing</a>'}
        <a href="#faq" class="hover:text-indigo-600 transition">FAQ</a>
      </nav>

      <div class="flex items-center space-x-3">
        ${isEcommerce ? `
        <button id="cartBtn" class="relative p-2 text-slate-700 hover:text-indigo-600 transition">
          <i data-lucide="shopping-bag" class="w-5 h-5"></i>
          <span class="cart-badge absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">2</span>
        </button>
        ` : ''}
        <button class="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition">
          ${isEcommerce ? 'Shop Now' : isLanding ? 'Get Started' : 'Launch App'}
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="flex-1">
    <section class="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100/70 text-indigo-700 text-xs font-bold mb-6">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Engineered for Maximum Performance</span>
        </div>
        <h1 class="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Next-Generation <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">${escapeXml(title)}</span> Built to Scale
        </h1>
        <p class="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          ${escapeXml(cleanPrompt)}. Powered by intelligent architectures, blazing fast delivery, and modern user experience.
        </p>

        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button class="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center space-x-2">
            <span>Explore Experience</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
          <button class="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm transition">
            View Live Demo
          </button>
        </div>

        <!-- Metrics bar -->
        <div class="mt-16 pt-12 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div>
            <div class="text-3xl font-extrabold text-slate-900">99.9%</div>
            <div class="text-xs text-slate-500 font-semibold mt-1">Uptime Reliability</div>
          </div>
          <div>
            <div class="text-3xl font-extrabold text-slate-900">4.9/5</div>
            <div class="text-xs text-slate-500 font-semibold mt-1">User Satisfaction</div>
          </div>
          <div>
            <div class="text-3xl font-extrabold text-slate-900">10x</div>
            <div class="text-xs text-slate-500 font-semibold mt-1">Faster Execution</div>
          </div>
          <div>
            <div class="text-3xl font-extrabold text-slate-900">250+</div>
            <div class="text-xs text-slate-500 font-semibold mt-1">Components Included</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Section -->
    <section id="features" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-xs font-bold text-indigo-600 uppercase tracking-widest">Core Capabilities</h2>
          <p class="text-3xl font-extrabold text-slate-900 mt-2">Everything You Need To Dominate</p>
          <p class="text-slate-600 mt-4 text-sm sm:text-base">Designed to transform your operational efficiency from day one.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-xl transition-all duration-300">
            <div class="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-600/30">
              <i data-lucide="zap" class="w-6 h-6"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Ultra-Fast Pipeline</h3>
            <p class="text-slate-600 text-sm leading-relaxed">Built on modern protocols for lightning speed and instantaneous response times across all devices.</p>
          </div>

          <div class="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-xl transition-all duration-300">
            <div class="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-6 shadow-md shadow-violet-600/30">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Bank-Grade Security</h3>
            <p class="text-slate-600 text-sm leading-relaxed">Full encryption at rest and in transit, complete access control, and audited infrastructure.</p>
          </div>

          <div class="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-xl transition-all duration-300">
            <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-600/30">
              <i data-lucide="bar-chart-3" class="w-6 h-6"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Automated Insights</h3>
            <p class="text-slate-600 text-sm leading-relaxed">Real-time analytical graphs, actionable alerts, and deep predictive insights tailored for growth.</p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div class="flex items-center space-x-2 text-white font-bold">
        <span class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs">B</span>
        <span>${escapeXml(title)}</span>
      </div>
      <p class="text-xs">© 2026 ${escapeXml(title)}. All rights reserved. Generated with BuildAI Pro.</p>
      <div class="flex space-x-4 text-slate-400 text-sm">
        <a href="#" class="hover:text-white transition">Terms</a>
        <a href="#" class="hover:text-white transition">Privacy</a>
        <a href="#" class="hover:text-white transition">Documentation</a>
      </div>
    </div>
  </footer>

  <script>
    lucide.createIcons();
  </script>
</body>
</html>`;

  const files: Record<string, string> = {
    'index.html': previewHtml,
    'styles.css': `/* Custom styles for ${title} */
body {
  margin: 0;
  padding: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.accent-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}`,
    'app.js': `// Application Logic for ${title}
console.log('BuildAI Pro: Application Initialized - ${title}');

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});`
  };

  if (toolType === 'code') {
    files['solution.ts'] = `/**
 * BuildAI Pro Generated Solution: ${title}
 * Prompt: ${prompt}
 */

export interface SystemConfig {
  id: string;
  name: string;
  enabled: boolean;
  maxWorkers: number;
  timeoutMs: number;
}

export class EngineService {
  private config: SystemConfig;

  constructor(config: Partial<SystemConfig> = {}) {
    this.config = {
      id: 'cfg_' + Math.random().toString(36).substring(2, 9),
      name: '${escapeString(title)}',
      enabled: true,
      maxWorkers: 8,
      timeoutMs: 30000,
      ...config,
    };
  }

  public async executeTask<T>(taskName: string, payload: unknown): Promise<{ success: boolean; result: T }> {
    console.log(\`[EngineService] Executing task: \${taskName}\`, payload);
    // Processing logic
    return {
      success: true,
      result: { processedAt: new Date().toISOString(), task: taskName } as unknown as T
    };
  }
}`;
  }

  return {
    title,
    summary: `Complete ${toolType} architecture generated for "${cleanPrompt}". Ready for customization, export, and production deployment.`,
    files,
    previewHtml,
    isRealAi: false,
    modelUsed: 'BuildAI Template Engine'
  };
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function escapeString(unsafe: string) {
  return unsafe.replace(/"/g, '\\"').replace(/\n/g, ' ');
}
