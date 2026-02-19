import { useAuth } from "@/contexts/AuthContext";
import { Profile, profileService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    ordersCount: 0,
    designsCount: 0,
    inProgressCount: 0,
    addressesCount: 0,
  });

  // Redirect to landing if no user
  useEffect(() => {
    if (!user && !loggingOut) {
      router.replace("/");
    }
  }, [user, loggingOut]);

  // Reload profile when tab comes into focus (removed duplicate useEffect)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadProfileData();
      }
    }, [user]),
  );

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // Fetch profile and stats in parallel (no blocking loading state)
      const [profileData, statsData] = await Promise.all([
        profileService.get(user.id),
        profileService.getStats(user.id),
      ]);

      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            await signOut();
            // Navigation handled by auth state
          } catch (error) {
            console.error("Error during logout:", error);
            setLoggingOut(false);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const profileSections = [
    {
      title: "Account",
      items: [
        {
          icon: "person-outline",
          label: "Personal Information",
          value: "",
          route: "/view-profile",
        },
        {
          icon: "mail-outline",
          label: "Email",
          value: user?.email || "Not set",
          route: null,
        },
        {
          icon: "lock-closed-outline",
          label: "Change Password",
          value: "",
          route: "/change-password",
        },
        {
          icon: "location-outline",
          label: "Delivery Addresses",
          value:
            stats.addressesCount > 0
              ? `${stats.addressesCount} saved`
              : "No addresses",
          route: "/addresses",
        },
      ],
    },
    {
      title: "Orders",
      items: [
        {
          icon: "receipt-outline",
          label: "Order History",
          value:
            stats.ordersCount > 0
              ? `${stats.ordersCount} orders`
              : "No orders yet",
          route: "/(tabs)/orders",
        },
        {
          icon: "bookmark-outline",
          label: "Saved Designs",
          value:
            stats.designsCount > 0
              ? `${stats.designsCount} designs`
              : "No designs",
          route: "/saved-designs",
        },
        {
          icon: "repeat-outline",
          label: "Reorder",
          value: "",
          route: "/(tabs)/orders",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications-outline",
          label: "Notifications",
          value: "Enabled",
          route: null,
        },
        { icon: "moon-outline", label: "Dark Mode", value: "Off", route: null },
        {
          icon: "language-outline",
          label: "Language",
          value: "English",
          route: null,
        },
        {
          icon: "card-outline",
          label: "Payment Methods",
          value: "2 cards",
          route: null,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "help-circle-outline",
          label: "Help Center",
          value: "",
          route: null,
        },
        {
          icon: "chatbubble-outline",
          label: "Contact Support",
          value: "",
          route: null,
        },
        { icon: "star-outline", label: "Rate App", value: "", route: null },
        {
          icon: "document-text-outline",
          label: "Terms & Privacy",
          value: "",
          route: null,
        },
      ],
    },
  ];

  const handleMenuItemPress = (item: any) => {
    if (item.route) {
      router.push(item.route);
    } else if (
      item.label === "Notifications" ||
      item.label === "Dark Mode" ||
      item.label === "Language" ||
      item.label === "Payment Methods"
    ) {
      Alert.alert(
        "Coming Soon",
        `${item.label} settings will be available in a future update.`,
      );
    } else if (
      item.label === "Help Center" ||
      item.label === "Contact Support"
    ) {
      Alert.alert(
        item.label,
        "Please email support@printcraft.com for assistance.",
      );
    } else if (item.label === "Rate App") {
      Alert.alert(
        "Rate App",
        "Thank you for your feedback! We appreciate your support.",
      );
    } else if (item.label === "Terms & Privacy") {
      Alert.alert(
        "Terms & Privacy",
        "Please visit our website for terms of service and privacy policy.",
      );
    }
  };

  // Don't render profile while logging out or without user
  if (!user || loggingOut) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => profile?.avatar_url && setShowAvatarModal(true)}
            activeOpacity={profile?.avatar_url ? 0.7 : 1}
          >
            {profile?.avatar_url ? (
              <Image
                key={profile.avatar_url}
                source={{ uri: `${profile.avatar_url}?t=${Date.now()}` }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={48} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={() => router.push("/edit-profile")}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>
          {profile?.full_name || user?.user_metadata?.full_name || "User"}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.ordersCount}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.designsCount}</Text>
            <Text style={styles.statLabel}>Designs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.inProgressCount}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>
      </View>

      {/* Profile Sections */}
      {profileSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.menuItem,
                  itemIndex === section.items.length - 1 && styles.menuItemLast,
                ]}
                activeOpacity={0.7}
                onPress={() => handleMenuItemPress(item)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color="#3B82F6"
                    />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                    {item.value ? (
                      <Text style={styles.menuItemValue}>{item.value}</Text>
                    ) : null}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>PrintCraft v1.0.0</Text>
        <View style={styles.versionSubtextRow}>
          <Text style={styles.versionSubtext}>Made with </Text>
          <Ionicons name="heart" size={12} color="#F87171" />
          <Text style={styles.versionSubtext}> for print lovers</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />

      {/* Avatar Preview Modal */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowAvatarModal(false)}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAvatarModal(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          {profile?.avatar_url && (
            <Image
              source={{ uri: `${profile.avatar_url}?t=${Date.now()}` }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  menuItemValue: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 32,
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  versionSubtextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionSubtext: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  modalImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.7,
  },
});
