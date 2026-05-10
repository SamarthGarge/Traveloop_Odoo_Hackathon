import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApiCity } from '../store/useStore';
import { Search, MapPin, TrendingUp, Loader2, Globe } from 'lucide-react';
import { apiSearchCities, extractError } from '../lib/api';

const REGIONS = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East'];

const COST_LABELS: Record<string, string> = {
  '1': 'Budget',
  '2': 'Low',
  '3': 'Mid',
  '4': 'High',
  '5': 'Luxury',
};

function getCostLabel(cost: number): string {
  const tier = Math.min(5, Math.ceil(cost / 50));
  return COST_LABELS[String(tier)] ?? 'Mid';
}

export default function CitySearch() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [sort, setSort] = useState('popularity');

  const fetchCities = useCallback(() => {
    setLoading(true);
    apiSearchCities({
      q: query || undefined,
      region: region !== 'All' ? region : undefined,
      sort,
    })
      .then((res) => setCities((res.data ?? res) as ApiCity[]))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [query, region, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchCities, 300);
    return () => clearTimeout(timer);
  }, [fetchCities]);

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-['Montserrat'] mb-1">
          Explore Destinations
        </h1>
        <p className="text-[#64748B] text-sm">Discover cities from around the world</p>
      </div>

      {/* Search + Filters */}
      <div className="card p-5 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations..."
            className="input-field pl-12 text-base"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  region === r ? 'bg-[#001b26] text-white' : 'bg-[#f1f5f9] text-[#64748B] hover:bg-[#e2e8f0]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field text-sm py-1.5 ml-auto"
          >
            <option value="popularity">Most Popular</option>
            <option value="cost_asc">Budget Friendly</option>
            <option value="cost_desc">Most Expensive</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-44 bg-[#f1f5f9]" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#f1f5f9] rounded w-3/4" />
                <div className="h-3 bg-[#f1f5f9] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : cities.length === 0 ? (
        <div className="card p-12 text-center">
          <Globe className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
          <p className="text-[#94a3b8]">No destinations found matching your search.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-[#94a3b8] mb-4">{cities.length} destination{cities.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => navigate('/trips/new')}
                className="card card-interactive overflow-hidden text-left group"
              >
                <div className="relative h-44">
                  <img
                    src={city.image_url || '/images/dest-paris.jpg'}
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="badge bg-white/90 backdrop-blur-sm text-[#0b1c30] text-[10px]">
                      {getCostLabel(Number(city.cost_index))}
                    </span>
                  </div>
                  <div className="absolute bottom-0 p-4">
                    <h3 className="text-white font-bold text-base font-['Montserrat']">{city.name}</h3>
                    <p className="text-white/75 text-xs">{city.country}{city.region ? `, ${city.region}` : ''}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-[#64748B] line-clamp-2 mb-3">
                    {city.description || `Explore the wonders of ${city.name}, ${city.country}`}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-[#94a3b8]">
                      <MapPin className="w-3 h-3" /> {city.country}
                    </span>
                    <span className="flex items-center gap-1 text-[#E8604C] font-semibold">
                      <TrendingUp className="w-3 h-3" />
                      {city.popularity_score}% popular
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[#94a3b8]">Est. per day</span>
                    <span className="text-sm font-bold text-[#0b1c30]">
                      ${Number(city.cost_index).toFixed(0)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
