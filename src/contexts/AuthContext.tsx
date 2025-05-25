import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient"; // or wherever your supabase client is

interface User {
  id: string;
  email: string;
  // add other user fields you want
}

interface Profile {
  id: string;
  name: string;
  role: string;
  // add other profile fields you want
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch session user from Supabase auth
  useEffect(() => {
    const sessionUser = supabase.auth.getUser(); // adjust if your sdk version differs
    sessionUser.then(({ data, error }) => {
      if (error) {
        setError(error.message);
        setUser(null);
        setLoading(false);
        return;
      }
      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  // Function to fetch profile with error handling
  const fetchProfile = async () => {
    if (!user) {
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
        if (error.status === 400) {
          setError("Bad request while fetching profile. Please contact support.");
          // Optional: you can signOut here or clear user/session if you want
          // await signOut();
        } else {
          setError(error.message);
        }
        setProfile(null);
      } else {
        setProfile(data);
        setError(null);
      }
    } catch (err) {
      setError("Unexpected error fetching profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Expose a refreshProfile function to retry fetching profile
  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
