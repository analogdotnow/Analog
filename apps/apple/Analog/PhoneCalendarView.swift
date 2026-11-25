#if os(iOS)
import SwiftUI

struct PhoneCalendarView: View {
    @Environment(CalendarModel.self) private var model
    @State private var showsSettings = false

    var body: some View {
        @Bindable var model = model

        NavigationStack {
            Group {
                if model.mode == .month {
                    MonthGrid()
                } else {
                    WeekGrid(days: model.visibleDays)
                }
            }
            .simultaneousGesture(pageGesture)
            .background(Palette.background)
            .toolbarTitleDisplayMode(.inlineLarge)
            .modifier(Title(month: model.monthTitle, monthAndYear: model.monthYearTitle, year: model.yearTitle))
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Today") {
                        withAnimation(.snappy) { model.goToToday() }
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Settings", systemImage: "slider.horizontal.3") {
                        showsSettings = true
                    }
                }
                ToolbarItemGroup(placement: .bottomBar) {
                    Picker("View", selection: $model.mode) {
                        ForEach(ViewMode.allCases) { mode in
                            Text(mode.title).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)
                    .fixedSize()
                    Spacer()
                    Button("New Event", systemImage: "plus") {}
                }
            }
            .sheet(isPresented: $showsSettings) {
                SettingsSheet()
            }
        }
    }

    private var pageGesture: some Gesture {
        DragGesture(minimumDistance: 24)
            .onEnded { value in
                let dx = value.translation.width
                guard abs(dx) > 60, abs(dx) > abs(value.translation.height) * 1.5 else { return }
                withAnimation(.snappy) {
                    model.move(by: dx < 0 ? 1 : -1)
                }
            }
    }
}

private struct Title: ViewModifier {
    let month: String
    let monthAndYear: String
    let year: String

    func body(content: Content) -> some View {
        if #available(iOS 26, *) {
            content
                .navigationTitle(month)
                .navigationSubtitle(year)
        } else {
            content.navigationTitle(monthAndYear)
        }
    }
}
#endif
