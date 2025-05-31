# Analog Desktop App

A native desktop application for Analog Calendar built with Tauri and Rust.

## Features

### ✅ Completed Features

- **Native Desktop Application**: Built with Tauri for native performance and system integration
- **Hybrid Authentication**: Desktop-compatible OAuth flow that works with Google Calendar
- **Global Keyboard Shortcuts**: macOS system-wide shortcuts for quick access
  - `Cmd+Shift+C`: Show/Hide Calendar Window
  - `Cmd+Shift+N`: Create New Event
  - `Cmd+Shift+T`: Show Today's Events
  - `Cmd+Shift+W`: Switch to Week View
  - `Cmd+Shift+M`: Switch to Month View
  - `Cmd+Shift+D`: Switch to Day View
- **Frontend Integration**: Next.js frontend adapted for desktop with Tauri provider
- **Cross-Platform Support**: Configured for macOS with extensible architecture for other platforms

### 🚧 In Development Features

- **System Menu Integration**: Native macOS menu bar integration (placeholder implemented)
- **System Tray**: Quick access from system tray (placeholder implemented)
- **Native Notifications**: Desktop notification system (placeholder implemented)
- **Local Database**: SQLite database for offline calendar data (placeholder implemented)

## Architecture

### Backend (Rust/Tauri)

```
src-tauri/
├── src/
│   ├── lib.rs              # Main application setup
│   ├── main.rs             # Entry point
│   ├── auth.rs             # Desktop authentication handling
│   ├── calendar.rs         # Calendar operations and API integration
│   ├── shortcuts.rs        # Global keyboard shortcuts
│   ├── menu.rs             # Native menu integration (placeholder)
│   ├── tray.rs             # System tray integration (placeholder)
│   ├── notifications.rs    # Desktop notifications (placeholder)
│   └── database.rs         # Local database operations (placeholder)
├── Cargo.toml              # Rust dependencies
├── tauri.conf.json         # Tauri configuration
└── capabilities/           # Security capabilities
```

### Frontend Integration

```
apps/web/src/
├── lib/tauri/              # Tauri API wrapper
├── providers/              # Tauri context provider
├── components/auth/        # Hybrid authentication components
└── lib/hotkeys/            # Desktop keyboard shortcut integration
```

## Development

### Prerequisites

- Rust (1.77.2+)
- Bun package manager
- macOS (for macOS-specific features)

### Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start development server:**
   ```bash
   bun run tauri:dev
   ```

### Build Scripts

- `bun run tauri:dev` - Start development server with hot reload
- `bun run tauri:build` - Build production desktop app
- `bun run tauri:check` - Check Rust code compilation

## Configuration

### Tauri Configuration

Key settings in `src-tauri/tauri.conf.json`:

- **Window Settings**: 1400x900 minimum size, overlay title bar on macOS
- **Bundle Settings**: App identifier `com.analog.calendar`
- **Security**: Configured for calendar app requirements
- **Plugins**: Global shortcuts, notifications, HTTP, shell access

### Environment Variables

For desktop builds, server-side environment variables are not required as the app uses desktop authentication flow.

## Global Shortcuts

The desktop app registers system-wide keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+C` | Show/Hide Calendar Window |
| `Cmd+Shift+N` | Create New Event |
| `Cmd+Shift+T` | Go to Today |
| `Cmd+Shift+W` | Week View |
| `Cmd+Shift+M` | Month View |
| `Cmd+Shift+D` | Day View |

## Authentication

The desktop app uses a hybrid authentication system:

1. **Desktop Mode**: Opens system browser for OAuth, handles callback in Rust backend
2. **Web Fallback**: Falls back to web authentication when not in desktop environment
3. **Token Management**: Securely stores authentication tokens locally

## API Integration

### Tauri Commands

- **Authentication**: `open_auth_url`, `handle_auth_callback`, `get_auth_status`, `logout`
- **Calendar**: `get_calendar_events`, `create_calendar_event`, `update_calendar_event`, `delete_calendar_event`
- **Shortcuts**: `register_global_shortcuts`, `unregister_global_shortcuts`
- **Notifications**: `show_notification`, `schedule_event_reminder`
- **Database**: `get_user_data`, `save_user_data`, `get_calendars`, `save_calendar`

### Event System

The app uses Tauri's event system for real-time communication:

- `auth-success` / `auth-logout`: Authentication state changes
- `global-shortcut`: Global keyboard shortcut triggers
- `menu-action` / `tray-action`: Menu and tray interactions
- `calendar-event-*`: Calendar data changes
- `notification`: Desktop notifications

## Security

- **CSP**: Configured for calendar app requirements
- **API Scope**: Limited to required calendar and authentication APIs
- **Local Storage**: Secure token storage for offline access
- **Permissions**: Minimal required system permissions

## Deployment

### macOS

The app builds as a native macOS application with:

- Code signing support (configure in `tauri.conf.json`)
- DMG distribution
- App Store compatibility (with additional configuration)

### Future Platforms

The architecture supports extension to:

- Windows (Windows API integration needed)
- Linux (X11/Wayland shortcuts needed)

## Troubleshooting

### Development Issues

1. **Rust Compilation Errors**: Ensure Rust 1.77.2+ is installed
2. **Frontend Build Errors**: Check that Next.js static export is properly configured
3. **Global Shortcuts Not Working**: Verify macOS accessibility permissions

### Production Issues

1. **Authentication Failures**: Check OAuth configuration and callback URLs
2. **Missing Menu Items**: Verify menu API implementation for your Tauri version
3. **Notification Issues**: Check macOS notification permissions

## Contributing

When adding new features:

1. Add Rust commands in appropriate modules (`src-tauri/src/`)
2. Update Tauri configuration (`tauri.conf.json`)
3. Add TypeScript types and wrapper functions (`apps/web/src/lib/tauri/`)
4. Test on macOS development environment

## Roadmap

### Short Term
- Complete menu bar integration
- Implement system tray functionality
- Add native notifications
- Implement local database

### Long Term
- Windows support
- Linux support
- App Store distribution
- Advanced calendar features (recurring events, multiple calendars)
- Offline mode with sync