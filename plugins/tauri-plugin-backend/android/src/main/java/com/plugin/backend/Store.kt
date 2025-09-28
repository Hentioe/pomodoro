package com.plugin.backend

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map

private const val PREFERENCES_NAME = "base_settings"

// 扩展属性，创建 DataStore 实例
private val Context.dataStore: DataStore<Preferences> by
    preferencesDataStore(name = PREFERENCES_NAME)

enum class SettingsKey(val keyName: String) {
    TICK_SOUND("tick_sound"),
    BACKGROUND_MUSIC("background_music"),
    TICK_VOLUME("tick_volume"),
    ALARM_VOLUME("alarm_volume"),
    PROMPT_VOLUME("prompt_volume"),
    BACKGROUND_VOLUME("background_volume"),
    FOCUS_MINUTES("focus_minutes"),
    SHORT_BREAK_MINUTES("short_break_minutes"),
    LONG_BREAK_MINUTES("long_break_minutes"),
    // 用于存储最新下载 ID 的键
    LATEST_DOWNLOAD_ID("latest_download_id"),
    // 用户存储最新下载版本的键
    LATEST_DOWNLOAD_VERSION("latest_download_version");

    fun createKey(): Preferences.Key<String> = stringPreferencesKey(keyName)

    fun <T> createKeyT(): Preferences.Key<T> = stringPreferencesKey(keyName) as Preferences.Key<T>
}

class Store(context: Context) {
    private val dataStore = context.dataStore

    // 异步的写入方法
    suspend fun <T> write(key: Preferences.Key<T>, value: T) {
        dataStore.edit { preferences -> preferences[key] = value }
    }

    // 异步的读取方法
    suspend fun <T> read(key: Preferences.Key<T>): T? {
        return dataStore.data.map { preferences -> preferences[key] }.firstOrNull()
    }

    // 同步的写入方法
    fun <T> writeSync(key: Preferences.Key<T>, value: T) {
        kotlinx.coroutines.runBlocking { write(key, value) }
    }

    // 同步的读取方法
    fun <T> readSync(key: Preferences.Key<T>): T? {
        return kotlinx.coroutines.runBlocking { read(key) }
    }

    suspend fun remove(key: Preferences.Key<*>) {
        dataStore.edit { preferences -> preferences.remove(key) }
    }
}
