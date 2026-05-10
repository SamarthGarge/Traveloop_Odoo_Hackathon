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
  phone: string;
  city: string;
  country: string;
  photo: string;
  bio: string;
  language?: string;
}

export interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  dateRange: string;
  budget: number;
  city?: string;
  activities?: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  stop: string;
  time?: string;
  tags?: string[];
  mood?: string;
  location?: string;
  photos?: string[];
  favorite?: boolean;
  archived?: boolean;
  updatedAt?: string;
}

export interface ExpenseItem {
  id: string;
  category: string;
  title: string;
  description: string;
  qty: string;
  amount: number;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  coverImage: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  budget: number;
  spent: number;
  sections: ItinerarySection[];
  notes: Note[];
  createdBy: string;
  expenses?: ExpenseItem[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  packed: boolean;
  category: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  destination: string;
  likes: number;
  date: string;
}

interface AppState {
  // Auth
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: Omit<User, 'id'>) => boolean;
  updateProfile: (data: Partial<User>) => void;

  // Trips
  trips: Trip[];
  activeTrip: Trip | null;
  createTrip: (trip: Omit<Trip, 'id' | 'sections' | 'notes'>) => void;
  updateTrip: (id: string, data: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setActiveTrip: (trip: Trip | null) => void;

  // Checklist
  checklist: ChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void;
  resetChecklist: () => void;

  // Community
  communityPosts: CommunityPost[];
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'likes' | 'date'>) => void;
  likePost: (id: string) => void;

  // Notes
  addNote: (tripId: string, note: Omit<Note, 'id'>) => void;
  updateNote: (tripId: string, noteId: string, data: Partial<Note>) => void;
  deleteNote: (tripId: string, noteId: string) => void;

  // Finance
  updateTripBudget: (tripId: string, budget: number) => void;
  updateSectionBudget: (tripId: string, sectionId: string, budget: number) => void;
  addExpense: (tripId: string, expense: Omit<ExpenseItem, 'id'>) => void;
  updateExpense: (tripId: string, expenseId: string, data: Partial<ExpenseItem>) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;

  // UI
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

const seedCommunityPosts: CommunityPost[] = [
  { id: 'p1', author: 'Sarah Chen', avatar: '/images/user-avatar.jpg', title: 'Hidden gems in Kyoto', content: 'Found this amazing tea house near Kiyomizu-dera that no one talks about...', destination: 'Kyoto, Japan', likes: 24, date: '2025-01-15' },
  { id: 'p2', author: 'Marco Rossi', avatar: '/images/user-avatar.jpg', title: 'Best pasta in Rome', content: 'Skip the tourist traps and head to Trastevere for authentic carbonara...', destination: 'Rome, Italy', likes: 42, date: '2025-02-20' },
  { id: 'p3', author: 'Emma Watson', avatar: '/images/user-avatar.jpg', title: 'Northern Lights photography tips', content: 'Use ISO 1600+, f/2.8, 15-20s exposure. Best spots away from Reykjavik...', destination: 'Iceland', likes: 67, date: '2025-03-01' },
  { id: 'p4', author: 'James Park', avatar: '/images/user-avatar.jpg', title: 'Budget travel in Southeast Asia', content: 'How I spent 3 months traveling Thailand, Vietnam, and Bali for under ₹2000...', destination: 'Southeast Asia', likes: 89, date: '2025-03-10' },
  { id: 'p5', author: 'Lisa Mueller', avatar: '/images/user-avatar.jpg', title: 'Swiss Alps hiking guide', content: 'The best trails for beginners and advanced hikers in the Jungfrau region...', destination: 'Swiss Alps', likes: 35, date: '2025-03-25' },
];

// ─── Admin Credentials ─────────────────────────────────────────────────────
export const ADMIN_EMAIL = 'admin@traveloop.com';
export const ADMIN_PASSWORD = 'Admin@1234';
// ─────────────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: {
        id: '1',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james@traveloop.com',
        phone: '+1 555 123 4567',
        city: 'San Francisco',
        country: 'USA',
        photo: '/images/user-avatar.jpg',
        bio: 'Passionate traveler exploring the world one city at a time.',
      },
      isLoggedIn: false,
      isAdmin: false,

      login: (email: string, password: string) => {
        if (email && password) {
          // Check if it's the admin account
          const adminLogin = email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
          const adminUser = adminLogin ? {
            id: 'admin-1',
            firstName: 'Admin',
            lastName: 'Traveloop',
            email: ADMIN_EMAIL,
            phone: '+91 98765 43210',
            city: 'Mumbai',
            country: 'India',
            photo: '/images/user-avatar.jpg',
            bio: 'Platform administrator.',
          } : undefined;

          set({
            isLoggedIn: true,
            isAdmin: adminLogin,
            ...(adminUser ? { user: adminUser } : {}),
          });
          return true;
        }
        return false;
      },

      logout: () => set({ isLoggedIn: false, user: null, activeTrip: null }),

      register: (data) => {
        const newUser: User = { ...data, id: Date.now().toString() };
        set({ user: newUser, isLoggedIn: true, isAdmin: false });
        return true;
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
<<<<<<< HEAD

      // Checklist
      checklist: seedChecklist,

      toggleChecklistItem: (id) => {
        set({
          checklist: get().checklist.map((item) =>
            item.id === id ? { ...item, packed: !item.packed } : item
          ),
        });
      },

      addChecklistItem: (item) => {
        set({
          checklist: [
            ...get().checklist,
            { ...item, id: Date.now().toString() },
          ],
        });
      },

      resetChecklist: () => {
        set({
          checklist: get().checklist.map((item) => ({
            ...item,
            packed: false,
          })),
        });
      },

      // Community
      communityPosts: seedCommunityPosts,

      addCommunityPost: (post) => {
        const newPost: CommunityPost = {
          ...post,
          id: Date.now().toString(),
          likes: 0,
          date: new Date().toISOString().split('T')[0],
        };
        set({ communityPosts: [newPost, ...get().communityPosts] });
      },

      likePost: (id) => {
        set({
          communityPosts: get().communityPosts.map((p) =>
            p.id === id ? { ...p, likes: p.likes + 1 } : p
          ),
        });
      },

      // Notes
  addNote: (tripId, note) => {
    const newNote: Note = { ...note, id: Date.now().toString(), updatedAt: new Date().toISOString() };
    set({
      trips: get().trips.map((t) =>
        t.id === tripId ? { ...t, notes: [...t.notes, newNote] } : t
      ),
      activeTrip: get().activeTrip?.id === tripId
        ? { ...get().activeTrip!, notes: [...get().activeTrip!.notes, newNote] }
        : get().activeTrip,
    });
  },

  updateNote: (tripId, noteId, data) => {
    set({
      trips: get().trips.map((t) =>
        t.id === tripId
          ? { ...t, notes: t.notes.map((n) => n.id === noteId ? { ...n, ...data, updatedAt: new Date().toISOString() } : n) }
          : t
      ),
      activeTrip: get().activeTrip?.id === tripId
        ? { ...get().activeTrip!, notes: get().activeTrip!.notes.map((n) => n.id === noteId ? { ...n, ...data, updatedAt: new Date().toISOString() } : n) }
        : get().activeTrip,
    });
  },

  deleteNote: (tripId, noteId) => {
    set({
      trips: get().trips.map((t) =>
        t.id === tripId ? { ...t, notes: t.notes.filter((n) => n.id !== noteId) } : t
      ),
      activeTrip: get().activeTrip?.id === tripId
        ? { ...get().activeTrip!, notes: get().activeTrip!.notes.filter((n) => n.id !== noteId) }
        : get().activeTrip,
    });
  },

      // Finance
      updateTripBudget: (tripId, budget) => {
        set({
          trips: get().trips.map(t => t.id === tripId ? { ...t, budget } : t),
          activeTrip: get().activeTrip?.id === tripId ? { ...get().activeTrip!, budget } : get().activeTrip
        });
      },

      updateSectionBudget: (tripId, sectionId, budget) => {
        set({
          trips: get().trips.map(t => 
            t.id === tripId 
              ? { ...t, sections: t.sections.map(s => s.id === sectionId ? { ...s, budget } : s) } 
              : t
          ),
          activeTrip: get().activeTrip?.id === tripId
            ? { ...get().activeTrip!, sections: get().activeTrip!.sections.map(s => s.id === sectionId ? { ...s, budget } : s) }
            : get().activeTrip
        });
      },

      addExpense: (tripId, expense) => {
        const newExpense: ExpenseItem = { ...expense, id: Date.now().toString() };
        set({
          trips: get().trips.map(t => 
            t.id === tripId ? { ...t, expenses: [...(t.expenses || []), newExpense] } : t
          ),
          activeTrip: get().activeTrip?.id === tripId
            ? { ...get().activeTrip!, expenses: [...(get().activeTrip!.expenses || []), newExpense] }
            : get().activeTrip
        });
      },

      updateExpense: (tripId, expenseId, data) => {
        set({
          trips: get().trips.map(t => 
            t.id === tripId 
              ? { ...t, expenses: (t.expenses || []).map(e => e.id === expenseId ? { ...e, ...data } : e) } 
              : t
          ),
          activeTrip: get().activeTrip?.id === tripId
            ? { ...get().activeTrip!, expenses: (get().activeTrip!.expenses || []).map(e => e.id === expenseId ? { ...e, ...data } : e) }
            : get().activeTrip
        });
      },

      deleteExpense: (tripId, expenseId) => {
        set({
          trips: get().trips.map(t => 
            t.id === tripId ? { ...t, expenses: (t.expenses || []).filter(e => e.id !== expenseId) } : t
          ),
          activeTrip: get().activeTrip?.id === tripId
            ? { ...get().activeTrip!, expenses: (get().activeTrip!.expenses || []).filter(e => e.id !== expenseId) }
            : get().activeTrip
        });
      },
=======
>>>>>>> 95bb846bc93e0e8cc3c54ccdd99f9a02281f01d7
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
