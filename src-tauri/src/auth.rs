use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{command, AppHandle, Emitter, Window};
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
pub async fn start_oauth_server(window: Window) -> Result<u16, String> {
    use tauri_plugin_oauth::OauthConfig;

    let config = OauthConfig {
        ports: Some(vec![8080, 8081, 8082, 8083, 8084]),
        response: Some("Authentication successful! You can close this window.".into()),
    };

    tauri_plugin_oauth::start_with_config(config, move |url| {
        // Parse the OAuth callback URL and extract the authorization code
        if let Ok(parsed_url) = Url::parse(&url) {
            let query_pairs: HashMap<_, _> = parsed_url.query_pairs().collect();

            if let Some(code) = query_pairs.get("code") {
                let auth_data = AuthCallbackData {
                    code: code.to_string(),
                    state: query_pairs.get("state").unwrap_or(&"".into()).to_string(),
                };

                // Emit the auth code to the frontend for processing
                let _ = window.emit("oauth_callback", &auth_data);
            } else if let Some(error) = query_pairs.get("error") {
                let _ = window.emit("oauth_error", error.to_string());
            }
        }
    })
    .map_err(|err| err.to_string())
}

#[command]
pub async fn open_auth_url(app: AppHandle, port: u16) -> Result<String, String> {
    let client_id = std::env::var("GOOGLE_CLIENT_ID")
        .map_err(|_| "GOOGLE_CLIENT_ID environment variable not set")?;

    let redirect_uri = format!("http://localhost:{}/", port);

    let scopes = [
        "email",
        "profile",
        "openid",
        "https://mail.google.com/",
        "https://www.googleapis.com/auth/calendar",
    ]
    .join(" ");

    let auth_url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope={}&access_type=offline&prompt=select_account",
        client_id,
        redirect_uri,
        scopes
    );

    use tauri_plugin_opener::OpenerExt;
    app.opener()
        .open_url(&auth_url, None::<&str>)
        .map_err(|e| e.to_string())?;

    Ok("Auth URL opened successfully".to_string())
}

#[command]
pub async fn exchange_code_for_tokens(
    code: String,
    port: u16,
    app: AppHandle,
) -> Result<AuthResponse, String> {
    let client_id = std::env::var("GOOGLE_CLIENT_ID")
        .map_err(|_| "GOOGLE_CLIENT_ID environment variable not set")?;
    let client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
        .map_err(|_| "GOOGLE_CLIENT_SECRET environment variable not set")?;

    let redirect_uri = format!("http://localhost:{}/", port);

    let params = [
        ("client_id", client_id.as_str()),
        ("client_secret", client_secret.as_str()),
        ("code", code.as_str()),
        ("grant_type", "authorization_code"),
        ("redirect_uri", redirect_uri.as_str()),
    ];

    let client = reqwest::Client::new();
    let response = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let token_response: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

        // Get user info using the access token
        if let Some(access_token) = token_response.get("access_token").and_then(|v| v.as_str()) {
            let user_info_response = client
                .get("https://www.googleapis.com/oauth2/v2/userinfo")
                .bearer_auth(access_token)
                .send()
                .await
                .map_err(|e| e.to_string())?;

            if user_info_response.status().is_success() {
                let user_info: serde_json::Value =
                    user_info_response.json().await.map_err(|e| e.to_string())?;

                // Store the tokens (simplified - in production use secure storage)
                std::env::set_var("STORED_ACCESS_TOKEN", access_token);
                if let Some(refresh_token) =
                    token_response.get("refresh_token").and_then(|v| v.as_str())
                {
                    std::env::set_var("STORED_REFRESH_TOKEN", refresh_token);
                }

                let auth_response = AuthResponse {
                    success: true,
                    message: "Authentication successful".to_string(),
                    data: Some(AuthData {
                        token: access_token.to_string(),
                        user_id: user_info
                            .get("id")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string(),
                        email: user_info
                            .get("email")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string(),
                    }),
                };

                // Emit auth success event
                if let Err(e) = app.emit("auth-success", &auth_response) {
                    eprintln!("Failed to emit auth success event: {}", e);
                }

                return Ok(auth_response);
            }
        }
    }

    Err("Failed to exchange code for tokens".to_string())
}

#[command]
pub async fn get_auth_status() -> Result<bool, String> {
    // Check if user is authenticated by checking for stored tokens
    // This is a simplified implementation - in production you'd want secure storage
    match std::env::var("STORED_ACCESS_TOKEN") {
        Ok(token) => Ok(!token.is_empty()),
        Err(_) => Ok(false),
    }
}

#[command]
pub async fn logout(app: AppHandle) -> Result<String, String> {
    // Clear stored authentication data
    std::env::remove_var("STORED_ACCESS_TOKEN");
    std::env::remove_var("STORED_REFRESH_TOKEN");

    // Emit logout event to frontend
    app.emit("auth-logout", ())
        .map_err(|e| format!("Failed to emit logout event: {}", e))?;

    Ok("Logout successful".to_string())
}
