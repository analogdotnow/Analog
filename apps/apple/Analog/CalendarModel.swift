import AnalogKit
import Foundation
import Observation

enum ViewMode: String, CaseIterable, Identifiable {
    case day
    case threeDay
    case week
    case month

    static let macCases: [ViewMode] = [.day, .week, .month]

    var id: String { rawValue }

    var title: String {
        switch self {
        case .day: "Day"
        case .threeDay: "3 Day"
        case .week: "Week"
        case .month: "Month"
        }
    }
}

@Observable
final class CalendarModel {
    var anchor: Date
    #if os(iOS)
    var mode: ViewMode = .threeDay
    #else
    var mode: ViewMode = .week
    #endif
    var sources: [CalendarSource]
    var events: [CalendarEvent]
    var hiddenCalendarIDs: Set<String> = []
    var calendar: Calendar

    init(now: Date = .now, calendar: Calendar = .current) {
        self.calendar = calendar
        anchor = calendar.startOfDay(for: now)
        sources = SampleCalendar.sources
        events = SampleCalendar.events(around: now, calendar: calendar)
    }

    var visibleDays: [Date] {
        let start: Date
        let count: Int
        switch mode {
        case .day:
            start = anchor
            count = 1
        case .threeDay:
            start = anchor
            count = 3
        case .week, .month:
            start = calendar.dateInterval(of: .weekOfYear, for: anchor)?.start ?? anchor
            count = 7
        }
        return (0..<count).compactMap { calendar.date(byAdding: .day, value: $0, to: start) }
    }

    var monthDays: [Date] {
        guard
            let monthStart = calendar.dateInterval(of: .month, for: anchor)?.start,
            let gridStart = calendar.dateInterval(of: .weekOfYear, for: monthStart)?.start
        else { return [] }
        return (0..<42).compactMap { calendar.date(byAdding: .day, value: $0, to: gridStart) }
    }

    var monthTitle: String {
        anchor.formatted(.dateTime.month(.wide))
    }

    var monthYearTitle: String {
        anchor.formatted(.dateTime.month(.wide).year())
    }

    var yearTitle: String {
        anchor.formatted(.dateTime.year())
    }

    var weekNumberLabel: String {
        "W\(calendar.component(.weekOfYear, from: visibleDays.first ?? anchor))"
    }

    var visibleEvents: [CalendarEvent] {
        events.filter { !hiddenCalendarIDs.contains($0.calendarID) }
    }

    func timedEvents(on day: Date) -> [CalendarEvent] {
        visibleEvents.filter { !$0.isAllDay && intersects($0, day: day) }
    }

    func allDayEvents(on day: Date) -> [CalendarEvent] {
        visibleEvents.filter { $0.isAllDay && intersects($0, day: day) }
    }

    func events(on day: Date) -> [CalendarEvent] {
        visibleEvents
            .filter { intersects($0, day: day) }
            .sorted { ($0.isAllDay ? 0 : 1, $0.start) < ($1.isAllDay ? 0 : 1, $1.start) }
    }

    func color(for event: CalendarEvent) -> SRGBColor {
        sources.first { $0.id == event.calendarID }?.color ?? Tokens.mutedForeground.light
    }

    func isToday(_ day: Date) -> Bool {
        calendar.isDateInToday(day)
    }

    func isWeekend(_ day: Date) -> Bool {
        calendar.isDateInWeekend(day)
    }

    func move(by direction: Int) {
        let next: Date? = switch mode {
        case .day: calendar.date(byAdding: .day, value: direction, to: anchor)
        case .threeDay: calendar.date(byAdding: .day, value: 3 * direction, to: anchor)
        case .week: calendar.date(byAdding: .weekOfYear, value: direction, to: anchor)
        case .month: calendar.date(byAdding: .month, value: direction, to: anchor)
        }
        if let next {
            anchor = next
        }
    }

    func goToToday() {
        anchor = calendar.startOfDay(for: .now)
    }

    func toggle(_ source: CalendarSource) {
        if hiddenCalendarIDs.contains(source.id) {
            hiddenCalendarIDs.remove(source.id)
        } else {
            hiddenCalendarIDs.insert(source.id)
        }
    }

    private func intersects(_ event: CalendarEvent, day: Date) -> Bool {
        let start = calendar.startOfDay(for: day)
        guard let end = calendar.date(byAdding: .day, value: 1, to: start) else { return false }
        return event.start < end && event.end > start
    }
}
