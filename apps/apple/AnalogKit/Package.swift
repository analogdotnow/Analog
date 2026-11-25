// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "AnalogKit",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "AnalogKit", targets: ["AnalogKit"])
    ],
    targets: [
        .target(name: "AnalogKit"),
        .testTarget(name: "AnalogKitTests", dependencies: ["AnalogKit"]),
    ]
)
