import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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
import { usePreferences } from "@/contexts/PreferencesContext";
import { useThemeColors } from "@/hooks/use-theme-colors";

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
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          />
        ),
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "500",
          fontSize: 16,
          letterSpacing: 0.2,
        },
        headerShadowVisible: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 78,
          backgroundColor: darkMode
            ? "rgba(31, 41, 55, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          paddingBottom: 12,
          paddingTop: 12,
          paddingHorizontal: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: darkMode ? 0.2 : 0.07,
          shadowRadius: 10,
          elevation: 12,
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
                { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
              ]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 3,
          marginBottom: 0,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "transparent",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={["#FF006E", "#D6005C", "#AD004A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="color-palette" size={16} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={[styles.headerTitleText, { color: colors.text }]}>
                  PrintCraft
                </Text>
                <Text style={styles.headerSubtitle}>
                  Quality Print Services
                </Text>
              </View>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push("/cart")}
            >
              <View
                style={[
                  styles.cartIconContainer,
                  { backgroundColor: colors.card, borderColor: "#FF006E" },
                ]}
              >
                <Ionicons name="cart" size={22} color="#FF006E" />
                {itemCount > 0 && (
                  <View
                    style={[styles.cartBadge, { borderColor: colors.card }]}
                  >
                    <Text style={styles.cartBadgeText}>{itemCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? "#FF006E" : "#9CA3AF"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Services",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="grid" size={16} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={[styles.headerTitleText, { color: colors.text }]}>
                  Our Services
                </Text>
                <Text style={styles.headerSubtitle}>Browse Print Options</Text>
              </View>
            </View>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={24}
              color={focused ? "#FF006E" : "#9CA3AF"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={["#10B981", "#059669", "#047857"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="document-text" size={16} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={[styles.headerTitleText, { color: colors.text }]}>
                  My Orders
                </Text>
                <Text style={styles.headerSubtitle}>Track Your Orders</Text>
              </View>
            </View>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              size={24}
              color={focused ? "#FF006E" : "#9CA3AF"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Inbox",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={["#F59E0B", "#D97706", "#B45309"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="chatbubbles" size={16} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={[styles.headerTitleText, { color: colors.text }]}>
                  Messages
                </Text>
                <Text style={styles.headerSubtitle}>Stay Connected</Text>
              </View>
            </View>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: "relative" }}>
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={24}
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
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={["#8B5CF6", "#7C3AED", "#6D28D9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={[styles.headerTitleText, { color: colors.text }]}>
                  My Account
                </Text>
                <Text style={styles.headerSubtitle}>Manage Your Profile</Text>
              </View>
            </View>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={focused ? "#FF006E" : "#9CA3AF"}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoContainer: {
    shadowColor: "#FF006E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoGradient: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  titleTextContainer: {
    flexDirection: "column",
    gap: 1,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "400",
    color: "#9CA3AF",
    letterSpacing: 0.3,
  },
  cartButton: {
    marginRight: 16,
    marginTop: 2,
  },
  cartIconContainer: {
    position: "relative",
    padding: 10,
    borderRadius: 14,
    borderWidth: 2,
    shadowColor: "#FF006E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF006E",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
});
