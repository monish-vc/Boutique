import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { withRetry, isTransientError } from '../lib/retry';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,

  initialize: async () => {
    try {
      const { data: { session } } = await withRetry(
        () => supabase.auth.getSession(),
        { retries: 3, shouldRetry: isTransientError }
      );
      if (session?.user) {
        await get().fetchProfile(session.user);
      }
    } catch (err) {
      console.error('Auth init error:', err);
    } finally {
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await get().fetchProfile(session.user);
      } else {
        set({ user: null, profile: null, isAdmin: false });
      }
    });
  },

  fetchProfile: async (user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ id: user.id, email: user.email, role: 'customer' })
          .select()
          .single();
        set({
          user,
          profile: newProfile,
          isAdmin: false,
        });
      } else if (data) {
        set({
          user,
          profile: data,
          isAdmin: data.role === 'admin',
        });
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      set({ user, profile: null, isAdmin: false });
    }
  },

  signUp: async (email, password) => {
    const { data, error } = await withRetry(
      () => supabase.auth.signUp({ email, password }),
      { retries: 2, shouldRetry: isTransientError }
    );
    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await withRetry(
      () => supabase.auth.signInWithPassword({ email, password }),
      { retries: 2, shouldRetry: isTransientError }
    );
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null, isAdmin: false });
  },
}));

export default useAuthStore;
