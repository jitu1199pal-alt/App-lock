package com.applocktimer.pro.service

import android.app.*
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
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
            manager?.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("App Lock & Timer Pro Active")
            .setContentText("Protecting your screen-time habits")
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
}
