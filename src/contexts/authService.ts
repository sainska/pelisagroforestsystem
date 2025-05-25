// src/services/authService.ts
import { supabase } from '@/lib/supabaseClient'; // your Supabase client setup

type Metadata = {
  name: string;
  phone: string;
  national_id: string;
  location: string;
  id_document_url?: string;
  face_photo_url?: string;
};

export const authService = {
  signUp: async (email: string, password: string, metadata: Metadata) => {
    // 1. Create user in Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) throw new Error('User signup failed');

    // 2. Save user metadata/profile to 'profiles' table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id, // use auth user id as PK in profiles table
        email,
        name: metadata.name,
        phone: metadata.phone,
        national_id: metadata.national_id,
        location: metadata.location,
        id_document_url: metadata.id_document_url || null,
        face_photo_url: metadata.face_photo_url || null,
      });

    if (profileError) throw profileError;

    return data.user;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.session;
  },

  signOut: async (navigate: (path: string) => void) => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate('/login');
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  },

  updateProfile: async (data: any, userId: string, setProfile: (p: any) => void) => {
    const { error } = await supabase.from('profiles').update(data).eq('id', userId);
    if (error) throw error;
    // Optionally fetch updated profile and update state
    const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (updatedProfile) setProfile(updatedProfile);
    return updatedProfile;
  },

  uploadDocument: async (file: File, type: 'id' | 'face', userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_photo_${userId}.${fileExt}`;
    const filePath = `documents/${userId}/${fileName}`;

    const { data, error } = await supabase.storage.from('user-documents').upload(filePath, file, {
      upsert: true,
    });

    if (error) throw error;

    const { publicURL, error: urlError } = supabase.storage.from('user-documents').getPublicUrl(filePath);
    if (urlError) throw urlError;

    return publicURL;
  },

  submitPayment: async (mpesaCode: string, phoneNumber: string, userId: string) => {
    // Implement payment logic here (e.g., insert payment record in DB)
    // For example:
    const { error } = await supabase.from('payments').insert({
      user_id: userId,
      mpesa_code: mpesaCode,
      phone_number: phoneNumber,
      paid_at: new Date(),
    });
    if (error) throw error;
    return true;
  },

  checkAccountStatus: async (user: any, profile: any) => {
    // Implement your logic here to check status
    return { active: true }; // example
  },
};
