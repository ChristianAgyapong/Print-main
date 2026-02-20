import { usePreferences } from "@/contexts/PreferencesContext";
import { Colors, ThemeColors } from "@/constants/colors";

/**
 * Hook to get the current theme colors based on dark mode preference
 */
export function useThemeColors(): ThemeColors {
  const { darkMode } = usePreferences();
  return (darkMode ? Colors.dark : Colors.light) as ThemeColors;
}

/**
 * Hook to get a specific color value for the current theme
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors,
): string {
  const { darkMode } = usePreferences();
  const colorFromProps = props[darkMode ? "dark" : "light"];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    const colors = useThemeColors();
    return colors[colorName];
  }
}
