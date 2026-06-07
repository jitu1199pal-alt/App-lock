import React, { useState } from 'react';
import { Database, Search, RefreshCw, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { LockedApp } from '../types';

interface RoomDatabaseInspectorProps {
  logs: any[];
  clearLogs: () => void;
  appsList: LockedApp[];
  seedDatabase: () => void;
}

export default function RoomDatabaseInspector({
  logs,
  clearLogs,
  appsList,
  seedDatabase,
}: RoomDatabaseInspectorProps) {
  const [selectedSqlFilter, setSelectedSqlFilter] = useState<'ALL' | 'LOCKED' | 'BLOCKED' | 'SOCIAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sift apps based on sql filters and text search
  const filteredApps = appsList.filter((app) => {
    const textFields = `${app.appName} ${app.packageName}`.toLowerCase();
    const matchesSearch = textFields.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (selectedSqlFilter) {
      case 'LOCKED':
        return app.isLocked;
      case 'BLOCKED':
        return app.dailyLimit > 0 && app.usedMinutes >= app.dailyLimit;
      case 'SOCIAL':
        return app.category === 'social';
      default:
        return true;
    }
  });

  // Simulated SQL sentence based on selections
  const getGeneratedSql = () => {
    let query = "SELECT * FROM locked_apps";
    const conditions: string[] = [];

    if (searchQuery) {
      conditions.push(`(appName LIKE '%${searchQuery}%' OR packageName LIKE '%${searchQuery}%')`);
    }

    if (selectedSqlFilter === 'LOCKED') {
      conditions.push("isLocked = 1");
    } else if (selectedSqlFilter === 'BLOCKED') {
      conditions.push("usedMinutes >= dailyLimit AND dailyLimit > 0");
    } else if (selectedSqlFilter === 'SOCIAL') {
      conditions.push("category = 'social'");
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    return query + ";";
  };

  return (
    <div className="bg-[#12141c] border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
      {/* Database Inspector Header */}
      <div className="bg-[#1a1d28] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <span className="font-sans text-sm font-semibold text-gray-200">
            Room DB Live Schema Tracker
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="seed-db-btn"
            onClick={seedDatabase}
            className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-xs text-gray-300 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Seed DB</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
        {/* Terminal Query & State Viewer */}
        <div className="w-full lg:w-[45%] bg-[#0f111a] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              <Terminal className="w-4 h-4" />
              <span>Query Analyzer Console</span>
            </div>

            {/* Generated Query Prompt box */}
            <div className="bg-black/40 border border-gray-905 p-3 rounded-lg font-mono text-xs text-indigo-300 leading-normal mb-4">
              <div className="text-gray-500 mb-1">// Current SQLite Query</div>
              <span className="text-[#98c379]">sqlite{'>'}</span> <span className="text-gray-100">{getGeneratedSql()}</span>
            </div>

            {/* Filter Pills representing SQLite conditions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(['ALL', 'LOCKED', 'BLOCKED', 'SOCIAL'] as const).map((filter) => (
                <button
                  key={filter}
                  id={`sql-filter-${filter}`}
                  onClick={() => setSelectedSqlFilter(filter)}
                  className={`py-2 px-3 text-left font-mono text-xs rounded-lg border transition-all cursor-pointer ${
                    selectedSqlFilter === filter
                      ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-900/10'
                      : 'bg-gray-950/40 border-gray-800/80 text-gray-400 hover:bg-gray-900/80'
                  }`}
                >
                  <div className="font-semibold text-[10px] text-gray-500 mb-0.5">
                    {filter === 'ALL' && 'LIMITS & LOCKS'}
                    {filter === 'LOCKED' && 'SECURE MODE'}
                    {filter === 'BLOCKED' && 'STRICT MONITOR'}
                    {filter === 'SOCIAL' && 'BLOCKLIST CATEGORIES'}
                  </div>
                  <div>
                    {filter === 'ALL' && 'ALL APP ENTITIES'}
                    {filter === 'LOCKED' && 'isLocked = 1'}
                    {filter === 'BLOCKED' && 'limit_reached = 1'}
                    {filter === 'SOCIAL' && "category = 'social'"}
                  </div>
                </button>
              ))}
            </div>

            {/* Text Search simulation for LIKE */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                id="search-db-input"
                type="text"
                placeholder="Query apps list (appName LIKE %...%)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161a25] border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          {/* Database System Diagnostic Info */}
          <div className="border-t border-gray-850 pt-4 bg-gray-900/10 p-3 rounded-lg">
            <h5 className="text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Room Lifecycle Client Online
            </h5>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
              Transactions are securely committed through standard Coroutines. Single source of truth is updated on access limits matching.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="bg-gray-900/80 p-1.5 rounded border border-gray-800">
                <div className="text-indigo-400 text-xs font-bold">{appsList.length}</div>
                <div className="text-gray-500">Entities</div>
              </div>
              <div className="bg-gray-900/80 p-1.5 rounded border border-gray-800">
                <div className="text-indigo-400 text-xs font-bold">
                  {appsList.filter((a) => a.isLocked).length}
                </div>
                <div className="text-gray-500">Locked</div>
              </div>
              <div className="bg-gray-900/80 p-1.5 rounded border border-gray-800">
                <div className="text-indigo-400 text-xs font-bold">
                  {appsList.filter((a) => a.dailyLimit > 0).length}
                </div>
                <div className="text-gray-500">Times Controlled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Table Grid Layout */}
        <div className="flex-1 bg-[#10121a] p-4 flex flex-col justify-between overflow-auto">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
                <span>QueryResult: locked_apps [{filteredApps.length} records]</span>
              </span>
              <div className="text-[10px] font-mono text-gray-550 bg-gray-950 px-2 py-0.5 rounded border border-gray-900">
                TABLE: locked_apps ({appsList.length} total)
              </div>
            </div>

            {/* Simulated Data Grid */}
            <div className="border border-gray-850 rounded-lg overflow-hidden bg-gray-950/45">
              <table className="w-full text-left font-mono text-xs text-gray-300">
                <thead className="bg-[#141722] border-b border-gray-850 text-gray-400 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">packageName (PK)</th>
                    <th className="p-2.5">appName</th>
                    <th className="p-2.5 text-center">isLocked</th>
                    <th className="p-2.5 text-center">dailyLimit(m)</th>
                    <th className="p-2.5 text-center">usedMinutes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 text-xs italic">
                        No rows found matching current sqlite search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => {
                      const limitReached = app.dailyLimit > 0 && app.usedMinutes >= app.dailyLimit;
                      return (
                        <tr key={app.packageName} className="hover:bg-gray-900/40 transition-colors">
                          <td className="p-2.5 text-indigo-400/80 text-[11px] font-medium">{app.packageName}</td>
                          <td className="p-2.5 font-sans font-medium text-gray-200">{app.appName}</td>
                          <td className="p-2.5 text-center">
                            <span className={`inline-block w-4 h-4 rounded ${app.isLocked ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-gray-900 text-gray-600 border border-gray-800'} text-[10px] leading-tight font-bold`}>
                              {app.isLocked ? 'Y' : 'N'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center text-cyan-400">
                            {app.dailyLimit === 0 ? 'Infinite' : `${app.dailyLimit} min`}
                          </td>
                          <td className="p-2.5 text-center font-bold text-gray-200">
                            <span className={limitReached ? "text-rose-450 text-rose-400" : "text-gray-300"}>
                              {app.usedMinutes}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Database Actions Audit Stream */}
          <div className="mt-5 border-t border-gray-850 pt-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
              <span className="font-sans uppercase">SQLite Real-time Transaction Journal</span>
              <button
                id="clear-logs-btn"
                onClick={clearLogs}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Clear Live Logs
              </button>
            </div>
            <div className="bg-black/50 border border-gray-900 rounded-lg p-2.5 h-28 overflow-y-auto font-mono text-[10px] text-gray-400 space-y-1 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="text-gray-600 italic">No room events. Interact with local smartphone screen lock dials to trigger live query events...</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-1">
                    <span className="text-gray-650 shrink-0 text-gray-600">[{log.timestamp}]</span>
                    {log.type === 'blocked' && <AlertCircle className="w-3 h-3 text-amber-500 inline shrink-0 mt-0.5" />}
                    {log.type === 'limit_reached' && <AlertCircle className="w-3 h-3 text-red-500 inline shrink-0 mt-0.5" />}
                    {log.type === 'unlocked' && <CheckCircle2 className="w-3 h-3 text-emerald-500 inline shrink-0 mt-0.5" />}
                    <span className="text-indigo-200">{log.details}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
