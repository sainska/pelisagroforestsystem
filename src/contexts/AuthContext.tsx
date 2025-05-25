
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { AuthError, AuthResponse, Session, User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    metadata: { 
      name: string; 
      phone: string; 
      national_id: string; 
      location: string;
      id_document_url?: string;
      face_photo_url?: string;
    }
  ) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadDocument: (file: File, type: 'id' | 'face') => Promise<string>;
  submitPayment: (mpesaCode: string, phoneNumber: string) => Promise<void>;
  checkAccountStatus: () => Promise<{
    isApproved: boolean;
    paymentVerified: boolean;
    emailVerified: boolean;
    faceVerified: boolean;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
        return;
      }

      if (session) {
        setSession(session);
        setUser(session.user);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
        }
      }

      setIsLoading(false);
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          // Fetch profile data when user signs in
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setProfile(profileData || null);
          }, 0);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata: { 
      name: string; 
      phone: string; 
      national_id: string; 
      location: string;
      id_document_url?: string;
      face_photo_url?: string;
    }
  ): Promise<AuthResponse> => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (signUpError) {
        console.error('Error signing up:', signUpError);
        return { data: { user: null, session: null }, error: signUpError };
      }

      return { data: signUpData, error: null };
    } catch (error) {
      console.error('Sign-up failed:', error);
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign out failed',
        description: 'There was a problem signing out.',
        variant: 'destructive',
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Prevent updating national_id
      const { national_id, ...updateData } = data;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => (prev ? { ...prev, ...updateData } : null));

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'There was a problem updating your profile.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const uploadDocument = async (file: File, type: 'id' | 'face'): Promise<string> => {
    try {
      if (!user) throw new Error('User not authenticated');

      const fileName = `${user.id}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
      
      // For now, return a placeholder URL since we don't have storage configured
      // In a real implementation, you would upload to Supabase Storage
      const mockUrl = `https://placeholder.com/${fileName}`;
      
      // Update profile with document URL
      const updateField = type === 'id' ? 'id_document_url' : 'face_photo_url';
      await updateProfile({ [updateField]: mockUrl });

      return mockUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const submitPayment = async (mpesaCode: string, phoneNumber: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          mpesa_code: mpesaCode,
          phone_number: phoneNumber,
          amount: 300.00,
          status: 'Pending'
        });

      if (error) throw error;

      toast({
        title: 'Payment submitted',
        description: 'Your payment has been submitted for verification.',
      });
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: 'Payment failed',
        description: 'There was a problem submitting your payment.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const checkAccountStatus = async () => {
    try {
      if (!user || !profile) {
        return {
          isApproved: false,
          paymentVerified: false,
          emailVerified: false,
          faceVerified: false,
        };
      }

      return {
        isApproved: profile.account_approved || false,
        paymentVerified: profile.payment_verified || false,
        emailVerified: profile.email_verified || false,
        faceVerified: profile.face_verified || false,
      };
    } catch (error) {
      console.error('Error checking account status:', error);
      return {
        isApproved: false,
        paymentVerified: false,
        emailVerified: false,
        faceVerified: false,
      };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    uploadDocument,
    submitPayment,
    checkAccountStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? (
        children
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
          <p className="ml-2 text-emerald-700">Loading...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
