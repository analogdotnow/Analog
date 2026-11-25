#if os(macOS)
import AnalogKit
import SwiftUI

struct MacCalendarView: View {
    @Environment(CalendarModel.self) private var model

    var body: some View {
        @Bindable var model = model

        NavigationSplitView {
            Sidebar()
                .navigationSplitViewColumnWidth(min: 220, ideal: 240, max: 320)
        } detail: {
            Group {
                if model.mode == .month {
                    MonthGrid()
                } else {
                    WeekGrid(days: model.visibleDays)
                }
            }
            .background(Palette.background)
            .navigationTitle(model.monthYearTitle)
            .toolbar {
                ToolbarItem(placement: .navigation) {
                    ControlGroup {
                        Button("Previous", systemImage: "chevron.left") { model.move(by: -1) }
                        Button("Today") { model.goToToday() }
                        Button("Next", systemImage: "chevron.right") { model.move(by: 1) }
                    }
                }
                ToolbarItem(placement: .primaryAction) {
                    Picker("View", selection: $model.mode) {
                        ForEach(ViewMode.macCases) { mode in
                            Text(mode.title).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)
                }
                ToolbarItem(placement: .primaryAction) {
                    Button("New Event", systemImage: "plus") {}
                }
            }
        }
        .frame(minWidth: 900, minHeight: 600)
    }
}

private struct Sidebar: View {
    @Environment(CalendarModel.self) private var model

    var body: some View {
        List {
            Section {
                MiniMonth()
                    .listRowInsets(EdgeInsets(top: 8, leading: 8, bottom: 8, trailing: 8))
            }
            Section("Calendars") {
                ForEach(model.sources) { source in
                    CalendarToggle(source: source, isVisible: !model.hiddenCalendarIDs.contains(source.id)) {
                        model.toggle(source)
                    }
                }
            }
        }
        .listStyle(.sidebar)
    }
}

private struct CalendarToggle: View {
    let source: CalendarSource
    let isVisible: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                RoundedRectangle(cornerRadius: 4, style: .continuous)
                    .fill(isVisible ? Color(source.color) : .clear)
                    .strokeBorder(Color(source.color), lineWidth: 1.5)
                    .frame(width: 14, height: 14)
                    .overlay {
                        if isVisible {
                            Image(systemName: "checkmark")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundStyle(.white)
                        }
                    }
                Text(source.name)
                    .foregroundStyle(Palette.foreground)
                Spacer()
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

private struct MiniMonth: View {
    @Environment(CalendarModel.self) private var model

    var body: some View {
        let days = model.monthDays
        let visible = Set(model.visibleDays)
        let weeks = stride(from: 0, to: days.count, by: 7).map { Array(days[$0..<min($0 + 7, days.count)]) }

        VStack(alignment: .leading, spacing: 6) {
            Text(model.anchor, format: .dateTime.month(.wide).year())
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Palette.foreground)
                .padding(.leading, 4)
            HStack(spacing: 0) {
                ForEach(Array(days.prefix(7)), id: \.self) { day in
                    Text(day, format: .dateTime.weekday(.narrow))
                        .frame(maxWidth: .infinity)
                }
            }
            .font(.system(size: 10, weight: .medium))
            .foregroundStyle(Palette.mutedForeground.opacity(0.7))
            VStack(spacing: 2) {
                ForEach(weeks, id: \.first) { week in
                    HStack(spacing: 0) {
                        ForEach(week, id: \.self) { day in
                            dayCell(day)
                        }
                    }
                    .background {
                        if model.mode != .month, week.contains(where: visible.contains) {
                            RoundedRectangle(cornerRadius: 6, style: .continuous).fill(Palette.accent)
                        }
                    }
                }
            }
        }
    }

    private func dayCell(_ day: Date) -> some View {
        let isToday = model.isToday(day)
        let inMonth = model.calendar.isDate(day, equalTo: model.anchor, toGranularity: .month)

        return Button {
            model.anchor = day
        } label: {
            Text(day, format: .dateTime.day())
                .font(.system(size: 11, weight: isToday ? .semibold : .regular))
                .monospacedDigit()
                .foregroundStyle(
                    isToday ? Palette.background
                        : inMonth ? Palette.foreground : Palette.mutedForeground.opacity(0.5)
                )
                .frame(width: 22, height: 22)
                .background {
                    if isToday {
                        Circle().fill(Palette.foreground)
                    }
                }
                .frame(maxWidth: .infinity)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

struct CalendarCommands: Commands {
    let model: CalendarModel

    var body: some Commands {
        CommandMenu("Go") {
            Button("Today") { model.goToToday() }
                .keyboardShortcut("t")
            Button("Previous") { model.move(by: -1) }
                .keyboardShortcut(.leftArrow)
            Button("Next") { model.move(by: 1) }
                .keyboardShortcut(.rightArrow)
        }
        CommandGroup(before: .toolbar) {
            ForEach(Array(ViewMode.macCases.enumerated()), id: \.element) { index, mode in
                Button(mode.title) { model.mode = mode }
                    .keyboardShortcut(KeyEquivalent(Character("\(index + 1)")))
            }
            Divider()
        }
    }
}
#endif
