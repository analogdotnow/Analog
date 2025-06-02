use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Emitter};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CalendarEvent {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_time: String, // ISO 8601 datetime
    pub end_time: String,   // ISO 8601 datetime
    pub calendar_id: String,
    pub location: Option<String>,
    pub attendees: Vec<String>,
    pub all_day: bool,
    pub recurring: bool,
    pub reminder_minutes: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CalendarEventCreate {
    pub title: String,
    pub description: Option<String>,
    pub start_time: String,
    pub end_time: String,
    pub calendar_id: String,
    pub location: Option<String>,
    pub attendees: Vec<String>,
    pub all_day: bool,
    pub recurring: bool,
    pub reminder_minutes: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CalendarEventUpdate {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub start_time: Option<String>,
    pub end_time: Option<String>,
    pub location: Option<String>,
    pub attendees: Option<Vec<String>>,
    pub all_day: Option<bool>,
    pub recurring: Option<bool>,
    pub reminder_minutes: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CalendarEventFilter {
    pub start_date: String,
    pub end_date: String,
    pub calendar_ids: Option<Vec<String>>,
}

#[command]
pub async fn get_calendar_events(
    filter: CalendarEventFilter,
    _app: AppHandle,
) -> Result<Vec<CalendarEvent>, String> {
    // In a real implementation, this would fetch events from Google Calendar API
    // For now, return mock data for development

    let mock_events = vec![
        CalendarEvent {
            id: "event_1".to_string(),
            title: "Team Standup".to_string(),
            description: Some("Daily team standup meeting".to_string()),
            start_time: "2025-05-29T09:00:00Z".to_string(),
            end_time: "2025-05-29T09:30:00Z".to_string(),
            calendar_id: "primary".to_string(),
            location: Some("Conference Room A".to_string()),
            attendees: vec!["team@company.com".to_string()],
            all_day: false,
            recurring: true,
            reminder_minutes: Some(15),
        },
        CalendarEvent {
            id: "event_2".to_string(),
            title: "Project Review".to_string(),
            description: Some("Quarterly project review".to_string()),
            start_time: "2025-05-29T14:00:00Z".to_string(),
            end_time: "2025-05-29T15:30:00Z".to_string(),
            calendar_id: "primary".to_string(),
            location: None,
            attendees: vec![],
            all_day: false,
            recurring: false,
            reminder_minutes: Some(30),
        },
    ];

    // Filter events based on date range
    let start_filter = DateTime::parse_from_rfc3339(&filter.start_date)
        .map_err(|e| format!("Invalid start_date format: {}", e))?;
    let end_filter = DateTime::parse_from_rfc3339(&filter.end_date)
        .map_err(|e| format!("Invalid end_date format: {}", e))?;

    let filtered_events: Vec<CalendarEvent> = mock_events
        .into_iter()
        .filter(|event| {
            if let Ok(event_start) = DateTime::parse_from_rfc3339(&event.start_time) {
                event_start >= start_filter && event_start <= end_filter
            } else {
                false
            }
        })
        .collect();

    Ok(filtered_events)
}

#[command]
pub async fn create_calendar_event(
    event_data: CalendarEventCreate,
    app: AppHandle,
) -> Result<CalendarEvent, String> {
    // In a real implementation, this would create an event via Google Calendar API

    let new_event = CalendarEvent {
        id: format!("event_{}", Utc::now().timestamp()),
        title: event_data.title,
        description: event_data.description,
        start_time: event_data.start_time,
        end_time: event_data.end_time,
        calendar_id: event_data.calendar_id,
        location: event_data.location,
        attendees: event_data.attendees,
        all_day: event_data.all_day,
        recurring: event_data.recurring,
        reminder_minutes: event_data.reminder_minutes,
    };

    // Emit event to frontend
    app.emit("calendar-event-created", &new_event)
        .map_err(|e| format!("Failed to emit event created: {}", e))?;

    Ok(new_event)
}

#[command]
pub async fn update_calendar_event(
    event_update: CalendarEventUpdate,
    app: AppHandle,
) -> Result<CalendarEvent, String> {
    // In a real implementation, this would update an event via Google Calendar API

    // Mock updated event
    let updated_event = CalendarEvent {
        id: event_update.id.clone(),
        title: event_update.title.unwrap_or("Updated Event".to_string()),
        description: event_update.description,
        start_time: event_update
            .start_time
            .unwrap_or("2025-05-29T10:00:00Z".to_string()),
        end_time: event_update
            .end_time
            .unwrap_or("2025-05-29T11:00:00Z".to_string()),
        calendar_id: "primary".to_string(),
        location: event_update.location,
        attendees: event_update.attendees.unwrap_or_default(),
        all_day: event_update.all_day.unwrap_or(false),
        recurring: event_update.recurring.unwrap_or(false),
        reminder_minutes: event_update.reminder_minutes,
    };

    // Emit event to frontend
    app.emit("calendar-event-updated", &updated_event)
        .map_err(|e| format!("Failed to emit event updated: {}", e))?;

    Ok(updated_event)
}

#[command]
pub async fn delete_calendar_event(event_id: String, app: AppHandle) -> Result<String, String> {
    // In a real implementation, this would delete an event via Google Calendar API

    // Emit event to frontend
    app.emit("calendar-event-deleted", event_id.clone())
        .map_err(|e| format!("Failed to emit event deleted: {}", e))?;

    Ok(format!("Event {} deleted successfully", event_id))
}

#[command]
pub async fn sync_calendars(app: AppHandle) -> Result<String, String> {
    // Sync with Google Calendar API
    // This would fetch all calendars and events from Google Calendar

    app.emit("calendar-sync-started", ())
        .map_err(|e| format!("Failed to emit sync started: {}", e))?;

    // Simulate sync delay
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

    app.emit("calendar-sync-completed", ())
        .map_err(|e| format!("Failed to emit sync completed: {}", e))?;

    Ok("Calendar sync completed".to_string())
}
