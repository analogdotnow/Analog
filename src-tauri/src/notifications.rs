use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{command, AppHandle, Emitter};
use tokio::time::{sleep, Duration};

// Global storage for scheduled reminders
lazy_static::lazy_static! {
    static ref SCHEDULED_REMINDERS: Mutex<HashMap<String, tokio::task::JoinHandle<()>>> =
        Mutex::new(HashMap::new());
}

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
    use tauri_plugin_notification::NotificationExt;

    // Try to use native notification, fallback to frontend
    match app
        .notification()
        .builder()
        .title(&notification.title)
        .body(&notification.body)
        .show()
    {
        Ok(_) => {
            log::info!("Native notification shown: {}", notification.title);
            Ok("Native notification shown".to_string())
        }
        Err(_) => {
            // Fallback to frontend notification
            app.emit("notification", &notification)
                .map_err(|e| format!("Failed to emit notification: {}", e))?;
            Ok("Frontend notification shown".to_string())
        }
    }
}

#[command]
pub async fn schedule_event_reminder(
    event_id: String,
    event_title: String,
    reminder_minutes: u32,
    app: AppHandle,
) -> Result<String, String> {
    let reminder_time = chrono::Utc::now() + chrono::Duration::minutes(reminder_minutes as i64);
    let delay_duration = Duration::from_secs((reminder_minutes * 60) as u64);

    // Cancel existing reminder if any
    cancel_event_reminder(event_id.clone(), app.clone()).await?;

    let event_id_clone = event_id.clone();
    let event_title_clone = event_title.clone();
    let app_clone = app.clone();

    // Schedule the actual reminder
    let handle = tokio::spawn(async move {
        sleep(delay_duration).await;

        // Show the reminder notification
        let notification = NotificationRequest {
            title: "Event Reminder".to_string(),
            body: format!("Event starting: {}", event_title_clone),
            icon: None,
            tag: Some(event_id_clone.clone()),
        };

        if let Err(e) = show_notification(notification, app_clone.clone()).await {
            log::error!("Failed to show reminder notification: {}", e);
        }

        // Clean up from scheduled reminders
        if let Ok(mut reminders) = SCHEDULED_REMINDERS.lock() {
            reminders.remove(&event_id_clone);
        }
    });

    // Store the handle
    if let Ok(mut reminders) = SCHEDULED_REMINDERS.lock() {
        reminders.insert(event_id.clone(), handle);
    }

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
    // Cancel the scheduled task if it exists
    if let Ok(mut reminders) = SCHEDULED_REMINDERS.lock() {
        if let Some(handle) = reminders.remove(&event_id) {
            handle.abort();
            log::info!("Cancelled scheduled reminder for event ID: {}", event_id);
        }
    }

    app.emit(
        "reminder-cancelled",
        serde_json::json!({
            "event_id": event_id
        }),
    )
    .map_err(|e| format!("Failed to emit reminder cancelled event: {}", e))?;

    Ok("Reminder cancelled successfully".to_string())
}
