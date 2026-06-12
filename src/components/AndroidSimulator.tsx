import React, { useState, useEffect } from 'react';
import {
  Smartphone, Shield, CheckCircle2, AlertTriangle, Play, Square,
  CornerUpLeft, ShieldAlert, Key, HelpCircle, Lock, Unlock, Clock,
  Sliders, Plus, ChevronRight, Check, RotateCcw, Monitor, Star, Sparkles,
  MessageCircle, Youtube, Instagram, Facebook, Send, Ghost, Gamepad2, Globe, Mail, Wallet, Music, Twitter, Phone, Image
} from 'lucide-react';
import { LockedApp, LockType, FocusMode, SecurityConfig, ActivityLog } from '../types';

interface AndroidSimulatorProps {
  appsList: LockedApp[];
  updateAppLock: (packageName: string, isLocked: boolean) => void;
  updateAppLimit: (packageName: string, minutes: number) => void;
  incrementAppUsage: (packageName: string, minutes: number) => void;
  securityConfig: SecurityConfig;
  updateSecurityConfig: (config: SecurityConfig) => void;
  activeFocusMode: string | null;
  toggleFocusMode: (modeId: string) => void;
  focusModes: FocusMode[];
  addLog: (packageName: string, appName: string, type: ActivityLog['type'], details: string) => void;
}

export default function AndroidSimulator({
  appsList,
  updateAppLock,
  updateAppLimit,
  incrementAppUsage,
  securityConfig,
  updateSecurityConfig,
  activeFocusMode,
  toggleFocusMode,
  focusModes,
  addLog,
}: AndroidSimulatorProps) {
  // Simulator Navigation & Internal State
  const [currentSimulatorView, setCurrentSimulatorView] = useState<'LOCKSCREEN' | 'PERMISSIONS' | 'SETUP_LOCK' | 'APP_PASSCODE_LOCK' | 'HOME' | 'RECOVERY' | 'APP_ACTIVE' | 'LAUNCHED_OVERLAY' | 'APP_PRIVACY'>('PERMISSIONS');
  
  // Simulated Launched App State
  const [launchedApp, setLaunchedApp] = useState<LockedApp | null>(null);
  const [launchedAppUsageTime, setLaunchedAppUsageTime] = useState(0);
  const [temporaryBypass, setTemporaryBypass] = useState(false);
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);
  const [privacyLang, setPrivacyLang] = useState<'en' | 'hi'>('en');
  
  // Permissions toggler helper state
  const [tempPermissions, setTempPermissions] = useState(securityConfig.permissions);
  const [selectedLockType, setSelectedLockType] = useState<LockType>('PIN');
  const [newLockValue, setNewLockValue] = useState('');
  const [securityName, setSecurityName] = useState('Rahul');
  
  // Forgot Password Recovery State
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState(false);

  // App Locker Dashboard tab selection inside home screen
  const [homeTab, setHomeTab] = useState<'LOCKS' | 'TIMERS' | 'FOCUS'>('LOCKS');

  // Sync back security configs if permissions checked
  useEffect(() => {
    if (securityConfig.isConfigured) {
      setCurrentSimulatorView('APP_PASSCODE_LOCK');
    }
  }, []);

  // Timer loop for simulating active usage of launched apps
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentSimulatorView === 'APP_ACTIVE' && launchedApp) {
      interval = setInterval(() => {
        setLaunchedAppUsageTime((prev) => {
          const next = prev + 1;
          incrementAppUsage(launchedApp.packageName, 1);
          
          // Re-fetch the current stats of the app
          const appRef = appsList.find(a => a.packageName === launchedApp.packageName);
          if (appRef) {
            const currentTotal = appRef.usedMinutes;
            if (appRef.dailyLimit > 0 && currentTotal >= appRef.dailyLimit && !temporaryBypass) {
              setCurrentSimulatorView('LAUNCHED_OVERLAY');
              addLog(appRef.packageName, appRef.appName, 'limit_reached', `Daily screen limit reached for ${appRef.appName} (${appRef.dailyLimit} min)`);
            }
          }
          return next;
        });
      }, 3000); // 3 seconds = 1 virtual minute
    }
    return () => clearInterval(interval);
  }, [currentSimulatorView, launchedApp, temporaryBypass]);

  // Actions
  const handleTogglePermission = (key: keyof SecurityConfig['permissions']) => {
    const updated = { ...tempPermissions, [key]: !tempPermissions[key] };
    setTempPermissions(updated);
    
    // Add real logs
    const permissionNames: Record<string, string> = {
      usageStats: 'Usage Access Permission',
      overlay: 'Overlay (System Alert Window) Permission',
      accessibility: 'Accessibility Bind Service Node',
      batteryOptimization: 'Battery Optimization Ignored',
      notifications: 'Notification Manager Channel Access',
    };
    addLog('system.permission', permissionNames[key], 'unlocked', `Simulated permission [${permissionNames[key]}] configured requested status`);
  };

  const handlePermissionsComplete = () => {
    updateSecurityConfig({
      ...securityConfig,
      permissions: tempPermissions,
    });
    setCurrentSimulatorView('SETUP_LOCK');
  };

  const handleSetupComplete = () => {
    if (!newLockValue || newLockValue.length < 4) {
      alert("Please enter a valid 4-6 digit numeric code or pattern.");
      return;
    }
    updateSecurityConfig({
      ...securityConfig,
      lockType: selectedLockType,
      lockValue: newLockValue,
      securityName: securityName || 'Rahul',
      isConfigured: true,
      permissions: tempPermissions,
    });
    addLog('system.security', 'Study Mode App Lock & Timer Setup', 'unlocked', `Secure ${selectedLockType} setup successfully complete. Verification hint: '${securityName}'`);
    setCurrentSimulatorView('HOME');
  };

  const handleLaunchApp = (app: LockedApp) => {
    setLaunchedApp(app);
    setLaunchedAppUsageTime(0);
    setTemporaryBypass(false);
    setPinEntry('');
    setPinError(false);

    // Is this app locked either by explicit switch, focus mode block, or active limit?
    const limitReached = app.dailyLimit > 0 && app.usedMinutes >= app.dailyLimit;
    const isCategoryBlockedByFocus = activeFocusMode && focusModes.find(f => f.id === activeFocusMode)?.blockedCategories.includes(app.category);
    const isAppBlockedByFocus = activeFocusMode && focusModes.find(f => f.id === activeFocusMode)?.blockedApps.includes(app.packageName);
    
    const blockRequired = app.isLocked || limitReached || isCategoryBlockedByFocus || isAppBlockedByFocus;

    if (blockRequired) {
      setCurrentSimulatorView('LAUNCHED_OVERLAY');
      addLog(app.packageName, app.appName, 'blocked', `Blocked attempt to launch ${app.appName} due to high-security bounds rules`);
    } else {
      setCurrentSimulatorView('APP_ACTIVE');
      addLog(app.packageName, app.appName, 'unlocked', `Launched ${app.appName} into active usage foreground thread`);
    }
  };

  const handleVerifyPin = () => {
    if (pinEntry === securityConfig.lockValue) {
      setPinError(false);
      setPinEntry('');
      
      // If we are overriding a daily limit block, give them temporary bypass or let them back into the app!
      if (launchedApp && launchedApp.dailyLimit > 0 && launchedApp.usedMinutes >= launchedApp.dailyLimit) {
        setTemporaryBypass(true);
        setCurrentSimulatorView('APP_ACTIVE');
        addLog(launchedApp.packageName, launchedApp.appName, 'unlocked', `Verified master lock PIN. Screen session bypass granted.`);
      } else if (launchedApp) {
        setCurrentSimulatorView('APP_ACTIVE');
        addLog(launchedApp.packageName, launchedApp.appName, 'unlocked', `Verified PIN. ${launchedApp.appName} successfully launched.`);
      } else {
        setCurrentSimulatorView('HOME');
      }
    } else {
      setPinError(true);
      setPinEntry('');
      addLog('system.failed_pin', 'PIN Check', 'blocked', `Intruder alarm: Failed PIN validation attempt for unlocked flow`);
    }
  };

  const handleSecurityRecovery = () => {
    if (recoveryAnswer.trim().toLowerCase() === securityConfig.securityName.trim().toLowerCase()) {
      setRecoveryError(false);
      setRecoveryAnswer('');
      addLog('system.security', 'Forgot Password Reset', 'unlocked', `Correct answer given. Transitioning to lock redefinition setup`);
      setCurrentSimulatorView('SETUP_LOCK');
    } else {
      setRecoveryError(true);
      addLog('system.failed_pin', 'Forgot Password Reset', 'blocked', `Wrong answer for security recover validation hint: '${recoveryAnswer}'`);
    }
  };

  const handleAddExtraMinutes = (minutes: number) => {
    if (launchedApp) {
      if (pinEntry !== securityConfig.lockValue) {
        setPinError(true);
        addLog(launchedApp.packageName, launchedApp.appName, 'blocked', `Security error: Attempted to break/extend screen limits for ${launchedApp.appName} without providing valid PIN code first`);
        return;
      }
      setPinError(false);
      setPinEntry('');
      updateAppLimit(launchedApp.packageName, Math.max(launchedApp.dailyLimit, launchedApp.usedMinutes) + minutes);
      setTemporaryBypass(true);
      setCurrentSimulatorView('APP_ACTIVE');
      addLog(launchedApp.packageName, launchedApp.appName, 'time_extended', `Passcode approved: Confirmed PIN lock, setting +${minutes} min extra break for ${launchedApp.appName}`);
    }
  };

  // Helper to render high-fidelity brand icons for physical apps matching Indian/Global markets
  const renderAppIcon = (packageName: string) => {
    switch (packageName) {
      case 'com.whatsapp':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
            <MessageCircle className="w-5 h-5 fill-current" />
          </div>
        );
      case 'com.instagram.android':
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/25">
            <Instagram className="w-5 h-5" />
          </div>
        );
      case 'com.google.android.youtube':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/25">
            <Youtube className="w-5 h-5 fill-current" />
          </div>
        );
      case 'com.facebook.katana':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-650 flex items-center justify-center text-white shadow-md shadow-blue-600/25">
            <Facebook className="w-5 h-5 fill-current" />
          </div>
        );
      case 'org.telegram.messenger':
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
            <Send className="w-4 h-4 -rotate-45 translate-x-0.5 -translate-y-0.5 fill-current" />
          </div>
        );
      case 'com.snapchat.android':
        return (
          <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center text-black shadow-md shadow-yellow-400/25">
            <Ghost className="w-5 h-5 fill-current" />
          </div>
        );
      case 'com.tencent.ig':
        return (
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-orange-500/30 flex items-center justify-center text-orange-505 shadow-md">
            <Gamepad2 className="w-5 h-5" />
          </div>
        );
      case 'com.dts.freefireth':
        return (
          <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/20">
            <Gamepad2 className="w-5 h-5" />
          </div>
        );
      case 'com.android.chrome':
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 flex items-center justify-center text-white shadow-md">
            <Globe className="w-5 h-5" />
          </div>
        );
      case 'com.google.android.gm':
        return (
          <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-center text-rose-600 shadow-sm">
            <Mail className="w-4 h-4 fill-rose-100" />
          </div>
        );
      case 'com.google.android.apps.nbu.paisa.user':
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Wallet className="w-4.5 h-4.5" />
          </div>
        );
      case 'net.one97.paytm':
        return (
          <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
            <Wallet className="w-4.5 h-4.5" />
          </div>
        );
      case 'com.spotify.music':
        return (
          <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-md">
            <Music className="w-4.5 h-4.5" />
          </div>
        );
      case 'com.twitter.android':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#0f1419] border border-zinc-800 flex items-center justify-center text-white shadow-md">
            <Twitter className="w-4.5 h-4.5 fill-current" />
          </div>
        );
      case 'com.android.dialer':
        return (
          <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
            <Phone className="w-4.5 h-4.5 fill-current" />
          </div>
        );
      case 'com.android.gallery3d':
        return (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Image className="w-4.5 h-4.5 fill-current" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center text-gray-405">
            <Smartphone className="w-5 h-5" />
          </div>
        );
    }
  };

  const allEssentialPermissionsValid = tempPermissions.usageStats && tempPermissions.overlay && tempPermissions.accessibility;

  // Render Screens
  return (
    <div className="flex flex-col items-center justify-center p-3">
      {/* High-Fidelity physical phone chassis wrapper */}
      <div className="relative w-80 h-[640px] bg-[#1a1d26] rounded-[42px] border-4 border-gray-700 shadow-2xl p-3 flex flex-col overflow-hidden select-none">
        
        {/* Dynamic Notch / Speaker grille */}
        <div className="absolute top-0 left-12 right-12 h-6 bg-[#1a1d26] rounded-b-2xl mx-auto z-50 flex items-center justify-center">
          <div className="w-16 h-1.5 bg-gray-850 rounded-full mb-1"></div>
          {/* Mock Camera hole */}
          <div className="w-2.5 h-2.5 bg-black rounded-full border border-gray-900 ml-2 mb-1"></div>
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center px-4 pt-1.5 pb-1 text-[11px] font-mono text-gray-400 font-bold bg-[#0d0f14] shrink-0">
          <span>12:00 PM</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-[#50e3c2]">Focus Active</span>
            <div className="w-4 h-2 border border-gray-500 rounded-sm p-0.5 flex items-center">
              <div className="bg-emerald-500 h-full w-[80%] rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Core Mobile Screen viewport area */}
        <div className="flex-1 bg-[#0d0f14] rounded-[28px] overflow-hidden relative flex flex-col text-gray-200">
          
          {/* SECTION 1: PERMISSIONS CONFIGURATION */}
          {currentSimulatorView === 'PERMISSIONS' && (
            <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-[#11131a] to-[#0d0f14]">
              <div className="space-y-4">
                <div className="text-center pt-2">
                  <Shield className="w-11 h-11 text-indigo-400 mx-auto mb-2 animate-pulse" />
                  <h3 className="text-sm font-bold font-sans text-gray-100">Setup Essential Permissions</h3>
                  <p className="text-[10px] text-gray-400 leading-normal max-w-[220px] mx-auto mt-1">
                    To maintain lock limits securely in target Android SDK 35, authorize permissions:
                  </p>
                </div>

                {/* Specific Android Intent simulator list */}
                <div className="space-y-2">
                  {/* Usage Access */}
                  <div className="bg-[#161922] border border-gray-850 p-2.5 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-gray-200">Usage Access</span>
                        <span className="text-[8px] bg-indigo-950 font-mono text-indigo-400 px-1 rounded">Required</span>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-tight mt-0.5">Detects active user applications</p>
                    </div>
                    <button
                      id="perm-usage-toggle"
                      onClick={() => handleTogglePermission('usageStats')}
                      className={`h-6 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        tempPermissions.usageStats
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      }`}
                    >
                      {tempPermissions.usageStats ? 'Granted' : 'Grant'}
                    </button>
                  </div>

                  {/* Overlay Permission */}
                  <div className="bg-[#161922] border border-gray-850 p-2.5 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-gray-200">System Overlay</span>
                        <span className="text-[8px] bg-indigo-950 font-mono text-indigo-400 px-1 rounded">Required</span>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-tight mt-0.5">Launches secure block lock screens</p>
                    </div>
                    <button
                      id="perm-overlay-toggle"
                      onClick={() => handleTogglePermission('overlay')}
                      className={`h-6 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        tempPermissions.overlay
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      }`}
                    >
                      {tempPermissions.overlay ? 'Granted' : 'Grant'}
                    </button>
                  </div>

                  {/* Accessibility Node Monitor */}
                  <div className="bg-[#161922] border border-gray-850 p-2.5 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-gray-200">Accessibility</span>
                        <span className="text-[8px] bg-rose-950 font-mono text-rose-400 px-1 rounded">Highly Advised</span>
                      </div>
                      <p className="text-[9px] text-gray-500 leading-tight mt-0.5">Bypasses background settings exploits</p>
                    </div>
                    <button
                      id="perm-access-toggle"
                      onClick={() => handleTogglePermission('accessibility')}
                      className={`h-6 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        tempPermissions.accessibility
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      }`}
                    >
                      {tempPermissions.accessibility ? 'Granted' : 'Grant'}
                    </button>
                  </div>

                  {/* Optional: Battery Optimizations */}
                  <div className="bg-[#161922]/50 border border-gray-850/60 p-2 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex-1 pr-1.5">
                      <span className="text-[10px] font-bold text-gray-300">Ignore Battery saving</span>
                      <p className="text-[8px] text-gray-500 leading-none">Keeps active worker loop</p>
                    </div>
                    <input
                      id="perm-battery-checkbox"
                      type="checkbox"
                      checked={tempPermissions.batteryOptimization}
                      onChange={() => handleTogglePermission('batteryOptimization')}
                      className="rounded accent-indigo-500 w-3.5 h-3.5"
                    />
                  </div>

                  {/* Optional: Notify Channel */}
                  <div className="bg-[#161922]/50 border border-gray-850/60 p-2 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex-1 pr-1.5">
                      <span className="text-[10px] font-bold text-gray-300">Notification Alerts</span>
                      <p className="text-[8px] text-gray-500 leading-none">Show active screen notifications</p>
                    </div>
                    <input
                      id="perm-notify-checkbox"
                      type="checkbox"
                      checked={tempPermissions.notifications}
                      onChange={() => handleTogglePermission('notifications')}
                      className="rounded accent-indigo-500 w-3.5 h-3.5"
                    />
                  </div>
                </div>
              </div>

              <div>
                {!allEssentialPermissionsValid && (
                  <div className="bg-amber-950/20 border border-amber-900/30 p-2 rounded-lg mb-2 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[8px] text-amber-400 leading-normal">
                      We advise granting Usage Access, Alert Overlay, and Accessibility for robust system locking.
                    </span>
                  </div>
                )}
                <button
                  id="perms-continue-btn"
                  onClick={handlePermissionsComplete}
                  className={`w-full py-2.5 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    allEssentialPermissionsValid
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  <span>Proceed to App Setup</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: SETUP LOCK ENGINE */}
          {currentSimulatorView === 'SETUP_LOCK' && (
            <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-[#11131a] to-[#0d0f14]">
              <div className="space-y-4">
                <div className="text-center pt-2">
                  <Key className="w-10 h-11 text-indigo-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold font-sans text-gray-100">Establish Master Lock</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed max-w-[200px] mx-auto mt-1">
                    Select a secure guard credentials key and security recovery.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Select Lock Strategy */}
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-gray-500 mb-1">Select Guard Mode</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['PIN', 'PASSWORD', 'PATTERN'] as const).map((mode) => (
                        <button
                          key={mode}
                          id={`lock-mode-${mode}`}
                          onClick={() => {
                            setSelectedLockType(mode);
                            setNewLockValue('');
                          }}
                          className={`py-1 text-center font-mono text-[9px] rounded-md border transition-all cursor-pointer ${
                            selectedLockType === mode
                              ? 'bg-indigo-600/10 border-indigo-500 text-indigo-200'
                              : 'bg-gray-950 border-gray-850 text-gray-500 hover:bg-gray-900'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Numeric Entry Pad or String field depending on Guard mode */}
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-gray-500 mb-1">Enter Secret Code</label>
                    <input
                      id="setup-lock-input"
                      type={selectedLockType === 'PIN' ? 'number' : 'text'}
                      maxLength={6}
                      placeholder={selectedLockType === 'PIN' ? '4-6 Digits (e.g., 2026)' : 'Enter Code'}
                      value={newLockValue}
                      onChange={(e) => setNewLockValue(e.target.value)}
                      className="w-full bg-[#161a25] border border-gray-850 rounded-xl px-3 py-2 text-xs text-center font-bold tracking-widest text-indigo-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  {/* Security Question Input */}
                  <div className="bg-gray-950/40 p-2.5 border border-gray-850 rounded-xl">
                    <div className="flex items-center gap-1 mb-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-bold text-gray-350">Security Reset Question</span>
                    </div>
                    <div className="text-[9px] text-gray-500 leading-none mb-2">What is your favorite name?</div>
                    <input
                      id="setup-security-answer-input"
                      type="text"
                      placeholder="e.g. Rahul"
                      value={securityName}
                      onChange={(e) => setSecurityName(e.target.value)}
                      className="w-full bg-[#11131a] border border-gray-850 rounded-lg px-2.5 py-1.5 text-xs text-indigo-400 placeholder-gray-650 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  id="complete-setup-btn"
                  onClick={handleSetupComplete}
                  disabled={!newLockValue || newLockValue.length < 4}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold font-sans shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                    newLockValue && newLockValue.length >= 4
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Enforce Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: APP_PASSCODE_LOCK SCREEN (Always enforce passcode when opening setting console) */}
          {currentSimulatorView === 'APP_PASSCODE_LOCK' && (
            <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-[#090b11] to-[#0e1017]">
              <div className="space-y-5 pt-3">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/5 animate-pulse">
                    <Lock className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">Study Mode Security</h3>
                  <p className="text-[9px] text-gray-400 max-w-[180px] mx-auto mt-1 leading-normal">
                    This settings app is locked under secure PIN/Password access.
                  </p>
                </div>

                <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-850 space-y-2">
                  <span className="text-[8px] uppercase tracking-wider font-mono text-gray-500 block text-center">
                    Enter Master {securityConfig.lockType}
                  </span>
                  <input
                    id="app-passcode-entry"
                    type="password"
                    maxLength={12}
                    placeholder={`Type ${securityConfig.lockType}`}
                    value={pinEntry}
                    onChange={(e) => setPinEntry(e.target.value)}
                    className="w-full bg-[#11131a] border border-gray-850 rounded-lg px-2.5 py-1.5 text-xs text-center tracking-widest text-indigo-300 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                  {pinError && (
                    <span className="text-[8.5px] text-rose-500 block text-center italic mt-1 font-sans">
                      ⚠ Incorrect password credentials
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  id="app-verify-passcode-btn"
                  onClick={handleVerifyPin}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold font-sans rounded-xl shadow cursor-pointer transition active:scale-98"
                >
                  Verify PIN
                </button>
                <button
                  id="app-passcode-forgot"
                  onClick={() => {
                    setCurrentSimulatorView('RECOVERY');
                    setPinEntry('');
                    setPinError(false);
                  }}
                  className="w-full text-center py-1 text-[9px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          {/* SECTION 4: HOME CONSOLE */}
          {currentSimulatorView === 'HOME' && (
            <div className="flex-1 flex flex-col justify-between bg-[#0a0c11]">
              {/* Home Lock Header */}
              <div className="bg-[#10131e] px-4 py-3 border-b border-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold font-sans text-gray-200">Study Mode App Lock & Timer</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] text-emerald-400 font-mono">Service On</span>
                </div>
              </div>

              {/* Live Focus Mode Quick Bar */}
              {activeFocusMode && (
                <div className="bg-indigo-950/40 border-b border-indigo-900/30 py-1.5 px-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] text-indigo-300 leading-none">
                      Active Mode: <strong className="uppercase">{activeFocusMode}</strong>
                    </span>
                  </div>
                  <button
                    id="phone-focus-deactivate"
                    onClick={() => toggleFocusMode(activeFocusMode)}
                    className="text-[9px] text-rose-450 hover:text-rose-400 cursor-pointer font-bold"
                  >
                    Turn Off
                  </button>
                </div>
              )}

              {/* Sub-Tabs Selector inside simulated Home */}
              <div className="bg-[#121522] grid grid-cols-3 text-center border-b border-gray-900">
                {(['LOCKS', 'TIMERS', 'FOCUS'] as const).map((tab) => (
                  <button
                    key={tab}
                    id={`phone-tab-${tab}`}
                    onClick={() => setHomeTab(tab)}
                    className={`py-2 text-[10px] uppercase font-bold transition-all border-b-2 cursor-pointer ${
                      homeTab === tab
                        ? 'border-indigo-500 text-indigo-300 bg-gray-950/20'
                        : 'border-transparent text-gray-500 hover:text-gray-400'
                    }`}
                  >
                    {tab === 'LOCKS' && 'Lock Apps'}
                    {tab === 'TIMERS' && 'Limits'}
                    {tab === 'FOCUS' && 'Focus'}
                  </button>
                ))}
              </div>

              {/* Screen Tab Contents */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[380px] scrollbar-thin">
                
                {/* SUBTAB 1: APP LOCK REGULATION */}
                {homeTab === 'LOCKS' && (
                  <div className="space-y-2">
                    <p className="text-[9px] text-gray-500 uppercase leading-none px-1 tracking-wider">Configure Protection Lock</p>
                    {appsList.map((app) => {
                      // Determine if blocked by focus
                      const isCategoryBlocked = activeFocusMode && focusModes.find(f => f.id === activeFocusMode)?.blockedCategories.includes(app.category);
                      const isAppBlocked = activeFocusMode && focusModes.find(f => f.id === activeFocusMode)?.blockedApps.includes(app.packageName);
                      const isFocusBlocked = isCategoryBlocked || isAppBlocked;

                      return (
                        <div
                          key={app.packageName}
                          className={`p-2 rounded-xl flex items-center justify-between border transition-all ${
                            app.isLocked || isFocusBlocked
                              ? 'bg-indigo-950/20 border-indigo-700/20'
                              : 'bg-[#151924] border-gray-850 hover:border-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Brand Icon with Secure Status Badge */}
                            <div className="relative shrink-0 select-none">
                              {renderAppIcon(app.packageName)}
                              <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#0d0f14] ${
                                app.isLocked || isFocusBlocked ? 'bg-red-500 text-white' : 'bg-zinc-800 text-gray-450'
                              }`}>
                                {app.isLocked || isFocusBlocked ? (
                                  <Lock className="w-2 h-2" />
                                ) : (
                                  <Unlock className="w-2 h-2" />
                                )}
                              </div>
                            </div>
                            <div className="min-w-0 pr-1">
                              <span className="text-[11px] font-bold block text-gray-200 truncate">{app.appName}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] uppercase tracking-wider text-gray-550 font-medium px-1 rounded bg-gray-950">{app.category}</span>
                                {app.dailyLimit > 0 && (
                                  <span className="text-[8px] text-cyan-400 flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    {app.dailyLimit}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-1">
                            {/* Action toggle locks */}
                            <button
                              id={`lock-toggle-${app.packageName}`}
                              onClick={() => {
                                updateAppLock(app.packageName, !app.isLocked);
                                addLog(app.packageName, app.appName, !app.isLocked ? 'blocked' : 'unlocked', `${!app.isLocked ? 'Locked' : 'Unlocked'} ${app.appName} lock status in Room DB`);
                              }}
                              className={`w-8 h-5 rounded-full p-0.5 transition-all relative shrink-0 cursor-pointer ${
                                app.isLocked ? 'bg-indigo-600' : 'bg-gray-800'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                                app.isLocked ? 'translate-x-3' : 'translate-x-0'
                              }`}></div>
                            </button>

                            {/* Simulation Launch play btn */}
                            <button
                              id={`launch-app-${app.packageName}`}
                              onClick={() => handleLaunchApp(app)}
                              className="w-6 h-6 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/70 flex items-center justify-center border border-indigo-700/20 cursor-pointer shrink-0"
                              title="Test Opening this App"
                            >
                              <Play className="w-3.5 h-3.5 text-indigo-300" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SUBTAB 2: APP TIMER RANGES */}
                {homeTab === 'TIMERS' && (
                  <div className="space-y-2">
                    <p className="text-[9px] text-gray-500 uppercase leading-none px-1 tracking-wider">Configure Screen Time Limits</p>
                    {appsList.map((app) => (
                      <div key={app.packageName} className="bg-[#151924] border border-gray-850 rounded-xl p-2.5 space-y-2">
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            {renderAppIcon(app.packageName)}
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold block text-gray-200 truncate">{app.appName}</span>
                              <span className="text-[8px] text-gray-500 font-mono block truncate">{app.packageName}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-bold font-mono shrink-0">
                            {app.dailyLimit === 0 ? 'No Limit' : `${app.dailyLimit} MIN`}
                          </span>
                        </div>

                        {/* Fast selectors of preset time */}
                        <div className="grid grid-cols-5 gap-1">
                          {[0, 5, 20, 30, 60].map((mins) => (
                            <button
                              key={mins}
                              id={`timer-set-${app.packageName}-${mins}`}
                              onClick={() => {
                                updateAppLimit(app.packageName, mins);
                                addLog(app.packageName, app.appName, 'time_extended', `Updated usage threshold to ${mins === 0 ? 'Unlimited' : `${mins}m`} for ${app.appName}`);
                              }}
                              className={`py-1 text-center font-mono text-[9px] rounded-md border transition-all cursor-pointer ${
                                app.dailyLimit === mins
                                  ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                                  : 'bg-gray-950 border-gray-900 text-gray-500 hover:bg-gray-900/60'
                              }`}
                            >
                              {mins === 0 ? 'Off' : `${mins}m`}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SUBTAB 3: FOCUS MODE ENFORCEMENTS */}
                {homeTab === 'FOCUS' && (
                  <div className="space-y-2.5">
                    <p className="text-[9px] text-gray-500 uppercase leading-none px-1 tracking-wider">Trigger Focus Mode Profile</p>
                    
                    {focusModes.map((mode) => (
                      <div
                        key={mode.id}
                        className={`p-3 rounded-xl border transition-all ${
                          mode.isActive
                            ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
                            : 'bg-[#151924] border-gray-850 hover:border-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <div>
                            <span className="text-[11px] font-bold block text-gray-200 uppercase">{mode.name}</span>
                            <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{mode.description}</p>
                          </div>
                          <button
                            id={`focus-toggle-btn-${mode.id}`}
                            onClick={() => {
                              toggleFocusMode(mode.id);
                              addLog('system.focus', mode.name, 'focus_active', `${mode.isActive ? 'Deactivated' : 'Activated'} Focus Session: ${mode.name}`);
                            }}
                            className={`px-2.5 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                              mode.isActive
                                ? 'bg-[#50e3c2]/10 text-[#50e3c2] border border-[#50e3c2]/30'
                                : 'bg-indigo-600 text-white shadow'
                            }`}
                          >
                            {mode.isActive ? 'Active' : 'Enable'}
                          </button>
                        </div>

                        {/* Group of categories affected */}
                        <div className="flex flex-wrap gap-1">
                          {mode.blockedCategories.map((c) => (
                            <span key={c} className="text-[7.5px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-950/20 text-amber-400 border border-amber-900/20">
                              Block: {c}
                            </span>
                          ))}
                          {mode.blockedApps.map((a) => {
                            const appObj = appsList.find(app => app.packageName === a);
                            return (
                              <span key={a} className="text-[7.5px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-rose-950/20 text-rose-400 border border-rose-900/20">
                                Block: {appObj?.appName || a}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Home Lock Footer menu bar */}
              <div className="bg-[#10131e] p-2 px-2.5 border-t border-gray-900 grid grid-cols-3 gap-1.5 text-center shrink-0">
                <button
                  id="reset-security-phone"
                  onClick={() => {
                    setCurrentSimulatorView('PERMISSIONS');
                    addLog('system.reset', 'Phone State Restored', 'unlocked', `Re-evaluating Android system locks permissions. System reset initialized`);
                  }}
                  className="flex flex-col items-center justify-center gap-0.5 bg-gray-950 hover:bg-gray-900 text-gray-400 hover:text-gray-200 rounded-lg py-1 text-[8px] font-bold transition-all cursor-pointer border border-gray-850"
                >
                  <RotateCcw className="w-3 h-3 text-indigo-400" />
                  <span>Reset All</span>
                </button>
                <button
                  id="phone-forgot-password"
                  onClick={() => setCurrentSimulatorView('RECOVERY')}
                  className="flex flex-col items-center justify-center gap-0.5 bg-[#1c1911] hover:bg-[#2c2311] text-amber-300 hover:text-amber-100 rounded-lg py-1 text-[8px] font-bold transition-all cursor-pointer border border-amber-950"
                >
                  <HelpCircle className="w-3 h-3 text-amber-400" />
                  <span>Forgot Pin</span>
                </button>
                <button
                  id="phone-privacy-policy"
                  onClick={() => setCurrentSimulatorView('APP_PRIVACY')}
                  className="flex flex-col items-center justify-center gap-0.5 bg-[#0e1713] hover:bg-[#12231c] text-emerald-400 hover:text-emerald-250 rounded-lg py-1 text-[8px] font-bold transition-all cursor-pointer border border-emerald-950"
                >
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Privacy</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION: APP_PRIVACY POLICY (Interactive inside-app viewer) */}
          {currentSimulatorView === 'APP_PRIVACY' && (
            <div className="flex-1 flex flex-col justify-between bg-[#0a0b11]">
              <div className="bg-[#10131e] px-3.5 py-2.5 border-b border-gray-900 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold text-gray-200">🔒 Official Privacy Policy</span>
                <button
                  id="privacy-close-btn"
                  onClick={() => setCurrentSimulatorView('HOME')}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-[8.5px] text-gray-300 rounded font-bold cursor-pointer"
                >
                  Back
                </button>
              </div>

              {/* In-app Language Selector Toggle */}
              <div className="bg-[#131623] px-3 py-1 flex justify-around border-b border-gray-900 shrink-0">
                <button 
                  onClick={() => setPrivacyLang('en')}
                  className={`text-[8.5px] font-sans font-bold px-2 py-0.5 rounded ${privacyLang === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => setPrivacyLang('hi')}
                  className={`text-[8.5px] font-sans font-bold px-2 py-0.5 rounded ${privacyLang === 'hi' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
                >
                  हिंदी (Hindi)
                </button>
              </div>

              {/* Scrollable Policy Material */}
              <div className="flex-1 p-3 overflow-y-auto max-h-[310px] space-y-3 font-sans text-[9px] leading-relaxed scrollbar-none">
                {privacyLang === 'en' ? (
                  <>
                    <div className="border border-emerald-900/30 bg-emerald-950/10 p-2 rounded text-emerald-300">
                      <strong>🌿 Offline-First Commitment</strong>
                      <p className="mt-0.5 text-[8.5px]">We collect NO data. All PIN codes and app lock listings remain sandboxed on your local device.</p>
                    </div>
                    
                    <div className="space-y-1">
                      <strong className="text-gray-200">1. Data Safety & Privacy</strong>
                      <p className="text-gray-400">Study Mode App Lock & Timer operates entirely locally. No passwords or app usage limits are ever transmitted to external servers or third-party analytical SDKs.</p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-gray-200">2. Device Permissions Used</strong>
                      <ul className="list-disc pl-3 text-gray-400 space-y-1">
                        <li><strong>Accessibility Service:</strong> Used solely to detect launches of blocked apps and display overlays instantly.</li>
                        <li><strong>System Overlay Window:</strong> Used to display the PIN/Pattern blocker block window over distracting apps.</li>
                        <li><strong>Usage Stats:</strong> Logs study minutes securely on your device.</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-gray-200">3. Child & Ad-Free Compliance</strong>
                      <p className="text-gray-400">Since we gather zero personal info, we are fully COPPA compliant. We have zero distracting banner ads or web trackers.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border border-emerald-900/30 bg-emerald-950/10 p-2 rounded text-emerald-300">
                      <strong>🌿 ऑफलाइन-फर्स्ट सुरक्षा</strong>
                      <p className="mt-0.5 text-[8.5px]">हम कोई डेटा एकत्र नहीं करते हैं। आपके पासवर्ड और ऐप लॉक लिस्ट पूरी तरह आपके फ़ोन पर सैंडबॉक्स्ड रहते हैं।</p>
                    </div>
                    
                    <div className="space-y-1">
                      <strong className="text-gray-200">1. डेटा सुरक्षा और गोपनीयता</strong>
                      <p className="text-gray-400">यह ऐप पूरी तरह से ऑफलाइन काम करता है। आपका PIN, पैटर्न, या स्क्रीन टाइम डेटा किसी बाहरी सर्वर या थर्ड-पार्टी एनालिटिक्स टूल पर नहीं भेजा जाता।</p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-gray-200">2. महत्वपूर्ण अनुमतियाँ</strong>
                      <ul className="list-disc pl-3 text-gray-400 space-y-1">
                        <li><strong>एक्सेसिबिलिटी सर्विस:</strong> प्रतिबंधित ऐप के ओपन होने का पता लगाने और तुरंत सुरक्षा स्क्रीन दिखाने के लिए।</li>
                        <li><strong>सिस्टम ओवरले स्क्रीन:</strong> प्रतिबंधित ऐप्स के ऊपर पासवर्ड विंडो ड्रा करने के लिए।</li>
                        <li><strong>यूसेज स्टैट्स:</strong> दैनिक स्टडी टाइम और लिमिट्स को आपके फ़ोन पर ट्रैक करने के लिए।</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-gray-200">3. बच्चों की सुरक्षा नियम</strong>
                      <p className="text-gray-400">हम किसी भी प्रकार का व्यक्तिगत डेटा एकत्र नहीं करते, इसलिए हमारे सुरक्षा प्रणालियाँ बच्चों के लिए पूर्ण रूप से सुरक्षित (COPPA) हैं।</p>
                    </div>
                  </>
                )}
                
                <div className="pt-2 text-center text-gray-650 border-t border-gray-900 text-[8px]">
                  <span>Support: jitu1199pal@gmail.com</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: SECURITY RECOVERY SCREEN */}
          {currentSimulatorView === 'RECOVERY' && (
            <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-[#1c1411] to-[#0d0f14]">
              <div className="space-y-4">
                <div className="text-center pt-2">
                  <ShieldAlert className="w-11 h-11 text-amber-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold font-sans text-gray-100">Recovery Validation Answer</h3>
                  <p className="text-[9px] text-gray-400 leading-normal max-w-[190px] mx-auto mt-1">
                    Input correct security question verification value.
                  </p>
                </div>

                <div className="space-y-3 bg-gray-950/45 p-3 rounded-xl border border-gray-900">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-mono text-gray-500 mb-0.5">Verification Question</label>
                    <span className="text-[11px] font-bold text-gray-205">What is your favorite name?</span>
                  </div>

                  <div>
                    <input
                      id="recovery-answer-input"
                      type="text"
                      placeholder="Hint: Rahul"
                      value={recoveryAnswer}
                      onChange={(e) => setRecoveryAnswer(e.target.value)}
                      className="w-full bg-[#11131a] border border-gray-850 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 placeholder-gray-650 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  {recoveryError && (
                    <div className="text-[9px] text-rose-500 italic">
                      ⚠ Incorrect name. Re-verify the answer.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  id="recovery-verify-btn"
                  onClick={handleSecurityRecovery}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-sans rounded-xl shadow cursor-pointer"
                >
                  Confirm Answer
                </button>
                <button
                  id="recovery-cancel-btn"
                  onClick={() => setCurrentSimulatorView('HOME')}
                  className="w-full py-1.5 bg-gray-900 border border-gray-850 text-gray-400 text-[10px] font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* SECTION 5: APP ACTIVE RUNTIME */}
          {currentSimulatorView === 'APP_ACTIVE' && launchedApp && (
            <div className="flex-1 flex flex-col justify-between bg-black relative">
              {/* App Status Header */}
              <div className="bg-[#12141a] px-3.5 py-2.5 flex items-center justify-between border-b border-gray-900">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0 scale-75 transform origin-center">
                    {renderAppIcon(launchedApp.packageName)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold block text-gray-100 truncate">{launchedApp.appName}</span>
                    <span className="text-[8.5px] text-gray-500 block truncate">{launchedApp.packageName}</span>
                  </div>
                </div>
                <button
                  id="app-close-btn"
                  onClick={() => {
                    setCurrentSimulatorView('HOME');
                    addLog(launchedApp.packageName, launchedApp.appName, 'unlocked', `Closed ${launchedApp.appName} foreground process`);
                  }}
                  className="px-2.5 py-1 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 text-[9px] font-bold rounded-lg cursor-pointer"
                >
                  Close App
                </button>
              </div>

              {/* Actively Simulating Content Frame */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#111116] to-[#000000] text-center space-y-3">
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center border border-indigo-500/20 animate-pulse bg-indigo-950/10">
                  <div className="scale-150 transform">
                    {renderAppIcon(launchedApp.packageName)}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest block">Simulating App Usage</span>
                  <p className="text-[9px] text-gray-500 max-w-[190px] mx-auto mt-1 leading-normal">
                    Study Mode App Lock & Timer background worker is actively monitoring this process. Screen limit countdown is live.
                  </p>
                </div>

                {/* Simulated Timer Clock */}
                <div className="bg-gray-950/60 p-2 px-3 border border-gray-900 rounded-xl font-mono text-[11px]">
                  <div className="text-gray-500 text-[8px] uppercase">Incremental Minute Used</div>
                  <div className="text-gray-100 font-bold font-sans text-xs mt-0.5">
                    {launchedApp.usedMinutes} min used this epoch
                  </div>
                </div>
              </div>

              {/* Usage Warning Bar */}
              {launchedApp.dailyLimit > 0 && (
                <div className="bg-cyan-950/20 border-t border-cyan-900/30 py-2 px-4 text-center">
                  <span className="text-[9px] text-cyan-400 leading-normal block">
                    Daily Limit Configured: {launchedApp.dailyLimit} min
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: LOCKSCREEN OVERLAY */}
          {currentSimulatorView === 'LAUNCHED_OVERLAY' && launchedApp && (
            <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-[#121118] to-[#08080c] relative">
              
              {/* Intruder Lock banner */}
              <div className="space-y-4 pt-2">
                <div className="text-center">
                  <div className="relative w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <div className="scale-125 select-none text-zinc-400">
                      {renderAppIcon(launchedApp.packageName)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center border border-[#121118] min-w-0">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  {/* Decide lock reason */}
                  {launchedApp.dailyLimit > 0 && launchedApp.usedMinutes >= launchedApp.dailyLimit && !temporaryBypass ? (
                    <div>
                      <h4 className="text-xs font-bold text-rose-450 text-rose-400 uppercase tracking-wider">Screen limit reached</h4>
                      <p className="text-[9px] text-gray-500 leading-normal max-w-[190px] mx-auto mt-1">
                        Daily usage limit reached for <strong>{launchedApp.appName}</strong> ({launchedApp.usedMinutes}/{launchedApp.dailyLimit}m).
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Target App Locked</h4>
                      <p className="text-[9px] text-gray-500 leading-normal max-w-[190px] mx-auto mt-1">
                        <strong>Study Mode App Lock & Timer</strong> guard has locked this application boundary.
                      </p>
                    </div>
                  )}
                </div>

                {/* Preset Pin Unlock inputs block */}
                <div className="space-y-2.5">
                  <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-850">
                    <span className="text-[8px] uppercase tracking-wider font-mono text-gray-500 block mb-1">Enter Security Credentials</span>
                    <input
                      id="simulated-open-pin-entry"
                      type="password"
                      maxLength={6}
                      placeholder="Enter Unlock PIN"
                      value={pinEntry}
                      onChange={(e) => setPinEntry(e.target.value)}
                      className="w-full bg-[#11131a] border border-gray-850 rounded-lg px-2.5 py-1.5 text-xs text-center tracking-widest text-indigo-300 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                    {pinError && (
                      <span className="text-[8.5px] text-rose-500 block mt-1 italic">
                        ⚠ Incorrect verification credential code
                      </span>
                    )}
                  </div>

                  {/* Extra time selection framework (Always present on block warning overlays) */}
                  {launchedApp && (
                    <div className="bg-[#1c1911]/45 p-2 rounded-xl border border-amber-950">
                      <span className="text-[8px] uppercase tracking-wider text-amber-400 font-bold block mb-1.5 text-center">Request Extra Timer Extensions</span>
                      <div className="grid grid-cols-3 gap-1">
                        {[5, 15, 30].map((mins) => (
                          <button
                            key={mins}
                            id={`request-extra-${mins}`}
                            onClick={() => handleAddExtraMinutes(mins)}
                            className="bg-amber-950/40 hover:bg-amber-950/85 border border-amber-900/30 hover:border-amber-500/40 py-1 rounded text-center text-[9px] font-bold text-amber-300 transition-colors cursor-pointer"
                          >
                            +{mins} Min
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions for overlays */}
              <div className="space-y-2">
                <button
                  id="confirm-verification-overlay"
                  onClick={handleVerifyPin}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-sans rounded-xl shadow cursor-pointer"
                >
                  Verify Master Key
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="back-launcher-overlay"
                    onClick={() => setCurrentSimulatorView('HOME')}
                    className="py-1.5 bg-gray-900 border border-gray-800 text-[9.5px] font-bold text-gray-400 rounded-lg transition-colors cursor-pointer"
                  >
                    Go Back Home
                  </button>
                  <button
                    id="recovery-trigger-overlay"
                    onClick={() => setCurrentSimulatorView('RECOVERY')}
                    className="py-1.5 bg-amber-950/20 border border-amber-900/30 text-[9.5px] font-bold text-amber-400 rounded-lg text-center transition-colors cursor-pointer"
                  >
                    Forgot Password
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Outer Android physical navigation keys */}
        <div className="h-8 flex items-center justify-center gap-12 bg-[#1a1d26] shrink-0 pt-1">
          <button
            id="outer-back-button"
            onClick={() => {
              if (currentSimulatorView === 'HOME' || currentSimulatorView === 'APP_PASSCODE_LOCK' || currentSimulatorView === 'APP_PRIVACY') {
                setCurrentSimulatorView('PERMISSIONS');
              } else if (currentSimulatorView !== 'PERMISSIONS') {
                if (securityConfig.isConfigured) {
                  setCurrentSimulatorView('APP_PASSCODE_LOCK');
                  setPinEntry('');
                  setPinError(false);
                } else {
                  setCurrentSimulatorView('HOME');
                }
              }
            }}
            className="w-8 h-8 rounded-full border border-gray-850 flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-gray-850 transition-colors cursor-pointer"
            title="Android Gestures Back"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>
          
          <button
            id="outer-home-button"
            onClick={() => {
              if (securityConfig.isConfigured) {
                setCurrentSimulatorView('APP_PASSCODE_LOCK');
                setPinEntry('');
                setPinError(false);
              } else {
                setCurrentSimulatorView('PERMISSIONS');
              }
            }}
            className="w-10 h-3 rounded-full bg-gray-650 hover:bg-gray-500 transition-colors mx-auto shrink-0 bg-gray-655 cursor-pointer"
            title="System Home Press"
          ></button>

          <button
            id="outer-inspect-button"
            className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-indigo-400 opacity-60 hover:opacity-100 transition-opacity"
            title="Active Guardian Status"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
