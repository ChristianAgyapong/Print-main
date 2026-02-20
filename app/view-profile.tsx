import { useAuth } from "@/contexts/AuthContext";
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
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ViewProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  // Reload profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [user]),
  );

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const profileData = await profileService.get(user.id);
      setProfile(profileData);
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: {
      backgroundColor: colors.backgroundSecondary,
      borderBottomColor: colors.border,
    },
    headerTitle: { color: colors.text },
    profileCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    userName: { color: colors.text },
    userEmail: { color: colors.textSecondary },
    bioText: { color: colors.textSecondary },
    infoLabel: { color: colors.textSecondary },
    infoValue: { color: colors.text },
  };

  const renderInfoSection = (
    title: string,
    items: { label: string; value: string | null; icon: string }[],
  ) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, dynamicStyles.infoLabel]}>
        {title}
      </Text>
      <View style={[styles.sectionContent, dynamicStyles.profileCard]}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.infoRow,
              index === items.length - 1 && styles.infoRowLast,
            ]}
          >
            <View style={styles.infoLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={20} color="#FF006E" />
              </View>
              <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>
                {item.label}
              </Text>
            </View>
            <Text style={[styles.infoValue, dynamicStyles.infoValue]}>
              {item.value || "Not set"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <StatusBar style={colors.statusBarStyle} />
      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
          Personal Information
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/edit-profile")}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color="#FF006E" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF006E" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={[styles.profileHeader, dynamicStyles.profileCard]}>
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
            <Text style={[styles.userName, dynamicStyles.userName]}>
              {profile?.full_name ?? "User"}
            </Text>
            <Text style={[styles.userEmail, dynamicStyles.userEmail]}>
              {user?.email}
            </Text>
          </View>

          {/* Basic Information */}
          {renderInfoSection("Basic Information", [
            {
              label: "Full Name",
              value: profile?.full_name ?? null,
              icon: "person-outline",
            },
            {
              label: "Email",
              value: user?.email || null,
              icon: "mail-outline",
            },
            {
              label: "Phone",
              value: profile?.phone ?? null,
              icon: "call-outline",
            },
          ])}

          {/* About */}
          {(profile?.bio || profile?.company || profile?.job_title) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.infoLabel]}>
                About
              </Text>
              <View style={[styles.sectionContent, dynamicStyles.profileCard]}>
                {profile?.bio && (
                  <View style={[styles.infoRow, styles.bioRow]}>
                    <View style={styles.infoLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name="document-text-outline"
                          size={20}
                          color="#3B82F6"
                        />
                      </View>
                      <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>
                        Bio
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.infoValue,
                        styles.bioText,
                        dynamicStyles.bioText,
                      ]}
                    >
                      {profile.bio}
                    </Text>
                  </View>
                )}
                {profile?.company && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name="business-outline"
                          size={20}
                          color="#FF006E"
                        />
                      </View>
                      <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>
                        Company
                      </Text>
                    </View>
                    <Text style={[styles.infoValue, dynamicStyles.infoValue]}>
                      {profile.company}
                    </Text>
                  </View>
                )}
                {profile?.job_title && (
                  <View style={[styles.infoRow, styles.infoRowLast]}>
                    <View style={styles.infoLeft}>
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name="briefcase-outline"
                          size={20}
                          color="#FF006E"
                        />
                      </View>
                      <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>
                        Job Title
                      </Text>
                    </View>
                    <Text style={[styles.infoValue, dynamicStyles.infoValue]}>
                      {profile.job_title}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Personal Details */}
          {(profile?.date_of_birth || profile?.gender) &&
            renderInfoSection("Personal Details", [
              {
                label: "Date of Birth",
                value: profile?.date_of_birth
                  ? formatDate(profile.date_of_birth)
                  : null,
                icon: "calendar-outline",
              },
              {
                label: "Gender",
                value: profile?.gender,
                icon: "person-outline",
              },
            ])}

          {/* Address */}
          {(profile?.address_street || profile?.address_city) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.infoLabel]}>
                Address
              </Text>
              <View style={[styles.sectionContent, dynamicStyles.profileCard]}>
                <View style={styles.addressContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#FF006E"
                    />
                  </View>
                  <View style={styles.addressText}>
                    {profile?.address_street && (
                      <Text
                        style={[styles.addressLine, dynamicStyles.infoValue]}
                      >
                        {profile.address_street}
                      </Text>
                    )}
                    {(profile?.address_city ||
                      profile?.address_state ||
                      profile?.address_zip) && (
                      <Text
                        style={[styles.addressLine, dynamicStyles.infoValue]}
                      >
                        {[
                          profile?.address_city,
                          profile?.address_state,
                          profile?.address_zip,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    )}
                    {profile?.address_country && (
                      <Text
                        style={[styles.addressLine, dynamicStyles.infoValue]}
                      >
                        {profile.address_country}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Empty State */}
          {!profile?.bio &&
            !profile?.company &&
            !profile?.job_title &&
            !profile?.date_of_birth &&
            !profile?.gender &&
            !profile?.address_street &&
            !profile?.address_city && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="information-circle-outline"
                  size={64}
                  color="#B8B8D1"
                />
                <Text style={[styles.emptyStateTitle, dynamicStyles.userName]}>
                  Complete Your Profile
                </Text>
                <Text style={[styles.emptyStateText, dynamicStyles.userEmail]}>
                  Add more information to personalize your experience
                </Text>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => router.push("/edit-profile")}
                >
                  <Text style={styles.completeButtonText}>
                    Complete Profile
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 32,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF006E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  bioRow: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 0, 110, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 16,
    color: "#FF006E",
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "50%",
  },
  bioText: {
    maxWidth: "100%",
    textAlign: "left",
    marginTop: 12,
    lineHeight: 22,
    fontWeight: "400",
    color: "#1F2937",
  },
  addressContainer: {
    flexDirection: "row",
    padding: 16,
  },
  addressText: {
    flex: 1,
  },
  addressLine: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  completeButton: {
    backgroundColor: "#FF006E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
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
