import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Order, ordersService } from '@/lib/database-service';

const { width } = Dimensions.get('window');

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Start your first order by browsing our products</Text>
          </View>
        ) : (
          orders.slice(0, 5).map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.orderTotal}>Total: €{order.total_amount.toFixed(2)}</Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
          <Text style={styles.actionButtonText}>Upload Design</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="calculator-outline" size={24} color="#8B5CF6" />
          <Text style={styles.actionButtonText}>Get Quote</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle-outline" size={24} color="#10B981" />
          <Text style={styles.actionButtonText}>Order Help</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    color: '#3B82F6',
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    color: '#1F2937',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
});
