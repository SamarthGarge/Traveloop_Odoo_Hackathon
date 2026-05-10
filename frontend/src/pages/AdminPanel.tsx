import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { destinations } from '../data/destinations';
import {
  ArrowLeft,
  Users,
  MapPin,
  Star,
  TrendingUp,
  Shield,
  BarChart3,
  Activity,
  Globe,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const monthlyData = [
  { month: 'Jan', trips: 12, users: 45 },
  { month: 'Feb', trips: 18, users: 52 },
  { month: 'Mar', trips: 25, users: 68 },
  { month: 'Apr', trips: 32, users: 85 },
  { month: 'May', trips: 28, users: 92 },
  { month: 'Jun', trips: 45, users: 110 },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { trips, communityPosts } = useStore();

  const totalTrips = trips.length;
  const totalUsers = 156;
  const popularCities = destinations
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5);
  const popularActivities = ['Sightseeing', 'Food Tours', 'Beaches', 'Museums', 'Adventure'];

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-[#00202a]" />
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: totalUsers, icon: Users, color: '#5b7f74' },
            { label: 'Total Trips', value: totalTrips, icon: Globe, color: '#ffcc66' },
            { label: 'Destinations', value: destinations.length, icon: MapPin, color: '#ff9966' },
            { label: 'Community Posts', value: communityPosts.length, icon: Activity, color: '#66cc99' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#5b7f74]" />
              Monthly Trips Created
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="trips" fill="#5b7f74" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ffcc66]" />
              User Growth Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#ffcc66" strokeWidth={2} dot={{ fill: '#ffcc66' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Cities & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#ff9966]" />
              Popular Cities
            </h3>
            <div className="space-y-3">
              {popularCities.map((city, i) => (
                <div key={city.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                  <img src={city.image} alt={city.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-[#1a1a1a] text-sm">{city.name}</p>
                    <p className="text-xs text-gray-500">{city.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#5b7f74]">{city.popularity}%</p>
                    <p className="text-xs text-gray-400">popularity</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#ffcc66]" />
              Popular Activities
            </h3>
            <div className="space-y-3">
              {popularActivities.map((activity, i) => (
                <div key={activity} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-[#1a1a1a] text-sm">{activity}</p>
                    <div className="h-2 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-full rounded-full bg-[#ffcc66]"
                        style={{ width: `${100 - i * 15}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{100 - i * 15}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
