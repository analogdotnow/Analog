# Analog for iOS and macOS

A native SwiftUI client built from the Analog calendar design. One multiplatform target runs on iOS 17+ and macOS 14+.

## Build

Open `Analog.xcodeproj` in Xcode and run the `Analog` scheme on an iPhone simulator or My Mac. From the command line:

```sh
xcodebuild -project Analog.xcodeproj -scheme Analog -destination 'platform=macOS' build
xcodebuild -project Analog.xcodeproj -scheme Analog -destination 'generic/platform=iOS Simulator' build
```

Calendar logic (models, day layout, sample data) lives in the `AnalogKit` package and is tested on its own:

```sh
cd AnalogKit && swift test
```

## Design

Designs live in the Paper file "Analog". The iOS and macOS pages preview each system look side by side: Liquid Glass Clear, Liquid Glass Tinted and Classic (iOS 17–18, macOS 14–15). Glass and classic surface colors are Paper tokens (`--color-glass-*`, `--color-classic-*`), so one token change updates every variant. Calendar colors follow the web app: event fill, border and text mix the calendar color into the background at 20%, 30% and 70%.

## Native chrome

Navigation bars, toolbars, sidebars, sheets and settings use the system's SwiftUI controls. On iOS 26 and macOS 26 they adopt Liquid Glass automatically. Earlier versions get the classic bars. Reduce Transparency and the Clear or Tinted glass setting apply on their own. Only the calendar content (grid, event chips, now indicator) is custom.
