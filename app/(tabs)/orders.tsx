import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Order, ordersService } from '@/lib/database-service';
import { OrderStatusTracker } from '@/components/order-status-tracker';
import { EmptyState } from '@/components/empty-state';
import { OrderCardSkeleton } from '@/components/skeleton-loader';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function OrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();
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
      'pending': '#F59E0B',
      'processing': '#3B82F6',
      'shipped': '#8B5CF6',
      'delivered': '#10B981',
      'cancelled': '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const orderCategories = [
    {
      id: '1',
      title: 'Business Cards',
      icon: 'card-outline',
      description: 'Professional business cards',
      color: '#3B82F6',
    },
    {
      id: '2',
      title: 'Flyers & Posters',
      icon: 'document-text-outline',
      description: 'Eye-catching promotional materials',
      color: '#8B5CF6',
    },
    {
      id: '3',
      title: 'Custom Banners',
      icon: 'images-outline',
      description: 'Large format printing',
      color: '#EC4899',
    },
    {
      id: '4',
      title: 'T-Shirt Printing',
      icon: 'shirt-outline',
      description: 'Custom apparel designs',
      color: '#10B981',
    },
    {
      id: '5',
      title: 'Photo Prints',
      icon: 'image-outline',
      description: 'High quality photo printing',
      color: '#F59E0B',
    },
    {
      id: '6',
      title: 'Stickers & Labels',
      icon: 'pricetag-outline',
      description: 'Custom stickers & labels',
      color: '#06B6D4',
    },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Custom Orders</Text>
        <Text style={styles.headerSubtitle}>Create your perfect print</Text>
      </View>

      {/* New Order Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start New Order</Text>
        <View style={styles.categoryGrid}>
          {orderCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon as any} size={28} color={category.color} />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Orders Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Orders</Text>
          {orders.length > 0 && (
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All ({orders.length})</Text>
            </TouchableOpacity>
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
                style={styles.orderCard}
                activeOpacity={0.7}
                onPress={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNumber}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.orderRow}>
                    <Ionicons name="cube-outline" size={16} color="#6B7280" />
                    <Text style={styles.orderDetailText}>
                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Ionicons name="cash-outline" size={16} color="#6B7280" />
                    <Text style={styles.orderDetailText}>€{order.total_amount.toFixed(2)}</Text>
                  </View>
                </View>

                {expandedOrder === order.id && (
                  <View style={styles.expandedContent}>
                    <OrderStatusTracker status={order.status} />
                    <View style={styles.orderActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="information-circle-outline" size={20} color="#FF006E" />
                        <Text style={styles.actionButtonText}>Track Order</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="chatbubble-outline" size={20} color="#FF006E" />
                        <Text style={styles.actionButtonText}>Contact</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.orderFooter}>
                  <TouchableOpacity style={styles.reorderButton}>
                    <Ionicons name="repeat-outline" size={18} color="#FF006E" />
                    <Text style={styles.reorderText}>Reorder</Text>
                  </TouchableOpacity>
                  <Ionicons 
                    name={expandedOrder === order.id ? "chevron-up" : "chevron-down"}
                    size={20} 
                    color="#B8B8D1" 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle-outline" size={24} color="#FF006E" />
          <Text style={styles.actionButtonText}>Upload Design</Text>
          <Ionicons name="chevron-forward" size={20} color="#B8B8D1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="calculator-outline" size={24} color="#FF006E" />
          <Text style={styles.actionButtonText}>Get Quote</Text>
          <Ionicons name="chevron-forward" size={20} color="#B8B8D1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle-outline" size={24} color="#FF006E" />
          <Text style={styles.actionButtonText}>Order Help</Text>
          <Ionicons name="chevron-forward" size={20} color="#B8B8D1" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    padding: 20,
    backgroundColor: '#F9F5F0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF006E',
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reorderText: {
    fontSize: 14,
    color: '#FF006E',
    fontWeight: '600',
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
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF006E',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
});
