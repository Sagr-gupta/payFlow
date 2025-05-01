import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User as AppUser } from '../types';

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (email: string, password: string, name: string, company: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<boolean>;
}

const fetchUserProfile = async (userId: string): Promise<AppUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as AppUser;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  signup: async (email: string, password: string, name: string, company: string) => {
    set({ isLoading: true, error: null });
    
    try {
      if (!email || !password || !name || !company) {
        throw new Error('All fields are required');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name,
            company,
          }
        }
      });
      
      if (authError) {
        console.error('Signup error:', authError);
        throw authError;
      }
      
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: email.trim(),
              name,
              company,
              role: 'user',
            },
          ]);
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }
        
        const userProfile = await fetchUserProfile(authData.user.id);
        if (userProfile) {
          set({ user: userProfile, isAuthenticated: true });
        }
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred during signup';
      console.error('Signup failed:', error);
      set({ error: errorMessage });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (error) {
        console.error('Login error:', error);
        if (error.message === 'Email not confirmed') {
          throw new Error('Please check your email to confirm your account before logging in.');
        }
        throw error;
      }
      
      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        if (userProfile) {
          set({ user: userProfile, isAuthenticated: true });
        }
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred during login';
      console.error('Login failed:', error);
      set({ error: errorMessage });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  checkSession: async () => {
    set({ isLoading: true });
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        if (userProfile) {
          set({ user: userProfile, isAuthenticated: true });
        }
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },

  resendConfirmationEmail: async (email: string) => {
    set({ isLoading: true, error: null });
    
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      
      if (error) {
        console.error('Resend confirmation error:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred while resending confirmation email';
      console.error('Resend confirmation failed:', error);
      set({ error: errorMessage });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));