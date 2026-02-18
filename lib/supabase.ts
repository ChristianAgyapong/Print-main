import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage adapter that works on both web and native
const getStorage = () => {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    return {
      getItem: (key: string) => Promise.resolve(typeof window !== 'undefined' ? localStorage.getItem(key) : null),
      setItem: (key: string, value: string) => Promise.resolve(typeof window !== 'undefined' && localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(typeof window !== 'undefined' && localStorage.removeItem(key)),
    };
  } else {
    // Use AsyncStorage for native
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
