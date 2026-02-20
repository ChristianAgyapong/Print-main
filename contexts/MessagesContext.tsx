import { messagesService } from "@/lib/database-service";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface MessagesContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined,
);

export const MessagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      refreshUnreadCount();
      // Refresh every 30 seconds when app is active
      const interval = setInterval(refreshUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user?.id]);

  const refreshUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const messages = await messagesService.getUserMessages(user.id);
      const unread = messages.filter((m) => !m.read && m.from_admin).length;
      setUnreadCount(unread);
      console.log(`📬 Unread messages from admin: ${unread}`);
    } catch (error) {
      console.error("❌ Error fetching unread count:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await messagesService.markAsRead(messageId);
      await refreshUnreadCount();
    } catch (error) {
      console.error("❌ Error marking message as read:", error);
    }
  };

  return (
    <MessagesContext.Provider
      value={{ unreadCount, refreshUnreadCount, markAsRead }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};
