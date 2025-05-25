import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  national_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  farm_group_id?: string;
  avatar_url?: string;
  id_document_url?: string;
  face_photo_url?: string;
  face_verified?: boolean;
  email_verified?: boolean;
  payment_verified?: boolean;
  account_approved?: boolean;
  approved_by?: string;
  approved_at?: string;
  trust_score?: number;
  location?: string;
  created_at?: string;
  updated_at?: string;
};

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Failed to get session:", error);
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        console.warn("No user ID available, skipping profile fetch.");
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error, status } = await supabase
          .from("profiles")
          .select(
            "id,national_id,name,email,phone,role,farm_group_id,avatar_url,id_document_url,face_photo_url,face_verified,email_verified,payment_verified,account_approved,approved_by,approved_at,trust_score,location,created_at,updated_at"
          )
          .eq("id", user.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        setProfile(data ?? null);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
