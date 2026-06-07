package com.applocktimer.pro.database

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
}
