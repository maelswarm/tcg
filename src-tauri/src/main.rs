#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::{Manager, State};
use tauri_plugin_shell::ShellExt;

struct SidecarHandle(Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarHandle(Mutex::new(None)))
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Resolve the config directory where .env lives (e.g. AppData/Roaming/tcg-price-tracker)
            let config_dir = app_handle
                .path()
                .app_config_dir()
                .expect("Failed to get app config dir");
            std::fs::create_dir_all(&config_dir).expect("Failed to create config dir");
            let config_dir_str = config_dir.to_str().unwrap().to_string();

            // Spawn the Node.js sidecar, passing config dir as argv[2]
            let sidecar_command = app_handle
                .shell()
                .sidecar("server-sidecar")
                .expect("Failed to find sidecar binary");

            let (_rx, child) = sidecar_command
                .args([&config_dir_str])
                .spawn()
                .expect("Failed to spawn sidecar");

            let state: State<SidecarHandle> = app_handle.state();
            *state.0.lock().unwrap() = Some(child);

            // Poll port 3847 in background, then show the window once server is ready
            let app_handle2 = app_handle.clone();
            std::thread::spawn(move || {
                wait_for_server(30);
                if let Some(window) = app_handle2.get_webview_window("main") {
                    window.show().unwrap();
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            // Kill the sidecar when user closes the window
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();

                let state: State<SidecarHandle> = window.state();
                if let Ok(mut handle) = state.0.lock() {
                    if let Some(child) = handle.take() {
                        // Get PID for tree kill on Windows
                        let pid = child.pid();
                        let _ = child.kill();

                        // Also ensure all child processes are killed on Windows
                        #[cfg(target_os = "windows")]
                        {
                            use std::process::Command;
                            let _ = Command::new("taskkill")
                                .args(&["/F", "/T", "/PID", &pid.to_string()])
                                .output();
                        }
                    }
                }

                std::process::exit(0);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Poll 127.0.0.1:3847 every 200ms until it accepts connections or timeout.
fn wait_for_server(timeout_secs: u64) {
    use std::time::{Duration, Instant};
    let deadline = Instant::now() + Duration::from_secs(timeout_secs);
    loop {
        if Instant::now() > deadline {
            eprintln!("Timed out waiting for server on port 3847");
            break;
        }
        if std::net::TcpStream::connect("127.0.0.1:3847").is_ok() {
            break;
        }
        std::thread::sleep(Duration::from_millis(200));
    }
}
