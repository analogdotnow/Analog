import Testing
import AnalogKit

struct SRGBColorTests {
    @Test func parsesHex() {
        let color = SRGBColor(hex: 0x3B82F6)
        #expect(color == SRGBColor(red: 59 / 255, green: 130 / 255, blue: 246 / 255))
    }

    @Test func mixesTowardOther() {
        let white = SRGBColor(hex: 0xFFFFFF)
        let black = SRGBColor(hex: 0x000000)
        #expect(white.mixed(with: black, fraction: 0) == white)
        #expect(white.mixed(with: black, fraction: 1) == black)
        #expect(white.mixed(with: black, fraction: 0.2) == SRGBColor(red: 0.8, green: 0.8, blue: 0.8))
    }

    @Test func clampsFraction() {
        let red = SRGBColor(hex: 0xFF0000)
        let blue = SRGBColor(hex: 0x0000FF)
        #expect(red.mixed(with: blue, fraction: 2) == blue)
        #expect(red.mixed(with: blue, fraction: -1) == red)
    }
}
