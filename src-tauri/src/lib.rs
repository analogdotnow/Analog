use tauri::Manager;

mod auth;
mod calendar;
mod constants;
mod database;
mod menu;
mod navigation;
mod notifications;
mod shortcuts;
mod tray;
mod window_state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            auth::open_auth_url,
            auth::handle_auth_callback,
            auth::get_auth_status,
            auth::logout,
            calendar::get_calendar_events,
            calendar::create_calendar_event,
            calendar::update_calendar_event,
            calendar::delete_calendar_event,
            calendar::sync_calendars,
            shortcuts::register_global_shortcuts,
            shortcuts::unregister_global_shortcuts,
            shortcuts::get_registered_shortcuts,
            notifications::show_notification,
            notifications::schedule_event_reminder,
            notifications::cancel_event_reminder,
            navigation::navigate_to_login,
            navigation::navigate_to_calendar,
            navigation::navigate_to_route
        ])
        .setup(|app| {
            // Register global shortcuts for macOS
            if cfg!(target_os = "macos") {
                shortcuts::setup_global_shortcuts(app.handle())?;
            }

            // Set up menu (placeholder)
            #[cfg(target_os = "macos")]
            {
                menu::create_app_menu(app.handle())?;
            }

            // Set up system tray (placeholder)
            tray::create_system_tray(app.handle())?;

            // Set up window properties for macOS and restore window state
            if let Some(window) = app.get_webview_window(constants::MAIN_WINDOW) {
                #[cfg(target_os = "macos")]
                {
                    if let Err(e) = window.set_title_bar_style(tauri::TitleBarStyle::Overlay) {
                        log::error!("Failed to set title bar style: {}", e);
                    }
                }

                // Restore window state
                if let Err(e) = window_state::restore_window_state(&window) {
                    log::error!("Failed to restore window state: {}", e);
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            // Handle window events
            match event {
                tauri::WindowEvent::Focused(focused) => {
                    let app_handle = window.app_handle();
                    tray::update_tray_menu_visibility(app_handle.clone(), *focused);
                }
                tauri::WindowEvent::Resized(_) | tauri::WindowEvent::Moved(_) => {
                    // Save window state when window is resized or moved
                    if let Err(e) = window_state::save_window_state(window) {
                        log::error!("Failed to save window state: {}", e);
                    }
                }
                tauri::WindowEvent::CloseRequested { .. } => {
                    // Save window state immediately when window is closed
                    if let Err(e) = window_state::save_window_state_immediate(window) {
                        log::error!("Failed to save window state on close: {}", e);
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
