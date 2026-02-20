import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AdminProvider } from "@/contexts/AdminContext";
import { AdminNotificationsProvider } from "@/contexts/AdminNotificationsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { MessagesProvider } from "@/contexts/MessagesContext";
import {
    PreferencesProvider,
    usePreferences,
} from "@/contexts/PreferencesContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const { darkMode, loading: prefsLoading } = usePreferences();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const inTabsGroup = segments[0] === "(tabs)";
    const inProtectedRoute = [
      "edit-profile",
      "view-profile",
      "addresses",
      "saved-designs",
      "change-password",
      "cart",
    ].includes(segments[0]);
    const onLandingPage = !segments[0];

    console.log("🧭 Navigation guard:", {
      hasUser: !!user,
      segments: segments.join("/"),
      onLandingPage,
      inTabsGroup,
      inAuthGroup,
      inProtectedRoute,
    });

    if (user) {
      // User is signed in
      if (onLandingPage || inAuthGroup) {
        // User is signed in but on landing/auth page, redirect to tabs
        console.log("✅ User signed in, redirecting to tabs");
        router.replace("/(tabs)");
      }
      // Allow navigation within protected routes and tabs
    } else {
      // User is not signed in
      if (inTabsGroup || inProtectedRoute) {
        // User is not signed in but trying to access protected routes, redirect to landing
        console.log("❌ User not signed in, redirecting to landing");
        router.replace("/");
      }
    }
  }, [user, loading]);

  // Use darkMode from preferences instead of system color scheme
  const theme = darkMode ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="cart"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="view-profile"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="addresses"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="saved-designs"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="wishlist"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="change-password"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="admin"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="help-center"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="terms-privacy"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="payment-methods"
          options={{
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <AdminProvider>
          <AdminNotificationsProvider>
            <CartProvider>
              <WishlistProvider>
                <MessagesProvider>
                  <RootLayoutNav />
                </MessagesProvider>
              </WishlistProvider>
            </CartProvider>
          </AdminNotificationsProvider>
        </AdminProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
