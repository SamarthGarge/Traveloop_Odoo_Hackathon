import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  TrendingUp,
  Compass,
  Heart,
  MoreHorizontal,
  Users,
  DollarSign,
  Plane,
  CheckCircle2,
  Star,
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

  const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
  const ongoingTrips  = trips.filter((t) => t.status === 'ongoing');
  const completedTrips = trips.filter((t) => t.status === 'completed');

  // ─ Dynamic stats derived from real trip data ────────────────────────────────────────────
  // Unique countries derived from all trip destinations (split on comma)
  const allCountries = trips.flatMap(t =>
    t.destination.split(',').map(d => d.trim())
  );
  const uniqueCountries = [...new Set(allCountries)];
  const countriesVisited = uniqueCountries.length;

  // Explorer tiers: Bronze=5, Silver=10, Gold=15, Platinum=25
  const GOLD_THRESHOLD = 15;
  const toGold = Math.max(0, GOLD_THRESHOLD - countriesVisited);
  const explorerPct = Math.min(Math.round((countriesVisited / GOLD_THRESHOLD) * 100), 100);
  const explorerTier =
    countriesVisited >= 25 ? 'Platinum' :
    countriesVisited >= 15 ? 'Gold' :
    countriesVisited >= 10 ? 'Silver' : 'Bronze';

  // Budget stats
  const totalBudget  = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
  const totalSpent   = trips.reduce((acc, t) => acc + (t.spent  || 0), 0);
  const budgetUsedPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const ongoingBudget  = ongoingTrips.reduce((a, t) => a + (t.budget || 0), 0);
  const upcomingBudget = upcomingTrips.reduce((a, t) => a + (t.budget || 0), 0);

  // Community posts from store (fallback to built-in if not in store yet)
  const { communityPosts } = useStore();
  const displayPosts = (communityPosts ?? []).slice(0, 3);
  // ────────────────────────────────────────────────────────────────────────────
  
  const filteredActiveTrips = [...ongoingTrips, ...upcomingTrips].filter((trip) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return trip.name.toLowerCase().includes(q) || trip.destination.toLowerCase().includes(q);
  });
  
  const activeTrip = filteredActiveTrips[0];

  const handleResumeTrip = (trip: ApiTrip) => {
    setActiveTrip(trip);
    navigate(`/trips/${trip.id}/view`);
  };

  return (
    <div className="page-transition">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">
            Welcome back, {user?.firstName || 'Alex'}!
          </h1>
          <p className="text-[#64748B] text-sm mt-1">Your intelligent concierge is ready to help you explore.</p>
        </div>
        <button onClick={() => navigate('/trips/new')} className="btn-primary self-start">
          <Plane className="w-4 h-4" />
          Plan a New Trip
        </button>
      </div>

      {/* NEW: Global Search Bar */}
      <div className="relative mb-8">
        <Search className="w-5 h-5 text-[#94a3b8] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search trips, destinations, or activities..."
          className="w-full bg-white border border-[#e2e8f0] rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8604C]/20 focus:border-[#E8604C] transition-all shadow-sm hover:border-[#94a3b8]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column ── */}
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
                        <h3 className="text-xl font-bold text-[#0b1c30] font-heading">{activeTrip.name}</h3>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredDestinations.slice(0, 3).map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => navigate('/trips/new')}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] text-left"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  
                  {/* Save Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#64748B] hover:text-[#E8604C] transition-colors z-10">
                    <Heart className="w-4 h-4" />
                  </button>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-base font-heading">{dest.name},</h3>
                      <span className="text-white/80 text-sm">{dest.country}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* ── Completed Trips Section ── */}
          {completedTrips.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#0b1c30] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                  Completed Trips
                </h2>
                <button
                  onClick={() => navigate('/trips')}
                  className="text-sm text-[#64748B] hover:text-[#0b1c30] font-medium flex items-center gap-1 transition-colors"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-[#0b1c30] font-heading">{completedTrips.length}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">Trips Done</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-[#E8604C] font-heading">
                    {[...new Set(completedTrips.map(t => t.destination.split(',')[0].trim()))].length}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">Destinations</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-[#059669] font-heading">
                    ₹{(completedTrips.reduce((acc, t) => acc + t.spent, 0) / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">Total Spent</p>
                </div>
              </div>

              {/* Trip Cards */}
              <div className="space-y-3">
                {completedTrips.map((trip) => {
                  const spendPct = trip.budget > 0 ? Math.min(Math.round((trip.spent / trip.budget) * 100), 100) : 0;
                  return (
                    <button
                      key={trip.id}
                      onClick={() => { useStore.getState().setActiveTrip(trip); navigate('/itinerary/view'); }}
                      className="w-full card overflow-hidden hover:shadow-md transition-shadow text-left group"
                    >
                      <div className="flex items-stretch">
                        {/* Image strip */}
                        <div className="w-28 flex-shrink-0 relative overflow-hidden">
                          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="badge bg-[#ecfdf5] text-[#059669] text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                              </div>
                              <h3 className="font-bold text-[#0b1c30] font-heading">{trip.name}</h3>
                              <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {trip.destination}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-0.5 justify-end mb-1">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`w-3 h-3 ${s <= 4 ? 'text-[#f59e0b] fill-current' : 'text-[#e2e8f0]'}`} />
                                ))}
                              </div>
                              <p className="text-[10px] text-[#94a3b8]">{trip.startDate}</p>
                            </div>
                          </div>
                          {/* Budget bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-[#94a3b8] mb-1">
                              <span>Budget Used</span>
                              <span className="font-semibold text-[#0b1c30]">₹{trip.spent.toLocaleString()} / ₹{trip.budget.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${spendPct > 90 ? 'bg-[#dc2626]' : 'bg-[#059669]'}`}
                                style={{ width: `${spendPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">

          {/* DYNAMIC Traveler Status Card */}
          <div className="card p-5 border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase">Traveler Status</p>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8604C]/10 text-[#E8604C]">
                {explorerTier} Explorer
              </span>
            </div>
            <p className="text-4xl font-bold font-heading text-[#0b1c30]">
              {countriesVisited}
              <span className="text-base font-normal text-[#64748B] ml-2">Destinations</span>
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4 mb-4">
              <div className="text-center py-2 rounded-xl bg-[#f8fafc]">
                <p className="text-lg font-bold text-[#0b1c30]">{trips.length}</p>
                <p className="text-[10px] text-[#94a3b8]">Total Trips</p>
              </div>
              <div className="text-center py-2 rounded-xl bg-[#fff5f3]">
                <p className="text-lg font-bold text-[#E8604C]">{ongoingTrips.length}</p>
                <p className="text-[10px] text-[#94a3b8]">Ongoing</p>
              </div>
              <div className="text-center py-2 rounded-xl bg-[#f0fdf4]">
                <p className="text-lg font-bold text-[#059669]">{completedTrips.length}</p>
                <p className="text-[10px] text-[#94a3b8]">Done</p>
              </div>
            </div>
            <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
              <div className="h-full bg-[#E8604C] rounded-full transition-all duration-700" style={{ width: `${explorerPct}%` }} />
            </div>
            <p className="text-xs text-[#94a3b8] mt-2">
              {toGold > 0
                ? `${toGold} more destination${toGold > 1 ? 's' : ''} to reach Gold Explorer`
                : `🎉 Gold Explorer unlocked! ${countriesVisited - GOLD_THRESHOLD} beyond Gold.`}
            </p>
          </div>

          {/* DYNAMIC Budget Overview */}
          <div className="card p-5 border-l-4 border-l-[#059669]">
            <p className="text-[10px] font-semibold tracking-widest text-[#64748B] uppercase mb-1">Budget Overview</p>
            <h3 className="text-xl font-bold text-[#0b1c30] font-heading">Total Planned Spend</h3>
            <p className="text-2xl font-bold text-[#059669] mt-2">₹{totalBudget.toLocaleString()}</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Spent so far</span>
                <span className="font-semibold text-[#0b1c30]">₹{totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Remaining</span>
                <span className={`font-semibold ${totalBudget - totalSpent >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                  ₹{Math.abs(totalBudget - totalSpent).toLocaleString()}
                  {totalBudget - totalSpent < 0 && ' over'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Upcoming budget</span>
                <span className="font-semibold text-[#0b1c30]">₹{upcomingBudget.toLocaleString()}</span>
              </div>
            </div>
            {/* Spend progress bar */}
            <div className="mt-3 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${budgetUsedPct > 90 ? 'bg-[#dc2626]' : 'bg-[#059669]'}`}
                style={{ width: `${budgetUsedPct}%` }}
              />
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">{budgetUsedPct}% of budget used across {trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Completed Trips Quick Summary (right column) */}
          {completedTrips.length > 0 && (
            <div className="card p-5 border-l-4 border-l-[#E8604C]">
              <p className="text-[10px] font-semibold tracking-widest text-[#64748B] uppercase mb-1">Travel Milestones</p>
              <h3 className="text-xl font-bold text-[#0b1c30] font-heading mb-3">Your Achievements</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-[#f1f5f9]">
                  <span className="text-sm text-[#64748B]">Trips completed</span>
                  <span className="font-bold text-[#0b1c30]">{completedTrips.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#f1f5f9]">
                  <span className="text-sm text-[#64748B]">Destinations explored</span>
                  <span className="font-bold text-[#E8604C]">
                    {[...new Set(completedTrips.map(t => t.destination.split(',')[0].trim()))].length}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[#64748B]">Total spent</span>
                  <span className="font-bold text-[#059669]">
                    ₹{(completedTrips.reduce((a, t) => a + t.spent, 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC Community Highlights */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#E8604C]" />
              <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Community Highlights</h3>
            </div>
            <div className="space-y-4">
              {displayPosts.length > 0 ? displayPosts.map((post, i) => (
                <div key={post.id ?? i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748B] font-bold text-xs flex-shrink-0">
                    {post.author?.[0] ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0b1c30] leading-tight">{post.title}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">by {post.author} · {post.likes} likes</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="badge badge-primary text-[10px]">{post.destination?.split(',')[0]}</span>
                    </div>
                  </div>
                </div>
              )) : (
                // Fallback to sample posts when store has no community data yet
                [{ id:'f1', author:'Mark T.', title:'7 Days in Reykjavik: A Winter Guide', likes:2000, destination:'Reykjavik, Iceland', tags:['Nature','Winter'] },
                 { id:'f2', author:'Sarah W.', title:'Hidden Gems of the Amalfi Coast', likes:1500, destination:'Amalfi, Italy', tags:['Coastal','Food'] }]
                .map((post, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748B] font-bold text-xs flex-shrink-0">
                      {post.author[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0b1c30] leading-tight">{post.title}</p>
                      <p className="text-xs text-[#94a3b8] mt-0.5">by {post.author} · {(post.likes / 1000).toFixed(1)}k likes</p>
                      <div className="flex gap-1.5 mt-1.5">
                        {post.tags.map(tag => <span key={tag} className="badge badge-primary text-[10px]">{tag}</span>)}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
