import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useThemeColors } from "@/hooks/use-theme-colors";
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
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const {
    notificationsEnabled,
    darkMode,
    language,
    toggleNotifications,
    toggleDarkMode,
    setLanguage,
  } = usePreferences();
  const colors = useThemeColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
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
    Alert.alert("Logout", "Are you sure you wants to logout?", [
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
            console.error("Errors during logout:", error);
            setLoggingOut(false);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "zh", name: "中文" },
  ];

  const getLanguageName = (code: string) => {
    return languages.find((l) => l.code === code)?.name || "English";
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: "https://apps.apple.com/app/idXXXXXXXXXX",
      android: "https://play.google.com/store/apps/details?id=com.printcraft",
      default: "https://www.printcraft.com",
    });

    Alert.alert(
      "Rate PrintCrafts",
      "Would you like to rate our app? Your feedback helps us improve!",
      [
        { text: "Not Now", style: "cancel" },
        {
          text: "Rate App",
          onPress: () => Linking.openURL(storeUrl),
        },
      ],
    );
  };

  const profileSections = [
    {
      title: "Accounts",
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
          icon: "chatbubble-ellipses-outline",
          label: "Inbox",
          value: "",
          route: "/(tabs)/messages",
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
          value: notificationsEnabled ? "Enabled" : "Disabled",
          route: null,
          hasToggle: true,
          toggleValue: notificationsEnabled,
          onToggle: toggleNotifications,
        },
        {
          icon: "moon-outline",
          label: "Dark Mode",
          value: darkMode ? "On" : "Off",
          route: null,
          hasToggle: true,
          toggleValue: darkMode,
          onToggle: toggleDarkMode,
        },
        {
          icon: "language-outline",
          label: "Language",
          value: getLanguageName(language),
          route: null,
          action: "language",
        },
        {
          icon: "card-outline",
          label: "Payment Methods",
          value: "2 cards",
          route: "/payment-methods",
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
          route: "/help-center",
        },
        {
          icon: "chatbubble-outline",
          label: "Contact Support",
          value: "",
          route: "/(tabs)/messages",
        },
        {
          icon: "star-outline",
          label: "Rate App",
          value: "",
          route: null,
          action: "rate",
        },
        {
          icon: "document-text-outline",
          label: "Terms & Privacy",
          value: "",
          route: "/terms-privacy",
        },
      ],
    },
  ];

  const handleMenuItemPress = (item: any) => {
    if (item.route) {
      router.push(item.route);
    } else if (item.action === "language") {
      setShowLanguageModal(true);
    } else if (item.action === "rate") {
      handleRateApp();
    }
  };

  // Show loading while auth is loading or logging out
  if (loading || loggingOut) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // If auth finished loading and still no user, return null (will redirect via useEffect)
  if (!user) {
    return null;
  }

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.backgroundSecondary,
      borderBottomColor: colors.border,
    },
    userName: {
      color: colors.text,
    },
    userEmail: {
      color: colors.textSecondary,
    },
    statValue: {
      color: colors.text,
    },
    statLabel: {
      color: colors.textSecondary,
    },
    sectionTitle: {
      color: colors.text,
    },
    sectionContent: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    menuItem: {
      borderBottomColor: colors.borderLight,
    },
    menuIconContainer: {
      backgroundColor: colors.primaryLight,
    },
    menuItemLabel: {
      color: colors.text,
    },
    adminPanelButton: {
      backgroundColor: colors.card,
      borderColor: colors.primaryLight,
    },
    adminPanelTitle: {
      color: colors.text,
    },
    adminPanelSubtitle: {
      color: colors.textSecondary,
    },
    logoutButton: {
      backgroundColor: colors.card,
      borderColor: colors.borderLight,
    },
    logoutButtonText: {
      color: colors.textSecondary,
    },
    versionText: {
      color: colors.textSecondary,
    },
    versionSubtext: {
      color: colors.textSecondary,
    },
    languageModalContent: {
      backgroundColor: colors.backgroundSecondary,
    },
    languageModalHeader: {
      borderBottomColor: colors.borderLight,
    },
    languageModalTitle: {
      color: colors.text,
    },
    languageItem: {
      borderBottomColor: colors.borderLight,
    },
    languageItemText: {
      color: colors.text,
    },
  };

  return (
    <>
      <StatusBar style={colors.statusBarStyle} />
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={[styles.header, dynamicStyles.header]}>
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
          <Text style={[styles.userName, dynamicStyles.userName]}>
            {profile?.full_name || user?.user_metadata?.full_name || "User"}
          </Text>
          <Text style={[styles.userEmail, dynamicStyles.userEmail]}>
            {user?.email}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, dynamicStyles.statValue]}>
                {stats.ordersCount}
              </Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
                Orders
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, dynamicStyles.statValue]}>
                {stats.designsCount}
              </Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
                Designs
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, dynamicStyles.statValue]}>
                {stats.inProgressCount}
              </Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
                In Progress
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Panel Button */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.adminPanelButton, dynamicStyles.adminPanelButton]}
            onPress={() => router.push("/admin" as any)}
          >
            <View style={styles.adminPanelContent}>
              <View style={styles.adminIconContainer}>
                <Ionicons name="shield-checkmark" size={24} color="#FF006E" />
              </View>
              <View style={styles.adminTextContainer}>
                <Text
                  style={[
                    styles.adminPanelTitle,
                    dynamicStyles.adminPanelTitle,
                  ]}
                >
                  Admin Panel
                </Text>
                <Text
                  style={[
                    styles.adminPanelSubtitle,
                    dynamicStyles.adminPanelSubtitle,
                  ]}
                >
                  Manage orders, users & products
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FF006E" />
          </TouchableOpacity>
        )}

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, dynamicStyles.sectionContent]}>
              {section.items.map((item: any, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    dynamicStyles.menuItem,
                    itemIndex === section.items.length - 1 &&
                      styles.menuItemLast,
                  ]}
                  activeOpacity={item.hasToggle ? 1 : 0.7}
                  onPress={() => !item.hasToggle && handleMenuItemPress(item)}
                  disabled={item.hasToggle}
                >
                  <View style={styles.menuItemLeft}>
                    <View
                      style={[
                        styles.menuIconContainer,
                        dynamicStyles.menuIconContainer,
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color="#FF006E"
                      />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text
                        style={[
                          styles.menuItemLabel,
                          dynamicStyles.menuItemLabel,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.value && !item.hasToggle ? (
                        <Text style={styles.menuItemValue}>{item.value}</Text>
                      ) : null}
                    </View>
                  </View>
                  {item.hasToggle ? (
                    <Switch
                      value={item.toggleValue}
                      onValueChange={item.onToggle}
                      trackColor={{ false: "#D1D5DB", true: "#FFC5DD" }}
                      thumbColor={item.toggleValue ? "#FF006E" : "#F3F4F6"}
                      ios_backgroundColor="#D1D5DB"
                    />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#B8B8D1"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, dynamicStyles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text
              style={[styles.logoutButtonText, dynamicStyles.logoutButtonText]}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, dynamicStyles.versionText]}>
            PrintCraft v1.0.0
          </Text>
          <View style={styles.versionSubtextRow}>
            <Text style={[styles.versionSubtext, dynamicStyles.versionSubtext]}>
              Made with{" "}
            </Text>
            <Ionicons name="heart" size={12} color="#F87171" />
            <Text style={[styles.versionSubtext, dynamicStyles.versionSubtext]}>
              {" "}
              for print lovers
            </Text>
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

        {/* Language Selector Modal */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <TouchableOpacity
            style={styles.languageModalOverlay}
            activeOpacity={1}
            onPress={() => setShowLanguageModal(false)}
          >
            <View
              style={[
                styles.languageModalContent,
                dynamicStyles.languageModalContent,
              ]}
            >
              <View
                style={[
                  styles.languageModalHeader,
                  dynamicStyles.languageModalHeader,
                ]}
              >
                <Text
                  style={[
                    styles.languageModalTitle,
                    dynamicStyles.languageModalTitle,
                  ]}
                >
                  Select Language
                </Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.languageList}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.languageItem, dynamicStyles.languageItem]}
                    onPress={() => {
                      setLanguage(lang.code);
                      setShowLanguageModal(false);
                      Alert.alert(
                        "Language Changed",
                        `Language set to ${lang.name}`,
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.languageItemText,
                        dynamicStyles.languageItemText,
                      ]}
                    >
                      {lang.name}
                    </Text>
                    {language === lang.code && (
                      <Ionicons name="checkmark" size={24} color="#FF006E" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
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
  languageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  languageModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  languageModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  languageItemText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
});
