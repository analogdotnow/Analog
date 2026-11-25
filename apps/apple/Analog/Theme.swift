import AnalogKit
import SwiftUI

struct Token {
    let light: SRGBColor
    let dark: SRGBColor

    init(light: UInt32, dark: UInt32) {
        self.light = SRGBColor(hex: light)
        self.dark = SRGBColor(hex: dark)
    }

    func resolve(_ scheme: ColorScheme) -> SRGBColor {
        scheme == .dark ? dark : light
    }

    var color: Color {
        #if os(iOS)
        Color(uiColor: UIColor { traits in
            UIColor(traits.userInterfaceStyle == .dark ? dark : light)
        })
        #else
        Color(nsColor: NSColor(name: nil) { appearance in
            let isDark = appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua
            return NSColor(isDark ? dark : light)
        })
        #endif
    }
}

enum Tokens {
    static let background = Token(light: 0xFFFFFF, dark: 0x131313)
    static let foreground = Token(light: 0x0A0A0A, dark: 0xFAFAFA)
    static let mutedForeground = Token(light: 0x737373, dark: 0xA3A3A3)
    static let border = Token(light: 0xE5E5E5, dark: 0x262626)
    static let weekendColumn = Token(light: 0xFAFAFA, dark: 0x161616)
    static let accent = Token(light: 0xF5F5F5, dark: 0x262626)
}

enum Palette {
    static let background = Tokens.background.color
    static let foreground = Tokens.foreground.color
    static let mutedForeground = Tokens.mutedForeground.color
    static let border = Tokens.border.color
    static let weekendColumn = Tokens.weekendColumn.color
    static let accent = Tokens.accent.color
    static let now = Color(SRGBColor(hex: 0xEF4444))
}

struct EventColors {
    let fill: Color
    let stroke: Color
    let text: Color
    let bar: Color

    init(_ color: SRGBColor, scheme: ColorScheme) {
        let background = Tokens.background.resolve(scheme)
        let foreground = Tokens.foreground.resolve(scheme)
        fill = Color(background.mixed(with: color, fraction: 0.2))
        stroke = Color(background.mixed(with: color, fraction: 0.3))
        text = Color(foreground.mixed(with: color, fraction: 0.7))
        bar = Color(background.mixed(with: color, fraction: 0.9)).opacity(0.4)
    }
}

extension Color {
    init(_ rgb: SRGBColor) {
        self.init(.sRGB, red: rgb.red, green: rgb.green, blue: rgb.blue)
    }
}

#if os(iOS)
extension UIColor {
    convenience init(_ rgb: SRGBColor) {
        self.init(red: rgb.red, green: rgb.green, blue: rgb.blue, alpha: 1)
    }
}
#else
extension NSColor {
    convenience init(_ rgb: SRGBColor) {
        self.init(srgbRed: rgb.red, green: rgb.green, blue: rgb.blue, alpha: 1)
    }
}
#endif
