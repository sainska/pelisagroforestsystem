// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient"; // adjust import if different

interface User {
  id: string;
  email: string;
  // add other user fields if needed
}

interface Profile {
  id: string;
  name: string;
  role: string;
  // add other profile fields as per your DB schema
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile based on user id
  const fetchProfile = async () => {
    if (!user) {
      console.log("No user to fetch profile for");
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log("Error fetching profile:", error);
        if (error.status === 400) {
          setError("Bad request while fetching profile. Please contact support.");
        } else {
          setError(error.message);
        }
        setProfile(null);
      } else {
        console.log("Profile fetched:", data);
        setProfile(data);
        setError(null);
      }
    } catch (err) {
      console.log("Unexpected error fetching profile:", err);
      setError("Unexpected error fetching profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to auth state changes and get current user
  useEffect(() => {
    setLoading(true);
    const getSessionUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.log("Error getting session:", error);
        setError(error.message);
        setUser(null);
        setLoading(false);
        return;
      }
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getSessionUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Fetch profile every time user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.log("Sign out error:", error);
      setError("Error signing out.");
    }
  };

  // Expose a function to refresh profile manually
  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, error, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
