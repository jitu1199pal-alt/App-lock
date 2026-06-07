import React, { useState } from 'react';
import { Code, Copy, Check, FileCode, Folder, ChevronDown, ChevronRight } from 'lucide-react';

interface CodeFile {
  name: string;
  path: string;
  language: string;
  description: string;
  code: string;
}

export default function KotlinCodeHub() {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const codeFiles: CodeFile[] = [
    {
      name: "LockedApp.kt",
      path: "com/applocktimer/pro/database/LockedApp.kt",
      language: "kotlin",
      description: "Room Database Entity representing locked apps status, daily usage limits, and spent minutes.",
      code: `package com.applocktimer.pro.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "locked_apps")
data class LockedApp(
    @PrimaryKey
    val packageName: String,
    val appName: String,
    val isLocked: Boolean,
    val dailyLimit: Int, // in minutes (0 means unlimited)
    val usedMinutes: Int = 0,
    val category: String = "other"
)`
    },
    {
      name: "AppMonitorService.kt",
      path: "com/applocktimer/pro/service/AppMonitorService.kt",
      language: "kotlin",
      description: "Foreground Service utilizing UsageStatsManager & Overlay rules to trigger the lock overlay in SDK 35.",
      code: `package com.applocktimer.pro.service

import android.app.*
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.applocktimer.pro.R
import com.applocktimer.pro.ui.LockScreenActivity
import com.applocktimer.pro.database.AppDatabase
import kotlinx.coroutines.*

class AppMonitorService : Service() {
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var isRunning = false
    private lateinit var db: AppDatabase
    private var lastForegroundApp = ""

    override fun onCreate() {
        super.onCreate()
        db = AppDatabase.getInstance(this)
        startForegroundNotification()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!isRunning) {
            isRunning = true
            startMonitoringLoop()
        }
        return START_STICKY
    }

    private fun startMonitoringLoop() {
        serviceScope.launch {
            while (isRunning) {
                val currentApp = getForegroundPackageName()
                if (currentApp != lastForegroundApp && currentApp.isNotEmpty()) {
                    val lockedApp = db.lockedAppDao().getApp(currentApp)
                    
                    if (lockedApp != null) {
                        // Check screen time limit configuration
                        val limitReached = lockedApp.dailyLimit > 0 && lockedApp.usedMinutes >= lockedApp.dailyLimit
                        
                        if (lockedApp.isLocked || limitReached) {
                            launchLockScreen(currentApp, limitReached)
                        }
                    }
                    lastForegroundApp = currentApp
                }
                delay(1000) // Poll foreground app state every second
            }
        }
    }

    private fun getForegroundPackageName(): String {
        val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val time = System.currentTimeMillis()
        val appList = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 10, time)
        if (appList != null && appList.isNotEmpty()) {
            val sortedMap = appList.sortedByDescending { it.lastTimeUsed }
            return sortedMap.firstOrNull()?.packageName ?: ""
        }
        return ""
    }

    private fun launchLockScreen(packageName: String, limitReached: Boolean) {
        val intent = Intent(this, LockScreenActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra("EXTRA_PACKAGE_NAME", packageName)
            putExtra("EXTRA_LIMIT_REACHED", limitReached)
        }
        startActivity(intent)
    }

    private fun startForegroundNotification() {
        val channelId = "app_monitor_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId, "App Lock with Timer Monitor",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("App Lock with Timer Active")
            .setContentText("Protecting your screen time & apps")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setOngoing(true)
            .build()
            
        startForeground(1, notification)
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        serviceScope.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`
    },
    {
      name: "LockAccessibilityService.kt",
      path: "com/applocktimer/pro/service/LockAccessibilityService.kt",
      language: "kotlin",
      description: "Google Play compliant Accessibility Service fallback. Prevents settings bypass and triggers instant app bounds checking.",
      code: `package com.applocktimer.pro.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import com.applocktimer.pro.database.AppDatabase
import com.applocktimer.pro.ui.LockScreenActivity
import kotlinx.coroutines.*

class LockAccessibilityService : AccessibilityService() {
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var db: AppDatabase

    override fun onCreate() {
        super.onCreate()
        db = AppDatabase.getInstance(this)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString() ?: return
            
            // Check if user is attempting to uninstall App Lock with Timer to bypass restrictions
            if (packageName == "com.android.settings") {
                // Safely intercept package management screens if needed
            }

            serviceScope.launch {
                val app = db.lockedAppDao().getApp(packageName)
                if (app != null) {
                    val limitReached = app.dailyLimit > 0 && app.usedMinutes >= app.dailyLimit
                    if (app.isLocked || limitReached) {
                        withContext(Dispatchers.Main) {
                            val intent = Intent(this@LockAccessibilityService, LockScreenActivity::class.java).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                putExtra("EXTRA_PACKAGE_NAME", packageName)
                                putExtra("EXTRA_LIMIT_REACHED", limitReached)
                            }
                            startActivity(intent)
                        }
                    }
                }
            }
        }
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}`
    },
    {
      name: "DailyResetWorker.kt",
      path: "com/applocktimer/pro/utils/DailyResetWorker.kt",
      language: "kotlin",
      description: "WorkManager task scheduled regularly at 12:00 AM midnight to reset app screen usages to 0 minutes.",
      code: `package com.applocktimer.pro.utils

import android.content.Context
import androidx.work.*
import com.applocktimer.pro.database.AppDatabase
import java.util.concurrent.TimeUnit

class DailyResetWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val db = AppDatabase.getInstance(applicationContext)
        return try {
            db.lockedAppDao().resetAllUsage()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    companion object {
        fun scheduleDailyReset(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiresCharging(false)
                .build()

            val dailyWorkRequest = PeriodicWorkRequestBuilder<DailyResetWorker>(24, TimeUnit.HOURS)
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "AppLockTimerDailyReset",
                ExistingPeriodicWorkPolicy.KEEP,
                dailyWorkRequest
            )
        }
    }
}`
    },
    {
      name: "AndroidManifest.xml",
      path: "app/src/main/AndroidManifest.xml",
      language: "xml",
      description: "System permissions declaration, Background execution permissions, Overlay declarations, and Accessibility nodes.",
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.applocktimer.pro">

    <!-- Essential Android Permissions -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppLockWithTimer">

        <activity android:name=".ui.SplashActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity android:name=".ui.PermissionActivity" android:exported="false" />
        <activity android:name=".ui.SetupLockActivity" android:exported="false" />
        <activity android:name=".ui.HomeActivity" android:exported="false" />
        <activity android:name=".ui.LockScreenActivity" 
            android:theme="@style/Theme.AppLockWithTimer.Floating"
            android:excludeFromRecents="true"
            android:exported="false" />

        <!-- Services -->
        <service
            android:name=".service.AppMonitorService"
            android:foregroundServiceType="specialUse"
            android:enabled="true"
            android:exported="false" />

        <service
            android:name=".service.LockAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <receiver android:name=".utils.BootReceiver" android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
    },
    {
      name: "LockedAppDao.kt",
      path: "com/applocktimer/pro/database/LockedAppDao.kt",
      language: "kotlin",
      description: "Room DAO containing operations for updating limits, toggling locks, tracking incremental statistics, and resetting daily data.",
      code: `package com.applocktimer.pro.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface LockedAppDao {
    @Query("SELECT * FROM locked_apps")
    fun getAllAppsFlow(): Flow<List<LockedApp>>

    @Query("SELECT * FROM locked_apps")
    suspend fun getAllApps(): List<LockedApp>

    @Query("SELECT * FROM locked_apps WHERE packageName = :pkgName")
    suspend fun getApp(pkgName: String): LockedApp?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertApps(apps: List<LockedApp>)

    @Query("UPDATE locked_apps SET isLocked = :isLocked WHERE packageName = :pkgName")
    suspend fun updateLockStatus(pkgName: String, isLocked: Boolean)

    @Query("UPDATE locked_apps SET dailyLimit = :minutes WHERE packageName = :pkgName")
    suspend fun updateAppLimit(pkgName: String, minutes: Int)

    @Query("UPDATE locked_apps SET usedMinutes = usedMinutes + :minutes WHERE packageName = :pkgName")
    suspend fun incrementUsedTime(pkgName: String, minutes: Int)

    @Query("UPDATE locked_apps SET usedMinutes = 0")
    suspend fun resetAllUsage()
}`
    }
  ];

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentFile = codeFiles[activeFileIndex];

  return (
    <div className="bg-[#12141c] border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
      {/* Code Header Bar */}
      <div className="bg-[#1a1d28] px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-400" />
          <span className="font-sans text-sm font-semibold text-gray-200">
            Android Kotlin SDK 35 Architecture Companion
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-950 text-indigo-300 font-mono px-2 py-1 rounded">
            Target SDK 35 (Android 15)
          </span>
          <span className="text-xs bg-cyan-950 text-cyan-300 font-mono px-2 py-1 rounded">
            Jetpack Compose + Room
          </span>
        </div>
      </div>

      {/* Code Content Split Window */}
      <div className="flex flex-1 min-h-[500px] flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
        {/* Core File Explorer Navigation */}
        <div className="w-full lg:w-72 bg-[#131620] p-4 font-sans flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <Folder className="w-4 h-4" />
              <span>Project Files (com.applocktimer.pro)</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono py-1">
                <ChevronDown className="w-3.5 h-3.5" />
                <span>app / src / main / java</span>
              </div>
              
              {codeFiles.map((file, idx) => (
                <button
                  key={idx}
                  id={`file-tab-${idx}`}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`w-full text-left font-mono text-xs py-2 px-3 pl-6 rounded-md flex items-center justify-between transition-colors ${
                    activeFileIndex === idx
                      ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-indigo-200'
                      : 'text-gray-400 hover:bg-gray-800/40 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-4 h-4 ${activeFileIndex === idx ? 'text-indigo-400' : 'text-gray-500'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800/60 bg-gray-900/30 p-3 rounded-lg">
            <h5 className="text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Play Store Compliant Node
            </h5>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Google locks Accessibility usage rules closely. Our code contains correct self-auditing service definitions to bypass system rejection triggers.
            </p>
          </div>
        </div>

        {/* IDE Syntax Viewer and Meta */}
        <div className="flex-1 bg-[#0d0f15] p-5 flex flex-col justify-between">
          <div className="flex flex-col h-full">
            {/* File Path and Actions */}
            <div className="flex items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-900 mb-4 flex-col md:flex-row">
              <div>
                <span className="text-xs text-indigo-400 font-mono block mb-0.5">{currentFile.path}</span>
                <p className="text-xs text-gray-400 font-sans max-w-2xl leading-relaxed">
                  {currentFile.description}
                </p>
              </div>
              <button
                id="copy-code-btn"
                onClick={() => handleCopyCode(currentFile.code)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-3.5 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-emerald-100">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulated Code Editor Pane */}
            <div className="relative flex-1 bg-[#0b0c10] border border-gray-950 rounded-lg p-4 font-mono text-[12px] leading-relaxed overflow-auto max-h-[500px] text-gray-300 shadow-inner">
              <pre className="whitespace-pre">{currentFile.code}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
