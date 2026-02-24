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
  user_name?: string | null;
  user_email?: string | null;
  user_phone?: string | null;
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
    userDetails?: { name?: string; email?: string; phone?: string },
  ): Promise<Order | null> {
    try {
      console.log("📦 Creating order with user details:", userDetails);
      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Create order with user details
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          user_name: userDetails?.name || null,
          user_email: userDetails?.email || null,
          user_phone: userDetails?.phone || null,
          status: "pending",
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (orderError) {
        console.error("❌ Error creating order:", orderError);
        throw orderError;
      }

      console.log("✅ Order created with ID:", order.id);

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
      console.log("Updating profile with:", updates);
      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      console.log("Profile updated successfully");
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

      // If duplicate key error (profile already exists), return true
      if (error) {
        if (error.code === "23505") {
          console.log("✅ Profile already exists in database");
          return true;
        }
        throw error;
      }
      console.log("✅ Profile created in database");
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

// Admin Service
export const adminService = {
  // Check if user is admin (for now, checking against email domain or specific emails)
  isAdmin: (email: string | undefined): boolean => {
    if (!email) return false;
    // Add your admin emails here
    const adminEmails = ["admin@printcraft.com", "owner@printcraft.com"];
    return adminEmails.includes(email.toLowerCase());
  },

  // Get all orders with user details
  async getAllOrders(): Promise<
    (Order & { user?: { email: string; name: string; phone: string | null } })[]
  > {
    try {
      console.log("📦 Admin: Fetching all orders from backend...");
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items(
            id,
            order_id,
            product_id,
            quantity,
            price,
            product:products(*)
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Admin: Error fetching orders:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      console.log(`✅ Admin: Fetched ${data?.length || 0} orders from backend`);

      // User details are now stored directly in the orders table
      // No need to fetch from auth.admin separately
      const ordersWithUsers = (data || []).map((order) => ({
        ...order,
        user: {
          email: order.user_email || "N/A",
          name: order.user_name || "Unknown Customer",
          phone: order.user_phone || null,
        },
      }));

      console.log(
        `✅ Admin: Loaded ${ordersWithUsers.length} orders with user details`,
      );
      return ordersWithUsers;
    } catch (error) {
      console.error("❌ Admin: Error fetching all orders:", error);
      console.error("This might be a Row Level Security (RLS) policy issue.");
      console.error(
        "Check ADMIN_PANEL_GUIDE.md for Supabase setup instructions.",
      );
      return [];
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
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

  // Get all users (profiles with email)
  async getAllUsers(): Promise<(Profile & { email: string })[]> {
    try {
      console.log("👥 Admin: Fetching all users from backend...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Admin: Error fetching users:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        console.error(
          "\n⚠️  COMMON ISSUE: Row Level Security (RLS) policies may be blocking admin access.",
        );
        console.error(
          "\n📖 SOLUTION: You need to add RLS policies for admin access.",
        );
        console.error("Run this SQL in your Supabase SQL Editor:");
        console.error("\n-- Allow admins to read all profiles");
        console.error('CREATE POLICY "Admin can read all profiles"');
        console.error("ON profiles FOR SELECT");
        console.error(
          "USING (auth.jwt() ->> 'email' IN ('admin@printcraft.com', 'owner@printcraft.com'));",
        );
        console.error(
          "\nOr temporarily disable RLS on profiles table for testing.",
        );
        throw error;
      }

      // Fetch emails for all users
      const usersWithEmails = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: userData } = await supabase.auth.admin.getUserById(
            profile.id,
          );
          return {
            ...profile,
            email: userData?.user?.email || "N/A",
          };
        }),
      );

      console.log(
        `✅ Admin: Fetched ${usersWithEmails.length} users with emails`,
      );
      return usersWithEmails;
    } catch (error) {
      console.error("❌ Admin: Failed to load users. Returning empty array.");
      console.error(
        "Check the console logs above for detailed error information.",
      );
      return [];
    }
  },

  // Get user stats
  async getUserStats(): Promise<{
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
  }> {
    try {
      console.log("📊 Admin: Fetching platform statistics...");

      const { count: usersCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (usersError) {
        console.error("❌ Admin: Error counting users:", usersError);
      } else {
        console.log(`✅ Admin: Found ${usersCount || 0} users in backend`);
      }

      const { count: ordersCount, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      if (ordersError) {
        console.error("❌ Admin: Error counting orders:", ordersError);
      } else {
        console.log(`✅ Admin: Found ${ordersCount || 0} orders in backend`);
      }

      const { data: orders, error: revenueError } = await supabase
        .from("orders")
        .select("total_amount");

      if (revenueError) {
        console.error("❌ Admin: Error fetching revenue:", revenueError);
      }

      const totalRevenue =
        orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      const { count: productsCount, error: productsError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (productsError) {
        console.error("❌ Admin: Error counting products:", productsError);
      } else {
        console.log(
          `✅ Admin: Found ${productsCount || 0} products in backend`,
        );
      }

      const stats = {
        totalUsers: usersCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        totalProducts: productsCount || 0,
      };

      console.log("📊 Admin: Platform statistics:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Admin: Error fetching admin stats:", error);
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
      };
    }
  },

  // Add new product
  async addProduct(
    product: Omit<Product, "id" | "created_at" | "updated_at">,
  ): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding product:", error);
      return null;
    }
  },

  // Update product
  async updateProduct(
    id: string,
    updates: Partial<Omit<Product, "id" | "created_at" | "updated_at">>,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
  },

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  },
};

// ===================================
// MESSAGE TYPES & INTERFACES
// ===================================

export interface Message {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  read: boolean;
  from_admin: boolean;
  admin_sender_email?: string | null;
  deleted_by_user: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
}

export interface NewMessage {
  user_id: string;
  subject: string;
  message: string;
  from_admin?: boolean;
  admin_sender_email?: string;
}

// ===================================
// MESSAGING SERVICE
// ===================================

export const messagesService = {
  // Get all messages for current user
  async getUserMessages(userId: string): Promise<Message[]> {
    try {
      console.log("📬 Fetching messages for user:", userId);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", userId)
        .eq("deleted_by_user", false) // Only show messages not deleted by user
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log(`📬 Found ${data?.length || 0} messages for user`);
      return data || [];
    } catch (error) {
      console.error("❌ Error fetching user messages:", error);
      return [];
    }
  },

  // Get unread message count for user
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false)
        .eq("deleted_by_user", false); // Don't count deleted messages

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("❌ Error getting unread count:", error);
      return 0;
    }
  },

  // Mark message as read
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", messageId);

      if (error) throw error;
      console.log("✅ Message marked as read:", messageId);
      return true;
    } catch (error) {
      console.error("❌ Error marking message as read:", error);
      return false;
    }
  },

  // Mark all messages as read for user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;
      console.log("✅ All messages marked as read for user:", userId);
      return true;
    } catch (error) {
      console.error("❌ Error marking all messages as read:", error);
      return false;
    }
  },

  // Delete message (for users - soft delete)
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      // Mark message as deleted by user instead of actually deleting it
      // This allows admin to still see the message
      const { error } = await supabase
        .from("messages")
        .update({ deleted_by_user: true })
        .eq("id", messageId);

      if (error) throw error;
      console.log("🗑️ Message marked as deleted by user:", messageId);
      return true;
    } catch (error) {
      console.error("❌ Error deleting message:", error);
      return false;
    }
  },

  // Send message to admin (from user)
  async sendToAdmin(
    userId: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    try {
      console.log("📤 User sending message to admin:", { userId, subject });

      const { error } = await supabase.from("messages").insert([
        {
          user_id: userId,
          subject: subject,
          message: message,
          from_admin: false,
          read: false,
        },
      ]);

      if (error) throw error;
      console.log("✅ Message sent to admin successfully");
      return true;
    } catch (error) {
      console.error("❌ Error sending message to admin:", error);
      return false;
    }
  },
};

// Admin messaging service
export const adminMessagesService = {
  // Send message to user (from admin)
  async sendMessage(newMessage: NewMessage): Promise<boolean> {
    try {
      console.log("📤 Admin sending message:", newMessage);

      // Get current admin user email
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const messageToInsert = {
        ...newMessage,
        from_admin: true,
        admin_sender_email: user?.email || null,
      };

      const { error } = await supabase
        .from("messages")
        .insert([messageToInsert]);

      if (error) throw error;
      console.log("✅ Message sent successfully");
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    }
  },

  // Get all messages (admin view)
  async getAllMessages(): Promise<Message[]> {
    try {
      console.log("📬 Admin: Fetching all messages...");

      // Fetch messages without foreign key join (to avoid schema cache issues)
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Admin: Query error:", error);
        throw error;
      }

      console.log(
        `📬 Admin: Fetched ${(data || []).length} messages from database`,
      );

      // Map the data to include user information
      const messagesWithUsers = await Promise.all(
        (data || []).map(async (message: any) => {
          try {
            // Get user profile info
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("id, full_name, company, phone")
              .eq("id", message.user_id)
              .single();

            if (profileError) {
              console.warn(
                `⚠️ Could not fetch profile for user ${message.user_id}:`,
                profileError,
              );
            }

            // Get user email from auth (requires admin API)
            const { data: userData, error: userError } =
              await supabase.auth.admin.getUserById(message.user_id);

            if (userError) {
              console.warn(
                `⚠️ Could not fetch email for user ${message.user_id}:`,
                userError,
              );
            }

            return {
              ...message,
              user: {
                id: message.user_id,
                email: userData?.user?.email || "No email",
                full_name: profile?.full_name || "Unknown User",
              },
            };
          } catch (err) {
            console.error(`❌ Error processing message ${message.id}:`, err);
            return {
              ...message,
              user: {
                id: message.user_id,
                email: "Error loading",
                full_name: "Unknown User",
              },
            };
          }
        }),
      );

      console.log(
        `✅ Admin: Fetched ${messagesWithUsers.length} messages with user info`,
      );
      return messagesWithUsers;
    } catch (error) {
      console.error("❌ Admin: Error fetching messages:", error);
      return [];
    }
  },

  // Get message statistics
  async getMessageStats(): Promise<{
    total: number;
    unread: number;
    read: number;
  }> {
    try {
      const { data, error } = await supabase.from("messages").select("read");

      if (error) throw error;

      const total = data?.length || 0;
      const unread = data?.filter((m) => !m.read).length || 0;
      const read = total - unread;

      return { total, unread, read };
    } catch (error) {
      console.error("❌ Error getting message stats:", error);
      return { total: 0, unread: 0, read: 0 };
    }
  },

  // Delete message (admin)
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
      console.log("🗑️ Admin: Message deleted:", messageId);
      return true;
    } catch (error) {
      console.error("❌ Admin: Error deleting message:", error);
      return false;
    }
  },

  // Mark message as read (admin)
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", messageId);

      if (error) throw error;
      console.log("✅ Admin: Message marked as read:", messageId);
      return true;
    } catch (error) {
      console.error("❌ Admin: Error marking message as read:", error);
      return false;
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
