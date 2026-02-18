# Supabase Database Helper

This file demonstrates how to use Supabase in your app for database operations, storage, and real-time subscriptions.

## Example: Database Operations

```typescript
import { supabase } from '@/lib/supabase';

// Fetch all products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Create an order
export const createOrder = async (orderData: any) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
```

## Example: File Upload

```typescript
import { supabase } from '@/lib/supabase';

export const uploadProductImage = async (
  file: File | Blob, 
  fileName: string
) => {
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
};
```

## Example: Real-time Subscriptions

```typescript
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export const useRealtimeOrders = (userId: string) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Initial fetch
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId);
      
      if (data) setOrders(data);
    };

    fetchOrders();

    // Subscribe to changes
    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchOrders(); // Refresh orders
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return orders;
};
```

## Example: Usage in Components

```typescript
import { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { getProducts } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>{item.price}</Text>
        </View>
      )}
    />
  );
}
```

Copy these examples to your project and customize as needed!
