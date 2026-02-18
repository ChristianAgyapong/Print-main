import { useCart } from "@/contexts/CartContext";
import { Product, productsService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FileUpload from "@/components/file-upload";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, isInCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

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
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
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

        {/* Product Info */}
        <View style={styles.contentContainer}>
          {product.category && (
            <Text style={styles.category}>
              {product.category.toUpperCase()}
            </Text>
          )}
          <Text style={styles.productName}>{product.title}</Text>
          <Text style={styles.price}>€{product.price.toFixed(2)}</Text>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description ||
                "High-quality printing service for all your needs. Professional results guaranteed."}
            </Text>
          </View>

          {/* Upload Design */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Your Design</Text>
            <Text style={styles.uploadInfo}>
              Upload your design file to proceed with your order
            </Text>
            <View style={styles.uploadContainer}>
              <FileUpload
                onUploadComplete={(upload) => {
                  Alert.alert('Success!', 'Design uploaded successfully. You can now add this to your cart.');
                }}
                onUploadError={(error) => {
                  Alert.alert('Upload Failed', error);
                }}
              />
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Premium quality materials</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Fast turnaround time</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Professional finish</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>
                100% satisfaction guarantee
              </Text>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={24} color="#3B82F6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Free Shipping</Text>
                <Text style={styles.infoSubtitle}>On orders over €100</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="refresh-outline" size={24} color="#3B82F6" />
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
              <Ionicons name="remove" size={20} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Ionicons name="add" size={20} color="#1F2937" />
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
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
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
  },
  backIconButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  deliveryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  contentContainer: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 8,
  },
  productName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3B82F6",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
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
    color: "#374151",
  },
  uploadInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  uploadContainer: {
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
    color: "#1F2937",
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  bottomBar: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  quantityContainer: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  quantityValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  addToCartButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
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
