import Foundation
import Testing
import AnalogKit

struct DayLayoutTests {
    let calendar: Calendar = {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!
        return calendar
    }()

    var day: Date { calendar.date(from: DateComponents(year: 2026, month: 11, day: 25))! }

    func event(_ id: String, _ startHour: Double, _ endHour: Double) -> CalendarEvent {
        CalendarEvent(
            id: id,
            calendarID: "work",
            title: id,
            start: day.addingTimeInterval(startHour * 3600),
            end: day.addingTimeInterval(endHour * 3600)
        )
    }

    func layout(_ events: [CalendarEvent]) -> [String: PositionedEvent] {
        let positioned = DayLayout.position(events, on: day, calendar: calendar)
        return Dictionary(uniqueKeysWithValues: positioned.map { ($0.event.id, $0) })
    }

    @Test func separateEventsTakeFullWidth() {
        let result = layout([event("a", 9, 10), event("b", 10, 11)])
        #expect(result["a"]?.column == 0)
        #expect(result["a"]?.columnCount == 1)
        #expect(result["b"]?.column == 0)
        #expect(result["b"]?.columnCount == 1)
    }

    @Test func overlappingEventsSplitColumns() {
        let result = layout([event("a", 9, 11), event("b", 10, 11)])
        #expect(result["a"]?.column == 0)
        #expect(result["b"]?.column == 1)
        #expect(result["a"]?.columnCount == 2)
        #expect(result["b"]?.columnCount == 2)
    }

    @Test func longerEventGoesFirstOnTie() {
        let result = layout([event("short", 9, 10), event("long", 9, 12)])
        #expect(result["long"]?.column == 0)
        #expect(result["short"]?.column == 1)
    }

    @Test func chainReusesFreedColumn() {
        let result = layout([event("a", 9, 10), event("b", 9.5, 11), event("c", 10, 11)])
        #expect(result["a"]?.column == 0)
        #expect(result["b"]?.column == 1)
        #expect(result["c"]?.column == 0)
        #expect(result.values.allSatisfy { $0.columnCount == 2 })
    }

    @Test func clampsEventsCrossingMidnight() {
        let result = layout([event("late", 23, 26), event("early", -2, 1)])
        #expect(result["late"]?.startMinute == 23 * 60)
        #expect(result["late"]?.endMinute == DayLayout.minutesInDay)
        #expect(result["early"]?.startMinute == 0)
        #expect(result["early"]?.endMinute == 60)
    }

    @Test func ignoresAllDayAndOtherDays() {
        var allDay = event("all", 0, 24)
        allDay.isAllDay = true
        let result = layout([allDay, event("tomorrow", 25, 26)])
        #expect(result.isEmpty)
    }

    @Test(arguments: [(2026, 3, 8), (2026, 11, 1)])
    func daylightSavingDaysUseWallClockMinutes(year: Int, month: Int, day: Int) {
        var newYork = Calendar(identifier: .gregorian)
        newYork.timeZone = TimeZone(identifier: "America/New_York")!
        let nineAM = newYork.date(from: DateComponents(year: year, month: month, day: day, hour: 9))!
        let halfPastEleven = newYork.date(from: DateComponents(year: year, month: month, day: day, hour: 23, minute: 30))!
        let events = [
            CalendarEvent(id: "morning", calendarID: "work", title: "morning", start: nineAM, end: nineAM.addingTimeInterval(3600)),
            CalendarEvent(id: "late", calendarID: "work", title: "late", start: halfPastEleven, end: halfPastEleven.addingTimeInterval(7200)),
        ]
        let positioned = DayLayout.position(events, on: nineAM, calendar: newYork)
        let result = Dictionary(uniqueKeysWithValues: positioned.map { ($0.event.id, $0) })
        #expect(result["morning"]?.startMinute == 9 * 60)
        #expect(result["late"]?.startMinute == 23 * 60 + 30)
        #expect(result["late"]?.endMinute == DayLayout.minutesInDay)
    }
}
