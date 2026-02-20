import { adminService, Profile } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await adminService.getAllUsers();
    console.log(`📊 Admin UI: Received ${data.length} users from service`);
    setUsers(data);
    setFilteredUsers(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.company?.toLowerCase().includes(query),
    );
    setFilteredUsers(filtered);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF006E" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or company..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* User Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
        </Text>
      </View>

      {/* Users List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No Users Found" : "No Users Loaded"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Try adjusting your search query"
                : "If users exist in your database but aren't showing:\n\n1. Check the console logs for errors\n2. You may need to set up RLS policies\n3. See SUPABASE_ADMIN_RLS_POLICIES.sql\n\nOr users will appear here when they sign up"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.helpButton}
                onPress={() => {
                  Alert.alert(
                    "Admin Setup Required",
                    "To view all users, you need to add Row Level Security (RLS) policies in Supabase.\n\n1. Open your Supabase project\n2. Go to SQL Editor\n3. Run the SQL from SUPABASE_ADMIN_RLS_POLICIES.sql file\n4. Replace the email addresses with your admin email\n5. Refresh this page\n\nThe console should show detailed error messages.",
                    [{ text: "OK" }],
                  );
                }}
              >
                <Ionicons name="help-circle" size={20} color="#FFFFFF" />
                <Text style={styles.helpButtonText}>Setup Help</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.avatarContainer}>
                {user.avatar_url ? (
                  <Image
                    source={{ uri: user.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {(user.full_name && user.full_name.charAt(0).toUpperCase()) || "U"}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user.full_name || "No Name"}
                </Text>
                {user.company ? (
                  <View style={styles.companyRow}>
                    <Ionicons name="business" size={14} color="#6B7280" />
                    <Text style={styles.companyText}>{user.company}</Text>
                  </View>
                ) : null}
                {user.phone ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="call" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>{user.phone}</Text>
                  </View>
                ) : null}
                {user.address_city && user.address_country ? (
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>
                      {`${user.address_city}, ${user.address_country}`}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.joinDate}>
                  {user.created_at
                    ? `Joined ${new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}`
                    : "Join date unknown"}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  countContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  countText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  userCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF006E",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  companyText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
  },
  joinDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
