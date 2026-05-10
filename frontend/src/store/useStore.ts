import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  apiLogin,
  apiRegister,
  apiGetProfile,
  extractError,
} from '../lib/api';

// ── Types ────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  photoUrl?: string;
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

// Helper: map backend user → AppUser
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

// ── Store Interface ──────────────────────────────────────────
interface TraveloopState {
  token: string | null;
  user: AppUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;

  // Active trip for navigation context (in-memory, not persisted)
  activeTrip: ApiTrip | null;

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

// ── Store ────────────────────────────────────────────────────
export const useStore = create<TraveloopState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      activeTrip: null,

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
