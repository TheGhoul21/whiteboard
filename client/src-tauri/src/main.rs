// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct PresentationWindowConfig {
    always_on_top: bool,
    background_color: String,
    fullscreen: bool,
}

#[tauri::command]
async fn open_presentation_window(
    app_handle: tauri::AppHandle,
    config: PresentationWindowConfig,
) -> Result<(), String> {
    // Check if presentation window already exists
    if let Some(_window) = app_handle.get_webview_window("presentation") {
        return Err("Presentation window already open".to_string());
    }

    // Create presentation window URL with query parameter
    let url = WebviewUrl::App("index.html?mode=presentation".into());

    // Build the presentation window
    // In debug mode, use decorations to make it easier to debug
    #[cfg(debug_assertions)]
    let window = WebviewWindowBuilder::new(
        &app_handle,
        "presentation",
        url,
    )
    .title("Whiteboard - Presentation")
    .inner_size(1920.0, 1080.0)
    .resizable(true)
    .decorations(true) // Show title bar in debug mode
    .always_on_top(config.always_on_top)
    .fullscreen(config.fullscreen)
    .build()
    .map_err(|e| e.to_string())?;

    // In release mode, use frameless window
    #[cfg(not(debug_assertions))]
    let window = WebviewWindowBuilder::new(
        &app_handle,
        "presentation",
        url,
    )
    .title("Whiteboard - Presentation")
    .inner_size(1920.0, 1080.0)
    .resizable(true)
    .decorations(false) // Frameless window in release
    .always_on_top(config.always_on_top)
    .fullscreen(config.fullscreen)
    .build()
    .map_err(|e| e.to_string())?;

    // Dev tools available but not auto-opened (use right-click -> Inspect)
    let _ = window;

    Ok(())
}

#[tauri::command]
async fn close_presentation_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("presentation") {
        window.close().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Presentation window not found".to_string())
    }
}

#[tauri::command]
async fn update_presentation_window(
    app_handle: tauri::AppHandle,
    config: PresentationWindowConfig,
) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("presentation") {
        window.set_always_on_top(config.always_on_top)
            .map_err(|e| e.to_string())?;
        window.set_fullscreen(config.fullscreen)
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Presentation window not found".to_string())
    }
}

#[tauri::command]
fn is_presentation_window_open(app_handle: tauri::AppHandle) -> bool {
    app_handle.get_webview_window("presentation").is_some()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            open_presentation_window,
            close_presentation_window,
            update_presentation_window,
            is_presentation_window_open
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
