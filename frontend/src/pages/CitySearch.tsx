import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApiCity } from '../store/useStore';
import { Search, MapPin, TrendingUp, Loader2, Globe } from 'lucide-react';
import { apiSearchCities, extractError } from '../lib/api';

const MOCK_CITIES = [
  {
    id: 1,
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    image: '/images/dest-paris.jpg',
    costIndex: 4, // 1-5 scale
    popularity: 4.8,
    description: 'City of light, art, and exquisite cuisine.',
  },
  {
    id: 2,
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    image: '/images/image.png',
    costIndex: 3,
    popularity: 4.9,
    description: 'Historic temples, traditional gardens, and geisha districts.',
  },
  {
    id: 3,
    name: 'New York City',
    country: 'USA',
    region: 'North America',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
    costIndex: 5,
    popularity: 4.7,
    description: 'The city that never sleeps, known for its skyline and culture.',
  },
  {
    id: 4,
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
    costIndex: 2,
    popularity: 4.6,
    description: 'Tropical paradise with beaches, temples, and yoga retreats.',
  },
  {
    id: 5,
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800',
    costIndex: 3,
    popularity: 4.8,
    description: 'Ancient ruins, spectacular food, and vibrant street life.',
  },
  {
    id: 6,
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&q=80&w=800',
    costIndex: 2,
    popularity: 4.5,
    description: 'Stunning coastal views, mountains, and rich history.',
  },
  {
    id: 7,
    name: 'London',
    country: 'UK',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800',
    costIndex: 5,
    popularity: 4.8,
    description: 'Historic landmarks, modern culture, and royal heritage.',
  },
  {
    id: 8,
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=800',
    costIndex: 3,
    popularity: 4.7,
    description: 'Art, Gaudí architecture, and Mediterranean beaches.',
  },
  {
    id: 9,
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'South America',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800',
    costIndex: 3,
    popularity: 4.6,
    description: 'Iconic beaches, lush mountains, and vibrant carnival spirit.',
  },
  {
    id: 10,
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800',
    costIndex: 4,
    popularity: 4.8,
    description: 'Harbor city known for its Opera House and stunning beaches.',
  },
  {
    id: 11,
    name: 'Dubai',
    country: 'UAE',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800',
    costIndex: 5,
    popularity: 4.5,
    description: 'Ultra-modern architecture, luxury shopping, and desert safaris.',
  },
  {
    id: 13,
    name: 'Buenos Aires',
    country: 'Argentina',
    region: 'South America',
    image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&q=80&w=800',
    costIndex: 2,
    popularity: 4.4,
    description: 'Tango, steak, and beautiful European-style architecture.',
  },
  {
    id: 14,
    name: 'Vancouver',
    country: 'Canada',
    region: 'North America',
    image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&q=80&w=800',
    costIndex: 4,
    popularity: 4.6,
    description: 'Bustling west coast seaport surrounded by stunning nature.',
  }
];

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
        <p className="text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase mb-1">DISCOVER</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">City Search</h1>
        <p className="text-[#64748B] text-sm mt-2">Find and add perfect destinations to your itinerary.</p>
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

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCities.map((city) => {
          const isAdded = addedCities.includes(city.id);
          return (
            <div key={city.id} className="card-interactive overflow-hidden flex flex-col h-full group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={city.image} 
                  alt={city.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="badge bg-white/90 backdrop-blur-sm text-[#0b1c30] shadow-sm">
                    <Star className="w-3 h-3 text-[#ffcc66] fill-current mr-1" />
                    {city.popularity}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-[#0b1c30] font-heading flex items-center justify-between">
                    {city.name}
                  </h3>
                  <div className="flex items-center text-[#64748B] text-xs mt-1 gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {city.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {city.region}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-[#64748B] line-clamp-2 mb-4 flex-1">
                  {city.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#94a3b8]">Cost Index:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <DollarSign 
                          key={i} 
                          className={`w-3 h-3 ${i < city.costIndex ? 'text-[#059669]' : 'text-[#e2e8f0]'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleCity(city.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isAdded 
                        ? 'bg-[#ecfdf5] text-[#059669] border border-[#059669]/20' 
                        : 'bg-[#001b26] text-white hover:bg-[#0b1c30] shadow-sm'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Navigation className="w-3 h-3" />
                        Added to Trip
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Add to Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCities.length === 0 && (
        <div className="text-center py-20 card">
          <Globe className="w-12 h-12 text-[#e2e8f0] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#0b1c30] font-heading">No cities found</h3>
          <p className="text-[#64748B] text-sm mt-2">Try adjusting your search or region filter.</p>
        </div>
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
