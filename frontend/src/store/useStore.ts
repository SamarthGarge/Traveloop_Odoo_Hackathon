import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  apiLogin,
  apiRegister,
  apiGetProfile,
  extractError,
} from '../lib/api';

// ΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  photoUrl?: string;
  photo?: string;  // alias for Navbar compatibility
  isAdmin: boolean;
  createdAt: string;
}

export interface ApiTrip {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  cover_photo_url?: string;
  is_public: boolean;
  share_token: string;
  total_budget?: number;
  created_at: string;
  stops?: ApiStop[];
}

export interface ApiStop {
  id: string;
  city_id: string;
  arrival_date: string;
  departure_date: string;
  order_index: number;
  city?: ApiCity;
  activities?: ApiStopActivity[];
}

export interface ApiCity {
  id: string;
  name: string;
  country: string;
  region?: string;
  cost_index: number;
  popularity_score: number;
  description?: string;
  image_url?: string;
}

export interface ApiActivity {
  id: string;
  name: string;
  type: string;
  cost: number;
  duration_mins?: number;
  description?: string;
  image_url?: string;
  city_id: string;
}

export interface ApiStopActivity {
  id: string;
  stop_id: string;
  activity_id: string;
  scheduled_time?: string;
  custom_cost?: number;
  notes?: string;
  activity?: ApiActivity;
}

export interface ApiPackingItem {
  id: string;
  trip_id: string;
  name: string;
  category: string;
  is_packed: boolean;
  created_at: string;
}

export interface ApiNote {
  id: string;
  trip_id: string;
  stop_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Helper: map backend user ΓåÆ AppUser
export function mapUser(u: Record<string, unknown>): AppUser {
  return {
    id: u.id as string,
    firstName: (u.first_name as string) ?? '',
    lastName: (u.last_name as string) ?? '',
    email: u.email as string,
    phone: u.phone as string | undefined,
    city: u.city as string | undefined,
    country: u.country as string | undefined,
    photoUrl: u.photo_url as string | undefined,
    isAdmin: (u.is_admin as boolean) ?? false,
    createdAt: (u.created_at as string) ?? '',
  };
}

// ΓöÇΓöÇ Store Interface ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
interface TraveloopState {
  token: string | null;
  user: AppUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;

  // Active trip for navigation context (in-memory, not persisted)
  activeTrip: ApiTrip | null;

  // Community
  communityPosts: Array<{
    id: string; author: string; avatar: string; date: string;
    destination: string; title: string; content: string; likes: number;
  }>;
  likePost: (id: string) => void;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    phone?: string;
    city?: string;
    country?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;

  // User actions
  updateUser: (updates: Partial<AppUser>) => void;

  // Active trip
  setActiveTrip: (trip: ApiTrip | null) => void;
}

// ΓöÇΓöÇ Store ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const useStore = create<TraveloopState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      activeTrip: null,
      communityPosts: [
        { id: '1', author: 'Aria Patel', avatar: 'https://i.pravatar.cc/150?img=47', date: '2 days ago', destination: 'Santorini', title: 'Hidden Beaches of Santorini', content: 'Discovered the most breathtaking secret coves away from the tourist crowds...', likes: 142 },
        { id: '2', author: 'Liam Chen', avatar: 'https://i.pravatar.cc/150?img=11', date: '4 days ago', destination: 'Tokyo', title: 'Tokyo on a Budget — My Guide', content: 'You don\'t need to break the bank to experience the best of Tokyo. Here\'s how I did it...', likes: 87 },
        { id: '3', author: 'Sofia Martinez', avatar: 'https://i.pravatar.cc/150?img=32', date: '1 week ago', destination: 'Kyoto', title: 'Cherry Blossom Season Tips', content: 'Timing your visit during hanami season is magical. Here\'s everything you need to know...', likes: 210 },
      ],

      login: async (email, password) => {
        const res = await apiLogin({ email, password });
        const data = res.data ?? res;
        const token: string = data.token;
        const user = mapUser(data.user);
        localStorage.setItem('traveloop_token', token);
        set({ token, user, isLoggedIn: true, isAdmin: user.isAdmin });
      },

      register: async (payload) => {
        const res = await apiRegister(payload);
        const data = res.data ?? res;
        const token: string = data.token;
        const user = mapUser(data.user);
        localStorage.setItem('traveloop_token', token);
        set({ token, user, isLoggedIn: true, isAdmin: user.isAdmin });
      },

      logout: () => {
        localStorage.removeItem('traveloop_token');
        set({ token: null, user: null, isLoggedIn: false, isAdmin: false, activeTrip: null });
      },

      refreshUser: async () => {
        try {
          const res = await apiGetProfile();
          const data = res.data ?? res;
          const user = mapUser(data);
          set({ user, isAdmin: user.isAdmin });
        } catch {
          // silently fail
        }
      },

      updateUser: (updates) => {
        const prev = get().user;
        if (!prev) return;
        const updated = { ...prev, ...updates };
        set({ user: updated, isAdmin: updated.isAdmin });
      },

      likePost: (id) => set((state) => ({
        communityPosts: state.communityPosts.map((p) =>
          p.id === id ? { ...p, likes: p.likes + 1 } : p
        ),
      })),

      setActiveTrip: (trip) => set({ activeTrip: trip }),
    }),
    {
      name: 'traveloop-auth',
      // Only persist auth state + activeTrip for sidebar links
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isAdmin: state.isAdmin,
        activeTrip: state.activeTrip,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync localStorage token with persisted state
        if (state?.token) {
          localStorage.setItem('traveloop_token', state.token);
        }
      },
    }
  )
);
