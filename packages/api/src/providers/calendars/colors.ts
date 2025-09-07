import * as z from "zod";

const HEX_REGEX = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const hexToRgbObjectSchema = z
  .string()
  .regex(HEX_REGEX, { message: "Invalid hex color format" })
  .transform((rawHex) => {
    let hex = rawHex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((ch) => ch + ch)
        .join("");
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  });

// Usage:
// const { r, g, b } = hexToRgbObjectSchema.parse("#1a2b3c");

const COLORS = [
  "#FB2C36", // Red
  "#FF6900", // Orange
  "#F0B100", // Yellow
  "#00C950", // Green
  "#2B7FFF", // Blue
  "#AD46FF", // Purple
  "#DE3BBE", // Pink
  "#a3a3a3", // Gray
  "#525252", // Dark gray

  "#f43f5e", // Rose - warm red
  "#d946ef", // Fuchsia - vibrant pink
  "#a855f7", // Purple
  "#6366f1", // Indigo - deep blue-purple
  "#3b82f6", // Blue - primary blue
  "#14b8a6", // Teal - blue-green
  "#10b981", // Emerald - true green
  "#84cc16", // Lime - yellow-green
  "#f59e0b", // Amber - orange-yellow
  "#f97316", // Orange - pure orange
  "#64748b", // Slate - neutral gray
];

export function assignColor(index: number) {
  return COLORS[index % COLORS.length];
}
