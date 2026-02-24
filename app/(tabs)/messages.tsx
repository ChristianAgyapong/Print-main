import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Message, messagesService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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

// ─── helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name?: string | null): string {
  if (!name) return "PC";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

type Filter = "all" | "inbox" | "sent";

export default function MessagesScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const { refreshUnreadCount } = useMessages();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [showCompose, setShowCompose] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) loadMessages();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) loadMessages();
    }, [user]),
  );

  const loadMessages = async () => {
    if (!user) return;
    setLoading(true);
    const data = await messagesService.getUserMessages(user.id);
    setMessages(data);
    setLoading(false);
    await refreshUnreadCount();
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handlePress = async (msg: Message) => {
    if (!msg.read) {
      const ok = await messagesService.markAsRead(msg.id);
      if (ok) {
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
        await refreshUnreadCount();
      }
    }
    setExpandedId(expandedId === msg.id ? null : msg.id);
  };

  const handleDelete = (id: string) =>
    Alert.alert("Delete Message", "Remove this message permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (await messagesService.deleteMessage(id)) {
            setMessages((prev) => prev.filter((m) => m.id !== id));
          } else {
            Alert.alert("Error", "Could not delete the message.");
          }
        },
      },
    ]);

  const handleSend = async () => {
    if (!user) return;
    if (!composeSubject.trim()) { Alert.alert("Required", "Please enter a subject."); return; }
    if (!composeBody.trim()) { Alert.alert("Required", "Please enter a message."); return; }

    setSending(true);
    const ok = await messagesService.sendToAdmin(user.id, composeSubject.trim(), composeBody.trim());
    setSending(false);

    if (ok) {
      Alert.alert("✅ Sent", "Your message has been sent to the support team.", [
        {
          text: "OK", onPress: () => {
            setShowCompose(false);
            setComposeSubject("");
            setComposeBody("");
            loadMessages();
          }
        },
      ]);
    } else {
      Alert.alert("Error", "Failed to send. Please try again.");
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const unread = messages.filter((m) => !m.read && m.from_admin).length;
  const inbox = messages.filter((m) => m.from_admin);
  const sent = messages.filter((m) => !m.from_admin);
  const filtered = activeFilter === "inbox" ? inbox
    : activeFilter === "sent" ? sent
      : messages;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <StatusBar style="dark" />
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#FF006E" />
          <Text style={s.loadingText}>Loading messages…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["bottom"]}>
      <StatusBar style="dark" />

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <View style={s.toolbar}>
        {/* Stats chips */}
        <View style={s.toolbarStats}>
          {unread > 0 && (
            <View style={s.unreadChip}>
              <View style={s.unreadDotSmall} />
              <Text style={s.unreadChipText}>{unread} unread</Text>
            </View>
          )}
          <Text style={s.toolbarTotal}>{messages.length} messages</Text>
        </View>

        {/* Compose FAB */}
        <TouchableOpacity style={s.composeFab} onPress={() => setShowCompose(true)} activeOpacity={0.8}>
          <Ionicons name="create-outline" size={17} color="#fff" />
          <Text style={s.composeFabText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter pills ──────────────────────────────────────────────────── */}
      <View style={s.filterBar}>
        {([["all", "All", messages.length], ["inbox", "Inbox", inbox.length], ["sent", "Sent", sent.length]] as [Filter, string, number][]).map(
          ([key, label, count]) => (
            <TouchableOpacity
              key={key}
              style={[s.pill, activeFilter === key && s.pillActive]}
              onPress={() => setActiveFilter(key)}
              activeOpacity={0.75}
            >
              <Text style={[s.pillText, activeFilter === key && s.pillTextActive]}>
                {label}
              </Text>
              {count > 0 && (
                <View style={[s.pillBadge, activeFilter === key && s.pillBadgeActive]}>
                  <Text style={[s.pillBadgeText, activeFilter === key && s.pillBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )
        )}
      </View>

      {/* ── Message list ──────────────────────────────────────────────────── */}
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF006E" />
          }
        >
          {filtered.length === 0 ? (
            <EmptyState filter={activeFilter} onCompose={() => setShowCompose(true)} />
          ) : (
            <View style={s.list}>
              {filtered.map((msg, idx) => {
                const isOpen = expandedId === msg.id;
                const isAdmin = msg.from_admin;
                const isUnread = !msg.read && isAdmin;

                return (
                  <View key={msg.id}>
                    {/* Divider (not before first) */}
                    {idx > 0 && <View style={s.divider} />}

                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() => handlePress(msg)}
                      style={[s.row, isUnread && s.rowUnread]}
                    >
                      {/* Unread stripe */}
                      {isUnread && <View style={s.unreadStripe} />}

                      {/* Avatar */}
                      <View style={[s.avatar, isAdmin ? s.avatarAdmin : s.avatarUser]}>
                        {isAdmin
                          ? <Ionicons name="shield-checkmark" size={18} color="#fff" />
                          : <Text style={s.avatarText}>{initials(user?.email)}</Text>
                        }
                      </View>

                      {/* Content */}
                      <View style={s.rowBody}>
                        <View style={s.rowTopLine}>
                          <Text style={[s.rowSender, isUnread && s.rowSenderBold]} numberOfLines={1}>
                            {isAdmin ? "PrintCraft Support" : "You → Support"}
                          </Text>
                          <Text style={[s.rowTime, isUnread && s.rowTimeBold]}>
                            {msg.created_at ? relativeTime(msg.created_at) : ""}
                          </Text>
                        </View>

                        <Text style={[s.rowSubject, isUnread && s.rowSubjectBold]} numberOfLines={1}>
                          {msg.subject}
                        </Text>

                        <View style={s.rowBottomLine}>
                          <Text style={s.rowPreview} numberOfLines={1}>
                            {isOpen ? "" : msg.message}
                          </Text>
                          {/* Badge */}
                          <View style={[s.badge, isAdmin ? s.badgeAdmin : s.badgeSent]}>
                            <Ionicons
                              name={isAdmin ? "arrow-down" : "arrow-up"}
                              size={9}
                              color={isAdmin ? "#8B5CF6" : "#10B981"}
                            />
                            <Text style={[s.badgeText, isAdmin ? s.badgeTextAdmin : s.badgeTextSent]}>
                              {isAdmin ? "Inbox" : "Sent"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Chevron */}
                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#C4C4CF"
                        style={{ marginLeft: 4 }}
                      />
                    </TouchableOpacity>

                    {/* Expanded body */}
                    {isOpen && (
                      <View style={s.expandedWrap}>
                        {/* Thread header */}
                        <View style={s.threadHeader}>
                          <Text style={s.threadHeaderLabel}>
                            {isAdmin ? "From: PrintCraft Support" : "To: PrintCraft Support"}
                          </Text>
                          <Text style={s.threadHeaderDate}>
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleString("en-US", {
                                weekday: "short", month: "short", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })
                              : "—"}
                          </Text>
                        </View>

                        <Text style={s.expandedBody}>{msg.message}</Text>

                        {/* Actions */}
                        <View style={s.expandedActions}>
                          <TouchableOpacity
                            style={s.replyBtn}
                            onPress={() => {
                              setComposeSubject(`Re: ${msg.subject}`);
                              setShowCompose(true);
                            }}
                          >
                            <Ionicons name="arrow-undo-outline" size={15} color="#FF006E" />
                            <Text style={s.replyBtnText}>Reply</Text>
                          </TouchableOpacity>

                          <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(msg.id)}>
                            <Ionicons name="trash-outline" size={15} color="#EF4444" />
                            <Text style={s.deleteBtnText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
              <View style={{ height: 100 }} />
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* ── Compose Modal ─────────────────────────────────────────────────── */}
      <Modal visible={showCompose} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCompose(false)}>
        <SafeAreaView style={s.composeContainer}>
          <StatusBar style="dark" />

          {/* Compose header */}
          <View style={s.composeHeader}>
            <TouchableOpacity style={s.composeHeaderBtn} onPress={() => setShowCompose(false)}>
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={s.composeTitle}>New Message</Text>
            <TouchableOpacity
              style={[s.sendBtn, (sending || !composeSubject.trim() || !composeBody.trim()) && s.sendBtnDisabled]}
              onPress={handleSend}
              disabled={sending || !composeSubject.trim() || !composeBody.trim()}
            >
              {sending
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Ionicons name="send" size={14} color="#fff" /><Text style={s.sendBtnText}>Send</Text></>
              }
            </TouchableOpacity>
          </View>

          {/* To chip */}
          <View style={s.toRow}>
            <Text style={s.toLabel}>To</Text>
            <View style={s.toChip}>
              <LinearGradient colors={["#FF006E", "#D6005C"]} style={s.toChipIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="shield-checkmark" size={12} color="#fff" />
              </LinearGradient>
              <Text style={s.toChipText}>PrintCraft Support</Text>
            </View>
          </View>

          <View style={s.composeDividerLine} />

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">

              {/* Subject */}
              <View style={s.composeFieldRow}>
                <Text style={s.composeFieldLabel}>Subject</Text>
                <TextInput
                  style={s.composeSubjectInput}
                  value={composeSubject}
                  onChangeText={setComposeSubject}
                  placeholder="What is this about?"
                  placeholderTextColor="#C4C4CF"
                  editable={!sending}
                />
              </View>

              <View style={s.composeDividerLine} />

              {/* Body */}
              <TextInput
                style={s.composeBodyInput}
                value={composeBody}
                onChangeText={setComposeBody}
                placeholder={"Write your message here…\n\nOur team usually responds within 24 hours."}
                placeholderTextColor="#C4C4CF"
                multiline
                textAlignVertical="top"
                editable={!sending}
              />

              {/* Character count */}
              <Text style={s.charCount}>{composeBody.length} characters</Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filter, onCompose }: { filter: Filter; onCompose: () => void }) {
  const icons: Record<Filter, any> = { all: "mail-outline", inbox: "arrow-down-circle-outline", sent: "arrow-up-circle-outline" };
  const titles: Record<Filter, string> = { all: "No messages yet", inbox: "Nothing in Inbox", sent: "Nothing sent yet" };
  const bodies: Record<Filter, string> = {
    all: "Your conversation with PrintCraft Support will appear here.",
    inbox: "Messages from the support team will show up here.",
    sent: "Messages you send to support will appear here.",
  };

  return (
    <View style={es.wrap}>
      <View style={es.iconWrap}>
        <Ionicons name={icons[filter]} size={48} color="#D1D5DB" />
      </View>
      <Text style={es.title}>{titles[filter]}</Text>
      <Text style={es.body}>{bodies[filter]}</Text>
      <TouchableOpacity style={es.btn} onPress={onCompose} activeOpacity={0.8}>
        <Ionicons name="create-outline" size={16} color="#fff" />
        <Text style={es.btnText}>Send a Message</Text>
      </TouchableOpacity>
    </View>
  );
}
const es = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "700", color: "#1F2937", marginBottom: 8 },
  body: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 21 },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 28, backgroundColor: "#FF006E", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, shadowColor: "#FF006E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FB" },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { fontSize: 15, color: "#9CA3AF" },

  // Toolbar
  toolbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#EDEEF2",
  },
  toolbarStats: { flexDirection: "row", alignItems: "center", gap: 10 },
  toolbarTotal: { fontSize: 12, color: "#9CA3AF" },
  unreadChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#FFF1F7", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: "#FFB3D1",
  },
  unreadDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF006E" },
  unreadChipText: { fontSize: 11, fontWeight: "700", color: "#FF006E" },
  composeFab: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#FF006E", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, shadowColor: "#FF006E", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  composeFabText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Filter pills
  filterBar: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EDEEF2",
  },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  pillActive: { backgroundColor: "#FF006E" },
  pillText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  pillTextActive: { color: "#fff" },
  pillBadge: { backgroundColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  pillBadgeActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  pillBadgeText: { fontSize: 10, fontWeight: "700", color: "#6B7280" },
  pillBadgeTextActive: { color: "#fff" },

  // List
  list: { backgroundColor: "#fff", marginTop: 12, marginHorizontal: 0 },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginLeft: 72 },

  // Row
  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14, paddingRight: 14,
    backgroundColor: "#fff", position: "relative",
  },
  rowUnread: { backgroundColor: "#FDFCFF" },
  unreadStripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3, backgroundColor: "#FF006E", borderRadius: 2 },

  // Avatar
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginLeft: 14, marginRight: 12 },
  avatarAdmin: { backgroundColor: "#8B5CF6" },
  avatarUser: { backgroundColor: "#FF006E" },
  avatarText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // Row text
  rowBody: { flex: 1 },
  rowTopLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  rowSender: { fontSize: 14, fontWeight: "500", color: "#374151", flex: 1, marginRight: 8 },
  rowSenderBold: { fontWeight: "700", color: "#1F2937" },
  rowTime: { fontSize: 11, color: "#9CA3AF" },
  rowTimeBold: { color: "#FF006E", fontWeight: "600" },
  rowSubject: { fontSize: 13, fontWeight: "500", color: "#6B7280", marginBottom: 4 },
  rowSubjectBold: { fontWeight: "700", color: "#1F2937" },
  rowBottomLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowPreview: { fontSize: 12, color: "#B0B0B8", flex: 1, marginRight: 8 },

  // Badges
  badge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  badgeAdmin: { backgroundColor: "#EDE9FE" },
  badgeSent: { backgroundColor: "#D1FAE5" },
  badgeText: { fontSize: 10, fontWeight: "600" },
  badgeTextAdmin: { color: "#8B5CF6" },
  badgeTextSent: { color: "#059669" },

  // Expanded
  expandedWrap: {
    marginLeft: 70, marginRight: 14, marginBottom: 14,
    backgroundColor: "#F9FAFB", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "#EDEEF2",
  },
  threadHeader: { marginBottom: 10 },
  threadHeaderLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  threadHeaderDate: { fontSize: 11, color: "#B0B0B8", marginTop: 2 },
  expandedBody: { fontSize: 14, color: "#374151", lineHeight: 22 },
  expandedActions: { flexDirection: "row", gap: 12, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EDEEF2" },
  replyBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: "#FFF1F7", borderWidth: 1, borderColor: "#FFB3D1" },
  replyBtnText: { fontSize: 13, fontWeight: "600", color: "#FF006E" },
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" },
  deleteBtnText: { fontSize: 13, fontWeight: "600", color: "#EF4444" },

  // Compose modal
  composeContainer: { flex: 1, backgroundColor: "#fff" },
  composeHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#EDEEF2",
  },
  composeHeaderBtn: { width: 34, height: 34, borderRadius: 9, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center" },
  composeTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  sendBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FF006E", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // To chip
  toRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  toLabel: { fontSize: 13, fontWeight: "600", color: "#9CA3AF", width: 36 },
  toChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  toChipIcon: { width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  toChipText: { fontSize: 13, fontWeight: "600", color: "#1F2937" },

  composeDividerLine: { height: 1, backgroundColor: "#EDEEF2" },

  // Subject row
  composeFieldRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  composeFieldLabel: { fontSize: 13, fontWeight: "600", color: "#9CA3AF", width: 60 },
  composeSubjectInput: { flex: 1, fontSize: 15, color: "#1F2937" },

  // Body
  composeBodyInput: { padding: 16, fontSize: 15, color: "#1F2937", minHeight: 260, lineHeight: 24 },
  charCount: { fontSize: 11, color: "#C4C4CF", textAlign: "right", paddingHorizontal: 16, paddingBottom: 16 },
});
