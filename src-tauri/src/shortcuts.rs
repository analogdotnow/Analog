use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

#[derive(Debug, Serialize, Deserialize)]
pub struct ShortcutConfig {
    pub key: String,
    pub modifiers: Vec<String>,
    pub action: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ShortcutRegistration {
    pub shortcuts: Vec<ShortcutConfig>,
}

pub fn setup_global_shortcuts(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Register CMD+SHIFT+C to show/hide calendar
    let shortcut = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyC);
    app.global_shortcut().register(shortcut)?;

    // Register CMD+SHIFT+N for new event
    let shortcut_new = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyN);
    app.global_shortcut().register(shortcut_new)?;

    // Register CMD+SHIFT+T for today view
    let shortcut_today = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyT);
    app.global_shortcut().register(shortcut_today)?;

    // Register CMD+SHIFT+W for week view
    let shortcut_week = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyW);
    app.global_shortcut().register(shortcut_week)?;

    // Register CMD+SHIFT+M for month view
    let shortcut_month = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyM);
    app.global_shortcut().register(shortcut_month)?;

    // Register CMD+SHIFT+D for day view
    let shortcut_day = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyD);
    app.global_shortcut().register(shortcut_day)?;

    log::info!("Global shortcuts registered successfully");
    Ok(())
}

#[command]
pub async fn register_global_shortcuts(
    shortcuts: ShortcutRegistration,
    app: AppHandle,
) -> Result<String, String> {
    // Register custom shortcuts from frontend
    for shortcut_config in shortcuts.shortcuts {
        // Parse modifiers
        let mut modifiers = Modifiers::empty();
        for modifier in shortcut_config.modifiers {
            match modifier.as_str() {
                "cmd" | "super" => modifiers |= Modifiers::SUPER,
                "ctrl" | "control" => modifiers |= Modifiers::CONTROL,
                "alt" | "option" => modifiers |= Modifiers::ALT,
                "shift" => modifiers |= Modifiers::SHIFT,
                _ => continue,
            }
        }

        // Parse key code
        let code = match shortcut_config.key.to_lowercase().as_str() {
            "a" => Code::KeyA,
            "b" => Code::KeyB,
            "c" => Code::KeyC,
            "d" => Code::KeyD,
            "e" => Code::KeyE,
            "f" => Code::KeyF,
            "g" => Code::KeyG,
            "h" => Code::KeyH,
            "i" => Code::KeyI,
            "j" => Code::KeyJ,
            "k" => Code::KeyK,
            "l" => Code::KeyL,
            "m" => Code::KeyM,
            "n" => Code::KeyN,
            "o" => Code::KeyO,
            "p" => Code::KeyP,
            "q" => Code::KeyQ,
            "r" => Code::KeyR,
            "s" => Code::KeyS,
            "t" => Code::KeyT,
            "u" => Code::KeyU,
            "v" => Code::KeyV,
            "w" => Code::KeyW,
            "x" => Code::KeyX,
            "y" => Code::KeyY,
            "z" => Code::KeyZ,
            "1" => Code::Digit1,
            "2" => Code::Digit2,
            "3" => Code::Digit3,
            "4" => Code::Digit4,
            "5" => Code::Digit5,
            "6" => Code::Digit6,
            "7" => Code::Digit7,
            "8" => Code::Digit8,
            "9" => Code::Digit9,
            "0" => Code::Digit0,
            "space" => Code::Space,
            "enter" => Code::Enter,
            "escape" => Code::Escape,
            "tab" => Code::Tab,
            _ => continue,
        };

        let shortcut = Shortcut::new(Some(modifiers), code);

        app.global_shortcut()
            .register(shortcut)
            .map_err(|e| format!("Failed to register shortcut: {}", e))?;
    }

    Ok("Shortcuts registered successfully".to_string())
}

#[command]
pub async fn unregister_global_shortcuts(app: AppHandle) -> Result<String, String> {
    app.global_shortcut()
        .unregister_all()
        .map_err(|e| format!("Failed to unregister shortcuts: {}", e))?;

    Ok("All shortcuts unregistered".to_string())
}

#[command]
pub async fn get_registered_shortcuts() -> Result<Vec<ShortcutConfig>, String> {
    // Return the list of default shortcuts
    let shortcuts = vec![
        ShortcutConfig {
            key: "c".to_string(),
            modifiers: vec!["cmd".to_string(), "shift".to_string()],
            action: "toggle-window".to_string(),
            description: "Show/Hide Calendar Window".to_string(),
        },
        ShortcutConfig {
            key: "n".to_string(),
            modifiers: vec!["cmd".to_string(), "shift".to_string()],
            action: "new-event".to_string(),
            description: "Create New Event".to_string(),
        },
        ShortcutConfig {
            key: "t".to_string(),
            modifiers: vec!["cmd".to_string(), "shift".to_string()],
            action: "show-today".to_string(),
            description: "Show Today's Events".to_string(),
        },
        ShortcutConfig {
            key: "w".to_string(),
            modifiers: vec!["cmd".to_string(), "shift".to_string()],
            action: "week-view".to_string(),
            description: "Switch to Week View".to_string(),
        },
        ShortcutConfig {
            key: "m".to_string(),
            modifiers: vec!["cmd".to_string(), "shift".to_string()],
            action: "month-view".to_string(),
            description: "Switch to Month View".to_string(),
        },
        ShortcutConfig {
            key: "d".to_string(),
            modifiers: vec!["cmd".to_string(), "shift".to_string()],
            action: "day-view".to_string(),
            description: "Switch to Day View".to_string(),
        },
    ];

    Ok(shortcuts)
}
