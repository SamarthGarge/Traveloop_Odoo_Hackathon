import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { destinations } from '../data/destinations';
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  TrendingUp,
  Wallet,
  Compass,
} from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, trips } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('All');

  const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
  const ongoingTrips = trips.filter((t) => t.status === 'ongoing');

  const filteredDestinations = useMemo(() => {
    let filtered = destinations;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.activities.some((a) => a.toLowerCase().includes(q))
      );
    }
    if (groupBy !== 'All') {
      filtered = filtered.filter((d) =>
        d.activities.includes(groupBy)
      );
    }
    return filtered;
  }, [searchQuery, groupBy]);

  const quickStats = [
    { label: 'Total Trips', value: trips.length, icon: Compass, color: '#5b7f74' },
    { label: 'Upcoming', value: upcomingTrips.length, icon: Calendar, color: '#ffcc66' },
    { label: 'Ongoing', value: ongoingTrips.length, icon: TrendingUp, color: '#ff9966' },
    { label: 'Total Budget', value: `$${trips.reduce((a, t) => a + t.budget, 0).toLocaleString()}`, icon: Wallet, color: '#66cc99' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      {/* Hero Banner */}
      <div className="relative h-[360px] overflow-hidden">
        <img
          src="/images/dest-paris.jpg"
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00202a]/90 via-[#00202a]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.firstName || 'Traveler'}!
          </h1>
          <p className="text-white/70 text-lg">
            Where will your next adventure take you?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 card-hover"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
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

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, activities, or cities..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffcc66] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ffcc66]"
              >
                <option value="All">All Activities</option>
                <option value="Sightseeing">Sightseeing</option>
                <option value="Food Tours">Food Tours</option>
                <option value="Museums">Museums</option>
                <option value="Beaches">Beaches</option>
                <option value="Adventure">Adventure</option>
                <option value="Nature">Nature</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top Regional Selections */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Top Regional Selections</h2>
            <button
              onClick={() => navigate('/search')}
              className="text-sm text-[#5b7f74] hover:text-[#00202a] font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredDestinations.slice(0, 10).map((dest) => (
              <button
                key={dest.id}
                onClick={() => navigate('/trips/new')}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] card-hover text-left"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-semibold text-sm">{dest.name}</h3>
                  <div className="flex items-center gap-1 text-white/70 text-xs">
                    <MapPin className="w-3 h-3" />
                    {dest.country}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent / Upcoming Trips */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Your Trips</h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/trips')}
                className="text-sm text-[#5b7f74] hover:text-[#00202a] font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {upcomingTrips.length === 0 && ongoingTrips.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No trips planned yet</p>
              <button onClick={() => navigate('/trips/new')} className="btn-primary">
                Plan Your First Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...ongoingTrips, ...upcomingTrips].map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => navigate('/itinerary/view')}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 card-hover text-left"
                >
                  <div className="relative h-40">
                    <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'ongoing'
                          ? 'bg-green-500 text-white'
                          : trip.status === 'upcoming'
                          ? 'bg-[#ffcc66] text-[#00202a]'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {trip.status === 'ongoing' ? 'Ongoing' : trip.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a] mb-1">{trip.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.destination}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      {trip.startDate} - {trip.endDate}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{trip.sections.length} sections</span>
                      <span className="text-xs font-medium text-[#5b7f74]">${trip.budget.toLocaleString()} budget</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Plan a Trip CTA */}
        <div className="bg-[#00202a] rounded-2xl p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src="/images/dest-maldives.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Ready for your next adventure?
            </h2>
            <p className="text-white/60 mb-6 max-w-lg mx-auto">
              Plan, organize, and share your perfect trip with Traveloop&apos;s powerful itinerary builder.
            </p>
            <button onClick={() => navigate('/trips/new')} className="btn-primary text-base px-8 py-3">
              <MapPin className="w-5 h-5" />
              Plan a New Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
