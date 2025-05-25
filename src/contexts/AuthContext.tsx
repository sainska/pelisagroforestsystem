import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email,
          phone,
          role,
          farm_group_id,
          avatar_url,
          id_document_url,
          face_photo_url,
          face_verified,
          email_verified,
          payment_verified,
          account_approved,
          approved_by,
          approved_at,
          trust_score,
          location,
          created_at,
          updated_at
        `)
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        setUserProfile(null);
      } else {
        setUserProfile(data);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
