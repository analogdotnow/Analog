use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use tauri::{PhysicalPosition, PhysicalSize, WebviewWindow, Window};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WindowState {
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
}

impl WindowState {
    pub fn new(width: u32, height: u32, x: i32, y: i32) -> Self {
        Self {
            width,
            height,
            x,
            y,
        }
    }
}

// Debounced save state - shared across the application
lazy_static::lazy_static! {
    static ref PENDING_SAVE: Arc<Mutex<Option<(WindowState, Instant)>>> = Arc::new(Mutex::new(None));
    static ref SAVE_TASK_RUNNING: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
}

const DEBOUNCE_DURATION: Duration = Duration::from_millis(500);

fn get_state_file_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let mut path = dirs::config_dir().ok_or("Failed to get config directory")?;
    path.push("analog");
    path.push("window_state.json");
    Ok(path)
}

fn ensure_config_dir() -> Result<(), Box<dyn std::error::Error>> {
    let mut path = dirs::config_dir().ok_or("Failed to get config directory")?;
    path.push("analog");

    if !path.exists() {
        std::fs::create_dir_all(&path)?;
    }

    Ok(())
}

// Fast, non-blocking save that debounces frequent calls
pub fn save_window_state(window: &Window) -> Result<(), Box<dyn std::error::Error>> {
    let size = window.outer_size()?;
    let position = window.outer_position()?;
    let state = WindowState::new(size.width, size.height, position.x, position.y);

    // Update pending save with latest state
    {
        let mut pending = PENDING_SAVE.lock().unwrap();
        *pending = Some((state.clone(), Instant::now()));
    }

    // Start save task if not already running
    {
        let mut task_running = SAVE_TASK_RUNNING.lock().unwrap();
        if !*task_running {
            *task_running = true;
            thread::spawn(move || {
                debounced_save_task();
            });
        }
    }

    log::debug!("Queued window state save: {:?}", state);
    Ok(())
}

fn debounced_save_task() {
    loop {
        thread::sleep(DEBOUNCE_DURATION);

        let state_to_save = {
            let mut pending = PENDING_SAVE.lock().unwrap();
            if let Some((state, timestamp)) = pending.take() {
                // Check if enough time has passed since last update
                if timestamp.elapsed() >= DEBOUNCE_DURATION {
                    Some(state)
                } else {
                    // Put it back and wait more
                    *pending = Some((state, timestamp));
                    None
                }
            } else {
                None
            }
        };

        if let Some(state) = state_to_save {
            if let Err(e) = save_state_to_disk(&state) {
                log::error!("Failed to save window state: {}", e);
            } else {
                log::debug!("Debounced save completed: {:?}", state);
            }

            // Check if there are more pending saves
            let has_pending = {
                let pending = PENDING_SAVE.lock().unwrap();
                pending.is_some()
            };

            if !has_pending {
                // No more pending saves, exit task
                let mut task_running = SAVE_TASK_RUNNING.lock().unwrap();
                *task_running = false;
                break;
            }
        } else {
            // No state to save, exit task
            let mut task_running = SAVE_TASK_RUNNING.lock().unwrap();
            *task_running = false;
            break;
        }
    }
}

fn save_state_to_disk(state: &WindowState) -> Result<(), Box<dyn std::error::Error>> {
    ensure_config_dir()?;
    let state_path = get_state_file_path()?;
    let state_json = serde_json::to_string_pretty(state)?;
    std::fs::write(state_path, state_json)?;
    Ok(())
}

pub fn load_window_state() -> Option<WindowState> {
    match get_state_file_path() {
        Ok(state_path) => {
            if state_path.exists() {
                match std::fs::read_to_string(state_path) {
                    Ok(content) => match serde_json::from_str::<WindowState>(&content) {
                        Ok(state) => {
                            log::debug!("Loaded window state: {:?}", state);
                            Some(state)
                        }
                        Err(e) => {
                            log::warn!("Failed to parse window state: {}", e);
                            None
                        }
                    },
                    Err(e) => {
                        log::warn!("Failed to read window state file: {}", e);
                        None
                    }
                }
            } else {
                log::debug!("Window state file does not exist");
                None
            }
        }
        Err(e) => {
            log::warn!("Failed to get state file path: {}", e);
            None
        }
    }
}

pub fn restore_window_state(window: &WebviewWindow) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(state) = load_window_state() {
        // Set size
        let size = PhysicalSize::new(state.width, state.height);
        window.set_size(size)?;

        // Set position
        let position = PhysicalPosition::new(state.x, state.y);
        window.set_position(position)?;

        log::info!(
            "Restored window state: {}x{} at ({}, {})",
            state.width,
            state.height,
            state.x,
            state.y
        );
    } else {
        log::info!("No saved window state found, using default position and size");
    }

    Ok(())
}

// Immediate save for critical events like window close
pub fn save_window_state_immediate(window: &Window) -> Result<(), Box<dyn std::error::Error>> {
    let size = window.outer_size()?;
    let position = window.outer_position()?;
    let state = WindowState::new(size.width, size.height, position.x, position.y);

    // Ensure config dir exists
    let mut path = dirs::config_dir().ok_or("Failed to get config directory")?;
    path.push("analog");
    if !path.exists() {
        std::fs::create_dir_all(&path)?;
    }

    // Save immediately
    let state_path = get_state_file_path()?;
    let state_json = serde_json::to_string_pretty(&state)?;
    std::fs::write(state_path, state_json)?;

    log::debug!("Immediate save completed: {:?}", state);
    Ok(())
}
