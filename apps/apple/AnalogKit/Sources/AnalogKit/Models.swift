import Foundation

public struct SRGBColor: Hashable, Sendable {
    public var red: Double
    public var green: Double
    public var blue: Double

    public init(red: Double, green: Double, blue: Double) {
        self.red = red
        self.green = green
        self.blue = blue
    }

    public init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }

    public func mixed(with other: SRGBColor, fraction: Double) -> SRGBColor {
        let amount = min(max(fraction, 0), 1)
        return SRGBColor(
            red: red + (other.red - red) * amount,
            green: green + (other.green - green) * amount,
            blue: blue + (other.blue - blue) * amount
        )
    }
}

public struct CalendarSource: Identifiable, Hashable, Sendable {
    public let id: String
    public var name: String
    public var color: SRGBColor

    public init(id: String, name: String, color: SRGBColor) {
        self.id = id
        self.name = name
        self.color = color
    }
}

public struct CalendarEvent: Identifiable, Hashable, Sendable {
    public let id: String
    public var calendarID: String
    public var title: String
    public var start: Date
    public var end: Date
    public var isAllDay: Bool
    public var location: String?

    public init(
        id: String,
        calendarID: String,
        title: String,
        start: Date,
        end: Date,
        isAllDay: Bool = false,
        location: String? = nil
    ) {
        self.id = id
        self.calendarID = calendarID
        self.title = title
        self.start = start
        self.end = end
        self.isAllDay = isAllDay
        self.location = location
    }
}
