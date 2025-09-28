package com.plugin.backend

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log

class DownloadCompleteReceiver : BroadcastReceiver() {
    companion object {
        private const val LOG_TAG = "tauripomodoro:DownloadCompleteReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val downloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
        // 读取存储的最新下载 ID 判断是否匹配
        val latestDownloadId =
            Store(context).readSync(SettingsKey.LATEST_DOWNLOAD_ID.createKeyT<Long>())
        if (downloadId != latestDownloadId) {
            Log.d(LOG_TAG, "Ignoring download ID $downloadId, expecting $latestDownloadId")
            return
        }

        val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val uri: Uri? = downloadManager.getUriForDownloadedFile(downloadId)

        if (uri != null) {
            // 启动安装 Intent
            val installIntent = Intent(Intent.ACTION_VIEW)
            installIntent.setDataAndType(uri, "application/vnd.android.package-archive")
            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(installIntent)
        }
    }
}
