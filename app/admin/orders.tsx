import { adminService, Order } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

export default function AdminOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<
    (Order & { user?: { email: string; name: string; phone: string | null } })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await adminService.getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleUpdateStatus = (orderId: string, currentStatus: string) => {
    // Standard order flow
    const flow = ["pending", "processing", "shipped", "delivered", "cancelled"];

    Alert.alert(
      "Update Status",
      `Select new status for Order #${orderId.substring(0, 8)}`,
      [
        { text: "Cancel", style: "cancel" },
        ...flow.map(status => ({
          text: status.charAt(0).toUpperCase() + status.slice(1),
          style: status === "cancelled" ? "destructive" as const : "default" as const,
          onPress: async () => {
            const success = await adminService.updateOrderStatus(orderId, status);
            if (success) {
              loadOrders();
            } else {
              Alert.alert("Error", "Failed to update status");
            }
          }
        }))
      ]
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "#F59E0B", icon: "time-outline", bg: "#FEF3C7" };
      case "processing":
        return { color: "#3B82F6", icon: "construct-outline", bg: "#DBEAFE" };
      case "shipped":
        return { color: "#8B5CF6", icon: "airplane-outline", bg: "#EDE9FE" };
      case "delivered":
        return { color: "#10B981", icon: "checkmark-circle-outline", bg: "#D1FAE5" };
      case "cancelled":
        return { color: "#EF4444", icon: "close-circle-outline", bg: "#FEE2E2" };
      default:
        return { color: "#6B7280", icon: "help-circle-outline", bg: "#F3F4F6" };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHrs / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return "Yesterday";
    return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateStats = () => {
    const total = orders.length;
    const revenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const pending = orders.filter(o => o.status === "pending" || o.status === "processing").length;
    return { total, revenue, pending };
  };

  const stats = calculateStats();

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF006E" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              <Ionicons name="receipt" size={16} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerBrandTitle}>Order Management</Text>
            <Text style={styles.headerBrandSubtitle}>REVENUE & FULFILLMENT</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <LinearGradient
            colors={["#FF006E", "#BD0052"]}
            style={styles.mainStatCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconCircle}>
              <Ionicons name="wallet-outline" size={20} color="#FFF" />
            </View>
            <Text style={styles.mainStatLabel}>Total Revenue</Text>
            <Text style={styles.mainStatValue}>€{stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
            <View style={styles.statFooter}>
              <Text style={styles.statFooterText}>From {stats.total} successful orders</Text>
            </View>
          </LinearGradient>

          <View style={styles.statRow}>
            <View style={styles.smallStatCard}>
              <Text style={styles.smallStatValue}>{stats.pending}</Text>
              <Text style={styles.smallStatLabel}>To Process</Text>
              <View style={[styles.statBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.statBadgeText, { color: '#D97706' }]}>Action Required</Text>
              </View>
            </View>
            <View style={styles.smallStatCard}>
              <Text style={styles.smallStatValue}>{orders.filter(o => o.status === 'delivered').length}</Text>
              <Text style={styles.smallStatLabel}>Completed</Text>
              <View style={[styles.statBadge, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[styles.statBadgeText, { color: '#059669' }]}>Delivered</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Text style={styles.sectionSub}>{orders.length} items found</Text>
        </View>

        {/* Orders List */}
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>When customers purchase, they'll show up here.</Text>
          </View>
        ) : (
          orders.map((order) => {
            const config = getStatusConfig(order.status || "pending");
            return (
              <View key={order.id} style={styles.orderMasterCard}>
                <TouchableOpacity
                  onPress={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  style={styles.orderMainArea}
                >
                  <View style={styles.orderLeftCol}>
                    <View style={styles.customerAvatar}>
                      <Text style={styles.avatarText}>{order.user?.name?.charAt(0) || "U"}</Text>
                    </View>
                    <View style={styles.verticalLine} />
                  </View>

                  <View style={styles.orderRightCol}>
                    <View style={styles.orderHeaderRow}>
                      <Text style={styles.orderIdLabel}>#{order.id.substring(0, 8).toUpperCase()}</Text>
                      <Text style={styles.relativeTime}>{getTimeAgo(order.created_at)}</Text>
                    </View>

                    <Text style={styles.customerName}>{order.user?.name || "Unknown Customer"}</Text>

                    <View style={styles.statusPriceRow}>
                      <View style={[styles.inlineStatusBadge, { backgroundColor: config.bg }]}>
                        <Ionicons name={config.icon as any} size={12} color={config.color} />
                        <Text style={[styles.inlineStatusText, { color: config.color }]}>
                          {order.status?.toUpperCase() || "PENDING"}
                        </Text>
                      </View>
                      <Text style={styles.orderPrice}>€{order.total_amount?.toFixed(2)}</Text>
                    </View>

                    {expandedOrderId === order.id && (
                      <View style={styles.detailsReveal}>
                        <View style={styles.divider} />
                        <Text style={styles.itemsLabel}>ORDER ITEMS</Text>
                        {order.items?.map((item) => (
                          <View key={item.id} style={styles.itemMiniRow}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.product?.title}</Text>
                            <Text style={styles.itemQtyX}>x{item.quantity}</Text>
                            <Text style={styles.itemPriceVal}>€{item.price?.toFixed(2)}</Text>
                          </View>
                        ))}

                        <View style={styles.contactInfo}>
                          <View style={styles.contactItem}>
                            <Ionicons name="mail-outline" size={14} color="#6B7280" />
                            <Text style={styles.contactText}>{order.user?.email || "N/A"}</Text>
                          </View>
                          {order.user?.phone && (
                            <View style={styles.contactItem}>
                              <Ionicons name="call-outline" size={14} color="#6B7280" />
                              <Text style={styles.contactText}>{order.user.phone}</Text>
                            </View>
                          )}
                        </View>

                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleUpdateStatus(order.id, order.status || "pending")}
                        >
                          <Text style={styles.actionBtnText}>Update Order Status</Text>
                          <Ionicons name="chevron-forward" size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#6B7280", fontWeight: '500' },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  backButton: { padding: 4 },
  headerBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIconContainer: { elevation: 2, shadowColor: "#FF006E", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  headerIconGradient: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  headerTextContainer: { flexDirection: "column" },
  headerBrandTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  headerBrandSubtitle: { fontSize: 10, fontWeight: "500", color: "#9CA3AF", letterSpacing: 0.5 },
  refreshBtn: { padding: 8 },

  content: { flex: 1 },
  statsGrid: { padding: 20 },
  mainStatCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#FF006E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  mainStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  mainStatValue: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  statFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  statFooterText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  statRow: { flexDirection: 'row', gap: 12 },
  smallStatCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F1F1'
  },
  smallStatValue: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
  smallStatLabel: { fontSize: 12, color: '#6B7280', marginTop: 2, marginBottom: 8 },
  statBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statBadgeText: { fontSize: 10, fontWeight: '800' },

  sectionHeader: { paddingHorizontal: 20, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  sectionSub: { fontSize: 12, color: '#9CA3AF' },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },

  orderMasterCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    overflow: 'hidden'
  },
  orderMainArea: { flexDirection: 'row', padding: 16 },
  orderLeftCol: { alignItems: 'center', marginRight: 16 },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#374151' },
  verticalLine: { flex: 1, width: 2, backgroundColor: '#F3F4F6', marginTop: 8, borderRadius: 1 },

  orderRightCol: { flex: 1 },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderIdLabel: { fontSize: 12, fontWeight: '800', color: '#FF006E', letterSpacing: 1 },
  relativeTime: { fontSize: 12, color: '#9CA3AF' },
  customerName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 10 },

  statusPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inlineStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5
  },
  inlineStatusText: { fontSize: 10, fontWeight: '800' },
  orderPrice: { fontSize: 18, fontWeight: '800', color: '#1F2937' },

  detailsReveal: { marginTop: 16 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
  itemsLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12 },
  itemMiniRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  itemTitle: { flex: 1, fontSize: 13, color: '#4B5563', fontWeight: '500' },
  itemQtyX: { fontSize: 13, color: '#9CA3AF', marginHorizontal: 12 },
  itemPriceVal: { fontSize: 13, color: '#1F2937', fontWeight: '600' },

  contactInfo: { marginTop: 12, gap: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 13, color: '#6B7280' },

  actionBtn: {
    backgroundColor: '#FF006E',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 20,
    gap: 10
  },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' }
});
