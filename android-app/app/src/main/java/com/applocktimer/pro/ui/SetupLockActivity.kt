package com.applocktimer.pro.ui

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
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

class SetupLockActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var pin by remember { mutableStateOf("") }
            var confirmPin by remember { mutableStateOf("") }
            var step by remember { mutableStateOf(1) } // 1: Enter PIN, 2: Confirm PIN

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0F111A))
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "🔒",
                        fontSize = 58.sp,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    Text(
                        text = if (step == 1) "Create Master PIN" else "Confirm Master PIN",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    Text(
                        text = if (step == 1) "Enter a 4-digit PIN to secure your app settings and restricted locks" else "Re-enter your 4-digit PIN to confirm",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(bottom = 32.dp)
                    )

                    OutlinedTextField(
                        value = if (step == 1) pin else confirmPin,
                        onValueChange = { newValue ->
                            if (newValue.length <= 4 && newValue.all { it.isDigit() }) {
                                if (step == 1) {
                                    pin = newValue
                                } else {
                                    confirmPin = newValue
                                }
                            }
                        },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFF6366F1),
                            unfocusedBorderColor = Color(0xFF1E2130),
                            focusedContainerColor = Color(0xFF131522),
                            unfocusedContainerColor = Color(0xFF131522)
                        ),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .width(200.dp)
                            .height(58.dp)
                    )

                    Spacer(modifier = Modifier.height(48.dp))

                    Button(
                        onClick = {
                            if (step == 1) {
                                if (pin.length == 4) {
                                    step = 2
                                } else {
                                    Toast.makeText(this@SetupLockActivity, "PIN must be 4 digits", Toast.LENGTH_SHORT).show()
                                }
                            } else {
                                if (pin == confirmPin) {
                                    val sharedPref = getSharedPreferences("app_lock_prefs", Context.MODE_PRIVATE)
                                    sharedPref.edit().putString("lock_pin", pin).apply()

                                    Toast.makeText(this@SetupLockActivity, "Master PIN Saved successfully!", Toast.LENGTH_SHORT).show()
                                    startActivity(Intent(this@SetupLockActivity, HomeActivity::class.java))
                                    finish()
                                } else {
                                    Toast.makeText(this@SetupLockActivity, "PINs do not match, starting over", Toast.LENGTH_SHORT).show()
                                    pin = ""
                                    confirmPin = ""
                                    step = 1
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                    ) {
                        Text(
                            text = if (step == 1) "Next" else "Confirm & Save",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
