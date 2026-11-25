import AnalogKit
import SwiftUI

struct MonthGrid: View {
    @Environment(CalendarModel.self) private var model

    private let maxVisibleEvents = 3

    var body: some View {
        let days = model.monthDays
        let weeks = stride(from: 0, to: days.count, by: 7).map { Array(days[$0..<min($0 + 7, days.count)]) }

        VStack(spacing: 0) {
            HStack(spacing: 0) {
                ForEach(Array(days.prefix(7)), id: \.self) { day in
                    Text(day, format: .dateTime.weekday(.abbreviated))
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Palette.mutedForeground.opacity(0.7))
                        .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 32)
            ForEach(weeks, id: \.first) { week in
                HStack(spacing: 0) {
                    ForEach(week, id: \.self) { day in
                        cell(for: day)
                    }
                }
                .frame(maxHeight: .infinity)
                .overlay(alignment: .top) {
                    Rectangle().fill(Palette.border).frame(height: 1)
                }
            }
        }
    }

    private func cell(for day: Date) -> some View {
        let events = model.events(on: day)
        let isToday = model.isToday(day)
        let inMonth = model.calendar.isDate(day, equalTo: model.anchor, toGranularity: .month)

        return VStack(alignment: .leading, spacing: 2) {
            Text(day, format: .dateTime.day())
                .font(.system(size: 12, weight: .medium))
                .monospacedDigit()
                .foregroundStyle(
                    isToday ? Palette.background
                        : inMonth ? Palette.foreground : Palette.mutedForeground.opacity(0.5)
                )
                .frame(minWidth: 20, minHeight: 20)
                .background {
                    if isToday {
                        Circle().fill(Palette.foreground)
                    }
                }
                .padding(.bottom, 2)
            ForEach(events.prefix(maxVisibleEvents)) { event in
                EventPill(event: event, color: model.color(for: event))
            }
            if events.count > maxVisibleEvents {
                Text("+\(events.count - maxVisibleEvents)")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(Palette.mutedForeground)
                    .padding(.leading, 4)
            }
        }
        .padding(2)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(model.isWeekend(day) ? Palette.weekendColumn : .clear)
        .overlay(alignment: .leading) {
            Rectangle().fill(Palette.border).frame(width: 1)
        }
        .contentShape(Rectangle())
        .onTapGesture {
            model.anchor = day
            model.mode = .day
        }
    }
}
