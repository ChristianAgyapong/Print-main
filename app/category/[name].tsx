import { useCart } from "@/contexts/CartContext";
import { Product, productsService } from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const productCardWidth = (width - 60) / 2; // 2 columns with padding

const getProductIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    Commercial: "briefcase",
    Stationery: "card",
    "Large Format": "flag",
    Digital: "image",
    Packaging: "cube",
  };
  return icons[category] || "print";
};

const getProductGradient = (category: string) => {
  const gradients: { [key: string]: string[] } = {
    Commercial: ["#8B5CF6", "#6D28D9"],
    Stationery: ["#1E40AF", "#1E3A8A"],
    "Large Format": ["#059669", "#047857"],
    Digital: ["#DB2777", "#BE185D"],
    Packaging: ["#F59E0B", "#D97706"],
  };
  return gradients[category] || ["#3B82F6", "#2563EB"];
};

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Commercial: "#8B5CF6",
    Stationery: "#1E40AF",
    "Large Format": "#059669",
    Digital: "#DB2777",
    Packaging: "#F59E0B",
  };
  return colors[category] || "#3B82F6";
};

export default function CategoryPage() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryProducts();
  }, [name]);

  const loadCategoryProducts = async () => {
    setLoading(true);
    const allProducts = await productsService.getAll();
    const categoryProducts = allProducts.filter(
      (product) => product.category === name,
    );
    setProducts(categoryProducts);
    setLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  const categoryColor = getCategoryColor(name || "");
  const categoryIcon = getProductIcon(name || "");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View
            style={[
              styles.categoryIconCircle,
              { backgroundColor: `${categoryColor}20` },
            ]}
          >
            <Ionicons
              name={categoryIcon as any}
              size={24}
              color={categoryColor}
            />
          </View>
          <Text style={styles.headerTitle}>{name}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF006E" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptyText}>
            No products available in this category yet
          </Text>
          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backHomeText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.productCount}>
            {products.length} {products.length === 1 ? "Product" : "Products"}
          </Text>

          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                {product.image_url ? (
                  <View style={styles.productImageContainer}>
                    <Image
                      source={{ uri: product.image_url }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <LinearGradient
                    colors={getProductGradient(product.category || "") as any}
                    style={styles.productImageContainer}
                  >
                    <Ionicons
                      name={getProductIcon(product.category || "") as any}
                      size={48}
                      color="rgba(255,255,255,0.9)"
                    />
                  </LinearGradient>
                )}

                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>
                    {product.category?.toUpperCase() || "PRODUCT"}
                  </Text>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>€{product.price}</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddToCart(product)}
                    >
                      <Ionicons name="add" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
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
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  backHomeButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: "#FF006E",
    borderRadius: 12,
  },
  backHomeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 20,
  },
  productCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  productCard: {
    width: productCardWidth,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productImageContainer: {
    width: "100%",
    height: productCardWidth * 0.85,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 19,
    marginBottom: 8,
    minHeight: 38,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF006E",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF006E",
    justifyContent: "center",
    alignItems: "center",
  },
});
