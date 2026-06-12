import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Copy, 
  Check, 
  Video, 
  ExternalLink, 
  HelpCircle, 
  Code, 
  Smartphone, 
  UploadCloud,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { LockedApp, SecurityConfig, FocusMode, ActivityLog } from './types';
import AndroidSimulator from './components/AndroidSimulator';
import PrivacyPage from './components/PrivacyPage';

const INITIAL_APPS: LockedApp[] = [
  { packageName: 'com.whatsapp', appName: 'WhatsApp', isLocked: true, dailyLimit: 0, usedMinutes: 0, category: 'social' },
  { packageName: 'com.instagram.android', appName: 'Instagram', isLocked: true, dailyLimit: 30, usedMinutes: 12, category: 'social' },
  { packageName: 'com.google.android.youtube', appName: 'YouTube', isLocked: false, dailyLimit: 45, usedMinutes: 24, category: 'video' },
  { packageName: 'com.facebook.katana', appName: 'Facebook', isLocked: true, dailyLimit: 20, usedMinutes: 5, category: 'social' },
  { packageName: 'org.telegram.messenger', appName: 'Telegram', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'social' },
  { packageName: 'com.snapchat.android', appName: 'Snapchat', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'social' },
  { packageName: 'com.tencent.ig', appName: 'PUBG Mobile', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'gaming' },
  { packageName: 'com.dts.freefireth', appName: 'Free Fire', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'gaming' },
  { packageName: 'com.android.chrome', appName: 'Chrome Browser', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'utility' },
  { packageName: 'com.google.android.gm', appName: 'Gmail', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'productivity' },
  { packageName: 'com.google.android.apps.nbu.paisa.user', appName: 'Google Pay (GPay)', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'finance' },
  { packageName: 'net.one97.paytm', appName: 'Paytm', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'finance' },
  { packageName: 'com.spotify.music', appName: 'Spotify', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'entertainment' },
  { packageName: 'com.twitter.android', appName: 'Twitter / X', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'social' },
  { packageName: 'com.android.dialer', appName: 'Phone / Dialer', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'utility' },
  { packageName: 'com.android.gallery3d', appName: 'Gallery', isLocked: false, dailyLimit: 0, usedMinutes: 0, category: 'utility' }
];

const INITIAL_FOCUS_MODES: FocusMode[] = [
  { id: 'work', name: 'Work Mode', description: 'Blocks Social & Video applications completely to boost focus.', isActive: false, blockedCategories: ['social', 'video'], blockedApps: [] },
  { id: 'study', name: 'Study Mode', description: 'Total containment of gaming, social, and entertainment feeds.', isActive: false, blockedCategories: ['social', 'video', 'gaming'], blockedApps: [] },
  { id: 'sleep', name: 'Sleep Mode', description: 'Enforces complete lockout of all app categories after bedtime.', isActive: false, blockedCategories: ['social', 'video', 'gaming', 'utility', 'productivity'], blockedApps: [] },
  { id: 'custom', name: 'Custom Focus', description: 'Bespoke lockout configuration targeting specific critical nodes.', isActive: false, blockedCategories: [], blockedApps: ['com.instagram.android'] }
];

const INITIAL_SECURITY: SecurityConfig = {
  lockType: 'PIN',
  lockValue: '1234',
  securityName: 'Rahul',
  permissions: {
    usageStats: false,
    overlay: false,
    accessibility: false,
    batteryOptimization: false,
    notifications: false
  },
  isConfigured: false
};

const INITIAL_LOGS: ActivityLog[] = [
  { id: '1', timestamp: '14:32:01', packageName: 'system', appName: 'Room Engine', type: 'unlocked', details: 'Initialized Room SQL DB transaction instance at schema version 1' },
  { id: '2', timestamp: '14:35:10', packageName: 'com.instagram.android', appName: 'Instagram', type: 'blocked', details: 'Restricted overlay triggered foreground intercept matches block rules' }
];

export default function App() {
  const [isPrivacyScreen, setIsPrivacyScreen] = useState<boolean>(
    typeof window !== 'undefined' && 
    (window.location.pathname.includes('/privacy.html') || window.location.pathname.includes('/privacy'))
  );
  const [apps, setApps] = useState<LockedApp[]>(INITIAL_APPS);
  const [security, setSecurity] = useState<SecurityConfig>(INITIAL_SECURITY);
  const [focusModes, setFocusModes] = useState<FocusMode[]>(INITIAL_FOCUS_MODES);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // Layout View Tabs for Mobile viewports
  const [mobileActiveTab, setMobileActiveTab] = useState<'simulator' | 'publishing'>('simulator');
  const [hubSubTab, setHubSubTab] = useState<'policy' | 'forms' | 'video'>('policy');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Developer Hub Toggle to hide Play Store Kit from actual app-preview view
  const [showDevHub, setShowDevHub] = useState<boolean>(false);

  // Sync state transitions to live Room DB Log journal
  const addLog = (packageName: string, appName: string, type: ActivityLog['type'], details: string) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    const newLog: ActivityLog = {
      id: String(Date.now()),
      timestamp,
      packageName,
      appName,
      type,
      details
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // State Management Actions
  const updateAppLock = (packageName: string, isLocked: boolean) => {
    setApps((prev) =>
      prev.map((app) => (app.packageName === packageName ? { ...app, isLocked } : app))
    );
  };

  const updateAppLimit = (packageName: string, minutes: number) => {
    setApps((prev) =>
      prev.map((app) => (app.packageName === packageName ? { ...app, dailyLimit: minutes } : app))
    );
  };

  const incrementAppUsage = (packageName: string, minutes: number) => {
    setApps((prev) =>
      prev.map((app) => (app.packageName === packageName ? { ...app, usedMinutes: app.usedMinutes + minutes } : app))
    );
  };

  const toggleFocusMode = (modeId: string) => {
    setFocusModes((prev) =>
      prev.map((m) => {
        if (m.id === modeId) {
          const newState = !m.isActive;
          return { ...m, isActive: newState };
        }
        return { ...m, isActive: false }; // deactivate others (only one focus mode active at a time)
      })
    );
  };

  const getActiveFocusMode = () => {
    const active = focusModes.find((m) => m.isActive);
    return active ? active.id : null;
  };

  // Helper function to trigger interactive clipboard copies
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Hardcoded Copyable Form Texts for Console Forms
  const consoleFields = {
    accessibilityPurpose: "Our application 'Study Mode App Lock & Timer' uses the Accessibility Service API (specifically monitoring window state changes) to detect when a locked or restricted third-party application is launched by the user. If an app on the restricted list is launched during an active study lock period or when the screen limit has run out, our background worker triggers the security PIN/Pattern overlay immediately to prevent access, encouraging healthy productivity and phone focus.",
    accessibilityBenefit: "It benefits users by ensuring that their study hours are highly disciplined. The app blocks distracting apps such as games, social networks, and messaging clients instantly upon opening. This cannot be bypassed easily by switching tasks, which is only possible through the low-latency window detection using the Accessibility API.",
    accessibilityNoCollect: "No. The application is entirely offline-first. We do not collect, store, transmit, or share any personal, private, operational, or telemetry data from the Accessibility service. The app only transiently inspects the package name of the active foreground window to apply locks, and immediately discards the information once evaluated.",
    dataSafetyExplanation: "Study Mode App Lock & Timer is designed with an offline-first privacy architecture. The application does not collect, track, share, or transmit any user settings, passwords, PINs, patterns, locked app list, or screen usage limits to any external servers or third parties. All operational configurations, logs, and database records remain strictly sandboxed in local persistent SQLite/Room storage on the user's device."
  };

  if (isPrivacyScreen) {
    return <PrivacyPage onBackToApp={() => { setIsPrivacyScreen(false); window.history.pushState({}, '', '/'); }} />;
  }

  return (
    <div className="min-h-screen bg-[#07080e] text-gray-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      
      {/* Top Main Navigation Header */}
      <header className="bg-[#0b0c13] border-b border-gray-900 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/10">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-base text-gray-100 flex items-center gap-1.5 leading-none">
              Study Mode App Lock & Timer 🚀
            </h1>
            <span className="text-[10px] text-gray-400 font-mono tracking-wider block mt-0.5">
              Secure Smartphone Guard & Study Mode App Lock & Timer App
            </span>
          </div>
        </div>

        {/* Developer Console Toggle */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const nextState = !showDevHub;
              setShowDevHub(nextState);
              if (nextState) {
                setMobileActiveTab('publishing');
              } else {
                setMobileActiveTab('simulator');
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
              showDevHub 
                ? 'bg-indigo-650 text-white shadow-md' 
                : 'bg-[#121421] text-indigo-400 hover:text-indigo-300 border border-indigo-900/40 hover:bg-[#151726]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showDevHub ? 'Hide Play Store Kit' : 'Open Play Store Console Kit 🔧'}</span>
          </button>
        </div>

        {/* Responsive Dual Display Toggles for Mobile Screen Widths (Only show when Developer options are enabled) */}
        {showDevHub && (
          <div className="flex bg-[#121421] p-1.5 rounded-xl border border-gray-800 shrink-0 md:hidden w-full max-w-[320px]">
            <button 
              onClick={() => setMobileActiveTab('simulator')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-1.5 transition-all duration-250 ${mobileActiveTab === 'simulator' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Simulator
            </button>
            <button 
              onClick={() => setMobileActiveTab('publishing')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-1.5 transition-all duration-250 ${mobileActiveTab === 'publishing' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Play Store Kit
            </button>
          </div>
        )}
      </header>

      {/* Main Layout Workspace: dynamically center if dev hub is hidden */}
      <main className={`flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 items-start ${
        showDevHub 
          ? 'grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8' 
          : 'flex flex-col items-center justify-center py-6 md:py-12'
      }`}>
        
        {/* LEFT COLUMN: smartphone simulator preview (Visible on active mobile or desktop) */}
        <div className={`flex flex-col items-center justify-center ${
          showDevHub 
            ? 'md:col-span-5 w-full' 
            : 'w-full max-w-md'
        } ${mobileActiveTab === 'simulator' ? 'block' : 'hidden md:block'}`}>
          <div className="w-full max-w-sm flex flex-col items-center">
            
            {/* Header label for Left Column (Desktop) */}
            <div className="hidden md:flex items-center gap-2 mb-4 text-xs font-mono tracking-wider text-indigo-400 uppercase">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Interactive App Preview</span>
            </div>

            <AndroidSimulator
              appsList={apps}
              updateAppLock={updateAppLock}
              updateAppLimit={updateAppLimit}
              incrementAppUsage={incrementAppUsage}
              securityConfig={security}
              updateSecurityConfig={setSecurity}
              activeFocusMode={getActiveFocusMode()}
              toggleFocusMode={toggleFocusMode}
              focusModes={focusModes}
              addLog={addLog}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Play Store Publishing Kit Console (Visible on active mobile or desktop when showDevHub is active) */}
        {showDevHub && (
          <div className={`md:col-span-7 flex flex-col h-full bg-[#0a0b12] border border-gray-900 rounded-2xl overflow-hidden self-stretch ${mobileActiveTab === 'publishing' ? 'block' : 'hidden md:block'}`}>
          
          {/* Header of Developer Tab Hub */}
          <div className="bg-[#10111d] border-b border-gray-950 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400 animate-bounce" />
              <h2 className="text-sm font-semibold font-sans text-gray-200 uppercase tracking-wider">
                Google Play Store Publishing Console
              </h2>
            </div>
            
            {/* Embedded Live Link to Hosted Privacy Policy */}
            <a 
              href="/privacy.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 self-start sm:self-auto bg-indigo-950/40 py-1 px-2.5 rounded-lg border border-indigo-900/40"
            >
              <span>View Hosted Policy Live</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Sub Tab Controls within the Publishing Hub */}
          <div className="bg-[#0e0f18] px-4 py-2 border-b border-gray-950 flex flex-wrap gap-2">
            <button 
              onClick={() => setHubSubTab('policy')}
              className={`py-1.5 px-3 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-all ${hubSubTab === 'policy' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Privacy Policy (English/Hindi)
            </button>
            <button 
              onClick={() => setHubSubTab('forms')}
              className={`py-1.5 px-3 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-all ${hubSubTab === 'forms' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              Console Forms Copy/Paste
            </button>
            <button 
              onClick={() => setHubSubTab('video')}
              className={`py-1.5 px-3 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-all ${hubSubTab === 'video' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              Accessibility Demo Video Guide
            </button>
          </div>

          {/* Content Areas tailored strictly to Subtabs */}
          <div className="flex-1 p-5 overflow-y-auto max-h-[710px] space-y-6">

            {/* TAB 1: PRIVACY POLICY LIVE PREVIEW & HTML EXTRACTOR */}
            {hubSubTab === 'policy' && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/30 text-xs text-indigo-200 leading-relaxed">
                  <span className="font-bold block mb-1">🌍 Live Privacy Policy Hosting URL:</span>
                  You can copy your browser URL and append <code className="text-pink-300 font-mono text-[10px] bg-slate-950 px-1 py-0.5 rounded">/privacy.html</code> at the end to use as your official **Privacy Policy URL** in Play Console. Clicking English/Hindi dynamically swaps languages just like your screenshot!
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-sans flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    Interactive Static Page (Hosted preview)
                  </span>

                  <button
                    onClick={() => {
                      fetch('/privacy.html')
                        .then((res) => res.text())
                        .then((html) => handleCopyText('policy', html))
                        .catch(() => handleCopyText('policy', 'Error loading html - Please copy from play_store_publishing_kit/Privacy_Policy.html'));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-medium rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{copiedId === 'policy' ? 'Copied HTML! ✅' : 'Get Policy Source Code'}</span>
                  </button>
                </div>

                {/* Simulated Iframe mimicking Screenshots */}
                <div className="border border-gray-900 rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
                  <iframe 
                    src="/privacy.html" 
                    title="Privacy Policy Preview" 
                    className="w-full h-[580px]"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: PLAY STORE FORMS DIRECT COPY/PASTE */}
            {hubSubTab === 'forms' && (
              <div className="space-y-6 font-sans text-xs">
                
                {/* Intro block */}
                <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-900/30 text-emerald-200 leading-relaxed">
                  🔒 **Play Console Policy Form Solutions:** 
                  These descriptions guarantee your Accessibility service is approved without Google Console rejection. Click **Copy Detail** to instantly grab the respective text boxes.
                </div>

                {/* Field 1: Why use accessibility */}
                <div className="bg-[#121422] p-4.5 rounded-xl border border-gray-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                      <span className="bg-rose-500/10 text-rose-400 p-1 rounded-md text-[10px] font-mono">1</span>
                      What features in your app require the Accessibility API?
                    </span>
                    <button 
                      onClick={() => handleCopyText('f1', consoleFields.accessibilityPurpose)}
                      className={`py-1 px-2.5 rounded-lg flex items-center gap-1 transition ${copiedId === 'f1' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600/40 border border-indigo-500/25'}`}
                    >
                      {copiedId === 'f1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'f1' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-gray-400 leading-relaxed font-sans text-[11px] bg-[#0c0d15] p-3 rounded-lg border border-gray-950">
                    {consoleFields.accessibilityPurpose}
                  </p>
                </div>

                {/* Field 2: How Accessibility benefits users */}
                <div className="bg-[#121422] p-4.5 rounded-xl border border-gray-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                      <span className="bg-rose-500/10 text-rose-400 p-1 rounded-md text-[10px] font-mono">2</span>
                      How does the use of the Accessibility API benefit the user?
                    </span>
                    <button 
                      onClick={() => handleCopyText('f2', consoleFields.accessibilityBenefit)}
                      className={`py-1 px-2.5 rounded-lg flex items-center gap-1 transition ${copiedId === 'f2' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600/40 border border-indigo-500/25'}`}
                    >
                      {copiedId === 'f2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'f2' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-gray-400 leading-relaxed font-sans text-[11px] bg-[#0c0d15] p-3 rounded-lg border border-gray-950">
                    {consoleFields.accessibilityBenefit}
                  </p>
                </div>

                {/* Field 3: Sensitive collection pledge */}
                <div className="bg-[#121422] p-4.5 rounded-xl border border-gray-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                      <span className="bg-rose-500/10 text-rose-400 p-1 rounded-md text-[10px] font-mono">3</span>
                      Does the app use permission to collect sensitive user data?
                    </span>
                    <button 
                      onClick={() => handleCopyText('f3', consoleFields.accessibilityNoCollect)}
                      className={`py-1 px-2.5 rounded-lg flex items-center gap-1 transition ${copiedId === 'f3' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600/40 border border-indigo-500/25'}`}
                    >
                      {copiedId === 'f3' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'f3' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-gray-400 leading-relaxed font-sans text-[11px] bg-[#0c0d15] p-3 rounded-lg border border-gray-950">
                    {consoleFields.accessibilityNoCollect}
                  </p>
                </div>

                {/* Field 4: Data safety questions explanation */}
                <div className="bg-[#121422] p-4.5 rounded-xl border border-gray-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                      <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] p-1 rounded-md text-[10px] font-mono">4</span>
                      Data Safety Form Option - Core Decrypted/Offline Explanation
                    </span>
                    <button 
                      onClick={() => handleCopyText('f4', consoleFields.dataSafetyExplanation)}
                      className={`py-1 px-2.5 rounded-lg flex items-center gap-1 transition ${copiedId === 'f4' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600/40 border border-indigo-500/25'}`}
                    >
                      {copiedId === 'f4' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'f4' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-gray-400 leading-relaxed font-sans text-[11px] bg-[#0c0d15] p-3 rounded-lg border border-gray-950">
                    {consoleFields.dataSafetyExplanation}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: VIDEO DEMO COMPLIANCE GUIDE */}
            {hubSubTab === 'video' && (
              <div className="space-y-5 font-sans">
                <div className="bg-yellow-950/20 border border-yellow-900/35 p-4 rounded-xl text-yellow-200 text-xs leading-relaxed space-y-2">
                  <span className="font-bold flex items-center gap-1 text-sm text-yellow-400">
                    ⚠️ Play Console Rules Warning:
                  </span>
                  Android Accessibility guidelines mandate that you **MUST upload an Unlisted YouTube link** highlighting exact usage. Failing to provide this video demo will prompt manual rejection from reviewer teams.
                </div>

                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wide">
                  🎬 Demonstration Video Recording Script
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-[#121421] border border-gray-900 rounded-lg">
                    <span className="font-bold text-indigo-400 text-[11px] block mb-1">Step 1: Set a Pin Lock</span>
                    <p className="text-gray-400 text-[10px] leading-relaxed">
                      First, launch **Study Mode App Lock & Timer**. Complete the initial Setup screen inside your phone. Point your camera or recording showing the setup of a secure PIN tracker (e.g. "1234").
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#121421] border border-gray-900 rounded-lg">
                    <span className="font-bold text-indigo-400 text-[11px] block mb-1">Step 2: Restricted App selection</span>
                    <p className="text-gray-400 text-[10px] leading-relaxed">
                      Toggle ON any distracted app limit inside the list (e.g. check "Instagram" or "WhatsApp" locking state to mark them as locked).
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#121421] border border-gray-900 rounded-lg">
                    <span className="font-bold text-indigo-400 text-[11px] block mb-1">Step 3: Trigger Overlay Demo (Crucial Core)</span>
                    <p className="text-gray-400 text-[10px] leading-relaxed">
                      Exit back to the home screen. Launch the locked application. Show that **immediately** after opening, the secure PIN keypad overlay blockades the screen and requires typing "1234" to unlock, preventing bypass.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#121421] border border-gray-900 rounded-lg">
                    <span className="font-bold text-indigo-400 text-[11px] block mb-1">Step 4: Confirming Offline Privacy</span>
                    <p className="text-gray-400 text-[10px] leading-relaxed">
                      Show that no network calls are triggered, and configurations perform 100% locally to stay safe and quiet.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-emerald-400 block font-sans">
                    📝 Recommended YouTube Description Meta tags:
                  </span>
                  <pre className="text-[10px] leading-normal font-mono text-gray-400 bg-slate-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {"Study Mode App Lock & Timer - Accessibility API compliance video.\nThis test illustrates how current window bounds triggers our local overlay securely to blocks distractions so students focus without transferring any client settings outside."}
                  </pre>
                  <button 
                    onClick={() => handleCopyText('yt-desc', "Study Mode App Lock & Timer - Accessibility API compliance video.\nThis test illustrates how current window bounds triggers our local overlay securely to blocks distractions so students focus without transferring any client settings outside.")}
                    className="mt-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Video Description Metadata</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer inside Hub explaining metadata info */}
          <div className="bg-[#0b0c13] px-5 py-3 border-t border-gray-950 text-[10px] font-mono text-gray-500 flex items-center justify-between">
            <span>Play Store Bundle: com.applocktimer.pro</span>
            <span>Target SDK 34/35 Complete</span>
          </div>

        </div>
        )}

      </main>

      {/* Main Footer Block */}
      <footer className="bg-[#0b0c13] py-4 text-center text-xs text-gray-500 font-mono border-t border-gray-950 px-6 shrink-0 flex items-center justify-between justify-items-center">
        <span>© 2026 Study Mode App Lock & Timer Simulator</span>
        <div className="flex items-center gap-4 text-gray-650">
          <span>Secure Design</span>
          <span>Target SDK 35 (Android 15)</span>
          <span>Material 3 Theme</span>
        </div>
      </footer>
    </div>
  );
}

