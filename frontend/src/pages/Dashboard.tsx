import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowRight, TrendingUp, Compass, Heart, Plane, MoreHorizontal, Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiListTrips, apiSearchCities, extractError } from '../lib/api';
import type { ApiTrip, ApiCity } from '../store/useStore';

function getTripStatus(trip: ApiTrip): 'upcoming' | 'ongoing' | 'completed' {
  const now = new Date();
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setActiveTrip } = useStore();

  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiListTrips(),
      apiSearchCities({ sort: 'popularity', limit: 3 }),
    ])
      .then(([tripsRes, citiesRes]) => {
        setTrips((tripsRes.data ?? tripsRes) as ApiTrip[]);
        setCities((citiesRes.data ?? citiesRes) as ApiCity[]);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const ongoingTrips = trips.filter((t) => getTripStatus(t) === 'ongoing');
  const upcomingTrips = trips.filter((t) => getTripStatus(t) === 'upcoming');
  const activeTrip = [...ongoingTrips, ...upcomingTrips][0];

  const handleResumeTrip = (trip: ApiTrip) => {
    setActiveTrip(trip);
    navigate(`/trips/${trip.id}/view`);
  };

  return (
    <div className="page-transition">
      {/* ΓöÇΓöÇ Welcome Header ΓöÇΓöÇ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-['Montserrat']">
            Welcome back, {user?.firstName || 'Explorer'}!
          </h1>
          <p className="text-[#64748B] text-sm mt-1">Your intelligent concierge is ready to help you explore.</p>
        </div>
        <button onClick={() => navigate('/trips/new')} className="btn-primary self-start">
          <Plane className="w-4 h-4" />
          Plan a New Trip
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ΓöÇΓöÇ Left Column ΓöÇΓöÇ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Planning Card */}
          {loading ? (
            <div className="card p-8 text-center">
              <div className="animate-pulse h-32 bg-[#f1f5f9] rounded-xl" />
            </div>
          ) : activeTrip ? (
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E8604C]" />
                Continue Planning
              </h2>
              <div className="card overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-56 h-44 sm:h-auto flex-shrink-0 relative">
                    <img
                      src={activeTrip.cover_photo_url || '/images/dest-paris.jpg'}
                      alt={activeTrip.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`badge ${getTripStatus(activeTrip) === 'ongoing' ? 'badge-coral' : 'badge-warning'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {getTripStatus(activeTrip) === 'ongoing' ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#0b1c30] font-['Montserrat']">{activeTrip.name}</h3>
                        <p className="text-sm text-[#64748B] mt-0.5">
                          {new Date(activeTrip.start_date).toLocaleDateString()} - {new Date(activeTrip.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    {activeTrip.description && (
                      <p className="text-sm text-[#64748B] mt-3 line-clamp-2">{activeTrip.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-5">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#E8604C] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">
                          {user?.firstName?.[0] || 'A'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleResumeTrip(activeTrip)}
                        className="text-sm font-semibold text-[#E8604C] hover:text-[#ae311e] flex items-center gap-1 transition-colors"
                      >
                        Resume Planning <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Compass className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
              <p className="text-[#64748B] mb-4">No trips planned yet. Start your journey!</p>
              <button onClick={() => navigate('/trips/new')} className="btn-primary">
                Plan Your First Trip
              </button>
            </div>
          )}

          {/* Recommended Destinations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[#0b1c30]">Recommended for You</h2>
              <button
                onClick={() => navigate('/search')}
                className="text-sm text-[#64748B] hover:text-[#0b1c30] font-medium flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse aspect-[4/5] bg-[#f1f5f9] rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {cities.slice(0, 3).map((city) => (
                  <button
                    key={city.id}
                    onClick={() => navigate('/trips/new')}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/5] text-left"
                  >
                    <img
                      src={city.image_url || '/images/dest-paris.jpg'}
                      alt={city.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#64748B] hover:text-[#E8604C] transition-colors z-10">
                      <Heart className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-base font-['Montserrat']">{city.name},</h3>
                        <span className="text-white/80 text-sm">{city.country}</span>
                      </div>
                      {city.cost_index && (
                        <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-medium">
                          <TrendingUp className="w-3 h-3" />
                          ${city.cost_index}/day
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ΓöÇΓöÇ Right Column ΓöÇΓöÇ */}
        <div className="space-y-6">
          {/* Traveler Status Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#001b26] to-[#0d313f] p-5 text-white">
            <p className="text-[10px] font-semibold tracking-widest text-white/50 uppercase mb-3">Traveler Status</p>
            <p className="text-4xl font-bold font-['Montserrat']">
              {trips.length}
              <span className="text-base font-normal text-white/60 ml-2">Total Trips</span>
            </p>
            <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#E8604C] rounded-full" style={{ width: `${Math.min(trips.length * 10, 100)}%` }} />
            </div>
            <p className="text-xs text-white/40 mt-2">Keep exploring to level up!</p>
          </div>

          {/* Community Highlights */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#E8604C]" />
              <h3 className="text-lg font-bold text-[#0b1c30] font-['Montserrat']">Community Highlights</h3>
            </div>
            <div className="space-y-4">
              {[
                { title: '7 Days in Reykjavik: A Winter Guide', author: 'Mark T.', saves: '2k', tags: ['Nature', 'Winter'] },
                { title: 'Hidden Gems of the Amalfi Coast', author: 'Sarah W.', saves: '1.5k', tags: ['Coastal', 'Food'] },
              ].map((post, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748B] font-bold text-xs flex-shrink-0">
                    {post.author[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0b1c30] leading-tight">{post.title}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">by {post.author} ΓÇó {post.saves} saves</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="badge badge-primary text-[10px]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/community')}
              className="w-full mt-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-medium text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-all"
            >
              Explore Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
