package com.applocktimer.pro.service

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
}
