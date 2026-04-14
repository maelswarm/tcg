// lib.rs — required by Tauri v2 for mobile/cross-platform support
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Intentionally empty — desktop entry is in main.rs
}
