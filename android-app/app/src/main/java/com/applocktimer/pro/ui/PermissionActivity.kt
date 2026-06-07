package com.applocktimer.pro.ui

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Process
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class PermissionActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var hasOverlayPermission by remember { mutableStateOf(false) }
            var hasUsageStatsPermission by remember { mutableStateOf(false) }

            LaunchedEffect(key1 = true) {
                checkPermissions { overlay, usage ->
                    hasOverlayPermission = overlay
                    hasUsageStatsPermission = usage
                }
            }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0F111A))
                    .padding(24.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Permissions Required",
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )

                    Text(
                        text = "To monitor active apps and prevent bypass methods, the following background permissions are required:",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(bottom = 32.dp)
                    )

                    // Permission 1: Overlay
                    PermissionCard(
                        title = "1. Draw Over Other Apps",
                        description = "Enables the lock overlay screen when restricted apps are launched.",
                        isGranted = hasOverlayPermission,
                        onClick = {
                            if (!hasOverlayPermission) {
                                val intent = Intent(
                                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                    Uri.parse("package:$packageName")
                                )
                                startActivity(intent)
                            }
                        }
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Permission 2: Usage Stats
                    PermissionCard(
                        title = "2. App Usage Access",
                        description = "Required to accurately track which app is active second-by-second.",
                        isGranted = hasUsageStatsPermission,
                        onClick = {
                            if (!hasUsageStatsPermission) {
                                val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
                                startActivity(intent)
                            }
                        }
                    )

                    Spacer(modifier = Modifier.height(48.dp))

                    Button(
                        onClick = {
                            if (hasOverlayPermission && hasUsageStatsPermission) {
                                val sharedPref = getSharedPreferences("app_lock_prefs", Context.MODE_PRIVATE)
                                sharedPref.edit().putBoolean("is_first_run", false).apply()
                                startActivity(Intent(this@PermissionActivity, SetupLockActivity::class.java))
                                finish()
                            }
                        },
                        enabled = hasOverlayPermission && hasUsageStatsPermission,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF6366F1),
                            disabledContainerColor = Color(0xFF1E2130)
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                    ) {
                        Text(
                            text = "Continue Setup",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (hasOverlayPermission && hasUsageStatsPermission) Color.White else Color.Gray
                        )
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Re-check permissions on resume so the app moves forward automatically!
        checkPermissions { overlay, usage ->
            if (overlay && usage) {
                // If checking permissions inside onResume returns true directly, we can safely auto-enable continue button state
            }
        }
    }

    private fun checkPermissions(onResult: (Boolean, Boolean) -> Unit) {
        val hasOverlay = Settings.canDrawOverlays(this)
        
        val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                packageName
            )
        } else {
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                packageName
            )
        }
        val hasUsage = mode == AppOpsManager.MODE_ALLOWED
        onResult(hasOverlay, hasUsage)
    }
}

@Composable
fun PermissionCard(
    title: String,
    description: String,
    isGranted: Boolean,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF131522)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = description,
                    fontSize = 12.sp,
                    color = Color.LightGray
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Button(
                onClick = onClick,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isGranted) Color(0xFF10B981) else Color(0xFF3B82F6)
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = if (isGranted) "Granted" else "Grant",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}
