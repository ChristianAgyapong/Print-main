import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ordersService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    totalAmount,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount,
  } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to place an order.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/auth") },
      ]);
      return;
    }

    if (items.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before checking out.",
      );
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const order = await ordersService.create(user.id, orderItems);

      if (order) {
        clearCart();
        Alert.alert(
          "Order Placed!",
          `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
          [
            {
              text: "View Orders",
              onPress: () => router.push("/(tabs)/orders"),
            },
          ],
        );
      } else {
        Alert.alert("Error", "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#E5E7EB" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items to get started</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsCount}>
            {itemCount} {itemCount === 1 ? "Item" : "Items"}
          </Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE', '#BFDBFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.itemImageContainer}
              >
                <Ionicons name="color-palette" size={36} color="#3B82F6" />
              </LinearGradient>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product.title}</Text>
                <Text style={styles.itemCategory}>{item.product.category}</Text>
                <Text style={styles.itemPrice}>
                  €{item.product.price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                  >
                    <Ionicons name="remove" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                  >
                    <Ionicons name="add" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeItem(item.product.id)}
                >
                  <Ionicons name="trash" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>€{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {totalAmount >= 100 ? "FREE" : "€10.00"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (21%)</Text>
            <Text style={styles.summaryValue}>
              €{(totalAmount * 0.21).toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              €
              {(
                totalAmount +
                (totalAmount >= 100 ? 0 : 10) +
                totalAmount * 0.21
              ).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.checkoutButtonWrapper]}
          onPress={handleCheckout}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={loading ? ['#9CA3AF', '#6B7280'] : ['#3B82F6', '#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.checkoutButton}
          >
            <Text style={styles.checkoutButtonText}>
              {loading ? "Processing..." : "Proceed to Checkout"}
            </Text>
            <Ionicons name="arrow-forward-circle" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    flex: 1,
    textAlign: "center",
  },
  clearText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
  itemsSection: {
    padding: 20,
  },
  itemsCount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  itemImageContainer: {
    width: 85,
    height: 85,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  itemActions: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 3,
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2937",
    marginHorizontal: 14,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  summarySection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 22,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  bottomBar: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  checkoutButtonWrapper: {
    borderRadius: 14,
  },
  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  checkoutButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
