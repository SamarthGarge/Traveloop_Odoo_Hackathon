import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApiCity, ApiActivity } from '../store/useStore';
import { Search, MapPin, Clock, DollarSign, Loader2, Globe } from 'lucide-react';
import { apiSearchCities, apiGetCityActivities, extractError } from '../lib/api';

export default function ActivitySearch() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [selectedCity, setSelectedCity] = useState<ApiCity | null>(null);
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [error, setError] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Fetch cities
  useEffect(() => {
    apiSearchCities({ sort: 'popularity', limit: 20 })
      .then((res) => setCities((res.data ?? res) as ApiCity[]))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoadingCities(false));
  }, []);

  // Fetch activities when city is selected
  useEffect(() => {
    if (!selectedCity) { setActivities([]); return; }
    setLoadingActivities(true);
    apiGetCityActivities(selectedCity.id)
      .then((res) => setActivities((res.data ?? res) as ApiActivity[]))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoadingActivities(false));
  }, [selectedCity]);

  const allTypes = ['All', ...new Set(activities.map((a) => a.type))];
  const filtered = activities.filter((a) => {
    const matchesType = typeFilter === 'All' || a.type === typeFilter;
    const matchesSearch = !activitySearch || a.name.toLowerCase().includes(activitySearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-['Montserrat'] mb-1">
          Explore Activities
        </h1>
        <p className="text-[#64748B] text-sm">Browse activities for your destinations</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
      )}

      {/* City Selector */}
      <div className="mb-6">
        <h2 className="font-bold text-[#0b1c30] mb-3 text-sm uppercase tracking-wider">Select a Destination</h2>
        {loadingCities ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-28 h-20 bg-[#f1f5f9] rounded-2xl animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => { setSelectedCity(city); setTypeFilter('All'); setActivitySearch(''); }}
                className={`flex-shrink-0 relative w-28 h-20 rounded-2xl overflow-hidden transition-all ${
                  selectedCity?.id === city.id ? 'ring-2 ring-[#E8604C] ring-offset-2' : ''
                }`}
              >
                <img
                  src={city.image_url || '/images/dest-paris.jpg'}
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-0 left-0 right-0 text-white text-xs font-semibold text-center pb-2 px-1">
                  {city.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity search + filters */}
      {selectedCity && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="text"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Search activities..."
              className="input-field pl-10 text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {allTypes.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  typeFilter === type ? 'bg-[#001b26] text-white' : 'bg-white border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activities */}
      {!selectedCity ? (
        <div className="card p-12 text-center">
          <Globe className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
          <p className="text-[#94a3b8]">Select a destination above to browse activities</p>
        </div>
      ) : loadingActivities ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-36 bg-[#f1f5f9]" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#f1f5f9] rounded w-3/4" />
                <div className="h-3 bg-[#f1f5f9] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#94a3b8]">No activities found for {selectedCity.name}.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#E8604C]" />
            <h2 className="font-bold text-[#0b1c30]">{selectedCity.name}, {selectedCity.country}</h2>
            <span className="text-sm text-[#94a3b8]">— {filtered.length} activities</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((activity) => (
              <div key={activity.id} className="card card-interactive overflow-hidden group">
                <div className="relative h-36">
                  <img
                    src={activity.image_url || '/images/dest-paris.jpg'}
                    alt={activity.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="badge bg-white/90 backdrop-blur-sm text-[#0b1c30] text-[10px]">{activity.type}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#0b1c30] text-sm mb-1">{activity.name}</h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mb-3">
                    {activity.description || `Experience ${activity.name} in ${selectedCity.name}`}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span className="font-bold text-[#E8604C]">${Number(activity.cost).toFixed(0)}</span>
                      </span>
                      {activity.duration_mins && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(activity.duration_mins / 60)}h
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate('/trips/new')}
                      className="text-xs font-medium text-[#E8604C] hover:text-[#ae311e] transition-colors"
                    >
                      Plan Trip →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
