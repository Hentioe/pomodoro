package dev.hentioe.tauripomodoro

import android.os.Bundle
// import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // enableEdgeToEdge() // 不需要让 web 区域延伸到状态栏和导航栏后面
    super.onCreate(savedInstanceState)
  }
}