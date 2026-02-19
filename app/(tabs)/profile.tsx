import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { Profile, profileService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useAdmin();
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

  // Redirect to landing if no user (only after auth loading is complete)
  useEffect(() => {
    if (!loading && !user && !loggingOut) {
      router.replace("/");
    }
  }, [user, loggingOut, loading]);

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
            // Auth guard in _layout.tsx will redirect to landing page
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

  // Show loading while auth is loading or logging out
  if (loading || loggingOut) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  // If auth finished loading and still no user, return null (will redirect via useEffect)
  if (!user) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
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

        {/* Admin Panel Button */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminPanelButton}
            onPress={() => router.push("/admin" as any)}
          >
            <View style={styles.adminPanelContent}>
              <View style={styles.adminIconContainer}>
                <Ionicons name="shield-checkmark" size={24} color="#FF006E" />
              </View>
              <View style={styles.adminTextContainer}>
                <Text style={styles.adminPanelTitle}>Admin Panel</Text>
                <Text style={styles.adminPanelSubtitle}>Manage orders, users & products</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FF006E" />
          </TouchableOpacity>
        )}

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
                    itemIndex === section.items.length - 1 &&
                      styles.menuItemLast,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleMenuItemPress(item)}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color="#FF006E"
                      />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                      {item.value ? (
                        <Text style={styles.menuItemValue}>{item.value}</Text>
                      ) : null}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#B8B8D1" />
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

        <View style={{ height: 110 }} />

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF006E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    backgroundColor: "#FF006E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
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
    backgroundColor: "rgba(255, 0, 110, 0.1)",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 110, 0.3)",
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
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  adminPanelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#FF006E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "rgba(255, 0, 110, 0.2)",
  },
  adminPanelContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  adminIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 0, 110, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  adminTextContainer: {
    flex: 1,
  },
  adminPanelTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  adminPanelSubtitle: {
    fontSize: 13,
    color: "#6B7280",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
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
    backgroundColor: "rgba(255, 0, 110, 0.15)",
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
    color: "#FF006E",
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.3)",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
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
    color: "#6B7280",
    marginBottom: 4,
  },
  versionSubtextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 20, 0.92)",
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
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  modalImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.7,
  },
});
