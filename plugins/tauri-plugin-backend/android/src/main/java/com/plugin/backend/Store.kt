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
    TICK_VOLUME("tick_volume"),
    ALARM_VOLUME("alarm_volume"),
    PROMPT_VOLUME("prompt_volume"),
    FOCUS_MINUTES("focus_minutes"),
    SHORT_BREAK_MINUTES("short_break_minutes"),
    LONG_BREAK_MINUTES("long_break_minutes");

    fun createKey(): Preferences.Key<String> = stringPreferencesKey(keyName)
}

class Store(context: Context) {
    private val dataStore = context.dataStore

    // 通用写入方法
    suspend fun <T> write(key: Preferences.Key<T>, value: T) {
        dataStore.edit { preferences -> preferences[key] = value }
    }

    // 通用读取方法
    suspend fun <T> read(key: Preferences.Key<T>): T? {
        return dataStore.data.map { preferences -> preferences[key] }.firstOrNull()
    }
}
