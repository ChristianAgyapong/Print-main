// Color schemes for light and dark modes
export const Colors = {
  light: {
    // Primary colors
    primary: "#FF006E",
    primaryLight: "rgba(255, 0, 110, 0.1)",
    primaryDark: "#D6005C",

    // Background colors
    background: "#F9FAFB",
    backgroundSecondary: "#FFFFFF",
    backgroundTertiary: "#F3F4F6",

    // Text colors
    text: "#1F2937",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",
    textInverse: "#FFFFFF",

    // Border colors
    border: "#E5E7EB",
    borderLight: "#F3F4F6",

    // Status colors
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",

    // Shadow
    shadow: "#000000",

    // Card
    card: "#FFFFFF",
    cardBorder: "#E5E7EB",

    // Tab bar
    tabBarBackground: "#FFFFFF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#FF006E",

    // Status bar
    statusBarStyle: "dark" as const,
  },
  dark: {
    // Primary colors
    primary: "#FF006E",
    primaryLight: "rgba(255, 0, 110, 0.2)",
    primaryDark: "#FF3388",

    // Background colors
    background: "#0F172A",
    backgroundSecondary: "#1E293B",
    backgroundTertiary: "#334155",

    // Text colors
    text: "#F1F5F9",
    textSecondary: "#CBD5E1",
    textTertiary: "#94A3B8",
    textInverse: "#0F172A",

    // Border colors
    border: "#334155",
    borderLight: "#475569",

    // Status colors
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",

    // Shadow
    shadow: "#000000",

    // Card
    card: "#1E293B",
    cardBorder: "#334155",

    // Tab bar
    tabBarBackground: "#1E293B",
    tabIconDefault: "#64748B",
    tabIconSelected: "#FF006E",

    // Status bar
    statusBarStyle: "light" as const,
  },
};

export type ThemeColors = typeof Colors.light;
