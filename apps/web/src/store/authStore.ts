import { create } from 'zustand';
import { createApi } from '../../packages/api-client/src/index';
import type { Profile, User } from '../../packages/types/src/index';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  clearError: () => void;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

const api = createApi(supabaseUrl || '', supabaseAnonKey || '');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.login({ email, password });
      
      if (user) {
        const profile = await api.getProfile(user.id);
        set({ 
          user, 
          profile, 
          isAuthenticated: true,
          isLoading: false 
        });
        
        // Update presence to online
        await api.updatePresence(user.id, true);
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (email: string, password: string, username: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.register({ 
        email, 
        password, 
        username, 
        display_name: displayName 
      });
      
      if (user) {
        const profile = await api.getProfile(user.id);
        set({ 
          user, 
          profile, 
          isAuthenticated: true,
          isLoading: false 
        });
        
        // Update presence to online
        await api.updatePresence(user.id, true);
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      const userId = get().user?.id;
      
      // Update presence to offline before logging out
      if (userId) {
        await api.updatePresence(userId, false);
      }
      
      await api.logout();
      set({ 
        user: null, 
        profile: null, 
        isAuthenticated: false,
        error: null 
      });
    } catch (error: any) {
      set({ error: error.message || 'Logout failed' });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.resetPassword(email);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Password reset failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  fetchProfile: async () => {
    try {
      const user = await api.getCurrentUser();
      if (user) {
        const profile = await api.getProfile(user.id);
        set({ 
          user, 
          profile, 
          isAuthenticated: true,
          isLoading: false 
        });
        
        // Update presence to online
        await api.updatePresence(user.id, true);
      } else {
        set({ 
          user: null, 
          profile: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        user: null, 
        profile: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const userId = get().user?.id;
    if (!userId) throw new Error('Not authenticated');
    
    try {
      const updatedProfile = await api.updateProfile(userId, updates);
      set({ profile: updatedProfile });
    } catch (error: any) {
      set({ error: error.message || 'Profile update failed' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Auto-fetch profile on mount (for web app initialization)
export const initializeAuth = async () => {
  const store = useAuthStore.getState();
  await store.fetchProfile();
};
