package com.applocktimer.pro.ui

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.applocktimer.pro.database.AppDatabase
import com.applocktimer.pro.database.LockedApp
import com.applocktimer.pro.service.AppMonitorService
import com.applocktimer.pro.utils.DailyResetWorker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class HomeActivity : ComponentActivity() {
    private lateinit var db: AppDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        db = AppDatabase.getInstance(this)

        // Boot monitoring background services and schedule midnight reset
        startMonitoringForegroundService()
        DailyResetWorker.scheduleDailyReset(this)

        setContent {
            val scope = rememberCoroutineScope()
            var appsList by remember { mutableStateOf<List<LockedApp>>(emptyList()) }
            var isLoading by remember { mutableStateOf(true) }

            LaunchedEffect(key1 = true) {
                scope.launch {
                    loadAndSyncInstalledApps()
                    db.lockedAppDao().getAllAppsFlow().collect { list ->
                        appsList = list
                        isLoading = false
                    }
                }
            }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0F111A))
            ) {
                Column(modifier = Modifier.fillMaxSize()) {
                    // Header Bar
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF131522))
                            .padding(horizontal = 24.dp, vertical = 20.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column {
                                Text(
                                    text = "AppLock & Timer Pro",
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Manage locks & daily screen timers",
                                    fontSize = 12.sp,
                                    color = Color.Gray
                                )
                            }
                            Text(
                                text = "🛡️",
                                fontSize = 28.sp
                            )
                        }
                    }

                    if (isLoading) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = Color(0xFF6366F1))
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 20.dp, vertical = 12.dp)
                        ) {
                            items(appsList) { app ->
                                AppControlRow(
                                    app = app,
                                    onLockToggle = { isLocked ->
                                        scope.launch(Dispatchers.IO) {
                                            db.lockedAppDao().updateLockStatus(app.packageName, isLocked)
                                        }
                                    },
                                    onLimitChange = { limit ->
                                        scope.launch(Dispatchers.IO) {
                                            db.lockedAppDao().updateAppLimit(app.packageName, limit)
                                        }
                                    }
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                    }
                }
            }
        }
    }

    private fun startMonitoringForegroundService() {
        val serviceIntent = Intent(this, AppMonitorService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }

    private suspend fun loadAndSyncInstalledApps() = withContext(Dispatchers.IO) {
        val pm = packageManager
        val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
        val existingPackageNames = db.lockedAppDao().getAllApps().map { it.packageName }.toSet()

        val appsToInsert = mutableListOf<LockedApp>()

        for (pkg in packages) {
            // Filter system packages to show user apps (WhatsApp, Instagram, Social, games etc.)
            val isSystem = (pkg.flags and ApplicationInfo.FLAG_SYSTEM) != 0
            if (!isSystem || pkg.packageName == "com.android.chrome") {
                if (!existingPackageNames.contains(pkg.packageName) && pkg.packageName != packageName) {
                    val appLabel = pm.getApplicationLabel(pkg).toString()
                    appsToInsert.add(
                        LockedApp(
                            packageName = pkg.packageName,
                            appName = appLabel,
                            isLocked = false,
                            dailyLimit = 0, // 0 = unlimited by default
                            usedMinutes = 0,
                            category = if (pkg.packageName.contains("chat") || pkg.packageName.contains("social") || pkg.packageName.contains("wa")) "social" else "other"
                        )
                    )
                }
            }
        }

        if (appsToInsert.isNotEmpty()) {
            db.lockedAppDao().insertApps(appsToInsert)
        }
    }
}

@Composable
fun AppControlRow(
    app: LockedApp,
    onLockToggle: (Boolean) -> Unit,
    onLimitChange: (Int) -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131522)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = app.appName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = app.packageName,
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                }

                Switch(
                    checked = app.isLocked,
                    onCheckedChange = { onLockToggle(it) },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = Color(0xFF6366F1),
                        uncheckedThumbColor = Color.LightGray,
                        uncheckedTrackColor = Color(0xFF222533)
                    )
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Daily Timer Limit: " + (if (app.dailyLimit == 0) "No Limit" else "${app.dailyLimit} min"),
                    fontSize = 12.sp,
                    color = Color.LightGray
                )

                Row {
                    TextButton(onClick = { onLimitChange(0) }) {
                        Text("Reset", fontSize = 11.sp, color = Color.Gray)
                    }
                    TextButton(onClick = { onLimitChange(15) }) {
                        Text("15m", fontSize = 11.sp, color = Color(0xFF6366F1))
                    }
                    TextButton(onClick = { onLimitChange(30) }) {
                        Text("30m", fontSize = 11.sp, color = Color(0xFF6366F1))
                    }
                    TextButton(onClick = { onLimitChange(60) }) {
                        Text("1h", fontSize = 11.sp, color = Color(0xFF8B5CF6))
                    }
                }
            }
        }
    }
}
