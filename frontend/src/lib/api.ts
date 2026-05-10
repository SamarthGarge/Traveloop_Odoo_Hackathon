import axios from 'axios';

// ── Axios Instance ───────────────────────────────────────────
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('traveloop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → clear token & reload
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('traveloop_token');
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Helper ───────────────────────────────────────────────────
export function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (typeof data === 'string') return data;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

// ── Auth ─────────────────────────────────────────────────────
export async function apiRegister(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone?: string;
  city?: string;
  country?: string;
}) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function apiLogin(data: { email: string; password: string }) {
  const res = await api.post('/auth/login', data);
  return res.data;
}

export async function apiGetMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

// ── User Profile ─────────────────────────────────────────────
export async function apiGetProfile() {
  const res = await api.get('/users/me');
  return res.data;
}

export async function apiUpdateProfile(data: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  country?: string;
}) {
  const res = await api.patch('/users/me', data);
  return res.data;
}

export async function apiChangePassword(data: {
  current_password: string;
  new_password: string;
}) {
  const res = await api.patch('/users/me/password', data);
  return res.data;
}

export async function apiDeleteAccount() {
  const res = await api.delete('/users/me');
  return res.data;
}

// ── Trips ────────────────────────────────────────────────────
export async function apiListTrips() {
  const res = await api.get('/trips');
  return res.data;
}

export async function apiGetTrip(id: string) {
  const res = await api.get(`/trips/${id}`);
  return res.data;
}

export async function apiCreateTrip(data: {
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  cover_photo_url?: string;
  total_budget?: number;
}) {
  const res = await api.post('/trips', data);
  return res.data;
}

export async function apiUpdateTrip(
  id: string,
  data: {
    name?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    cover_photo_url?: string;
    total_budget?: number;
  }
) {
  const res = await api.patch(`/trips/${id}`, data);
  return res.data;
}

export async function apiDeleteTrip(id: string) {
  const res = await api.delete(`/trips/${id}`);
  return res.data;
}

export async function apiToggleShare(id: string, is_public: boolean) {
  const res = await api.patch(`/trips/${id}/share`, { is_public });
  return res.data;
}

export async function apiGetBudget(id: string) {
  const res = await api.get(`/trips/${id}/budget`);
  return res.data;
}

// ── Cities ───────────────────────────────────────────────────
export async function apiSearchCities(params?: {
  q?: string;
  region?: string;
  sort?: string;
  limit?: number;
}) {
  const res = await api.get('/cities', { params });
  return res.data;
}

export async function apiGetCity(id: string) {
  const res = await api.get(`/cities/${id}`);
  return res.data;
}

export async function apiGetCityActivities(
  id: string,
  params?: { type?: string; max_cost?: number }
) {
  const res = await api.get(`/cities/${id}/activities`, { params });
  return res.data;
}

// ── Stops ────────────────────────────────────────────────────
export async function apiListStops(tripId: string) {
  const res = await api.get(`/trips/${tripId}/stops`);
  return res.data;
}

export async function apiCreateStop(
  tripId: string,
  data: {
    city_id: string;
    arrival_date: string;
    departure_date: string;
  }
) {
  const res = await api.post(`/trips/${tripId}/stops`, data);
  return res.data;
}

export async function apiUpdateStop(
  tripId: string,
  stopId: string,
  data: { arrival_date?: string; departure_date?: string }
) {
  const res = await api.patch(`/trips/${tripId}/stops/${stopId}`, data);
  return res.data;
}

export async function apiDeleteStop(tripId: string, stopId: string) {
  const res = await api.delete(`/trips/${tripId}/stops/${stopId}`);
  return res.data;
}

export async function apiReorderStops(tripId: string, order: string[]) {
  const res = await api.patch(`/trips/${tripId}/stops/reorder`, { order });
  return res.data;
}

// ── Stop Activities ──────────────────────────────────────────
export async function apiListStopActivities(
  tripId: string,
  stopId: string
) {
  const res = await api.get(`/trips/${tripId}/stops/${stopId}/activities`);
  return res.data;
}

export async function apiAddStopActivity(
  tripId: string,
  stopId: string,
  data: {
    activity_id: string;
    scheduled_time?: string;
    custom_cost?: number;
    notes?: string;
  }
) {
  const res = await api.post(
    `/trips/${tripId}/stops/${stopId}/activities`,
    data
  );
  return res.data;
}

export async function apiUpdateStopActivity(
  tripId: string,
  stopId: string,
  saId: string,
  data: { scheduled_time?: string; custom_cost?: number; notes?: string }
) {
  const res = await api.patch(
    `/trips/${tripId}/stops/${stopId}/activities/${saId}`,
    data
  );
  return res.data;
}

export async function apiDeleteStopActivity(
  tripId: string,
  stopId: string,
  saId: string
) {
  const res = await api.delete(
    `/trips/${tripId}/stops/${stopId}/activities/${saId}`
  );
  return res.data;
}

// ── Packing ──────────────────────────────────────────────────
export async function apiListPacking(tripId: string) {
  const res = await api.get(`/trips/${tripId}/packing`);
  return res.data;
}

export async function apiCreatePackingItem(
  tripId: string,
  data: { name: string; category?: string }
) {
  const res = await api.post(`/trips/${tripId}/packing`, data);
  return res.data;
}

export async function apiUpdatePackingItem(
  tripId: string,
  itemId: string,
  data: { name?: string; category?: string; is_packed?: boolean }
) {
  const res = await api.patch(`/trips/${tripId}/packing/${itemId}`, data);
  return res.data;
}

export async function apiDeletePackingItem(tripId: string, itemId: string) {
  const res = await api.delete(`/trips/${tripId}/packing/${itemId}`);
  return res.data;
}

export async function apiResetPacking(tripId: string) {
  const res = await api.delete(`/trips/${tripId}/packing/reset`);
  return res.data;
}

// ── Notes ────────────────────────────────────────────────────
export async function apiListNotes(tripId: string) {
  const res = await api.get(`/trips/${tripId}/notes`);
  return res.data;
}

export async function apiCreateNote(
  tripId: string,
  data: { content: string; stop_id?: string }
) {
  const res = await api.post(`/trips/${tripId}/notes`, data);
  return res.data;
}

export async function apiUpdateNote(
  tripId: string,
  noteId: string,
  data: { content: string }
) {
  const res = await api.patch(`/trips/${tripId}/notes/${noteId}`, data);
  return res.data;
}

export async function apiDeleteNote(tripId: string, noteId: string) {
  const res = await api.delete(`/trips/${tripId}/notes/${noteId}`);
  return res.data;
}

// ── Public / Shared ──────────────────────────────────────────
export async function apiGetPublicTrip(token: string) {
  const res = await api.get(`/public/${token}`);
  return res.data;
}

export async function apiCopyPublicTrip(token: string) {
  const res = await api.post(`/public/${token}/copy`);
  return res.data;
}

// ── Admin ────────────────────────────────────────────────────
export async function apiAdminStats() {
  const res = await api.get('/admin/stats');
  return res.data;
}

export async function apiAdminUsers(params?: {
  page?: number;
  limit?: number;
}) {
  const res = await api.get('/admin/users', { params });
  return res.data;
}

export async function apiAdminTrips(params?: {
  page?: number;
  limit?: number;
}) {
  const res = await api.get('/admin/trips', { params });
  return res.data;
}

export default api;
