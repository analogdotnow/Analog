import SwiftUI

@main
struct AnalogApp: App {
    @State private var model = CalendarModel()

    var body: some Scene {
        WindowGroup {
            Group {
                #if os(iOS)
                PhoneCalendarView()
                #else
                MacCalendarView()
                #endif
            }
            .modifier(SettingsSync())
            .environment(model)
        }
        #if os(macOS)
        .commands { CalendarCommands(model: model) }
        #endif

        #if os(macOS)
        Settings {
            CalendarSettingsForm()
        }
        #endif
    }
}
