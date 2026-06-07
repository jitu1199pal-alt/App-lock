package com.applocktimer.pro.utils

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
}
