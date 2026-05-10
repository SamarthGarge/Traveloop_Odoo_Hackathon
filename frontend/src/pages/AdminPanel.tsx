import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Users,
  Wallet,
  TrendingUp,
  Globe,
  Bell,
  Search,
  ChevronRight,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Activity,
  Landmark,
  Mountain,
  Compass,
  Trash2,
  Edit3,
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

  const stats = [
    { label: 'TOTAL USERS', value: '124,502', change: '+12.5% this month', icon: Users, color: '#001b26', bg: 'white' },
    { label: 'AVG TRIP BUDGET', value: '₹3,450', change: '+4.2% vs last year', icon: Wallet, color: '#001b26', bg: 'white' },
    { label: 'ACTIVE TRIPS NOW', value: '1,893', sub: 'Across 42 countries', icon: Globe, color: 'white', bg: '#E8604C' },
  ];

  const chartData = [
    { month: 'Jan', value: 30 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 55 },
    { month: 'Apr', value: 50 },
    { month: 'May', value: 75 },
    { month: 'Jun', value: 90 },
  ];
  const maxVal = Math.max(...chartData.map(d => d.value));

  const topDestinations = [
    { name: 'Kyoto, Japan', bookings: '4,230', icon: Landmark },
    { name: 'Patagonia, Chile', bookings: '3,105', icon: Mountain },
    { name: 'Amalfi Coast, Italy', bookings: '2,890', icon: Compass },
  ];

  const [recentUsers, setRecentUsers] = useState([
    { id: 1, name: 'Jane Smith', role: 'Traveler', status: 'Active' },
    { id: 2, name: 'Mike Johnson', role: 'Concierge Agent', status: 'Active' },
    { id: 3, name: 'Anna Lee', role: 'Traveler', status: 'Pending' },
  ]);

  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setRecentUsers(recentUsers.filter(u => u.id !== id));
    }
  };

  const logs = [
    { title: 'API Rate Limit Warning', desc: 'Flight data API approaching 90% of daily quota.', time: '10:42 AM', severity: 'error' },
    { title: 'New Agent Onboarded', desc: 'Agent ID #4492 successfully completed training module.', time: '09:15 AM', severity: 'info' },
    { title: 'Routine Backup Complete', desc: 'Database cluster US-East-1 backup verified.', time: '02:00 AM', severity: 'muted' },
  ];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">Overview</h1>
          <p className="text-[#64748B] text-sm mt-1">Welcome back, Admin. Here is today's summary.</p>
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
            <div className="flex items-start justify-between mb-3">
              <p className={`text-[10px] font-semibold tracking-widest uppercase ${
                stat.bg === '#E8604C' ? 'text-white/70' : 'text-[#94a3b8]'
              }`}>
                {stat.label}
              </p>
              <stat.icon className={`w-5 h-5 ${stat.bg === '#E8604C' ? 'text-white/60' : 'text-[#94a3b8]'}`} />
            </div>
            <p className={`text-3xl font-bold font-heading ${
              stat.bg === '#E8604C' ? 'text-white' : 'text-[#0b1c30]'
            }`}>
              {stat.value}
            </p>
            {stat.change && (
              <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                stat.bg === '#E8604C' ? 'bg-white/20 text-white' : 'bg-[#ecfdf5] text-[#059669]'
              }`}>
                <TrendingUp className="w-3 h-3" /> {stat.change}
              </span>
            )}
            {stat.sub && (
              <p className="text-sm text-white/70 mt-1">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0b1c30] font-heading">User Registration Trends</h3>
            <button className="badge bg-[#f1f5f9] text-[#64748B]">Last 6 Months</button>
          </div>
          <div className="flex items-end justify-between h-52 gap-3">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center">
                  <div
                    className="w-8 sm:w-12 rounded-t-lg transition-all duration-700 hover:opacity-80"
                    style={{
                      height: `${(d.value / maxVal) * 180}px`,
                      backgroundColor: i >= 4 ? '#E8604C' : '#001b26',
                    }}
                  />
                </div>
                <span className="text-sm text-[#94a3b8]">{filteredUsers.length} users</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Top Destinations</h3>
            <button className="text-xs text-[#64748B] hover:text-[#0b1c30]">View All</button>
          </div>
          <div className="space-y-4">
            {topDestinations.map((dest) => (
              <button key={dest.name} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#f8fafc] transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#64748B]">
                  <dest.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0b1c30]">{dest.name}</p>
                  <p className="text-xs text-[#94a3b8]">{dest.bookings} bookings</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94a3b8]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Recent User Registrations</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
              <input placeholder="Search users..." className="input-field text-xs pl-8 py-2 w-36" />
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f1f5f9]">
                <th className="text-left pb-3 text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase">User</th>
                <th className="text-left pb-3 text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase">Role</th>
                <th className="text-left pb-3 text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase">Status</th>
                <th className="text-right pb-3 text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-[#f1f5f9] last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#E8604C]/10 flex items-center justify-center text-[#E8604C] text-xs font-bold">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-[#0b1c30]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-[#64748B]">{u.role}</td>
                  <td className="py-3">
                    <span className={`badge ${
                      u.status === 'Active' ? 'badge-success' : 'badge-error'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-[#94a3b8] hover:text-[#0b1c30] mr-3 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-[#94a3b8] hover:text-[#dc2626] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Logs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0b1c30] font-heading">System Logs</h3>
            <button className="text-[#94a3b8] hover:text-[#64748B]">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  log.severity === 'error' ? 'bg-[#E8604C]' : log.severity === 'info' ? 'bg-[#001b26]' : 'bg-[#94a3b8]'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#0b1c30]">{log.title}</p>
                    <span className="text-xs text-[#94a3b8] flex-shrink-0">{log.time}</span>
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
                        by {t.user?.first_name} {t.user?.last_name} • {new Date(t.start_date).toLocaleDateString()}
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
