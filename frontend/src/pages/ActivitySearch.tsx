import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinations, activities } from '../data/destinations';
import {
  ArrowLeft,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Star,
} from 'lucide-react';

export default function ActivitySearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [activityType, setActivityType] = useState('');
  const [viewMode, setViewMode] = useState<'cities' | 'activities'>('cities');

  const filteredCities = useMemo(() => {
    return destinations.filter((d) => {
      const matchSearch = !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !activityType || d.activities.includes(activityType);
      return matchSearch && matchType;
    });
  }, [searchQuery, activityType]);

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchSearch = !searchQuery ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.destination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = !selectedCity || a.destination === selectedCity;
      const matchType = !activityType || a.type === activityType;
      return matchSearch && matchCity && matchType;
    });
  }, [searchQuery, selectedCity, activityType]);

  const activityTypes = [...new Set(activities.map((a) => a.type))];

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

        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">
          {viewMode === 'cities' ? 'Explore Destinations' : 'Activities & Experiences'}
        </h1>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={viewMode === 'cities' ? "Search cities, countries..." : "Search activities..."}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffcc66]"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ffcc66]"
              >
                <option value="">All Types</option>
                {activityTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cities')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'cities' ? 'bg-white text-[#00202a] shadow-sm' : 'text-gray-500'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-1.5" />
              Cities
            </button>
            <button
              onClick={() => setViewMode('activities')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'activities' ? 'bg-white text-[#00202a] shadow-sm' : 'text-gray-500'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1.5" />
              Activities
            </button>
          </div>
        </div>

        {viewMode === 'cities' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCities.map((dest) => (
              <div
                key={dest.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 card-hover"
              >
                <div className="relative h-44">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-[#00202a]">
                    {dest.costIndex}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1a1a1a]">{dest.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {dest.country}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{dest.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {dest.activities.slice(0, 3).map((a) => (
                      <span key={a} className="px-2 py-0.5 rounded-full bg-[#5b7f74]/10 text-[#5b7f74] text-xs">
                        {a}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Popularity: {dest.popularity}%</span>
                    <button
                      onClick={() => { setSelectedCity(dest.name); setViewMode('activities'); }}
                      className="text-sm text-[#5b7f74] font-medium hover:text-[#00202a] flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Trip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedCity && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Showing activities in:</span>
                <span className="px-3 py-1 rounded-full bg-[#ffcc66]/20 text-[#00202a] text-sm font-medium">
                  {selectedCity}
                </span>
                <button onClick={() => setSelectedCity('')} className="text-sm text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              </div>
            )}
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4"
              >
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full sm:w-32 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a]">{activity.name}</h3>
                      <p className="text-sm text-gray-500">{activity.destination} | {activity.type}</p>
                    </div>
                    <button className="p-2 rounded-lg bg-[#5b7f74]/10 text-[#5b7f74] hover:bg-[#5b7f74]/20 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {activity.cost}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activity.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
