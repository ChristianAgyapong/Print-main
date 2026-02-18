import { supabase } from "./supabase";

// Product Types
export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  address_country: string | null;
  company: string | null;
  job_title: string | null;
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

// Products Service
export const productsService = {
  // Get all products
  async getAll(category?: string): Promise<Product[]> {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (category && category !== "All Products") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  // Get single product
  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  },

  // Search products
  async search(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  },

  // Get featured products
  async getFeatured(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
  },
};

// Orders Service
export const ordersService = {
  // Get user orders
  async getByUserId(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  },

  // Create order
  async create(
    userId: string,
    items: { product_id: string; quantity: number; price: number }[],
  ): Promise<Order | null> {
    try {
      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: "pending",
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      return null;
    }
  },

  // Update order status
  async updateStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      return false;
    }
  },
};

// Profile Service
export const profileService = {
  // Get profile
  async get(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },

  // Update profile
  async update(userId: string, updates: Partial<Profile>): Promise<boolean> {
    try {
      console.log('Updating profile with:', updates);
      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      console.log('Profile updated successfully');
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  },

  // Create profile (called after signup)
  async create(userId: string, fullName: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating profile:", error);
      return false;
    }
  },

  // Get user statistics
  async getStats(userId: string): Promise<{
    ordersCount: number;
    designsCount: number;
    inProgressCount: number;
    addressesCount: number;
  }> {
    try {
      // Get orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get in-progress orders count
      const { count: inProgressCount, error: progressError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["pending", "processing", "printing"]);

      // Get saved designs count
      const { count: designsCount, error: designsError } = await supabase
        .from("uploads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get addresses count
      const { count: addressesCount, error: addressesError } = await supabase
        .from("addresses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (ordersError || progressError || designsError || addressesError) {
        console.error("Error fetching stats:", {
          ordersError,
          progressError,
          designsError,
          addressesError,
        });
      }

      return {
        ordersCount: ordersCount || 0,
        designsCount: designsCount || 0,
        inProgressCount: inProgressCount || 0,
        addressesCount: addressesCount || 0,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        ordersCount: 0,
        designsCount: 0,
        inProgressCount: 0,
        addressesCount: 0,
      };
    }
  },
};

// Initialize sample products (run once in Supabase SQL Editor)
export const sampleProductsSQL = `
-- Insert sample products
INSERT INTO products (name, description, price, category, delivery_days) VALUES
  ('Premium Business Cards', 'High-quality business cards with premium finish. 500 cards per pack.', 45.00, 'Stationery', '3-5 days'),
  ('A-Frame Signs', 'Durable outdoor A-frame signs perfect for storefronts and events.', 95.00, 'Large Format', '3-5 days'),
  ('Custom Flyers', 'Eye-catching flyers for promotions and events. 1000 flyers included.', 75.00, 'Commercial', '5-7 days'),
  ('Acrylic Prints', 'Beautiful acrylic photo prints with vibrant colors and durability.', 55.00, 'Digital', '5-7 days'),
  ('Fabric Banners', 'Custom fabric banners with full-color printing. Various sizes available.', 180.00, 'Large Format', '5-7 days'),
  ('Annual Reports', 'Professional annual report printing with binding options.', 150.00, 'Commercial', '7-10 days'),
  ('Vinyl Stickers', 'Weather-resistant vinyl stickers. Pack of 100 custom stickers.', 35.00, 'Packaging', '3-5 days'),
  ('Brochures', 'Tri-fold brochures with glossy or matte finish. 500 brochures included.', 85.00, 'Commercial', '5-7 days'),
  ('Posters', 'Large format posters in various sizes. Premium paper quality.', 65.00, 'Large Format', '5-7 days'),
  ('Letterheads', 'Professional letterheads for business correspondence. 1000 sheets.', 55.00, 'Stationery', '3-5 days'),
  ('T-Shirt Printing', 'Custom t-shirt printing with your design. High-quality fabric.', 120.00, 'Digital', '7-10 days'),
  ('Custom Labels', 'Adhesive labels for products and packaging. Roll of 500 labels.', 40.00, 'Packaging', '5-7 days');
`;
