import { Order } from "@/lib/database-service";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminNotificationsContextType {
  newOrdersCount: number;
  recentOrders: Order[];
  clearNotifications: () => void;
  refreshOrders: () => Promise<void>;
}

const AdminNotificationsContext = createContext<
  AdminNotificationsContextType | undefined
>(undefined);

export function AdminNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Subscribe to realtime order insertions
    const ordersChannel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("🔔 New order received:", payload.new);

          // Add to recent orders
          const newOrder = payload.new as Order;
          setRecentOrders((prev) => [newOrder, ...prev].slice(0, 10)); // Keep last 10

          // Increment counter
          setNewOrdersCount((prev) => prev + 1);

          // Could show a toast notification here
          console.log(
            "📢 Admin notification: New order #" + newOrder.id.substring(0, 8),
          );
        },
      )
      .subscribe();

    setChannel(ordersChannel);

    // Cleanup on unmount
    return () => {
      if (ordersChannel) {
        supabase.removeChannel(ordersChannel);
      }
    };
  }, []);

  const clearNotifications = () => {
    console.log("🔕 Clearing admin notifications");
    setNewOrdersCount(0);
    setRecentOrders([]);
  };

  const refreshOrders = async () => {
    try {
      console.log("🔄 Refreshing recent orders...");
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setRecentOrders(data || []);
      console.log(`✅ Refreshed ${data?.length || 0} recent orders`);
    } catch (error) {
      console.error("❌ Error refreshing orders:", error);
    }
  };

  return (
    <AdminNotificationsContext.Provider
      value={{
        newOrdersCount,
        recentOrders,
        clearNotifications,
        refreshOrders,
      }}
    >
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useAdminNotifications must be used within AdminNotificationsProvider",
    );
  }
  return context;
}
