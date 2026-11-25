import AnalogKit
import SwiftUI

enum GridMetrics {
    #if os(iOS)
    static let gutterWidth: CGFloat = 44
    static let hourHeight: CGFloat = 56
    #else
    static let gutterWidth: CGFloat = 56
    static let hourHeight: CGFloat = 48
    #endif
    static let dayHeight = hourHeight * 24
    static let initialHour = 7
}

struct WeekGrid: View {
    @Environment(CalendarModel.self) private var model
    let days: [Date]

    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 0) {
                DayHeaderRow(days: days)
                AllDayRow(days: days)
            }
            .overlay(alignment: .bottom) {
                Rectangle().fill(Palette.border).frame(height: 1)
            }
            ScrollViewReader { proxy in
                ScrollView(.vertical) {
                    HStack(alignment: .top, spacing: 0) {
                        TimeGutter(showsNow: days.contains(where: model.isToday))
                        ForEach(days, id: \.self) { day in
                            DayColumn(day: day)
                        }
                    }
                    .frame(height: GridMetrics.dayHeight)
                    .background(alignment: .top) { HourLines() }
                    .padding(.vertical, 8)
                }
                .onAppear { proxy.scrollTo(GridMetrics.initialHour, anchor: .top) }
            }
        }
    }
}

struct DayHeaderRow: View {
    @Environment(CalendarModel.self) private var model
    @AppStorage(SettingsKey.showsWeekNumbers) private var showsWeekNumbers = SettingsDefault.showsWeekNumbers
    let days: [Date]

    var body: some View {
        HStack(spacing: 0) {
            Text(showsWeekNumbers ? model.weekNumberLabel : "")
                .font(.system(size: 11, weight: .medium))
                .monospacedDigit()
                .foregroundStyle(Palette.mutedForeground.opacity(0.7))
                .padding(.trailing, 6)
                .frame(width: GridMetrics.gutterWidth, alignment: .trailing)
            ForEach(days, id: \.self) { day in
                DayHeader(day: day, isToday: model.isToday(day))
                    .frame(maxWidth: .infinity)
            }
        }
        .frame(height: 36)
    }
}

struct DayHeader: View {
    let day: Date
    let isToday: Bool

    var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 4) {
                Text(day, format: .dateTime.weekday(.abbreviated))
                dayNumber
            }
            VStack(spacing: 1) {
                Text(day, format: .dateTime.weekday(.narrow))
                    .font(.system(size: 10, weight: .medium))
                dayNumber
            }
        }
        .font(.system(size: 13, weight: .medium))
        .foregroundStyle(isToday ? Palette.foreground : Palette.mutedForeground.opacity(0.7))
        .lineLimit(1)
    }

    private var dayNumber: some View {
        Text(day, format: .dateTime.day())
            .monospacedDigit()
            .padding(.horizontal, isToday ? 6 : 0)
            .padding(.vertical, isToday ? 1 : 0)
            .foregroundStyle(isToday ? Palette.background : Palette.mutedForeground.opacity(0.7))
            .background {
                if isToday {
                    Capsule().fill(Palette.foreground)
                }
            }
            .fixedSize()
    }
}

struct AllDayRow: View {
    @Environment(CalendarModel.self) private var model
    let days: [Date]

    var body: some View {
        let eventsByDay = days.map(model.allDayEvents(on:))
        if eventsByDay.contains(where: { !$0.isEmpty }) {
            HStack(alignment: .top, spacing: 0) {
                Text("all-day")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(Palette.mutedForeground.opacity(0.7))
                    .frame(width: GridMetrics.gutterWidth - 6, alignment: .trailing)
                    .padding(.trailing, 6)
                    .padding(.top, 4)
                ForEach(Array(zip(days, eventsByDay)), id: \.0) { _, events in
                    VStack(spacing: 2) {
                        ForEach(events) { event in
                            EventChip(event: event, color: model.color(for: event))
                                .frame(height: 22)
                        }
                    }
                    .padding(.horizontal, 1)
                    .frame(maxWidth: .infinity, alignment: .top)
                }
            }
            .padding(.bottom, 4)
        }
    }
}

struct TimeGutter: View {
    @AppStorage(SettingsKey.uses24HourTime) private var uses24HourTime = SettingsDefault.uses24HourTime
    let showsNow: Bool

    var body: some View {
        TimelineView(.everyMinute) { context in
            VStack(alignment: .trailing, spacing: 0) {
                ForEach(0..<24, id: \.self) { hour in
                    ZStack(alignment: .topTrailing) {
                        if hour > 0 && !(showsNow && isNearNow(hour, now: context.date)) {
                            Text(TimeFormat.hour(hour, uses24HourTime: uses24HourTime))
                                .font(.system(size: 11, weight: .medium))
                                .monospacedDigit()
                                .foregroundStyle(Palette.mutedForeground.opacity(0.7))
                                .offset(y: -7)
                        }
                    }
                    .padding(.trailing, 6)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                    .frame(height: GridMetrics.hourHeight)
                    .id(hour)
                }
            }
        }
        .overlay(alignment: .topTrailing) {
            if showsNow {
                NowLabel()
            }
        }
        .frame(width: GridMetrics.gutterWidth, height: GridMetrics.dayHeight)
    }

    private func isNearNow(_ hour: Int, now: Date) -> Bool {
        let minutesFromHour = nowOffset(now) / GridMetrics.hourHeight * 60 - CGFloat(hour * 60)
        return abs(minutesFromHour) < 15
    }

}

struct NowLabel: View {
    @AppStorage(SettingsKey.uses24HourTime) private var uses24HourTime = SettingsDefault.uses24HourTime

    var body: some View {
        TimelineView(.everyMinute) { context in
            Text(TimeFormat.time(context.date, uses24HourTime: uses24HourTime))
                .font(.system(size: 11, weight: .semibold))
                .monospacedDigit()
                .foregroundStyle(Palette.now)
                .padding(.horizontal, 2)
                .background(Palette.background, in: RoundedRectangle(cornerRadius: 3))
                .padding(.trailing, 4)
                .offset(y: nowOffset(context.date) - 7)
        }
    }
}

struct HourLines: View {
    var body: some View {
        VStack(spacing: 0) {
            ForEach(0..<24, id: \.self) { hour in
                Rectangle()
                    .fill(hour == 0 ? .clear : Palette.border)
                    .frame(height: 1)
                    .frame(maxHeight: .infinity, alignment: .top)
            }
        }
        .padding(.leading, GridMetrics.gutterWidth)
        .frame(height: GridMetrics.dayHeight)
    }
}

struct DayColumn: View {
    @Environment(CalendarModel.self) private var model
    let day: Date

    var body: some View {
        let positioned = DayLayout.position(model.timedEvents(on: day), on: day, calendar: model.calendar)

        GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                ForEach(positioned, id: \.event.id) { item in
                    let width = geometry.size.width / CGFloat(item.columnCount)
                    let top = CGFloat(item.startMinute) / 60 * GridMetrics.hourHeight
                    let height = CGFloat(item.endMinute - item.startMinute) / 60 * GridMetrics.hourHeight
                    EventChip(event: item.event, color: model.color(for: item.event))
                        .frame(width: max(width - 2, 0), height: max(height - 2, 16))
                        .offset(x: CGFloat(item.column) * width + 1, y: top + 1)
                }
                if model.isToday(day) {
                    NowIndicator()
                }
            }
        }
        .frame(maxWidth: .infinity)
        .background(model.isWeekend(day) ? Palette.weekendColumn : .clear)
        .overlay(alignment: .leading) {
            Rectangle().fill(Palette.border).frame(width: 1)
        }
    }
}

struct NowIndicator: View {
    var body: some View {
        TimelineView(.everyMinute) { context in
            ZStack(alignment: .leading) {
                Rectangle().fill(Palette.now).frame(height: 2)
                Capsule().fill(Palette.now).frame(width: 4, height: 14)
            }
            .frame(height: 14)
            .offset(y: nowOffset(context.date) - 7)
        }
        .allowsHitTesting(false)
    }
}

private func nowOffset(_ date: Date) -> CGFloat {
    CGFloat(DayLayout.minuteOfDay(date, calendar: .current)) / 60 * GridMetrics.hourHeight
}
