import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { LockedApp, SecurityConfig, FocusMode, ActivityLog } from './types';
import AndroidSimulator from './components/AndroidSimulator';

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
  const [apps, setApps] = useState<LockedApp[]>(INITIAL_APPS);
  const [security, setSecurity] = useState<SecurityConfig>(INITIAL_SECURITY);
  const [focusModes, setFocusModes] = useState<FocusMode[]>(INITIAL_FOCUS_MODES);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

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

  return (
    <div className="min-h-screen bg-[#07080e] text-gray-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Header */}
      <header className="bg-[#0b0c13] border-b border-gray-900 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 mx-auto">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/10">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-base text-gray-100 flex items-center gap-1.5 leading-none">
              App Lock with Timer
            </h1>
            <span className="text-[10px] text-gray-500 font-mono tracking-wider block mt-0.5">
              Secure Smartphone Guard & Focus Dashboard Preview
            </span>
          </div>
        </div>
      </header>

      {/* Main Sandbox Workspace area */}
      <main className="flex-1 py-10 px-4 max-w-4xl w-full mx-auto flex flex-col items-center justify-center">
        {/* Device Container */}
        <div className="w-full max-w-sm sm:max-w-md flex justify-center">
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
      </main>

      {/* Footer copyright */}
      <footer className="bg-[#0b0c13] py-4 text-center text-xs text-gray-500 font-mono border-t border-gray-950 px-6 shrink-0 flex items-center justify-between justify-items-center">
        <span>© 2026 App Lock with Timer Simulator</span>
        <div className="flex items-center gap-4 text-gray-650">
          <span>Secure Design</span>
          <span>Target SDK 35 (Android 15)</span>
          <span>Material 3 Theme</span>
        </div>
      </footer>
    </div>
  );
}
