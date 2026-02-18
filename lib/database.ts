import { supabase } from './supabase';

// ============================================
// USER PROFILE OPERATIONS
// ============================================

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

/**
 * Create or update user profile
 */
export const upsertUserProfile = async (
  userId: string,
  profile: Partial<UserProfile>
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    return null;
  }

  return data;
};

// ============================================
// PRODUCT OPERATIONS
// ============================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  created_at: string;
}

/**
 * Get all products
 */
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data || [];
};

/**
 * Get single product by ID
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
};

// ============================================
// ORDER OPERATIONS
// ============================================

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new order
 */
export const createOrder = async (
  userId: string,
  totalAmount: number
): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    return null;
  }

  return data;
};

/**
 * Get all orders for a user
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status']
): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    return null;
  }

  return data;
};

// ============================================
// FILE UPLOAD OPERATIONS
// ============================================

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: Blob | File
): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (bucket: string, filePath: string): Promise<boolean> => {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error('Error deleting file:', error);
    return false;
  }

  return true;
};

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to order updates for a user
 */
export const subscribeToUserOrders = (
  userId: string,
  callback: (payload: any) => void
) => {
  const subscription = supabase
    .channel('user-orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return subscription;
};

/**
 * Unsubscribe from real-time channel
 */
export const unsubscribe = async (subscription: any) => {
  await supabase.removeChannel(subscription);
};
