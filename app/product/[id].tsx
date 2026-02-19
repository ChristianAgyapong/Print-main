import { useCart } from "@/contexts/CartContext";
import { Product, productsService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, isInCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;

    setLoading(true);
    const data = await productsService.getById(id);
    setProduct(data);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem(product, quantity);

    // Animate button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert(
      "Added to Cart",
      `${product.title} has been added to your cart.`,
      [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => router.push("/cart") },
      ],
    );
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF006E" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const gradients = {
    Stationery: ["#1E40AF", "#1E3A8A"] as const,
    "Large Format": ["#059669", "#047857"] as const,
    Commercial: ["#8B5CF6", "#7C3AED"] as const,
    Digital: ["#DB2777", "#BE185D"] as const,
    Packaging: ["#F59E0B", "#D97706"] as const,
  };

  const defaultGradient = ["#3B82F6", "#2563EB"] as const;
  const gradient =
    gradients[product.category as keyof typeof gradients] || defaultGradient;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        {product.image_url ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.image_url }}
              style={styles.productDetailImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.backIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.deliveryBadge}>
              <Ionicons name="time-outline" size={16} color="#1F2937" />
              <Text style={styles.deliveryText}>3-5 days</Text>
            </View>
          </View>
        ) : (
          <LinearGradient colors={gradient} style={styles.imageContainer}>
            <TouchableOpacity
              style={styles.backIconButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.productEmoji}>🎨</Text>
            <View style={styles.deliveryBadge}>
              <Ionicons name="time-outline" size={16} color="#1F2937" />
              <Text style={styles.deliveryText}>3-5 days</Text>
            </View>
          </LinearGradient>
        )}

        {/* Product Info */}
        <View style={styles.contentContainer}>
          {product.category && (
            <Text style={styles.category}>
              {product.category.toUpperCase()}
            </Text>
          )}
          <Text style={styles.productName}>{product.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>€{product.price.toFixed(2)}</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={16} color="#F59E0B" />
              ))}
              <Text style={styles.ratingText}>4.8 (124)</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description ||
                "High-quality printing service for all your needs. Professional results guaranteed."}
            </Text>
          </View>

          {/* How to Pay/Checkout */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Pay & Checkout</Text>
            <View style={styles.paymentInfo}>
              <View style={styles.paymentStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Add to Cart</Text>
                  <Text style={styles.stepDescription}>
                    Select quantity and add this item to your cart
                  </Text>
                </View>
              </View>
              <View style={styles.paymentStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Review Cart</Text>
                  <Text style={styles.stepDescription}>
                    Check your items and proceed to checkout
                  </Text>
                </View>
              </View>
              <View style={styles.paymentStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Make Payment</Text>
                  <Text style={styles.stepDescription}>
                    Complete payment using your preferred method
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.paymentMethods}>
              <Text style={styles.paymentMethodsTitle}>We Accept:</Text>
              <View style={styles.paymentIcons}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="card" size={24} color="#FF006E" />
                  <Text style={styles.paymentIconText}>Credit Card</Text>
                </View>
                <View style={styles.paymentIcon}>
                  <Ionicons name="logo-paypal" size={24} color="#FF006E" />
                  <Text style={styles.paymentIconText}>PayPal</Text>
                </View>
                <View style={styles.paymentIcon}>
                  <Ionicons name="wallet" size={24} color="#FF006E" />
                  <Text style={styles.paymentIconText}>E-Wallet</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF006E" />
              <Text style={styles.featureText}>Premium quality materials</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF006E" />
              <Text style={styles.featureText}>Fast turnaround time</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF006E" />
              <Text style={styles.featureText}>Professional finish</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF006E" />
              <Text style={styles.featureText}>
                100% satisfaction guarantee
              </Text>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={24} color="#FF006E" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Free Shipping</Text>
                <Text style={styles.infoSubtitle}>On orders over €100</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="refresh-outline" size={24} color="#FF006E" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Easy Returns</Text>
                <Text style={styles.infoSubtitle}>30-day return policy</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decrementQuantity}
            >
              <Ionicons name="remove" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            isInCart(product.id) && styles.inCartButton,
          ]}
          onPress={handleAddToCart}
        >
          <Ionicons
            name={isInCart(product.id) ? "checkmark-circle" : "cart"}
            size={22}
            color="#fff"
          />
          <Text style={styles.addToCartText}>
            {isInCart(product.id) ? "Add More" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1E",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F1E",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#B8B8D1",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0F0F1E",
  },
  errorText: {
    fontSize: 18,
    color: "#B8B8D1",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FF006E",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  productDetailImage: {
    width: "100%",
    height: "100%",
  },
  backIconButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  productEmoji: {
    fontSize: 80,
  },
  deliveryBadge: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 110, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  deliveryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  contentContainer: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B8B8D1",
    letterSpacing: 1,
    marginBottom: 8,
  },
  productName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF006E",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#B8B8D1",
    fontWeight: "600",
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#B8B8D1",
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#B8B8D1",
  },
  paymentInfo: {
    marginBottom: 16,
  },
  paymentStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF006E",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#B8B8D1",
    lineHeight: 20,
  },
  paymentMethods: {
    backgroundColor: "rgba(255, 0, 110, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 110, 0.2)",
  },
  paymentMethodsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  paymentIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 12,
  },
  paymentIcon: {
    alignItems: "center",
    gap: 6,
  },
  paymentIconText: {
    fontSize: 12,
    color: "#B8B8D1",
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 14,
    color: "#B8B8D1",
  },
  bottomBar: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    gap: 12,
  },
  quantityContainer: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B8B8D1",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 110, 0.15)",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  quantityValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addToCartButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF006E",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  inCartButton: {
    backgroundColor: "#10B981",
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
