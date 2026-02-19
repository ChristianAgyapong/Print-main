import { EmptyState } from "@/components/empty-state";
import { ProductCardSkeleton } from "@/components/skeleton-loader";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
    Product,
    productsService,
    profileService,
} from "@/lib/database-service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const PRODUCT_CARD_WIDTH = (width - 42) / 2;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();
  const { wishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<{
    [key: string]: Product[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const promoScrollRef = useRef<ScrollView>(null);
  const scrollY = new Animated.Value(0);

  const PROMO_CARD_WIDTH = width - 40;

  const promos = [
    {
      icon: "pricetag",
      title: "First Order Discount",
      subtitle: "Get 20% off your first order over €100",
      colors: ["#FF006E", "#D6005C"] as const,
    },
    {
      icon: "flash",
      title: "Flash Sale",
      subtitle: "Up to 50% off on selected items",
      colors: ["#8B5CF6", "#6D28D9"] as const,
    },
    {
      icon: "gift",
      title: "Free Shipping",
      subtitle: "Free delivery on orders over €75",
      colors: ["#059669", "#047857"] as const,
    },
    {
      icon: "star",
      title: "Loyalty Rewards",
      subtitle: "Earn points on every purchase",
      colors: ["#F59E0B", "#D97706"] as const,
    },
    {
      icon: "ribbon",
      title: "Bundle Deal",
      subtitle: "Save 15% when you order 3+ items",
      colors: ["#3B82F6", "#2563EB"] as const,
    },
  ];

  const categoryLayouts = [
    { name: "Commercial", icon: "briefcase", color: "#8B5CF6" },
    { name: "Stationery", icon: "card", color: "#1E40AF" },
    { name: "Large Format", icon: "flag", color: "#059669" },
    { name: "Digital", icon: "image", color: "#DB2777" },
    { name: "Packaging", icon: "cube", color: "#F59E0B" },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  // Auto-cycle through promos every 4 seconds
  useEffect(() => {
    const promoInterval = setInterval(() => {
      setCurrentPromoIndex((prev) => {
        const nextIndex = (prev + 1) % promos.length;
        promoScrollRef.current?.scrollTo({
          x: nextIndex * (PROMO_CARD_WIDTH + 12),
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(promoInterval);
  }, []);

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
    const data = await productsService.getAll();
    setProducts(data);

    // Group products by category
    const grouped: { [key: string]: Product[] } = {};
    data.forEach((product) => {
      const cat = product.category || "Other";
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(product);
    });
    setProductsByCategory(grouped);
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
    <>
      <StatusBar style="dark" />
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
            colors={["#FF006E", "#C2185B", "#880E4F"]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroHeader}>
                <View>
                  <Text style={styles.heroTitle}>PrintCraft Shop</Text>
                  <Text style={styles.heroSubtitle}>
                    Professional printing services for business, marketing,
                    branding, and more
                  </Text>
                </View>
              </View>

              {/* Profile Completion Banner */}
              {user && !profileComplete && (
                <TouchableOpacity
                  style={styles.completionBanner}
                  onPress={() => router.push("/(tabs)/profile")}
                >
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.completionText}>
                    Complete your profile for personalized recommendations
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {/* Special Offer Carousel */}
          <View style={styles.offerBannerWrapper}>
            <ScrollView
              ref={promoScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={PROMO_CARD_WIDTH + 12}
              decelerationRate="fast"
              contentContainerStyle={styles.promoScrollContent}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / (PROMO_CARD_WIDTH + 12),
                );
                setCurrentPromoIndex(index);
              }}
            >
              {promos.map((promo, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.95}
                  style={[styles.promoCard, { width: PROMO_CARD_WIDTH }]}
                >
                  <LinearGradient
                    colors={promo.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.promoGradient}
                  >
                    {/* Decorative circles */}
                    <View style={styles.promoDecor1} />
                    <View style={styles.promoDecor2} />

                    <View style={styles.promoContent}>
                      <View style={styles.promoIconCircle}>
                        <Ionicons
                          name={promo.icon as any}
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.promoTextContainer}>
                        <Text style={styles.promoTitle}>{promo.title}</Text>
                        <Text style={styles.promoSubtitle}>
                          {promo.subtitle}
                        </Text>
                      </View>
                      <View style={styles.promoArrowCircle}>
                        <Ionicons
                          name="arrow-forward"
                          size={20}
                          color="#FFFFFF"
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Shop By Category Label */}
        <View style={styles.shopLabelContainer}>
          <Text style={styles.shopLabel}>SHOP BY CATEGORY</Text>
        </View>

        {/* Products by Category */}
        {loading ? (
          <View style={styles.productsSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsScrollContent}
            >
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </ScrollView>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.productsSection}>
            <EmptyState
              icon="cube-outline"
              title="No products available"
              message="Check back later for new products"
              action={
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadProducts}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              }
            />
          </View>
        ) : (
          categoryLayouts.map((categoryLayout) => {
            const categoryProducts =
              productsByCategory[categoryLayout.name] || [];
            if (categoryProducts.length === 0) return null;

            return (
              <View key={categoryLayout.name} style={styles.categorySection}>
                {/* Category Header */}
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryHeaderLeft}>
                    <View
                      style={[
                        styles.categoryIconCircle,
                        { backgroundColor: `${categoryLayout.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={categoryLayout.icon as any}
                        size={20}
                        color={categoryLayout.color}
                      />
                    </View>
                    <Text style={styles.categoryTitle}>
                      {categoryLayout.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() =>
                      router.push(`/category/${categoryLayout.name}`)
                    }
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FF006E" />
                  </TouchableOpacity>
                </View>

                {/* Products Display - Horizontal Carousel */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productsScrollContent}
                >
                  {categoryProducts.map((product) => (
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
                          <View style={styles.deliveryBadge}>
                            <Text style={styles.deliveryText}>3-5 days</Text>
                          </View>
                        </View>
                      ) : (
                        <LinearGradient
                          colors={getProductGradient(product.category)}
                          style={styles.productImageContainer}
                        >
                          <View style={styles.deliveryBadge}>
                            <Text style={styles.deliveryText}>3-5 days</Text>
                          </View>
                          <Ionicons
                            name={getProductIcon(product.category) as any}
                            size={42}
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
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            );
          })
        )}

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>HOW IT WORKS</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Ionicons name="search" size={24} color="#FF006E" />
              <Text style={styles.stepTitle}>Choose</Text>
              <Text style={styles.stepDescription}>
                Browse & select products
              </Text>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Ionicons name="cloud-upload" size={24} color="#FF006E" />
              <Text style={styles.stepTitle}>Upload</Text>
              <Text style={styles.stepDescription}>Add your design files</Text>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Ionicons name="checkmark-done" size={24} color="#FF006E" />
              <Text style={styles.stepTitle}>Receive</Text>
              <Text style={styles.stepDescription}>Fast delivery to you</Text>
            </View>
          </View>
        </View>

        {/* Trust Stats */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={["rgba(255, 0, 110, 0.1)", "rgba(139, 92, 246, 0.1)"]}
            style={styles.statsGradient}
          >
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10K+</Text>
                <Text style={styles.statLabel}>Happy Customers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50K+</Text>
                <Text style={styles.statLabel}>Orders Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.9★</Text>
                <Text style={styles.statLabel}>Average Rating</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions Footer */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <Ionicons name="add-circle-outline" size={22} color="#3B82F6" />
            <Text style={styles.footerButtonText}>Custom Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#10B981" />
            <Text style={styles.footerButtonText}>Get Quote</Text>
          </TouchableOpacity>
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
  heroSection: {
    width: "100%",
    marginBottom: 24,
  },
  heroGradient: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroContent: {
    flex: 1,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
    maxWidth: "85%",
  },
  completionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  completionText: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  categoriesSection: {
    paddingVertical: 24,
    backgroundColor: "#F0F4F8",
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
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
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.9)",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: "rgba(255, 0, 110, 0.08)",
    borderColor: "#FF006E",
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  categoryButtonTextActive: {
    color: "#FF006E",
  },
  offerBannerWrapper: {
    marginTop: -28,
    marginBottom: 8,
  },
  promoScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  promoCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  promoGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    position: "relative",
    overflow: "hidden",
  },
  promoDecor1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  promoDecor2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  promoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  promoIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  promoArrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  shopLabelContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  shopLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1.5,
  },
  productsSection: {
    paddingBottom: 16,
  },
  categorySection: {
    marginBottom: 28,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF006E",
  },
  productsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    width: 200,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
  },
  productImageContainer: {
    width: "100%",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  deliveryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deliveryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1F2937",
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF006E",
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF006E",
    alignItems: "center",
    justifyContent: "center",
  },
  footerSection: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
  },
  footerButtonText: {
    fontSize: 15,
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
    backgroundColor: "#FF006E",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  howItWorksSection: {
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  stepsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  stepCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
  },
  stepNumber: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 0, 110, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FF006E",
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginTop: 6,
  },
  stepDescription: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 14,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  statsGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF006E",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 1.2,
    textAlign: "center",
    marginBottom: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
});
