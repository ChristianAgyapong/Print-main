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
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF006E",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: true,
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerBackground: () => (
          <BlurView
            intensity={80}
            tint="light"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#FFFFFF" },
            ]}
          />
        ),
        headerTintColor: "#1F2937",
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
          height: 85,
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 15,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: "#E5E7EB",
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint="light"
              style={[
                StyleSheet.absoluteFill,
                { borderTopLeftRadius: 32, borderTopRightRadius: 32 },
              ]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          gap: 2,
          backgroundColor: "transparent",
        },
        headerRight: () => (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/cart")}
          >
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart" size={22} color="#FF006E" />
              {itemCount > 0 && (
                <View style={styles.cartBadge}>
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
            <View
              style={[
                styles.iconContainer,
                focused
                  ? styles.iconContainerActive
                  : styles.iconContainerInactive,
              ]}
            >
              {focused && <View style={styles.iconGlowEffect} />}
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={focused ? 28 : 24}
                  color={focused ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Services",
          headerTitle: "Our Services",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused
                  ? styles.iconContainerActive
                  : styles.iconContainerInactive,
              ]}
            >
              {focused && <View style={styles.iconGlowEffect} />}
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={focused ? "grid" : "grid-outline"}
                  size={focused ? 28 : 24}
                  color={focused ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerTitle: "My Orders",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused
                  ? styles.iconContainerActive
                  : styles.iconContainerInactive,
              ]}
            >
              {focused && <View style={styles.iconGlowEffect} />}
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={focused ? "document-text" : "document-text-outline"}
                  size={focused ? 28 : 24}
                  color={focused ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconContainer,
                focused
                  ? styles.iconContainerActive
                  : styles.iconContainerInactive,
              ]}
            >
              {focused && <View style={styles.iconGlowEffect} />}
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={focused ? 28 : 24}
                  color={focused ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    position: "relative",
    marginBottom: 0,
  },
  iconContainerInactive: {
    backgroundColor: "transparent",
  },
  iconContainerActive: {
    backgroundColor: "#FF006E",
    shadowColor: "#FF006E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  iconGlowEffect: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#FF006E",
    opacity: 0.3,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cartButton: {
    marginRight: 16,
  },
  cartIconContainer: {
    position: "relative",
    padding: 10,
    backgroundColor: "rgba(255, 0, 110, 0.08)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 0, 110, 0.25)",
    shadowColor: "#000",
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
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
});
