import AnalogKit
import SwiftUI

struct EventChip: View {
    let event: CalendarEvent
    let color: SRGBColor
    @Environment(\.colorScheme) private var scheme
    @AppStorage(SettingsKey.uses24HourTime) private var uses24HourTime = SettingsDefault.uses24HourTime

    private var showsTime: Bool {
        !event.isAllDay && event.end.timeIntervalSince(event.start) > 30 * 60
    }

    var body: some View {
        let colors = EventColors(color, scheme: scheme)
        let shape = RoundedRectangle(cornerRadius: 6, style: .continuous)

        HStack(alignment: .top, spacing: 6) {
            RoundedRectangle(cornerRadius: 1.5)
                .fill(colors.bar)
                .frame(width: 3)
                .frame(maxHeight: .infinity)
            VStack(alignment: .leading, spacing: 2) {
                Text(event.title)
                    .font(.system(size: 12, weight: .medium))
                if showsTime {
                    Text(TimeFormat.time(event.start, uses24HourTime: uses24HourTime))
                        .font(.system(size: 11))
                        .monospacedDigit()
                        .opacity(0.7)
                }
            }
            .lineLimit(1)
            Spacer(minLength: 0)
        }
        .padding(.vertical, 4)
        .padding(.leading, 4)
        .padding(.trailing, 6)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .foregroundStyle(colors.text)
        .background(colors.fill, in: shape)
        .overlay(shape.strokeBorder(colors.stroke, lineWidth: 1))
        .clipShape(shape)
    }
}

struct EventPill: View {
    let event: CalendarEvent
    let color: SRGBColor
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        let colors = EventColors(color, scheme: scheme)

        HStack(spacing: 4) {
            RoundedRectangle(cornerRadius: 1)
                .fill(colors.bar)
                .frame(width: 2)
            Text(event.title)
                .font(.system(size: 10, weight: .medium))
                .lineLimit(1)
            Spacer(minLength: 0)
        }
        .padding(.vertical, 2)
        .padding(.leading, 2)
        .padding(.trailing, 4)
        .frame(height: 16)
        .foregroundStyle(colors.text)
        .background(colors.fill, in: RoundedRectangle(cornerRadius: 4, style: .continuous))
    }
}
