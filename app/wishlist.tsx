import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWishlist } from '@/contexts/WishlistContext';
import { EmptyState } from '@/components/empty-state';
import { LinearGradient } from 'expo-linear-gradient';

export default function WishlistScreen() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  const getProductGradient = (category: string | null): readonly [string, string] => {
    const gradients: { [key: string]: readonly [string, string] } = {
      Stationery: ["#1E40AF", "#1E3A8A"] as const,
      "Large Format": ["#059669", "#047857"] as const,
      Commercial: ["#8B5CF6", "#7C3AED"] as const,
      Digital: ["#DB2777", "#BE185D"] as const,
      Packaging: ["#F59E0B", "#D97706"] as const,
    };
    return gradients[category || "Commercial"] || ["#3B82F6", "#2563EB"] as const;
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        {wishlist.length > 0 && (
          <TouchableOpacity onPress={clearWishlist}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wishlist Content */}
      {wishlist.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Your wishlist is empty"
          message="Save products you love to your wishlist and access them anytime"
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
        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          <Text style={styles.itemCount}>
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
          </Text>

          {wishlist.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <LinearGradient
                colors={getProductGradient(product.category)}
                style={styles.productImage}
              >
                <Ionicons
                  name={getProductIcon(product.category) as any}
                  size={40}
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
                <Text style={styles.productPrice}>€{product.price.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromWishlist(product.id)}
              >
                <Ionicons name="heart" size={24} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <View style={{ height: 110 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  clearText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF006E',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseButton: {
    backgroundColor: '#FF006E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
