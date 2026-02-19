import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
    Product,
    productsService,
    profileService
} from "@/lib/database-service";
import { ProductCardSkeleton } from "@/components/skeleton-loader";
import { EmptyState } from "@/components/empty-state";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated,
} from "react-native";

const { width } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (width - 42) / 2;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();
  const { wishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [profileComplete, setProfileComplete] = useState(true); // Default true to hide banner until we check
  const scrollY = new Animated.Value(0);

  const categories = [
    { id: "1", name: "All Products", icon: "apps" },
    { id: "2", name: "Commercial", icon: "briefcase" },
    { id: "3", name: "Stationery", icon: "pencil" },
    { id: "4", name: "Packaging", icon: "cube" },
    { id: "5", name: "Large Format", icon: "expand" },
    { id: "6", name: "Digital", icon: "desktop" },
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  useEffect(() => {
    checkProfileCompletion();
  }, [user]);

  // Recheck profile completion when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkProfileCompletion();
    }, [user]),
  );

  const checkProfileCompletion = async () => {
    if (!user) {
      setProfileComplete(true);
      return;
    }

    try {
      const profile = await profileService.get(user.id);

      // Check if profile has key fields filled
      if (!profile) {
        setProfileComplete(false);
        return;
      }

      // Consider profile complete if at least these fields are filled
      const hasBasicInfo = profile.full_name && profile.phone;
      const hasAddress =
        profile.address_street &&
        profile.address_city &&
        profile.address_country;
      const hasAdditionalInfo =
        profile.bio || profile.company || profile.job_title;

      // Profile is complete if they have basic info and either address or additional info
      const isComplete = hasBasicInfo && (hasAddress || hasAdditionalInfo);
      setProfileComplete(isComplete);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      setProfileComplete(true); // Hide banner on error
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    const category =
      selectedCategory === "All Products" ? undefined : selectedCategory;
    const data = await productsService.getAll(category);
    setProducts(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProducts(), checkProfileCompletion()]);
    setRefreshing(false);
  };

  const getProductGradient = (category: string | null): string[] => {
    const gradients: { [key: string]: string[] } = {
      Stationery: ["#1E40AF", "#1E3A8A"],
      "Large Format": ["#059669", "#047857"],
      Commercial: ["#8B5CF6", "#7C3AED"],
      Digital: ["#DB2777", "#BE185D"],
      Packaging: ["#F59E0B", "#D97706"],
    };
    return gradients[category || "Commercial"] || ["#3B82F6", "#2563EB"];
  };

  const getProductIcon = (category: string | null): string => {
    const icons: { [key: string]: string } = {
      Stationery: "card",
      "Large Format": "flag",
      Commercial: "megaphone",
      Digital: "image",
      Packaging: "cube",
    };
    return icons[category || ""] || "color-palette";
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={["#F9FAFB", "#E5E7EB"]}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroTitle}>PrintCraft Shop</Text>
                <Text style={styles.heroSubtitle}>
                  Professional printing services for business, marketing, branding,
                  and more
                </Text>
              </View>
              <TouchableOpacity
                style={styles.wishlistButton}
                onPress={() => router.push("/wishlist")}
              >
                <Ionicons name="heart" size={24} color="#EF4444" />
                {wishlist.length > 0 && (
                  <View style={styles.wishlistBadge}>
                    <Text style={styles.wishlistBadgeText}>{wishlist.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Profile Completion Banner */}
            {user && !profileComplete && (
              <TouchableOpacity
                style={styles.completionBanner}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={styles.completionText}>
                  Complete your profile to get personalized recommendations
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Browse Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.categoryLabel}>BROWSE CATEGORIES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name &&
                  styles.categoryButtonActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={
                  selectedCategory === category.name ? "#3B82F6" : "#6B7280"
                }
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.name &&
                    styles.categoryButtonTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <View style={styles.productsSection}>
        {loading ? (
          <View style={styles.productsGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </View>
        ) : products.length === 0 ? (
          <EmptyState
            icon="cube-outline"
            title="No products available"
            message="Check back later for new products"
            action={
              <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <LinearGradient
                  colors={getProductGradient(product.category)}
                  style={styles.productImageContainer}
                >
                  <View style={styles.deliveryBadge}>
                    <Text style={styles.deliveryText}>3-5 days</Text>
                  </View>
                  <Ionicons
                    name={getProductIcon(product.category) as any}
                    size={52}
                    color="rgba(255,255,255,0.9)"
                  />
                </LinearGradient>

                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>
                    {product.category?.toUpperCase() || "PRODUCT"}
                  </Text>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>
                      €{product.price.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        addItem(product);
                      }}
                    >
                      <Ionicons name="add" size={18} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions Footer */}
      <View style={styles.footerSection}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push("/(tabs)/orders")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
          <Text style={styles.footerButtonText}>Start Custom Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#10B981" />
          <Text style={styles.footerButtonText}>Get Quote</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  heroSection: {
    width: "100%",
  },
  heroGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  heroContent: {
    flex: 1,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    maxWidth: "80%",
  },
  wishlistButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wishlistBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  wishlistBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  completionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  completionText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    fontWeight: "500",
  },
  categoriesSection: {
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  categoryButtonTextActive: {
    color: "#3B82F6",
  },
  productsSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  productImageContainer: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  deliveryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deliveryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1F2937",
  },
  productInfo: {
    padding: 14,
  },
  productCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  footerSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
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
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
