import Foundation

public struct PositionedEvent: Sendable {
    public let event: CalendarEvent
    public let startMinute: Int
    public let endMinute: Int
    public let column: Int
    public let columnCount: Int
}

public enum DayLayout {
    public static let minutesInDay = 24 * 60

    public static func position(
        _ events: [CalendarEvent],
        on day: Date,
        calendar: Calendar
    ) -> [PositionedEvent] {
        let dayStart = calendar.startOfDay(for: day)
        guard let dayEnd = calendar.date(byAdding: .day, value: 1, to: dayStart) else { return [] }

        let spans = events
            .filter { !$0.isAllDay && $0.start < dayEnd && $0.end > dayStart }
            .map { event in
                let start = event.start <= dayStart ? 0 : minuteOfDay(event.start, calendar: calendar)
                let end = event.end >= dayEnd ? minutesInDay : minuteOfDay(event.end, calendar: calendar)
                return (event: event, start: start, end: max(end, start + 1))
            }
            .sorted { lhs, rhs in
                if lhs.start != rhs.start { return lhs.start < rhs.start }
                return lhs.end - lhs.start > rhs.end - rhs.start
            }

        var result: [PositionedEvent] = []
        var cluster: [(event: CalendarEvent, start: Int, end: Int, column: Int)] = []
        var columnEnds: [Int] = []
        var clusterEnd = Int.min

        func flushCluster() {
            let count = columnEnds.count
            result += cluster.map {
                PositionedEvent(
                    event: $0.event,
                    startMinute: $0.start,
                    endMinute: $0.end,
                    column: $0.column,
                    columnCount: count
                )
            }
            cluster = []
            columnEnds = []
        }

        for span in spans {
            if span.start >= clusterEnd {
                flushCluster()
            }
            let column = columnEnds.firstIndex { $0 <= span.start } ?? columnEnds.count
            if column == columnEnds.count {
                columnEnds.append(span.end)
            } else {
                columnEnds[column] = span.end
            }
            cluster.append((span.event, span.start, span.end, column))
            clusterEnd = max(clusterEnd, span.end)
        }
        flushCluster()

        return result
    }

    public static func minuteOfDay(_ date: Date, calendar: Calendar) -> Int {
        let components = calendar.dateComponents([.hour, .minute], from: date)
        return (components.hour ?? 0) * 60 + (components.minute ?? 0)
    }
}
