import {
  adminMessagesService,
  adminService,
  Message,
  Profile,
} from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UserWithEmail = Profile & { email: string };

export default function AdminMessagesScreen() {
  const router = useRouter();
  const [showInbox, setShowInbox] = useState(false);
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithEmail | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadData();
  }, [showInbox]);

  const loadData = async () => {
    setLoading(true);
    if (showInbox) {
      await loadMessages();
    } else {
      await loadUsers();
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    const data = await adminMessagesService.getAllMessages();
    console.log(`📬 Admin: Loaded ${data.length} messages`);
    // Filter to show messages FROM users (to admin)
    const userMessages = data.filter((msg) => !msg.from_admin);
    setMessages(userMessages);
  };

  const loadUsers = async () => {
    const data = await adminService.getAllUsers();
    console.log(`📬 Admin Messages: Loaded ${data.length} users`);
    setUsers(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSelectUser = (user: UserWithEmail) => {
    setSelectedUser(user);
    setShowComposeModal(true);
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSending(true);
    const success = await adminMessagesService.sendMessage({
      user_id: selectedUser.id,
      subject: subject.trim(),
      message: message.trim(),
    });

    setSending(false);

    if (success) {
      Alert.alert(
        "Success",
        `Message sent to ${selectedUser.full_name || selectedUser.email || "user"}`,
        [
          {
            text: "OK",
            onPress: () => {
              setShowComposeModal(false);
              setSelectedUser(null);
              setSubject("");
              setMessage("");
            },
          },
        ],
      );
    } else {
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.email &&
        user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.full_name &&
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.company &&
        user.company.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF006E" />
          <Text style={styles.loadingText}>
            {showInbox ? "Loading messages..." : "Loading users..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {showInbox ? "Inbox" : "Send Message"}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setShowInbox(!showInbox);
            setSearchQuery("");
          }}
          style={styles.toggleButton}
        >
          {showInbox ? (
            <>
              <Ionicons name="send" size={20} color="#FF006E" />
              <Text style={styles.toggleButtonText}>Send</Text>
            </>
          ) : (
            <>
              <Ionicons name="mail" size={20} color="#FF006E" />
              <Text style={styles.toggleButtonText}>Inbox</Text>
              {unreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {String(unreadCount)}
                  </Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Content based on view */}
      {showInbox ? (
        // Inbox View
        <>
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Messages received from users will appear here.
            </Text>
          </View>

          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="mail-open-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Messages</Text>
                <Text style={styles.emptyText}>
                  You haven't received any messages from users yet
                </Text>
              </View>
            ) : (
              messages.map((msg) => (
                <TouchableOpacity
                  key={msg.id}
                  style={[
                    styles.messageCard,
                    !msg.read && styles.unreadMessage,
                  ]}
                  onPress={() => {
                    setExpandedMessageId(
                      expandedMessageId === msg.id ? null : msg.id,
                    );
                    if (!msg.read) {
                      adminMessagesService.markAsRead(msg.id);
                      loadMessages();
                    }
                  }}
                >
                  <View style={styles.messageHeader}>
                    <View style={styles.messageUserInfo}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                          {(msg.user?.full_name &&
                            msg.user.full_name.charAt(0).toUpperCase()) ||
                            (msg.user?.email &&
                              msg.user.email.charAt(0).toUpperCase()) ||
                            "U"}
                        </Text>
                      </View>
                      <View style={styles.messageUserDetails}>
                        <Text style={styles.messageUserName}>
                          {msg.user?.full_name || "Unknown User"}
                        </Text>
                        <Text style={styles.messageUserEmail}>
                          {msg.user?.email || "No email"}
                        </Text>
                      </View>
                    </View>
                    {!msg.read && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.messageSubject}>{msg.subject}</Text>

                  {expandedMessageId === msg.id ? (
                    <Text style={styles.messageBody}>{msg.message}</Text>
                  ) : (
                    <Text style={styles.messagePreview} numberOfLines={2}>
                      {msg.message}
                    </Text>
                  )}

                  <View style={styles.messageFooter}>
                    <Text style={styles.messageDate}>
                      {new Date(msg.created_at).toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      style={styles.replyButton}
                      onPress={() => {
                        if (msg.user && msg.user.id) {
                          // Find the full user profile from users list
                          const fullUser = users.find(
                            (u) => u.id === msg.user!.id,
                          );
                          if (fullUser) {
                            setSelectedUser(fullUser);
                            setSubject(`Re: ${msg.subject}`);
                            setShowInbox(false);
                            setShowComposeModal(true);
                          }
                        }
                      }}
                    >
                      <Ionicons name="arrow-undo" size={16} color="#FF006E" />
                      <Text style={styles.replyButtonText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      ) : (
        // Compose View
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users by name, email, or company..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Select a user to send them a message. They'll receive it in their
              Messages section.
            </Text>
          </View>

          {/* Users List */}
          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Users Found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "Try a different search term"
                    : "No registered users yet"}
                </Text>
              </View>
            ) : (
              filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userCard}
                  onPress={() => handleSelectUser(user)}
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(user.full_name &&
                        user.full_name.charAt(0).toUpperCase()) ||
                        (user.email && user.email.charAt(0).toUpperCase()) ||
                        "U"}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {user.full_name || "No Name"}
                    </Text>
                    <Text style={styles.userEmail}>
                      {user.email || "No Email"}
                    </Text>
                    {user.company ? (
                      <Text
                        style={styles.userCompany}
                      >{`🏢 ${user.company}`}</Text>
                    ) : null}
                    {user.phone ? (
                      <Text style={styles.userPhone}>{`📱 ${user.phone}`}</Text>
                    ) : null}
                  </View>

                  <Ionicons
                    name="chatbubble-ellipses"
                    size={24}
                    color="#FF006E"
                  />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Compose Message Modal */}
      <Modal
        visible={showComposeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComposeModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Message</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowComposeModal(false);
                  setSelectedUser(null);
                  setSubject("");
                  setMessage("");
                }}
              >
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Recipient Info */}
              <View style={styles.recipientCard}>
                <Text style={styles.recipientLabel}>To:</Text>
                <Text style={styles.recipientName}>
                  {selectedUser?.full_name || "Unknown"}
                </Text>
                <Text style={styles.recipientEmail}>
                  {selectedUser?.email || "No Email"}
                </Text>
              </View>

              {/* Subject Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter message subject"
                  placeholderTextColor="#9CA3AF"
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              {/* Message Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message *</Text>
                <TextInput
                  style={[styles.input, styles.messageInput]}
                  placeholder="Type your message here..."
                  placeholderTextColor="#9CA3AF"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              </View>

              {/* Send Button */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  sending && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>Send Message</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 32,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF1F7",
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF006E",
  },
  headerBadge: {
    backgroundColor: "#FF006E",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    marginLeft: 4,
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF006E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },
  userCompany: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  recipientCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recipientLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  recipientEmail: {
    fontSize: 13,
    color: "#6B7280",
  },
  inputGroup: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
  },
  messageInput: {
    minHeight: 150,
    paddingTop: 12,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF006E",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 20,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  messageCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF006E",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  messageUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  messageUserDetails: {
    marginLeft: 12,
    flex: 1,
  },
  messageUserName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  messageUserEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF006E",
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  messagePreview: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  messageBody: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  messageDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFF1F7",
    borderRadius: 8,
  },
  replyButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF006E",
  },
});
