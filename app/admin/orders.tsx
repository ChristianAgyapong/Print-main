import { adminService, Order } from "@/lib/database-service";
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
    console.log(`📊 Admin UI: Received ${data.length} orders from service`);
    setOrders(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleUpdateStatus = (orderId: string, currentStatus: string) => {
    const statusOptions = ["pending", "delivered"];
    const otherStatus =
      statusOptions.find((s) => s !== currentStatus) || "delivered";

    Alert.alert("Update Order Status", `Change status to "${otherStatus}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Update",
        onPress: async () => {
          const success = await adminService.updateOrderStatus(
            orderId,
            otherStatus,
          );
          if (success) {
            Alert.alert("Success", "Order status updated successfully");
            await loadOrders();
          } else {
            Alert.alert("Error", "Failed to update order status");
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#F59E0B";
      case "delivered":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF006E" />
          <Text style={styles.loadingText}>Loading orders...</Text>
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
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {orders.filter((o) => o.status === "pending").length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {orders.filter((o) => o.status === "delivered").length}
          </Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>
              Orders will appear here when customers make purchases
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <TouchableOpacity
                onPress={() => toggleOrderExpansion(order.id)}
                style={styles.orderHeader}
              >
                <View style={styles.orderMainInfo}>
                  <View style={styles.orderTitleRow}>
                    <Text style={styles.orderNumber}>
                      {order.id
                        ? `Order #${order.id.substring(0, 8)}`
                        : "Order"}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: `${getStatusColor(order.status || "pending")}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(order.status || "pending") },
                        ]}
                      >
                        {(order.status || "pending").toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderCustomer}>
                    {`Customer: ${order.user?.name || "Unknown Customer"}`}
                  </Text>
                  <Text style={styles.orderEmail}>
                    {`Email: ${order.user?.email || "N/A"}`}
                  </Text>
                  {order.user?.phone ? (
                    <Text style={styles.orderPhone}>
                      {`Phone: ${order.user.phone}`}
                    </Text>
                  ) : null}
                  <Text style={styles.orderDate}>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Date N/A"}
                  </Text>
                  <Text style={styles.orderTotal}>
                    {`€${(order.total_amount || 0).toFixed(2)}`}
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedOrderId === order.id ? "chevron-up" : "chevron-down"
                  }
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              {/* Expanded Order Details */}
              {expandedOrderId === order.id && (
                <View style={styles.orderDetails}>
                  <Text style={styles.detailsTitle}>Order Items:</Text>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemName}>
                          {item.product?.title || "Product"}
                        </Text>
                        <Text style={styles.itemQty}>
                          {`Qty: ${item.quantity || 0}`}
                        </Text>
                        <Text style={styles.itemPrice}>
                          {`€${(item.price || 0).toFixed(2)}`}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No items found</Text>
                  )}

                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() =>
                      handleUpdateStatus(order.id, order.status || "pending")
                    }
                  >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.updateButtonText}>Update Status</Text>
                  </TouchableOpacity>
                </View>
              )}
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF006E",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
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
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  orderMainInfo: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  orderCustomer: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  orderEmail: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  orderPhone: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 6,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF006E",
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  itemQty: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
