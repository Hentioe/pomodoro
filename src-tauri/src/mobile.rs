use tauri::AppHandle;

#[tauri::command]
pub async fn tick(_handle: AppHandle) {}
#[tauri::command]
pub async fn done(_handle: AppHandle, _next_state: String) {}
#[tauri::command]
pub async fn exit(_handle: AppHandle) {}
