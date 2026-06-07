package com.applocktimer.pro.database

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
)
