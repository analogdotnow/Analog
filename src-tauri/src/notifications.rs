use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Emitter};

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationRequest {
    pub title: String,
    pub body: String,
    pub icon: Option<String>,
    pub tag: Option<String>,
}

#[command]
pub async fn show_notification(
    notification: NotificationRequest,
    app: AppHandle,
) -> Result<String, String> {
    // Simplified notification - use system notifications when available
    log::info!(
        "Showing notification: {} - {}",
        notification.title,
        notification.body
    );

    // Emit to frontend for now
    app.emit("notification", &notification)
        .map_err(|e| format!("Failed to emit notification: {}", e))?;

    Ok("Notification shown".to_string())
}

#[command]
pub async fn schedule_event_reminder(
    event_id: String,
    event_title: String,
    reminder_minutes: u32,
    app: AppHandle,
) -> Result<String, String> {
    let reminder_time = chrono::Utc::now() + chrono::Duration::minutes(reminder_minutes as i64);

    log::info!(
        "Scheduled reminder for event '{}' (ID: {}) in {} minutes",
        event_title,
        event_id,
        reminder_minutes
    );

    app.emit(
        "reminder-scheduled",
        serde_json::json!({
            "event_id": event_id,
            "event_title": event_title,
            "reminder_minutes": reminder_minutes,
            "reminder_time": reminder_time.to_rfc3339()
        }),
    )
    .map_err(|e| format!("Failed to emit reminder scheduled event: {}", e))?;

    Ok("Reminder scheduled successfully".to_string())
}

#[command]
pub async fn cancel_event_reminder(event_id: String, app: AppHandle) -> Result<String, String> {
    log::info!("Cancelled reminder for event ID: {}", event_id);

    app.emit(
        "reminder-cancelled",
        serde_json::json!({
            "event_id": event_id
        }),
    )
    .map_err(|e| format!("Failed to emit reminder cancelled event: {}", e))?;

    Ok("Reminder cancelled successfully".to_string())
}
