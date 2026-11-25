import Foundation

public enum SampleCalendar {
    public static let sources: [CalendarSource] = [
        CalendarSource(id: "work", name: "Work", color: SRGBColor(hex: 0x3B82F6)),
        CalendarSource(id: "personal", name: "Personal", color: SRGBColor(hex: 0x22C55E)),
        CalendarSource(id: "family", name: "Family", color: SRGBColor(hex: 0xF97316)),
        CalendarSource(id: "fitness", name: "Fitness", color: SRGBColor(hex: 0xA855F7)),
    ]

    private struct Template {
        let day: Int
        let calendarID: String
        let title: String
        let start: (hour: Int, minute: Int)
        let minutes: Int
        var location: String? = nil
    }

    private static let templates: [Template] = [
        Template(day: 0, calendarID: "fitness", title: "Morning run", start: (7, 0), minutes: 45),
        Template(day: 0, calendarID: "work", title: "Weekly planning", start: (9, 30), minutes: 60, location: "Room 4"),
        Template(day: 0, calendarID: "work", title: "Design review", start: (10, 0), minutes: 90),
        Template(day: 0, calendarID: "personal", title: "Lunch with Aida", start: (12, 30), minutes: 60, location: "Köfe"),
        Template(day: 1, calendarID: "work", title: "Standup", start: (9, 0), minutes: 30),
        Template(day: 1, calendarID: "work", title: "Focus block", start: (10, 0), minutes: 180),
        Template(day: 1, calendarID: "family", title: "School pickup", start: (16, 0), minutes: 30),
        Template(day: 2, calendarID: "work", title: "Standup", start: (9, 0), minutes: 30),
        Template(day: 2, calendarID: "work", title: "Interview", start: (11, 0), minutes: 60),
        Template(day: 2, calendarID: "work", title: "Roadmap sync", start: (11, 30), minutes: 60),
        Template(day: 2, calendarID: "personal", title: "Dentist", start: (12, 0), minutes: 60, location: "OralSmart"),
        Template(day: 2, calendarID: "fitness", title: "Yoga", start: (18, 30), minutes: 60),
        Template(day: 3, calendarID: "work", title: "Standup", start: (9, 0), minutes: 30),
        Template(day: 3, calendarID: "work", title: "Customer call", start: (14, 0), minutes: 45),
        Template(day: 3, calendarID: "family", title: "Dinner at mom's", start: (19, 0), minutes: 120),
        Template(day: 4, calendarID: "work", title: "Demo day", start: (13, 0), minutes: 120),
        Template(day: 4, calendarID: "personal", title: "Haircut", start: (17, 30), minutes: 30),
        Template(day: 5, calendarID: "fitness", title: "Long ride", start: (8, 0), minutes: 150),
        Template(day: 5, calendarID: "family", title: "Farmers market", start: (11, 0), minutes: 90),
        Template(day: 6, calendarID: "personal", title: "Reading", start: (10, 0), minutes: 60),
    ]

    public static func events(around now: Date, calendar: Calendar) -> [CalendarEvent] {
        guard let weekStart = calendar.dateInterval(of: .weekOfYear, for: now)?.start else { return [] }

        var events = templates.enumerated().compactMap { index, template -> CalendarEvent? in
            guard
                let day = calendar.date(byAdding: .day, value: template.day, to: weekStart),
                let start = calendar.date(
                    bySettingHour: template.start.hour,
                    minute: template.start.minute,
                    second: 0,
                    of: day
                ),
                let end = calendar.date(byAdding: .minute, value: template.minutes, to: start)
            else { return nil }
            return CalendarEvent(
                id: "sample-\(index)",
                calendarID: template.calendarID,
                title: template.title,
                start: start,
                end: end,
                location: template.location
            )
        }

        if let start = calendar.date(byAdding: .day, value: 3, to: weekStart),
           let end = calendar.date(byAdding: .day, value: 2, to: start) {
            events.append(
                CalendarEvent(
                    id: "sample-offsite",
                    calendarID: "work",
                    title: "Team offsite",
                    start: start,
                    end: end,
                    isAllDay: true,
                    location: "Almaty"
                )
            )
        }

        return events
    }
}
