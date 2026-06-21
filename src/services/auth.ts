import { supabase } from './supabase';
import { User } from '../types/database.types';

export interface RegisterParams {
  email: string;
  password?: string;
  name: string;
}

export interface LoginParams {
  email: string;
  password?: string;
}

export const authService = {
  /**
   * Registers a new user with Supabase Auth and creates a record in the public.users table.
   */
  async register({ email, password, name }: RegisterParams) {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: password || 'default-placeholder-password', // Fallback as per ERD
      options: {
        data: {
          name, // Will be accessible in auth metadata
        },
      },
    });

    if (authError) throw authError;

    // Note: Assuming there is a Supabase Database Trigger to automatically
    // insert into public.users when auth.users is populated (as mentioned in ERD: "Linked to auth.users.id via Supabase trigger").
    // If not, you will need to manually insert the user profile here:
    /*
    if (authData.user) {
      const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        name,
        password: password, // As per ERD
      });

      if (dbError) throw dbError;
    }
    */

    return authData;
  },

  /**
   * Logs in a user with Supabase Auth
   */
  async login({ email, password }: LoginParams) {
    if (!password) {
      // OTP / Magic link flow
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      return data;
    }

    // Standard email & password login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Logs out the current user
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Gets the currently authenticated user session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  
  /**
   * Gets the current user profile from public.users table based on Auth ID
   */
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data as User;
  }
};
