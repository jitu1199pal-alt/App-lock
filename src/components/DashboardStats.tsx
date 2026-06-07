import React from 'react';
import { LockedApp, FocusMode } from '../types';
import { Sliders, Clock, ShieldAlert, CheckCircle2, TrendingUp, Sparkles, Server } from 'lucide-react';

interface DashboardStatsProps {
  appsList: LockedApp[];
  focusModes: FocusMode[];
  activeFocusMode: string | null;
}

export default function DashboardStats({
  appsList,
  focusModes,
  activeFocusMode,
}: DashboardStatsProps) {
  // Compute Stats
  const totalLocked = appsList.filter((a) => a.isLocked).length;
  const averageLimit = Math.round(
    appsList.filter((a) => a.dailyLimit > 0).reduce((acc, current) => acc + current.dailyLimit, 0) /
      (appsList.filter((a) => a.dailyLimit > 0).length || 1)
  );

  // Fake cumulative minutes saved based on configuration
  const totalMinutesSaved = appsList.reduce((acc, app) => {
    if (app.dailyLimit > 0) {
      // If used is close to limit, assume they saved significant hours
      const diff = Math.max(0, 120 - app.usedMinutes);
      return acc + diff;
    }
    return acc;
  }, 0);

  const activeModeDetails = focusModes.find((f) => f.id === activeFocusMode);

  return (
    <div className="space-y-4 font-sans">
      {/* Dynamic Grid Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Lock Safeguards */}
        <div className="bg-[#12141c] border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Active Lock Gates</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-indigo-400">{totalLocked}</span>
              <span className="text-xs text-gray-400">/ {appsList.length} apps</span>
            </div>
          </div>
          <div className="bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-900/30">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* KPI 2: Screen Time Restrictors */}
        <div className="bg-[#12141c] border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Average App Cap</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-cyan-400">
                {appsList.filter((a) => a.dailyLimit > 0).length > 0 ? averageLimit : 0}
              </span>
              <span className="text-xs text-cyan-500 font-mono">minutes</span>
            </div>
          </div>
          <div className="bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-900/30">
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* KPI 3: Dynamic Calculated Screen savings */}
        <div className="bg-[#12141c] border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Daily Savings Index</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-400">~{totalMinutesSaved}</span>
              <span className="text-xs text-emerald-500 font-mono">saved mins</span>
            </div>
          </div>
          <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/40">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* KPI 4: Active Mode Indicator */}
        <div className="bg-[#12141c] border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Focus Strategy</span>
            <span className="text-md font-bold block text-[#50e3c2] uppercase">
              {activeModeDetails ? activeModeDetails.name : 'Unlocked Mode'}
            </span>
          </div>
          <div className={`p-2.5 rounded-lg border ${
            activeModeDetails 
              ? 'bg-[#50e3c2]/10 border-[#50e3c2]/30 text-[#50e3c2]' 
              : 'bg-gray-900 border-gray-800 text-gray-500'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Visual bento schedule tracking & System diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Box A: Active Focus Targets */}
        <div className="bg-[#12141c] border border-gray-800 rounded-xl p-5 lg:col-span-2 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-widest flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Schedules & Interceptions Timeline</span>
            </h4>
            <span className="text-xs bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded font-mono">12 AM Reset Cycle</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Hour Block Intensity Simulation */}
            <div className="bg-[#161a25]/55 p-4 rounded-xl border border-gray-850 space-y-3">
              <span className="text-xs font-semibold text-gray-200 block">Restricted Peak Hours</span>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>08:00 AM - 12:00 PM (Study Peak)</span>
                  <span className="text-indigo-400 font-bold">90% Protection</span>
                </div>
                <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[90%] rounded-full"></div>
                </div>

                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>02:00 PM - 05:00 PM (Work Block)</span>
                  <span className="text-cyan-400 font-bold">75% Protection</span>
                </div>
                <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full w-[75%] rounded-full"></div>
                </div>

                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>10:00 PM - 06:00 AM (Sleep Mode)</span>
                  <span className="text-pink-400 font-bold">100% Locked</span>
                </div>
                <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-full rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Profile Insights Details */}
            <div className="bg-[#161a25]/55 p-4 rounded-xl border border-[#1e2436] flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-200 block mb-1">Focus Mode Insights</span>
                <p className="text-[11.5px] text-gray-400 leading-normal">
                  {activeModeDetails ? (
                    `You are actively maintaining a restricted threshold. Category targets matching '${activeModeDetails.blockedCategories.join(', ')}' are completely locked to support focus.`
                  ) : (
                    "No focus profiles are currently configured inside the device. You can choose Sleep Mode or Work Mode to enforce total concentration boundaries."
                  )}
                </p>
              </div>

              {activeModeDetails && (
                <div className="bg-emerald-950/25 border border-emerald-900/30 rounded-lg p-2 flex items-center gap-2 mt-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[10px] text-emerald-300 leading-none font-medium">Focus Shield matches and blocks targets actively.</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Box B: Android compliance checklist */}
        <div className="bg-[#12141c] border border-gray-800 rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-[#50e3c2]" />
              <span>Play Store Check List</span>
            </h4>
            
            <div className="space-y-2 text-[11.5px]">
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-indigo-400 font-bold shrink-0">✓</span>
                <span><strong>Accessibility Declaration</strong> - Ensure accessibility is strictly targeted only for locking apps foreground check.</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-indigo-400 font-bold shrink-0">✓</span>
                <span><strong>Data Safety Form</strong> - Fill correctly in console that no keystroke or personal identifier data leaves target app.</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-indigo-400 font-bold shrink-0">✓</span>
                <span><strong>Privacy Policy</strong> - App requires explicitly hosting clear statement policy linking Google Play console.</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-950/10 border border-blue-900/25 rounded-lg p-2.5 mt-4 text-[10.5px] text-blue-400 leading-normal">
            <strong>SDK 35 Note:</strong> Android 15 limits foreground processes. Accessibility Node analysis or Usage Access is mandatory to prevent daemon crashes.
          </div>
        </div>

      </div>

    </div>
  );
}
