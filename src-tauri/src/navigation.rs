use tauri::{AppHandle, command, Manager};

#[command]
pub async fn navigate_to_login(app: AppHandle) -> Result<String, String> {
    if let Some(window) = app.get_webview_window("main") {
        window.eval("window.location.href = '/login'")
            .map_err(|e| format!("Failed to navigate: {}", e))?;
        Ok("Navigated to login".to_string())
    } else {
        Err("Window not found".to_string())
    }
}

#[command]
pub async fn navigate_to_calendar(app: AppHandle) -> Result<String, String> {
    if let Some(window) = app.get_webview_window("main") {
        window.eval("window.location.href = '/calendar'")
            .map_err(|e| format!("Failed to navigate: {}", e))?;
        Ok("Navigated to calendar".to_string())
    } else {
        Err("Window not found".to_string())
    }
}

#[command]
pub async fn navigate_to_route(route: String, app: AppHandle) -> Result<String, String> {
    if let Some(window) = app.get_webview_window("main") {
        let script = format!("window.location.href = '{}'", route);
        window.eval(&script)
            .map_err(|e| format!("Failed to navigate: {}", e))?;
        Ok(format!("Navigated to {}", route))
    } else {
        Err("Window not found".to_string())
    }
}