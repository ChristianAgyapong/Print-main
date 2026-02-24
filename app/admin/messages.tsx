import {
  adminMessagesService,
  adminService,
  Message,
  Profile,
} from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useCallback } from "react";
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
  const [showInbox, setShowInbox] = useState(true);
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithEmail | null>(null);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(
    null,
  );
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [showInbox]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadMessages(),
      loadUsers(),
      refreshUnreadCount()
    ]);
    setLoading(false);
  };

  const refreshUnreadCount = async () => {
    const count = await adminMessagesService.getAdminUnreadCount();
    setUnreadCount(count);
  };

  const loadMessages = async () => {
    const data = await adminMessagesService.getAllMessages();
    // For admin inbox, usually show messages from users to admin
    // But we'll show all and filter for relevant ones
    const incomingMessages = data.filter((msg) => !msg.from_admin);
    setMessages(incomingMessages);
  };

  const loadUsers = async () => {
    const data = await adminService.getAllUsers();
    setUsers(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSelectUser = (user: UserWithEmail) => {
    setSelectedUser(user);
    setIsBroadcast(false);
    setShowComposeModal(true);
  };

  const handleBroadcastInitiate = () => {
    setSelectedUser(null);
    setIsBroadcast(true);
    setShowComposeModal(true);
  };

  const handleSendMessage = async () => {
    if ((!selectedUser && !isBroadcast) || !subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSending(true);

    let success = false;
    if (isBroadcast) {
      const result = await adminMessagesService.sendToAllUsers(subject.trim(), message.trim());
      success = result.sent > 0;
      if (success) {
        Alert.alert("Success", `Broadcast sent to ${result.sent} users.`);
      }
    } else if (selectedUser) {
      success = await adminMessagesService.sendMessage({
        user_id: selectedUser.id,
        subject: subject.trim(),
        message: message.trim(),
      });
      if (success) {
        Alert.alert("Success", `Message sent to ${selectedUser.full_name || selectedUser.email}.`);
      }
    }

    setSending(false);

    if (success) {
      setShowComposeModal(false);
      setSelectedUser(null);
      setIsBroadcast(false);
      setSubject("");
      setMessage("");
      loadData();
    } else {
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const markAsRead = async (messageId: string) => {
    await adminMessagesService.markAsRead(messageId);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
    refreshUnreadCount();
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert("Delete Message", "Are you sure? This is permanent for the admin view.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const ok = await adminMessagesService.deleteMessage(messageId);
          if (ok) {
            setMessages(prev => prev.filter(m => m.id !== messageId));
            refreshUnreadCount();
          }
        }
      }
    ]);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.company?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name={showInbox ? "mail-outline" : "people-outline"} size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>{showInbox ? "No Incoming Messages" : "No Users Found"}</Text>
      <Text style={styles.emptyText}>
        {showInbox
          ? "When users message you, they will appear here."
          : "Try searching for a different user name or email."}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerBrand}>
          <View style={styles.headerIconContainer}>
            <LinearGradient
              colors={["#FF006E", "#D6005C"]}
              style={styles.headerIconGradient}
            >
              <Ionicons name="chatbubbles" size={16} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerBrandTitle}>Admin Messages</Text>
            <Text style={styles.headerBrandSubtitle}>
              {showInbox ? "CUSTOMER INBOX" : "SEND MESSAGE"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.headerActionBtn, showInbox && styles.activeTab]}
          onPress={() => setShowInbox(!showInbox)}
        >
          <View style={styles.iconWithBadge}>
            <Ionicons name={showInbox ? "create-outline" : "mail-outline"} size={22} color={showInbox ? "#FF006E" : "#1F2937"} />
            {showInbox && unreadCount > 0 && (
              <View style={styles.badgeSmall}><Text style={styles.badgeTextSmall}>{unreadCount}</Text></View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, showInbox && styles.activeTabItem]}
          onPress={() => setShowInbox(true)}
        >
          <Text style={[styles.tabText, showInbox && styles.activeTabText]}>Inbox</Text>
          {unreadCount > 0 && (
            <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{unreadCount}</Text></View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, !showInbox && styles.activeTabItem]}
          onPress={() => setShowInbox(false)}
        >
          <Text style={[styles.tabText, !showInbox && styles.activeTabText]}>Compose</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF006E" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {showInbox ? (
            // INBOX VIEW
            <View style={styles.messageList}>
              {messages.length === 0 ? renderEmptyState() : messages.map((msg) => (
                <TouchableOpacity
                  key={msg.id}
                  style={[styles.messageCard, !msg.read && styles.unreadCard]}
                  onPress={() => {
                    setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id);
                    if (!msg.read) markAsRead(msg.id);
                  }}
                >
                  <View style={styles.messageHeader}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.avatarText}>
                        {msg.user?.full_name?.charAt(0) || msg.user?.email?.charAt(0) || "U"}
                      </Text>
                    </View>
                    <View style={styles.messageMainInfo}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.userName, !msg.read && styles.boldText]}>
                          {msg.user?.full_name || "Unknown User"}
                        </Text>
                        <Text style={styles.messageDate}>
                          {new Date(msg.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={[styles.msgSubject, !msg.read && styles.boldText]} numberOfLines={1}>
                        {msg.subject}
                      </Text>
                    </View>
                    {!msg.read && <View style={styles.unreadDot} />}
                  </View>

                  {expandedMessageId === msg.id && (
                    <View style={styles.expandedContent}>
                      <Text style={styles.fullMessage}>{msg.message}</Text>
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.replyBtn}
                          onPress={() => {
                            const u = users.find(user => user.id === msg.user_id);
                            if (u) {
                              setSelectedUser(u);
                              setSubject(`Re: ${msg.subject}`);
                              setShowComposeModal(true);
                            }
                          }}
                        >
                          <Ionicons name="arrow-undo" size={16} color="#FF006E" />
                          <Text style={styles.replyBtnText}>Reply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDeleteMessage(msg.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // COMPOSE / USER LIST VIEW
            <View style={styles.userSection}>
              <TouchableOpacity
                style={styles.broadcastBtn}
                onPress={handleBroadcastInitiate}
              >
                <LinearGradient
                  colors={["#FF006E", "#BD0052"]}
                  style={styles.broadcastGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="megaphone-outline" size={24} color="#FFF" />
                  <View style={styles.broadcastTextRow}>
                    <Text style={styles.broadcastTitle}>Broadcast to Everyone</Text>
                    <Text style={styles.broadcastSub}>Send a message to all registered users</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search users..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {filteredUsers.length === 0 ? renderEmptyState() : filteredUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.userRow}
                  onPress={() => handleSelectUser(user)}
                >
                  <View style={[styles.userCircle, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={styles.userInitial}>{user.full_name?.charAt(0) || "U"}</Text>
                  </View>
                  <View style={styles.userInfoCol}>
                    <Text style={styles.userNameText}>{user.full_name || "No Name"}</Text>
                    <Text style={styles.userEmailText}>{user.email}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Compose Modal */}
      <Modal
        visible={showComposeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComposeModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{isBroadcast ? "Broadcast Message" : "Direct Message"}</Text>
                <Text style={styles.modalSubtitle}>
                  {isBroadcast ? "To: All Registered Users" : `To: ${selectedUser?.full_name || selectedUser?.email}`}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowComposeModal(false)}>
                <Ionicons name="close-circle" size={32} color="#D1D5DB" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="What is this about?"
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Message Body</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Compose your message here..."
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.sendBtn, sending && styles.btnDisabled]}
                onPress={handleSendMessage}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.sendBtnText}>Send Message</Text>
                    <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
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
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: { padding: 4 },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerIconContainer: {
    shadowColor: "#FF006E",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  headerIconGradient: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: { flexDirection: "column", gap: 1 },
  headerBrandTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  headerBrandSubtitle: { fontSize: 10, fontWeight: "400", color: "#9CA3AF" },
  headerActionBtn: { padding: 8, borderRadius: 10 },
  activeTab: { backgroundColor: "#FFF1F7" },
  iconWithBadge: { position: 'relative' },
  badgeSmall: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF006E',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF'
  },
  badgeTextSmall: { fontSize: 9, fontWeight: '800', color: '#FFF' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center'
  },
  activeTabItem: { borderBottomColor: '#FF006E' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: '#FF006E' },
  tabBadge: {
    backgroundColor: '#FF006E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6
  },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },

  content: { flex: 1 },
  messageList: { padding: 16 },
  messageCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#FFFBFD',
    borderColor: '#FF006E33',
  },
  messageHeader: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  messageMainInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  userName: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  messageDate: { fontSize: 11, color: '#9CA3AF' },
  msgSubject: { fontSize: 13, color: '#4B5563' },
  boldText: { fontWeight: '700', color: '#000' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF006E', marginLeft: 8 },

  expandedContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  fullMessage: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6
  },
  replyBtnText: { fontSize: 13, fontWeight: '600', color: '#FF006E' },
  deleteBtn: { padding: 8 },

  userSection: { padding: 16 },
  broadcastBtn: { marginBottom: 20 },
  broadcastGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16
  },
  broadcastTextRow: { flex: 1 },
  broadcastTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  broadcastSub: { fontSize: 12, color: '#FFE1ED' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    gap: 10
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12
  },
  userCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  userInitial: { fontSize: 18, fontWeight: '700', color: '#374151' },
  userInfoCol: { flex: 1 },
  userNameText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  userEmailText: { fontSize: 12, color: '#6B7280' },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  modalSubtitle: { fontSize: 12, fontWeight: '500', color: '#6B7280', marginTop: 2 },
  modalForm: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1F2937'
  },
  textArea: { minHeight: 150 },
  sendBtn: {
    backgroundColor: '#FF006E',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 10,
    marginBottom: 30
  },
  btnDisabled: { opacity: 0.6 },
  sendBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
