import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Shield, Users, Map, TrendingUp, Search, Eye,
  Loader2, BarChart3,
} from 'lucide-react';
import { apiAdminStats, apiAdminUsers, apiAdminTrips, extractError } from '../lib/api';

interface AdminStats {
  total_users: number;
  total_trips: number;
  total_stops: number;
  total_activities: number;
  public_trips: number;
  new_users_this_month: number;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'trips'>('overview');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    Promise.all([
      apiAdminStats(),
      apiAdminUsers({ limit: 50 }),
      apiAdminTrips({ limit: 50 }),
    ])
      .then(([statsRes, usersRes, tripsRes]) => {
        setStats(statsRes.data ?? statsRes);
        setUsers((usersRes.data ?? usersRes) as any[]);
        setTrips((tripsRes.data ?? tripsRes) as any[]);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter((u) =>
    !userSearch ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#E8604C]/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#E8604C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c30] font-['Montserrat']">Admin Panel</h1>
          <p className="text-[#94a3b8] text-xs">Logged in as {user?.firstName} {user?.lastName}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#e2e8f0] pb-0">
        {(['overview', 'users', 'trips'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium capitalize border-b-2 transition-colors mr-4 ${
              activeTab === tab
                ? 'border-[#E8604C] text-[#E8604C]'
                : 'border-transparent text-[#94a3b8] hover:text-[#0b1c30]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#E8604C]" />
        </div>
      ) : (
        <>
          {/* Overview */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Total Trips', value: stats.total_trips, icon: Map, color: 'text-[#E8604C] bg-[#fef2f2]' },
                  { label: 'Trip Stops', value: stats.total_stops, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
                  { label: 'Activities', value: stats.total_activities, icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Public Trips', value: stats.public_trips, icon: Eye, color: 'text-amber-600 bg-amber-50' },
                  { label: 'New Users (Month)', value: stats.new_users_this_month, icon: TrendingUp, color: 'text-teal-600 bg-teal-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="card p-5">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-[#0b1c30]">{value?.toLocaleString() ?? 'ΓÇö'}</p>
                    <p className="text-xs text-[#94a3b8] mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent users preview */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#0b1c30]">Recent Users</h3>
                  <button onClick={() => setActiveTab('users')} className="text-sm text-[#E8604C] hover:text-[#ae311e]">View All ΓåÆ</button>
                </div>
                <div className="space-y-2">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#E8604C]/10 flex items-center justify-center text-[#E8604C] font-bold text-xs flex-shrink-0">
                        {u.first_name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0b1c30] truncate">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-[#94a3b8] truncate">{u.email}</p>
                      </div>
                      {u.is_admin && (
                        <span className="badge bg-[#E8604C]/10 text-[#E8604C] text-[10px]">Admin</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent trips preview */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#0b1c30]">Recent Trips</h3>
                  <button onClick={() => setActiveTab('trips')} className="text-sm text-[#E8604C] hover:text-[#ae311e]">View All ΓåÆ</button>
                </div>
                <div className="space-y-2">
                  {trips.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
                        <Map className="w-4 h-4 text-[#94a3b8]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0b1c30] truncate">{t.name}</p>
                        <p className="text-xs text-[#94a3b8]">
                          {t.user?.first_name} {t.user?.last_name} ΓÇó {new Date(t.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      {t.is_public && (
                        <span className="badge bg-green-50 text-green-600 text-[10px]">Public</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="input-field pl-9 text-sm"
                  />
                </div>
                <span className="text-sm text-[#94a3b8]">{filteredUsers.length} users</span>
              </div>
              <div className="card divide-y divide-[#f8fafc]">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-[#f8fafc] transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#E8604C]/10 flex items-center justify-center text-[#E8604C] font-bold text-sm flex-shrink-0">
                      {u.first_name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0b1c30]">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-[#94a3b8]">{u.email}</p>
                    </div>
                    <div className="text-right text-xs text-[#94a3b8] hidden sm:block">
                      <p>{u.country || 'ΓÇö'}</p>
                      <p className="mt-0.5">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                    {u.is_admin && (
                      <span className="badge bg-[#E8604C]/10 text-[#E8604C] text-[10px]">Admin</span>
                    )}
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center py-8 text-[#94a3b8] text-sm">No users found.</p>
                )}
              </div>
            </div>
          )}

          {/* Trips Tab */}
          {activeTab === 'trips' && (
            <div>
              <p className="text-sm text-[#94a3b8] mb-4">{trips.length} total trips</p>
              <div className="card divide-y divide-[#f8fafc]">
                {trips.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-[#f8fafc] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
                      <Map className="w-4 h-4 text-[#94a3b8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0b1c30] truncate">{t.name}</p>
                      <p className="text-xs text-[#94a3b8]">
                        by {t.user?.first_name} {t.user?.last_name} ΓÇó {new Date(t.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.is_public && (
                        <span className="badge bg-green-50 text-green-600 text-[10px]">Public</span>
                      )}
                      <button
                        onClick={() => navigate(`/trips/${t.id}/view`)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e2e8f0] text-[#94a3b8] hover:bg-[#f1f5f9] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {trips.length === 0 && (
                  <p className="text-center py-8 text-[#94a3b8] text-sm">No trips found.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
