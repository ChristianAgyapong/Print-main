import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Message, messagesService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const { refreshUnreadCount } = useMessages();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(
    null,
  );
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "from_admin" | "sent"
  >("all");

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  // Refresh when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadMessages();
      }
    }, [user]),
  );

  const loadMessages = async () => {
    if (!user) return;

    setLoading(true);
    const data = await messagesService.getUserMessages(user.id);
    setMessages(data);
    setLoading(false);
    // Refresh unread count
    await refreshUnreadCount();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleMessagePress = async (message: Message) => {
    // Mark as read if not already
    if (!message.read) {
      const success = await messagesService.markAsRead(message.id);
      if (success) {
        // Update local state
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, read: true } : m)),
        );
        // Refresh unread count in the badge
        await refreshUnreadCount();
      }
    }

    // Toggle expansion
    setExpandedMessageId(expandedMessageId === message.id ? null : message.id);
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await messagesService.deleteMessage(messageId);
            if (success) {
              setMessages((prev) => prev.filter((m) => m.id !== messageId));
              Alert.alert("Success", "Message deleted");
            } else {
              Alert.alert("Error", "Failed to delete message");
            }
          },
        },
      ],
    );
  };

  const handleSendToAdmin = async () => {
    if (!user) return;

    if (!composeSubject.trim()) {
      Alert.alert("Error", "Please enter a subject");
      return;
    }

    if (!composeMessage.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    setSending(true);
    const success = await messagesService.sendToAdmin(
      user.id,
      composeSubject.trim(),
      composeMessage.trim(),
    );
    setSending(false);

    if (success) {
      Alert.alert("Success", "Your message has been sent to the admin", [
        {
          text: "OK",
          onPress: () => {
            setShowComposeModal(false);
            setComposeSubject("");
            setComposeMessage("");
            loadMessages(); // Refresh to show the sent message
          },
        },
      ]);
    } else {
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const unreadCount = messages.filter((m) => !m.read && m.from_admin).length;
  const sentCount = messages.filter((m) => !m.from_admin).length;
  const fromAdminCount = messages.filter((m) => m.from_admin).length;

  // Filter messages based on active filter
  const filteredMessages = messages.filter((message) => {
    if (activeFilter === "from_admin") return message.from_admin;
    if (activeFilter === "sent") return !message.from_admin;
    return true; // "all"
  });

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textSecondary,
    },
    topBar: {
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
    },
    statsContainer: {
      backgroundColor: colors.backgroundSecondary,
    },
    statCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    statNumber: {
      color: colors.text,
    },
    statLabel: {
      color: colors.textSecondary,
    },
    filterTab: {
      backgroundColor: colors.card,
      borderColor: colors.borderLight,
    },
    filterTabText: {
      color: colors.textSecondary,
    },
    messageCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    messageSubject: {
      color: colors.text,
    },
    messageDate: {
      color: colors.textSecondary,
    },
    messageText: {
      color: colors.text,
    },
    emptyTitle: {
      color: colors.text,
    },
    emptyText: {
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
    inputLabel: {
      color: colors.text,
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
      color: colors.text,
    },
    composeInfoText: {
      color: colors.textSecondary,
    },
  };

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <StatusBar style={colors.statusBarStyle} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF006E" />
          <Text style={[styles.loadingText, dynamicStyles.loadingText]}>
            Loading messages...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar style={colors.statusBarStyle} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF006E"
          />
        }
        showsVerticalScrollIndicator={true}
      >
        {/* Compose Button in Header Area */}
        <View style={[styles.topBar, dynamicStyles.topBar]}>
          {unreadCount > 0 && (
            <View style={styles.unreadIndicator}>
              <Text style={styles.unreadIndicatorText}>
                {unreadCount} unread
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.composeButton}
            onPress={() => setShowComposeModal(true)}
          >
            <Ionicons name="create" size={18} color="#FFFFFF" />
            <Text style={styles.composeButtonText}>New Message</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Section */}
        {messages.length > 0 && (
          <View style={[styles.statsContainer, dynamicStyles.statsContainer]}>
            <View style={[styles.statCard, dynamicStyles.statCard]}>
              <Ionicons name="mail-unread" size={16} color="#FF006E" />
              <View style={styles.statInfo}>
                <Text style={[styles.statNumber, dynamicStyles.statNumber]}>
                  {unreadCount}
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
                  Unread
                </Text>
              </View>
            </View>
            <View style={[styles.statCard, dynamicStyles.statCard]}>
              <Ionicons name="arrow-down-circle" size={16} color="#8B5CF6" />
              <View style={styles.statInfo}>
                <Text style={[styles.statNumber, dynamicStyles.statNumber]}>
                  {fromAdminCount}
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
                  Received
                </Text>
              </View>
            </View>
            <View style={[styles.statCard, dynamicStyles.statCard]}>
              <Ionicons name="arrow-up-circle" size={16} color="#10B981" />
              <View style={styles.statInfo}>
                <Text style={[styles.statNumber, dynamicStyles.statNumber]}>
                  {sentCount}
                </Text>
                <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
                  Sent
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              dynamicStyles.filterTab,
              activeFilter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                dynamicStyles.filterTabText,
                activeFilter === "all" && styles.filterTabTextActive,
              ]}
            >
              All {messages.length > 0 && `(${messages.length})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              dynamicStyles.filterTab,
              activeFilter === "from_admin" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("from_admin")}
          >
            <Ionicons
              name="arrow-down"
              size={12}
              color={activeFilter === "from_admin" ? "#FFFFFF" : "#6B7280"}
              style={styles.filterTabIcon}
            />
            <Text
              style={[
                styles.filterTabText,
                dynamicStyles.filterTabText,
                activeFilter === "from_admin" && styles.filterTabTextActive,
              ]}
            >
              Admin {fromAdminCount > 0 && `(${fromAdminCount})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              dynamicStyles.filterTab,
              activeFilter === "sent" && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter("sent")}
          >
            <Ionicons
              name="arrow-up"
              size={12}
              color={activeFilter === "sent" ? "#FFFFFF" : "#6B7280"}
              style={styles.filterTabIcon}
            />
            <Text
              style={[
                styles.filterTabText,
                dynamicStyles.filterTabText,
                activeFilter === "sent" && styles.filterTabTextActive,
              ]}
            >
              Sent {sentCount > 0 && `(${sentCount})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <View style={styles.messagesContainer}>
          {filteredMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mail-outline" size={56} color="#D1D5DB" />
              <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>
                {activeFilter === "all" && "No Messages"}
                {activeFilter === "from_admin" && "No Messages from Admin"}
                {activeFilter === "sent" && "No Sent Messages"}
              </Text>
              <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                {activeFilter === "all" &&
                  "You don't have any messages yet. Check back later!"}
                {activeFilter === "from_admin" &&
                  "You haven't received any messages from the admin yet."}
                {activeFilter === "sent" &&
                  "You haven't sent any messages to the admin yet."}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowComposeModal(true)}
              >
                <Text style={styles.emptyButtonText}>
                  {activeFilter === "sent"
                    ? "Send Your First Message"
                    : "Send Message to Admin"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredMessages.map((message) => (
              <View
                key={message.id}
                style={[styles.messageCard, dynamicStyles.messageCard]}
              >
                <TouchableOpacity
                  style={styles.messageHeader}
                  onPress={() => handleMessagePress(message)}
                >
                  <View style={styles.messageHeaderLeft}>
                    {!message.read && <View style={styles.unreadDot} />}
                    <View style={styles.messageHeaderText}>
                      <View style={styles.subjectRow}>
                        <Text
                          style={[
                            styles.messageSubject,
                            dynamicStyles.messageSubject,
                            !message.read && styles.messageSubjectUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {message.subject}
                        </Text>
                        <View
                          style={[
                            styles.directionBadge,
                            message.from_admin
                              ? styles.fromAdminBadge
                              : styles.toAdminBadge,
                          ]}
                        >
                          <Ionicons
                            name={
                              message.from_admin ? "arrow-down" : "arrow-up"
                            }
                            size={10}
                            color="#FFFFFF"
                          />
                          <Text style={styles.directionBadgeText}>
                            {message.from_admin ? "Admin" : "Sent"}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[styles.messageDate, dynamicStyles.messageDate]}
                      >
                        {message.created_at
                          ? new Date(message.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "Date unknown"}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={
                      expandedMessageId === message.id
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>

                {/* Expanded Message Content */}
                {expandedMessageId === message.id && (
                  <View style={styles.messageBody}>
                    <View style={styles.messageContent}>
                      <Text
                        style={[styles.messageText, dynamicStyles.messageText]}
                      >
                        {message.message}
                      </Text>
                    </View>

                    <View style={styles.messageActions}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteMessage(message.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#EF4444"
                        />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Compose Message Modal */}
      <Modal
        visible={showComposeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowComposeModal(false)}
      >
        <SafeAreaView
          style={[styles.modalContainer, dynamicStyles.modalContainer]}
        >
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <TouchableOpacity onPress={() => setShowComposeModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
              Message Admin
            </Text>
            <TouchableOpacity onPress={handleSendToAdmin} disabled={sending}>
              {sending ? (
                <ActivityIndicator size="small" color="#FF006E" />
              ) : (
                <Ionicons name="send" size={24} color="#FF006E" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.composeInfo}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text
                style={[styles.composeInfoText, dynamicStyles.composeInfoText]}
              >
                Send a message to the admin team. You'll receive a response
                here.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                Subject *
              </Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="Enter subject"
                placeholderTextColor={colors.textSecondary}
                value={composeSubject}
                onChangeText={setComposeSubject}
                editable={!sending}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                Message *
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, dynamicStyles.input]}
                placeholder="Type your message here..."
                placeholderTextColor={colors.textSecondary}
                value={composeMessage}
                onChangeText={setComposeMessage}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                editable={!sending}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  unreadIndicator: {
    backgroundColor: "#FFF1F7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF006E",
  },
  unreadIndicatorText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF006E",
  },
  composeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FF006E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#FF006E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  composeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  statInfo: {
    alignItems: "flex-start",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 0,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterTabActive: {
    backgroundColor: "#FF006E",
    borderColor: "#FF006E",
  },
  filterTabIcon: {
    marginRight: 3,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: "#FF006E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  messageHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF006E",
  },
  messageHeaderText: {
    flex: 1,
  },
  messageSubject: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 3,
    flex: 1,
  },
  messageSubjectUnread: {
    fontWeight: "700",
  },
  messageDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  messageBody: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  messageContent: {
    padding: 12,
  },
  messageText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  messageActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  directionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  fromAdminBadge: {
    backgroundColor: "#8B5CF6",
  },
  toAdminBadge: {
    backgroundColor: "#10B981",
  },
  directionBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  composeInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  composeInfoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
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
  textArea: {
    minHeight: 150,
    textAlignVertical: "top",
  },
});
