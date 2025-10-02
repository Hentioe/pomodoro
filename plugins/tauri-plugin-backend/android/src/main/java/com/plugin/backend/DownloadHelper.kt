package com.plugin.backend

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.util.Log
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

private val LOG_TAG = "tauripomodoro:DownloadHelper"

fun startDownload(context: Context, apkUrl: String, version: String): Long {
    val request =
        DownloadManager.Request(Uri.parse(apkUrl))
            .setTitle(context.getString(R.string.upgrade_title)) // 通知标题
            .setDescription(context.getString(R.string.downloading_new_version) + version) // 通知描述
            .setNotificationVisibility(
                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED) // 显示进度并在完成时通知
            .setDestinationInExternalPublicDir(
                Environment.DIRECTORY_DOWNLOADS, "tauripomodoro-$version.apk") // 保存路径
            .setMimeType("application/vnd.android.package-archive") // APK 类型
            .setAllowedOverMetered(true) // 允许移动数据下载（可根据需要调整）
            .setAllowedOverRoaming(false)

    val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
    return downloadManager.enqueue(request) // 启动下载，返回 ID 用于追踪
}

fun checkDownloadNotification(context: Context) {
    MainScope().launch {
        val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
        val versionName = packageInfo.versionName
        val storedVersion =
            context.settingsStore.read(SettingsKey.LATEST_DOWNLOAD_VERSION.createKey())
        if (storedVersion == versionName) {
            // 最近下载的版本和当前相同
            Log.i(
                LOG_TAG,
                "Latest downloaded version ($storedVersion) is same as current version ($versionName), removing download notification if any")
            val downloadId =
                context.settingsStore.read(SettingsKey.LATEST_DOWNLOAD_ID.createKeyT<Long>())
            if (downloadId != null) {
                val downloadManager =
                    context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                downloadManager.remove(downloadId)
                Log.i(LOG_TAG, "Removed download notification for ID $downloadId")
                // 移除下载 ID 的记录
                context.settingsStore.remove(SettingsKey.LATEST_DOWNLOAD_ID.createKeyT<Long>())
            }
            // 移除下载版本的记录
            context.settingsStore.remove(SettingsKey.LATEST_DOWNLOAD_VERSION.createKey())
        }
    }
}
