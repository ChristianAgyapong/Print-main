import { useAuth } from "@/contexts/AuthContext";
import { Message, messagesService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    if (!user) return;

    setLoading(true);
    const data = await messagesService.getUserMessages(user.id);
    setMessages(data);
    setLoading(false);
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

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    const unreadCount = messages.filter((m) => !m.read).length;
    if (unreadCount === 0) {
      Alert.alert("Info", "No unread messages");
      return;
    }

    const success = await messagesService.markAllAsRead(user.id);
    if (success) {
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      Alert.alert("Success", "All messages marked as read");
    } else {
      Alert.alert("Error", "Failed to mark messages as read");
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF006E" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Messages</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done" size={24} color="#FF006E" />
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={styles.placeholder} />}
      </View>

      {/* Messages List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF006E"
          />
        }
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="mail-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Messages</Text>
            <Text style={styles.emptyText}>
              You don't have any messages yet. Check back later!
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View key={message.id} style={styles.messageCard}>
              <TouchableOpacity
                style={styles.messageHeader}
                onPress={() => handleMessagePress(message)}
              >
                <View style={styles.messageHeaderLeft}>
                  {!message.read && <View style={styles.unreadDot} />}
                  <View style={styles.messageHeaderText}>
                    <Text
                      style={[
                        styles.messageSubject,
                        !message.read && styles.messageSubjectUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {message.subject}
                    </Text>
                    <Text style={styles.messageDate}>
                      {new Date(message.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={
                    expandedMessageId === message.id
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              {/* Expanded Message Content */}
              {expandedMessageId === message.id && (
                <View style={styles.messageBody}>
                  <View style={styles.messageContent}>
                    <Text style={styles.messageText}>{message.message}</Text>
                  </View>

                  <View style={styles.messageActions}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteMessage(message.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
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
      </ScrollView>
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
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  unreadBadge: {
    backgroundColor: "#FF006E",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 32,
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
    textAlign: "center",
    paddingHorizontal: 40,
  },
  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  messageHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF006E",
  },
  messageHeaderText: {
    flex: 1,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  messageSubjectUnread: {
    fontWeight: "700",
  },
  messageDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  messageBody: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  messageContent: {
    padding: 16,
  },
  messageText: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
  },
  messageActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
});
