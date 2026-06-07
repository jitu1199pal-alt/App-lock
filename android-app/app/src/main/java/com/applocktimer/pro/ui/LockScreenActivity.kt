package com.applocktimer.pro.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class LockScreenActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Disable physical back button on Lock Screen to enforce security rules
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Return to home screen when back is pressed. User cannot access the locked app!
                val startMain = Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_HOME)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(startMain)
                finish()
            }
        })

        val targetPackageName = intent.getStringExtra("EXTRA_PACKAGE_NAME") ?: ""
        val limitReached = intent.getBooleanExtra("EXTRA_LIMIT_REACHED", false)

        setContent {
            var pinInput by remember { mutableStateOf("") }
            val sharedPref = getSharedPreferences("app_lock_prefs", Context.MODE_PRIVATE)
            val correctPin = sharedPref.getString("lock_pin", "0000") // Falls back to 0000 if not configured

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF07080E))
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "🔒",
                        fontSize = 64.sp,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    Text(
                        text = if (limitReached) "Daily Limit Exceeded" else "App is Locked",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    Text(
                        text = if (limitReached) {
                            "You have reached your daily screen-time limit for this application. Enter PIN to extend."
                        } else {
                            "Access to this app is restricted. Enter your 4-digit Master PIN to unlock."
                        },
                        fontSize = 13.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(bottom = 32.dp, start = 12.dp, end = 12.dp)
                    )

                    OutlinedTextField(
                        value = pinInput,
                        onValueChange = { newValue ->
                            if (newValue.length <= 4 && newValue.all { it.isDigit() }) {
                                pinInput = newValue
                            }
                        },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFFEF4444),
                            unfocusedBorderColor = Color(0xFF1E2130),
                            focusedContainerColor = Color(0xFF131522),
                            unfocusedContainerColor = Color(0xFF131522)
                        ),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .width(180.dp)
                            .height(58.dp)
                    )

                    Spacer(modifier = Modifier.height(40.dp))

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Button(
                            onClick = {
                                // Quit and go to home screen launchpad
                                val startMain = Intent(Intent.ACTION_MAIN).apply {
                                    addCategory(Intent.CATEGORY_HOME)
                                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                }
                                startActivity(startMain)
                                finish()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF131522)),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(54.dp)
                        ) {
                            Text(
                                text = "Exit",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.Gray
                            )
                        }

                        Button(
                            onClick = {
                                if (pinInput == correctPin) {
                                    Toast.makeText(this@LockScreenActivity, "Access Granted", Toast.LENGTH_SHORT).show()
                                    finish() // Close overlay lock, granting app visibility
                                } else {
                                    Toast.makeText(this@LockScreenActivity, "Incorrect Master PIN", Toast.LENGTH_SHORT).show()
                                    pinInput = ""
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(54.dp)
                        ) {
                            Text(
                                text = "Unlock",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}
