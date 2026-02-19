import { profileService } from "@/lib/database-service";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state changed:", event, "Has session:", !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Create profile only for new users (initial sign up)
      if (
        (event === "INITIAL_SESSION" || event === "SIGNED_IN") &&
        session?.user
      ) {
        const userId = session.user.id;
        const fullName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "User";

        // Check if profile exists
        const existingProfile = await profileService.get(userId);

        if (!existingProfile) {
          console.log("📝 Creating profile for user:", userId);
          const created = await profileService.create(userId, fullName);
          if (created) {
            console.log("✅ Profile created successfully");
          } else {
            console.log("ℹ️ Profile already exists or creation skipped");
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      // Profile creation is handled by auth state listener
      return { error };
    } catch (error) {
      console.error("❌ Error in signUp:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    // Clear user state immediately for responsive UI
    setUser(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    try {
      // Create redirect URL based on environment
      const redirectUrl = Platform.select({
        default: Linking.createURL("auth/callback"),
      });

      console.log("🔗 Redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error("❌ OAuth Error:", error);
        return { error };
      }
      if (!data?.url) {
        console.error("❌ No OAuth URL returned");
        return { error: new Error("No OAuth URL returned") };
      }

      console.log("🌐 Opening OAuth URL...");
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );

      console.log("📱 Browser result:", result);

      if (result.type === "success") {
        const { url } = result;
        console.log("✅ Success URL:", url);

        // Extract tokens from the URL hash or query parameters
        const urlObj = new URL(url);
        const hash = urlObj.hash.substring(1); // Remove '#'
        const hashParams = new URLSearchParams(hash);
        const queryParams = urlObj.searchParams;

        const access_token =
          hashParams.get("access_token") || queryParams.get("access_token");
        const refresh_token =
          hashParams.get("refresh_token") || queryParams.get("refresh_token");

        console.log("🔑 Tokens found:", {
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token,
        });

        if (access_token && refresh_token) {
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          console.log("✅ Session set successfully");
        } else {
          console.error("❌ No tokens found in URL");
        }
      } else {
        console.log("⚠️ Browser result type:", result.type);
      }

      return { error: null };
    } catch (error) {
      console.error("❌ Exception in signInWithGoogle:", error);
      return { error };
    }
  };

  const signInWithApple = async () => {
    try {
      // Create redirect URL based on environment
      const redirectUrl = Platform.select({
        default: Linking.createURL("auth/callback"),
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) return { error };
      if (!data?.url) return { error: new Error("No OAuth URL returned") };

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );

      if (result.type === "success") {
        const { url } = result;
        // Extract tokens from the URL hash or query parameters
        const urlObj = new URL(url);
        const hash = urlObj.hash.substring(1); // Remove '#'
        const hashParams = new URLSearchParams(hash);
        const queryParams = urlObj.searchParams;

        const access_token =
          hashParams.get("access_token") || queryParams.get("access_token");
        const refresh_token =
          hashParams.get("refresh_token") || queryParams.get("refresh_token");

        if (access_token && refresh_token) {
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = Linking.createURL("reset-password");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
