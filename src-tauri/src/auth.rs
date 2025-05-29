use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Emitter};
use url::Url;

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
    pub message: String,
    pub data: Option<AuthData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthData {
    pub token: String,
    pub user_id: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthCallbackData {
    pub code: String,
    pub state: String,
}

#[command]
pub async fn open_auth_url(app: AppHandle) -> Result<String, String> {
    let base_url =
        std::env::var("AUTH_BASE_URL").unwrap_or_else(|_| "https://localhost:3000".to_string());
    let auth_url = format!("{}/api/auth/signin/google", base_url);

    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .open_url(&auth_url, None::<&str>)
        .map_err(|e| e.to_string())?;

    Ok("Auth URL opened successfully".to_string())
}

#[command]
pub async fn handle_auth_callback(
    callback_url: String,
    app: AppHandle,
) -> Result<AuthResponse, String> {
    // Parse the callback URL to extract auth code and state
    let url = Url::parse(&callback_url).map_err(|e| format!("Invalid URL: {}", e))?;

    let mut code = None;
    let mut state = None;

    for (key, value) in url.query_pairs() {
        match key.as_ref() {
            "code" => code = Some(value.to_string()),
            "state" => state = Some(value.to_string()),
            _ => {}
        }
    }

    let code = code.ok_or("Missing authorization code")?;
    let state = state.ok_or("Missing state parameter")?;

    // Exchange authorization code for tokens
    let base_url =
        std::env::var("AUTH_BASE_URL").unwrap_or_else(|_| "https://localhost:3000".to_string());
    let callback_endpoint = format!("{}/api/auth/callback/google", base_url);

    let client = reqwest::Client::new();
    let response = client
        .post(&callback_endpoint)
        .json(&serde_json::json!({
            "code": code,
            "state": state
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to exchange code for tokens: {}", e))?
        .error_for_status()
        .map_err(|e| format!("HTTP error: {}", e))?;

    let auth_response: AuthResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse auth response: {}", e))?;

    if auth_response.success {
        // Notify the frontend that authentication is complete
        app.emit("auth-success", &auth_response)
            .map_err(|e| format!("Failed to emit auth success event: {}", e))?;
    }

    Ok(auth_response)
}

#[command]
pub async fn get_auth_status() -> Result<bool, String> {
    // Check if user is authenticated by checking for stored tokens
    // This would typically check a local database or secure storage
    // For now, return false to indicate not authenticated
    Ok(false)
}

#[command]
pub async fn logout(app: AppHandle) -> Result<String, String> {
    // Clear stored authentication data
    // Emit logout event to frontend
    app.emit("auth-logout", ())
        .map_err(|e| format!("Failed to emit logout event: {}", e))?;

    Ok("Logout successful".to_string())
}
