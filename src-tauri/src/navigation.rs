use tauri::{command, AppHandle, Manager, Url};

use crate::constants::MAIN_WINDOW;

#[command]
pub async fn navigate_to_login(app: AppHandle) -> Result<String, String> {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let url = Url::parse("http://localhost:3000/login")
            .map_err(|e| format!("Invalid URL: {}", e))?;
        window
            .navigate(url)
            .map_err(|e| format!("Failed to navigate: {}", e))?;
        Ok("Navigated to login".to_string())
    } else {
        Err("Window not found".to_string())
    }
}

#[command]
pub async fn navigate_to_calendar(app: AppHandle) -> Result<String, String> {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let url = Url::parse("http://localhost:3000/calendar")
            .map_err(|e| format!("Invalid URL: {}", e))?;
        window
            .navigate(url)
            .map_err(|e| format!("Failed to navigate: {}", e))?;
        Ok("Navigated to calendar".to_string())
    } else {
        Err("Window not found".to_string())
    }
}

#[command]
pub async fn navigate_to_route(route: String, app: AppHandle) -> Result<String, String> {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW) {
        let base_url = "http://localhost:3000";
        let full_url = if route.starts_with('/') {
            format!("{}{}", base_url, route)
        } else {
            format!("{}/{}", base_url, route)
        };
        
        let url = Url::parse(&full_url)
            .map_err(|e| format!("Invalid URL: {}", e))?;
        window
            .navigate(url)
            .map_err(|e| format!("Failed to navigate: {}", e))?;
        Ok(format!("Navigated to {}", route))
    } else {
        Err("Window not found".to_string())
    }
}
