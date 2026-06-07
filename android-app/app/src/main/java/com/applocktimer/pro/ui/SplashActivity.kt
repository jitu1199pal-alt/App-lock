package com.applocktimer.pro.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

class SplashActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0F111A)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "🔒",
                        fontSize = 72.sp
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "AppLock & Timer Pro",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Secure Screen Time Habits",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }

            LaunchedEffect(key1 = true) {
                delay(2000)
                val sharedPref = getSharedPreferences("app_lock_prefs", Context.MODE_PRIVATE)
                val isFirstRun = sharedPref.getBoolean("is_first_run", true)
                val hasPin = sharedPref.getString("lock_pin", null) != null

                val nextActivity = when {
                    isFirstRun -> PermissionActivity::class.java
                    !hasPin -> SetupLockActivity::class.java
                    else -> HomeActivity::class.java
                }

                startActivity(Intent(this@SplashActivity, nextActivity))
                finish()
            }
        }
    }
}
