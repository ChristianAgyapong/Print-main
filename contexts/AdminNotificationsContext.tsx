import { Order } from "@/lib/database-service";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminNotificationsContextType {
  newOrdersCount: number;
  newMessagesCount: number;
  recentOrders: Order[];
  clearNotifications: () => void;
  clearMessageNotifications: () => void;
  refreshOrders: () => Promise<void>;
  refreshMessages: () => Promise<void>;
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
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    // 1. Listen for new orders
    const ordersChannel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setRecentOrders((prev) => [payload.new as Order, ...prev].slice(0, 10));
          setNewOrdersCount((prev) => prev + 1);
        },
      )
      .subscribe();

    // 2. Listen for new messages FROM users
    const messagesChannel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as any;
          // Only notify if it's NOT from admin (i.e., from a user)
          if (!msg.from_admin) {
            console.log("📬 New user message received!");
            setNewMessagesCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    // Initial counts
    refreshMessages();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  const clearNotifications = () => {
    setNewOrdersCount(0);
    setRecentOrders([]);
  };

  const clearMessageNotifications = () => {
    setNewMessagesCount(0);
  };

  const refreshOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setRecentOrders(data || []);
    } catch (error) {
      console.error("❌ Error refreshing orders:", error);
    }
  };

  const refreshMessages = async () => {
    try {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("from_admin", false)
        .eq("read", false);

      if (error) throw error;
      setNewMessagesCount(count || 0);
    } catch (error) {
      console.error("❌ Error refreshing messages count:", error);
    }
  };

  return (
    <AdminNotificationsContext.Provider
      value={{
        newOrdersCount,
        newMessagesCount,
        recentOrders,
        clearNotifications,
        clearMessageNotifications,
        refreshOrders,
        refreshMessages,
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
