import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";

interface PreferencesContextType {
  notificationsEnabled: boolean;
  darkMode: boolean;
  language: string;
  toggleNotifications: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  setLanguage: (lang: string) => Promise<void>;
  loading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

const STORAGE_KEYS = {
  NOTIFICATIONS: "@preferences_notifications",
  DARK_MODE: "@preferences_dark_mode",
  LANGUAGE: "@preferences_language",
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguageState] = useState("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [notifications, theme, lang] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
      ]);

      if (notifications !== null) {
        setNotificationsEnabled(JSON.parse(notifications));
      }

      if (theme !== null) {
        setDarkMode(JSON.parse(theme));
      } else {
        // Use system preference if not set
        const colorScheme = Appearance.getColorScheme();
        setDarkMode(colorScheme === "dark");
      }

      if (lang !== null) {
        setLanguageState(lang);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(newValue),
      );
    } catch (error) {
      console.error("Error saving notification preference:", error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newValue = !darkMode;
      setDarkMode(newValue);
      await AsyncStorage.setItem(
        STORAGE_KEYS.DARK_MODE,
        JSON.stringify(newValue),
      );
    } catch (error) {
      console.error("Error saving dark mode preference:", error);
    }
  };

  const setLanguage = async (lang: string) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        notificationsEnabled,
        darkMode,
        language,
        toggleNotifications,
        toggleDarkMode,
        setLanguage,
        loading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
