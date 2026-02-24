import { EmptyState } from "@/components/empty-state";
import { OrderStatusTracker } from "@/components/order-status-tracker";
import { OrderCardSkeleton } from "@/components/skeleton-loader";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Order, ordersService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function OrdersScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    const data = await ordersService.getByUserId(user.id);
    setOrders(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      pending: "#F59E0B",
      delivered: "#10B981",
    };
    return colors[status] || "#6B7280";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      Alert.alert("Error", "No items found in this order.");
      return;
    }

    // Add all items from the order to cart
    let itemsAdded = 0;
    order.items.forEach((item) => {
      if (item.product) {
        addItem(item.product, item.quantity);
        itemsAdded++;
      }
    });

    if (itemsAdded > 0) {
      Alert.alert(
        "Items Added to Cart",
        `${itemsAdded} ${itemsAdded === 1 ? "item" : "items"} from order #${order.id.slice(0, 8).toUpperCase()} added to your cart.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => router.push("/cart") },
        ],
      );
    } else {
      Alert.alert(
        "Error",
        "Could not add items to cart. Products may no longer be available.",
      );
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
    headerSubtitle: {
      color: colors.textSecondary,
    },
    sectionTitle: {
      color: colors.text,
    },
    orderCount: {
      color: colors.textSecondary,
    },
    orderCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    orderNumber: {
      color: colors.text,
    },
    orderDate: {
      color: colors.textSecondary,
    },
    orderDetailText: {
      color: colors.textSecondary,
    },
    itemTitle: {
      color: colors.text,
    },
    itemQuantity: {
      color: colors.textSecondary,
    },
    totalLabel: {
      color: colors.textSecondary,
    },
    totalAmount: {
      color: colors.text,
    },
  };

  return (
    <>
      <StatusBar style={colors.statusBarStyle} />
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
              Order History
            </Text>
            {orders.length > 0 && (
              <Text style={[styles.orderCount, dynamicStyles.orderCount]}>
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </Text>
            )}
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              {[1, 2, 3].map((i) => (
                <OrderCardSkeleton key={i} />
              ))}
            </View>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No orders yet"
              message="Start your first order by browsing our products"
              action={
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => router.push("/(tabs)")}
                >
                  <Text style={styles.browseButtonText}>Browse Products</Text>
                </TouchableOpacity>
              }
            />
          ) : (
            <>
              {orders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderCard, dynamicStyles.orderCard]}
                  activeOpacity={0.7}
                  onPress={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id,
                    )
                  }
                >
                  <View style={styles.orderHeader}>
                    <View>
                      <Text
                        style={[styles.orderNumber, dynamicStyles.orderNumber]}
                      >
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </Text>
                      <Text style={[styles.orderDate, dynamicStyles.orderDate]}>
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(order.status) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(order.status) },
                        ]}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderDetails}>
                    <View style={styles.orderRow}>
                      <Ionicons name="cube-outline" size={16} color="#6B7280" />
                      <Text
                        style={[
                          styles.orderDetailText,
                          dynamicStyles.orderDetailText,
                        ]}
                      >
                        {order.items?.length || 0}{" "}
                        {order.items?.length === 1 ? "item" : "items"}
                      </Text>
                    </View>
                    <View style={styles.orderRow}>
                      <Ionicons name="cash-outline" size={16} color="#6B7280" />
                      <Text
                        style={[
                          styles.orderDetailText,
                          dynamicStyles.orderDetailText,
                        ]}
                      >
                        €{order.total_amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {expandedOrder === order.id && (
                    <View style={styles.expandedContent}>
                      <OrderStatusTracker status={order.status} />

                      {/* Order Items Details */}
                      {order.items && order.items.length > 0 && (
                        <View style={styles.orderItemsSection}>
                          <Text
                            style={[
                              styles.orderItemsTitle,
                              dynamicStyles.sectionTitle,
                            ]}
                          >
                            Order Items ({order.items.length})
                          </Text>
                          {order.items.map((item, index) => (
                            <View key={index} style={styles.orderItemCard}>
                              <View style={styles.orderItemHeader}>
                                <View style={styles.orderItemInfo}>
                                  <Text
                                    style={[
                                      styles.orderItemName,
                                      dynamicStyles.itemTitle,
                                    ]}
                                  >
                                    {item.product?.title || "Product"}
                                  </Text>
                                  {item.product?.category && (
                                    <Text
                                      style={[
                                        styles.orderItemCategory,
                                        dynamicStyles.itemQuantity,
                                      ]}
                                    >
                                      {item.product.category}
                                    </Text>
                                  )}
                                </View>
                                <View style={styles.orderItemPricing}>
                                  <Text
                                    style={[
                                      styles.orderItemPrice,
                                      dynamicStyles.totalAmount,
                                    ]}
                                  >
                                    €{item.price.toFixed(2)}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.orderItemPriceLabel,
                                      dynamicStyles.totalLabel,
                                    ]}
                                  >
                                    per item
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.orderItemFooter}>
                                <View style={styles.orderItemQuantity}>
                                  <Ionicons
                                    name="cube-outline"
                                    size={14}
                                    color="#6B7280"
                                  />
                                  <Text
                                    style={[
                                      styles.orderItemQuantityText,
                                      dynamicStyles.itemQuantity,
                                    ]}
                                  >
                                    Quantity: {item.quantity}
                                  </Text>
                                </View>
                                <View style={styles.orderItemSubtotal}>
                                  <Text
                                    style={[
                                      styles.orderItemSubtotalLabel,
                                      dynamicStyles.totalLabel,
                                    ]}
                                  >
                                    Subtotal:
                                  </Text>
                                  <Text
                                    style={[
                                      styles.orderItemSubtotalAmount,
                                      dynamicStyles.totalAmount,
                                    ]}
                                  >
                                    €{(item.price * item.quantity).toFixed(2)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}

                          {/* Order Summary */}
                          <View style={styles.orderSummary}>
                            <View style={styles.orderSummaryRow}>
                              <Text style={styles.orderSummaryLabel}>
                                Total Items:
                              </Text>
                              <Text style={styles.orderSummaryValue}>
                                {order.items.reduce(
                                  (sum, item) => sum + item.quantity,
                                  0,
                                )}
                              </Text>
                            </View>
                            <View style={styles.orderSummaryDivider} />
                            <View style={styles.orderSummaryRow}>
                              <Text style={styles.orderSummaryLabelTotal}>
                                Order Total:
                              </Text>
                              <Text style={styles.orderSummaryTotal}>
                                €{order.total_amount.toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}

                      <View style={styles.orderActions}>
                        <TouchableOpacity style={styles.actionButton}>
                          <Ionicons
                            name="information-circle-outline"
                            size={20}
                            color="#FF006E"
                          />
                          <Text style={styles.actionButtonText}>
                            Track Order
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                          <Ionicons
                            name="chatbubble-outline"
                            size={20}
                            color="#FF006E"
                          />
                          <Text style={styles.actionButtonText}>Contact</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={styles.orderFooter}>
                    <TouchableOpacity
                      style={styles.reorderButton}
                      onPress={() => handleReorder(order)}
                    >
                      <Ionicons
                        name="repeat-outline"
                        size={18}
                        color="#FF006E"
                      />
                      <Text style={styles.reorderText}>Reorder</Text>
                    </TouchableOpacity>
                    <Ionicons
                      name={
                        expandedOrder === order.id
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={20}
                      color="#B8B8D1"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  header: {
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  orderCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  orderItemsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  orderItemsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  orderItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  orderItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 4,
  },
  orderItemCategory: {
    fontSize: 11,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  orderItemPricing: {
    alignItems: "flex-end",
  },
  orderItemPrice: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "700",
  },
  orderItemPriceLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  orderItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  orderItemQuantity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderItemQuantityText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  orderItemSubtotal: {
    alignItems: "flex-end",
  },
  orderItemSubtotalLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  orderItemSubtotalAmount: {
    fontSize: 15,
    color: "#FF006E",
    fontWeight: "700",
  },
  orderSummary: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  orderSummaryLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  orderSummaryValue: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "600",
  },
  orderSummaryDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
  orderSummaryLabelTotal: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
  },
  orderSummaryTotal: {
    fontSize: 16,
    color: "#FF006E",
    fontWeight: "700",
  },
  viewAllText: {
    fontSize: 14,
    color: "#FF006E",
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: "#6B7280",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderDetailText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  orderActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 0, 110, 0.1)",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 110, 0.2)",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF006E",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reorderText: {
    fontSize: 14,
    color: "#FF006E",
    fontWeight: "600",
  },
  browseButton: {
    backgroundColor: "#FF006E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
