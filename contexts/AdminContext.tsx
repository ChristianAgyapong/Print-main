import { adminService } from "@/lib/database-service";
import { useAuth } from "./AuthContext";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    setIsLoading(true);
    if (user?.email) {
      const adminStatus = adminService.isAdmin(user.email);
      setIsAdmin(adminStatus);
    } else {
      setIsAdmin(false);
    }
    setIsLoading(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
