import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { useCart } from "@/contexts/CartContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { usePreferences } from "@/contexts/PreferencesContext";

export default function TabLayout() {
  const colors = useThemeColors();
  const { darkMode } = usePreferences();
  const router = useRouter();
  const { itemCount } = useCart();
  const { unreadCount } = useMessages();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF006E",
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: true,
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerBackground: () => (
          <BlurView
            intensity={80}
            tint={darkMode ? "dark" : "light"}
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.backgroundSecondary }]}
          />
        ),
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 20,
          letterSpacing: 0.5,
        },
        headerShadowVisible: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 88,
          backgroundColor: darkMode ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingBottom: 10,
          paddingTop: 12,
          paddingHorizontal: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: darkMode ? 0.3 : 0.1,
          shadowRadius: 16,
          elevation: 20,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: colors.border,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={darkMode ? "dark" : "light"}
              style={[
                StyleSheet.absoluteFill,
                { borderTopLeftRadius: 32, borderTopRightRadius: 32 },
              ]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginTop: 4,
          marginBottom: 2,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          gap: 4,
          backgroundColor: "transparent",
        },
        headerRight: () => (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/cart")}
          >
            <View style={[styles.cartIconContainer, { backgroundColor: colors.card, borderColor: "#FF006E" }]}>
              <Ionicons name="cart" size={22} color="#FF006E" />
              {itemCount > 0 && (
                <View style={[styles.cartBadge, { borderColor: colors.card }]}>
                  <Text style={styles.cartBadgeText}>{itemCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "PrintCraft",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={28}
              color={focused ? "#FF006E" : "#9CA3AF"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Services",
          headerTitle: "Our Services",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={28}
              color={focused ? "#FF006E" : "#9CA3AF"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerTitle: "My Orders",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              size={28}
              color={focused ? "#FF006E" : "#9CA3AF"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Inbox",
          headerTitle: "Inbox",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: "relative" }}>
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={28}
                color={focused ? "#FF006E" : "#9CA3AF"}
              />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -8,
                    backgroundColor: "#FF006E",
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 5,
                    borderWidth: 2,
                    borderColor: colors.backgroundSecondary,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: "900",
                      letterSpacing: -0.3,
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount.toString()}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          headerTitle: "Account",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={28}
              color={focused ? "#FF006E" : "#9CA3AF"}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cartButton: {
    marginRight: 12,
  },
  cartIconContainer: {
    position: "relative",
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: "#FF006E",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF006E",
    borderRadius: 14,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 7,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
});
