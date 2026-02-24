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
import { PAYSTACK_PUBLIC_KEY } from "@/lib/paystack";
import { PaystackProvider } from "react-native-paystack-webview";

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
            title: "PrintCraft",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            title: "Sign In",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            title: "Home",
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{
            title: "Product Details",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="cart"
          options={{
            title: "Shopping Cart",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            title: "Edit Profile",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="view-profile"
          options={{
            title: "Profile",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="addresses"
          options={{
            title: "Delivery Addresses",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="saved-designs"
          options={{
            title: "Saved Designs",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="wishlist"
          options={{
            title: "My Wishlist",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="change-password"
          options={{
            title: "Change Password",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="admin"
          options={{
            title: "Admin Panel",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="help-center"
          options={{
            title: "Help Center",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="messages"
          options={{
            title: "Messages",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="category"
          options={{
            title: "Category",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="terms-privacy"
          options={{
            title: "Terms & Privacy",
            headerShown: false,
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="payment-methods"
          options={{
            title: "Payment Methods",
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
        <PaystackProvider
          publicKey={PAYSTACK_PUBLIC_KEY}
          currency="GHS"
          defaultChannels={["mobile_money"]}
        >
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
        </PaystackProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
