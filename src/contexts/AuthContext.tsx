
import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { authService } from '@/services/authService';
import type { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, session, isLoading, setProfile } = useAuthState();
  const navigate = useNavigate();

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
  ) => {
    return authService.signUp(email, password, metadata);
  };

  const signIn = async (email: string, password: string) => {
    return authService.signIn(email, password);
  };

  const signOut = async () => {
    return authService.signOut(navigate);
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email);
  };

  const updateProfile = async (data: any) => {
    if (!user) throw new Error('User not authenticated');
    return authService.updateProfile(data, user.id, setProfile);
  };

  const uploadDocument = async (file: File, type: 'id' | 'face'): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    const url = await authService.uploadDocument(file, type, user.id);
    
    // Update profile with document URL
    const updateField = type === 'id' ? 'id_document_url' : 'face_photo_url';
    await updateProfile({ [updateField]: url });
    
    return url;
  };

  const submitPayment = async (mpesaCode: string, phoneNumber: string) => {
    if (!user) throw new Error('User not authenticated');
    return authService.submitPayment(mpesaCode, phoneNumber, user.id);
  };

  const checkAccountStatus = async () => {
    return authService.checkAccountStatus(user, profile);
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
