import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Profile, profileService } from "@/lib/database-service";
import { storageService } from "@/lib/storage-service";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const profileData = await profileService.get(user.id);
      if (profileData) {
        setProfile(profileData);
        setAvatarUri(profileData.avatar_url);
        setFullName(profileData.full_name || "");
        setPhone(profileData.phone || "");
        setBio(profileData.bio || "");
        setAddressStreet(profileData.address_street || "");
        setAddressCity(profileData.address_city || "");
        setAddressState(profileData.address_state || "");
        setAddressZip(profileData.address_zip || "");
        setAddressCountry(profileData.address_country || "");
        setCompany(profileData.company || "");
        setJobTitle(profileData.job_title || "");
        setDateOfBirth(profileData.date_of_birth || "");
        setGender(profileData.gender || "");
      } else {
        // Fallback to user metadata
        setFullName(user.user_metadata?.full_name || "");
        setPhone(user.user_metadata?.phone || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos to change your profile picture.",
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return;
    }

    // Validate date of birth format if provided
    if (dateOfBirth && dateOfBirth.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateOfBirth)) {
        Alert.alert(
          "Invalid Date Format",
          "Please enter date of birth in YYYY-MM-DD format (e.g., 1990-01-15)",
        );
        return;
      }

      // Validate it's a valid date
      const date = new Date(dateOfBirth);
      if (isNaN(date.getTime())) {
        Alert.alert("Invalid Date", "Please enter a valid date");
        return;
      }
    }

    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url || null;

      // Upload new avatar if changed
      if (avatarUri && avatarUri !== profile?.avatar_url) {
        setUploading(true);
        try {
          const uploadedUrl = await storageService.uploadAvatar(
            avatarUri,
            user.id,
            profile?.avatar_url,
          );

          if (uploadedUrl) {
            avatarUrl = uploadedUrl;
            console.log("Avatar uploaded successfully:", avatarUrl);
          } else {
            throw new Error("Failed to get avatar URL");
          }
        } catch (uploadError: any) {
          console.error("Avatar upload error:", uploadError);
          setUploading(false);
          setSaving(false);

          // Show specific error message from storage service
          const errorMessage =
            uploadError.message ||
            "Failed to upload profile picture. Please try again.";
          Alert.alert("Upload Error", errorMessage);
          return; // Stop the save process
        } finally {
          setUploading(false);
        }
      }

      // Update both auth user metadata and profile table
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
        },
      });

      if (authError) throw authError;

      // Prepare profile updates with proper null handling for optional fields
      const profileUpdates: Partial<Profile> = {
        full_name: fullName,
        avatar_url: avatarUrl,
        phone: phone || null,
        bio: bio || null,
        address_street: addressStreet || null,
        address_city: addressCity || null,
        address_state: addressState || null,
        address_zip: addressZip || null,
        address_country: addressCountry || null,
        company: company || null,
        job_title: jobTitle || null,
        date_of_birth: dateOfBirth && dateOfBirth.trim() ? dateOfBirth : null,
        gender: gender || null,
      };

      // Update profile in profiles table
      const profileSuccess = await profileService.update(
        user.id,
        profileUpdates,
      );

      if (!profileSuccess) {
        // If profile doesn't exist, create it
        await profileService.create(user.id, fullName);
        // Then update with avatar URL
        if (avatarUrl) {
          await profileService.update(user.id, {
            avatar_url: avatarUrl,
          });
        }
      }

      console.log("Profile updated with avatar URL:", avatarUrl);

      // Show success message and navigate back
      Alert.alert("Success", "Profile updated successfully!");

      // Navigate back with fallback to profile tab
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/profile");
        }
      }, 100);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
    container: {
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.backgroundSecondary,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.text,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    sectionTitle: {
      color: colors.text,
    },
    label: {
      color: colors.text,
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
      color: colors.text,
    },
    inputText: {
      color: colors.textSecondary,
    },
    modalContainer: {
      backgroundColor: colors.background,
    },
    modalHeader: {
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      color: colors.text,
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <StatusBar style={colors.statusBarStyle} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={[styles.header, dynamicStyles.header]}>
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Edit Profile</Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Avatar */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  style={styles.avatar}
                  onPress={() => avatarUri && setShowAvatarModal(true)}
                  activeOpacity={avatarUri ? 0.7 : 1}
                >
                  {avatarUri ? (
                    <Image
                      key={avatarUri}
                      source={{ uri: avatarUri }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={48} color="#fff" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={pickImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#FF006E" />
                  ) : (
                    <>
                      <Ionicons name="camera" size={18} color="#FF006E" />
                      <Text style={styles.changePhotoText}>Change Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, dynamicStyles.label]}>Full Name *</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, dynamicStyles.label]}>Email</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input, styles.inputDisabled]}
                    value={user?.email || ""}
                    editable={false}
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.helperText}>Email cannot be changed</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, dynamicStyles.label]}>Phone Number</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.sectionDivider}>
                  <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>About</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, dynamicStyles.label]}>Bio</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, dynamicStyles.label]}>Company</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={company}
                    onChangeText={setCompany}
                    placeholder="Your company name"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, dynamicStyles.label]}>Job Title</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={jobTitle}
                    onChangeText={setJobTitle}
                    placeholder="Your job title"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.sectionDivider}>
                  <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Personal Information</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, dynamicStyles.label]}>Date of Birth</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    keyboardType="numbers-and-punctuation"
                  />
                  <Text style={styles.helperText}>
                    Optional: Enter in YYYY-MM-DD format
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, dynamicStyles.label]}>Gender</Text>
                  <View style={styles.genderContainer}>
                    {["Male", "Female", "Other", "Prefer not to say"].map(
                      (option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.genderOption,
                            gender === option && styles.genderOptionSelected,
                          ]}
                          onPress={() => setGender(option)}
                        >
                          <Text
                            style={[
                              styles.genderOptionText,
                              gender === option &&
                                styles.genderOptionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                <View style={styles.sectionDivider}>
                  <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Address</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, dynamicStyles.label]}>Street Address</Text>
                  <TextInput
                    style={[styles.input, dynamicStyles.input]}
                    value={addressStreet}
                    onChangeText={setAddressStreet}
                    placeholder="123 Main Street"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={[styles.label, dynamicStyles.label]}>City</Text>
                    <TextInput
                      style={[styles.input, dynamicStyles.input]}
                      value={addressCity}
                      onChangeText={setAddressCity}
                      placeholder="City"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={[styles.label, dynamicStyles.label]}>State/Province</Text>
                    <TextInput
                      style={[styles.input, dynamicStyles.input]}
                      value={addressState}
                      onChangeText={setAddressState}
                      placeholder="State"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={[styles.label, dynamicStyles.label]}>ZIP/Postal Code</Text>
                    <TextInput
                      style={[styles.input, dynamicStyles.input]}
                      value={addressZip}
                      onChangeText={setAddressZip}
                      placeholder="12345"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={[styles.label, dynamicStyles.label]}>Country</Text>
                    <TextInput
                      style={[styles.input, dynamicStyles.input]}
                      value={addressCountry}
                      onChangeText={setAddressCountry}
                      placeholder="Country"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#3B82F6"
                  />
                  <Text style={styles.infoText}>
                    Your personal information is stored securely and will only
                    be used to improve your experience.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Avatar Preview Modal */}
        <Modal
          visible={showAvatarModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <TouchableOpacity
            style={[styles.modalContainer, dynamicStyles.modalContainer]}
            activeOpacity={1}
            onPress={() => setShowAvatarModal(false)}
          >
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAvatarModal(false)}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            {avatarUri && (
              <Image
                source={{ uri: avatarUri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
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
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF006E",
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  inputDisabled: {
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },
  sectionDivider: {
    marginTop: 20,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.12)",
    backgroundColor: "#FFFFFF",
  },
  genderOptionSelected: {
    backgroundColor: "#FF006E",
    borderColor: "#FF006E",
  },
  genderOptionText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  genderOptionTextSelected: {
    color: "#fff",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 0, 110, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 110, 0.3)",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#FF006E",
    lineHeight: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF006E",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
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
