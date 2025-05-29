use tauri::{AppHandle, Emitter, Manager};

use crate::constants::MAIN_WINDOW;

pub fn create_app_menu(_app: &AppHandle) -> Result<(), tauri::Error> {
    // Menu creation will be implemented when menu API is stable
    log::info!("App menu setup placeholder");
    Ok(())
}

#[allow(dead_code)]
pub fn handle_menu_event(app: &AppHandle, event: &str) {
    match event {
        "about" => {
            let _ = app.emit("menu-action", "about");
        }
        "quit" => {
            app.exit(0);
        }
        "hide" => {
            if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
                let _ = window.hide();
            }
        }
        "new_event" => {
            let _ = app.emit("menu-action", "new-event");
        }
        "day_view" => {
            let _ = app.emit("menu-action", "day-view");
        }
        "week_view" => {
            let _ = app.emit("menu-action", "week-view");
        }
        "month_view" => {
            let _ = app.emit("menu-action", "month-view");
        }
        "today" => {
            let _ = app.emit("menu-action", "today");
        }
        "refresh" => {
            let _ = app.emit("menu-action", "refresh");
        }
        "sync_calendars" => {
            let _ = app.emit("menu-action", "sync-calendars");
        }
        "minimize" => {
            if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
                let _ = window.minimize();
            }
        }
        "close" => {
            if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
                let _ = window.close();
            }
        }
        "website" => {
            #[cfg(target_os = "macos")]
            {
                use tauri_plugin_opener::OpenerExt;
                let _ = app.opener().open_url("https://analog.now", None::<&str>);
            }
        }
        _ => {
            log::info!("Unhandled menu event: {}", event);
        }
    }
}
