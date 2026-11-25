import SwiftUI

enum SettingsKey {
    static let weekStart = "weekStart"
    static let showsWeekNumbers = "showsWeekNumbers"
    static let uses24HourTime = "uses24HourTime"
}

enum SettingsDefault {
    static let weekStart = Locale.current.calendar.firstWeekday
    static let showsWeekNumbers = true
    static let uses24HourTime: Bool = {
        switch Locale.current.hourCycle {
        case .zeroToTwentyThree, .oneToTwentyFour: true
        default: false
        }
    }()
}

enum TimeFormat {
    static func hour(_ hour: Int, uses24HourTime: Bool) -> String {
        if uses24HourTime {
            return String(format: "%02d:00", hour)
        }
        let period = hour < 12 ? Calendar.current.amSymbol : Calendar.current.pmSymbol
        let twelveHour = hour % 12 == 0 ? 12 : hour % 12
        return "\(twelveHour) \(period)"
    }

    static func time(_ date: Date, uses24HourTime: Bool) -> String {
        if uses24HourTime {
            date.formatted(verbatim("\(hour: .twoDigits(clock: .twentyFourHour, hourCycle: .zeroBased)):\(minute: .twoDigits)"))
        } else {
            date.formatted(verbatim("\(hour: .defaultDigits(clock: .twelveHour, hourCycle: .oneBased)):\(minute: .twoDigits) \(dayPeriod: .standard(.abbreviated))"))
        }
    }

    private static func verbatim(_ format: Date.FormatString) -> Date.VerbatimFormatStyle {
        Date.VerbatimFormatStyle(format: format, locale: .current, timeZone: .current, calendar: .current)
    }
}

struct CalendarSettingsForm: View {
    @AppStorage(SettingsKey.weekStart) private var weekStart = SettingsDefault.weekStart
    @AppStorage(SettingsKey.showsWeekNumbers) private var showsWeekNumbers = SettingsDefault.showsWeekNumbers
    @AppStorage(SettingsKey.uses24HourTime) private var uses24HourTime = SettingsDefault.uses24HourTime

    var body: some View {
        Form {
            Section("Calendar") {
                Picker("Week starts on", selection: $weekStart) {
                    ForEach(Array(Calendar.current.standaloneWeekdaySymbols.enumerated()), id: \.offset) { index, name in
                        Text(name).tag(index + 1)
                    }
                }
                Toggle("Show week numbers", isOn: $showsWeekNumbers)
                Toggle("24-hour time", isOn: $uses24HourTime)
            }
        }
        #if os(macOS)
        .formStyle(.grouped)
        .frame(width: 420)
        .fixedSize(horizontal: false, vertical: true)
        #endif
    }
}

#if os(iOS)
struct SettingsSheet: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            CalendarSettingsForm()
                .navigationTitle("Settings")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") { dismiss() }
                    }
                }
        }
    }
}
#endif

struct SettingsSync: ViewModifier {
    @Environment(CalendarModel.self) private var model
    @AppStorage(SettingsKey.weekStart) private var weekStart = SettingsDefault.weekStart

    func body(content: Content) -> some View {
        content.onChange(of: weekStart, initial: true) {
            model.calendar.firstWeekday = weekStart
        }
    }
}
