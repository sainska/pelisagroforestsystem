
import type { User, Session, AuthError, AuthResponse } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthContextType {
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

export interface AccountStatus {
  isApproved: boolean;
  paymentVerified: boolean;
  emailVerified: boolean;
  faceVerified: boolean;
}
