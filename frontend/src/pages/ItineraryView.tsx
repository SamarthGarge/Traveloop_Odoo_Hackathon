import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { ApiTrip, ApiStop } from '../store/useStore';
import {
  ArrowLeft, MapPin, Calendar, Share2, DollarSign,
  Clock, Pencil, Loader2, Check, Package, StickyNote,
  BarChart2, List,
} from 'lucide-react';
import { apiGetTrip, apiGetBudget, apiToggleShare, extractError } from '../lib/api';

// ── sub-tab components ─────────────────────────────────────────
import PackingChecklist from './PackingChecklist';
import TripNotes from './TripNotes';
import ExpenseInvoice from './ExpenseInvoice';

interface BudgetData {
  total_budget?: number;
  estimated_cost: number;
  breakdown?: { category: string; amount: number }[];
  over_budget: boolean;
}

type Tab = 'itinerary' | 'packing' | 'notes' | 'budget';

const TABS: { key: Tab; label: string; icon: typeof List }[] = [
  { key: 'itinerary', label: 'Itinerary', icon: List },
  { key: 'packing',   label: 'Packing',   icon: Package },
  { key: 'notes',     label: 'Notes',     icon: StickyNote },
  { key: 'budget',    label: 'Budget',    icon: BarChart2 },
];

export default function ItineraryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab from URL so sidebar links also work
  const tabFromUrl: Tab = (() => {
    if (location.pathname.endsWith('/packing')) return 'packing';
    if (location.pathname.endsWith('/notes'))   return 'notes';
    if (location.pathname.endsWith('/budget'))  return 'budget';
    return 'itinerary';
  })();

  const [activeTab, setActiveTab] = useState<Tab>(tabFromUrl);
  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [error, setError] = useState('');

  // Switch tab when URL changes (sidebar navigation)
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [location.pathname]);

  // Fetch trip (critical)
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGetTrip(id)
      .then((res) => {
        const t = res?.data ?? res;
        setTrip(t);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch budget separately (non-critical — won't crash page if it fails)
  useEffect(() => {
    if (!id) return;
    apiGetBudget(id)
      .then((res) => setBudget(res?.data ?? res))
      .catch(() => setBudget(null)); // silently ignore budget errors
  }, [id]);

  const handleShare = async () => {
    if (!id || !trip) return;
    setSharingLoading(true);
    try {
      const res = await apiToggleShare(id, !trip.is_public);
      const updated = res?.data ?? res;
      setTrip((prev) => prev ? { ...prev, is_public: updated.is_public, share_token: updated.share_token } : prev);
      if (updated.is_public && updated.share_token) {
        const url = `${window.location.origin}/shared/${updated.share_token}`;
        await navigator.clipboard.writeText(url).catch(() => {});
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSharingLoading(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Update URL to match so sidebar also shows correct active state
    if (tab === 'itinerary') navigate(`/trips/${id}/view`, { replace: true });
    else navigate(`/trips/${id}/${tab}`, { replace: true });
  };

  const getTripDuration = () => {
    if (!trip) return 0;
    return Math.ceil(
      (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) /
      (1000 * 60 * 60 * 24)
    );
  };

  if (loading) {
    return (
      <div className="page-transition flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8604C]" />
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="page-transition text-center py-20">
        <p className="text-[#dc2626] mb-4">{error}</p>
        <button onClick={() => navigate('/trips')} className="btn-primary">Back to Trips</button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="page-transition text-center py-20">
        <MapPin className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
        <p className="text-[#94a3b8] mb-4">Trip not found.</p>
        <button onClick={() => navigate('/trips')} className="btn-primary">Back to Trips</button>
      </div>
    );
  }

  const stops = (trip.stops ?? []).slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  return (
    <div className="page-transition">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/trips')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9] transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-[#0b1c30] font-['Montserrat'] truncate">{trip.name}</h1>
          <p className="text-[#94a3b8] text-xs mt-0.5">
            {new Date(trip.start_date).toLocaleDateString()} → {new Date(trip.end_date).toLocaleDateString()} · {getTripDuration()} days
          </p>
        </div>
        <button
          onClick={() => navigate(`/trips/${id}/build`)}
          className="btn-secondary text-sm py-2 flex-shrink-0"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={handleShare}
          disabled={sharingLoading}
          className={`text-sm py-2 px-4 rounded-xl font-medium flex items-center gap-2 transition-all flex-shrink-0 ${
            shareSuccess
              ? 'bg-[#ecfdf5] text-[#059669] border border-[#059669]/20'
              : 'btn-primary'
          }`}
        >
          {sharingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : shareSuccess ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{shareSuccess ? 'Link Copied!' : trip.is_public ? 'Sharing' : 'Share'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
      )}

      {/* ── In-Page Tab Bar ── */}
      <div className="flex gap-1 mb-6 bg-[#f8fafc] rounded-2xl p-1 border border-[#e2e8f0]">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-white text-[#0b1c30] shadow-sm border border-[#e2e8f0]'
                : 'text-[#94a3b8] hover:text-[#64748B]'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'itinerary' && (
        <ItineraryTab trip={trip} stops={stops} budget={budget} tripId={id!} navigate={navigate} />
      )}
      {activeTab === 'packing' && <PackingChecklist />}
      {activeTab === 'notes'   && <TripNotes />}
      {activeTab === 'budget'  && <ExpenseInvoice />}
    </div>
  );
}

// ── Itinerary Tab ──────────────────────────────────────────────
function ItineraryTab({
  trip, stops, budget, tripId, navigate,
}: {
  trip: ApiTrip;
  stops: ApiStop[];
  budget: BudgetData | null;
  tripId: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main */}
      <div className="lg:col-span-2 space-y-5">
        {trip.cover_photo_url && (
          <div className="rounded-2xl overflow-hidden h-48">
            <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover" />
          </div>
        )}
        {trip.description && (
          <div className="card p-4">
            <p className="text-sm text-[#64748B]">{trip.description}</p>
          </div>
        )}

        {stops.length === 0 ? (
          <div className="card p-8 text-center">
            <MapPin className="w-10 h-10 text-[#e2e8f0] mx-auto mb-3" />
            <p className="text-[#94a3b8] mb-4">No stops added yet.</p>
            <button onClick={() => navigate(`/trips/${tripId}/build`)} className="btn-primary text-sm">
              Build Itinerary
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {stops.map((stop, idx) => <StopCard key={stop.id} stop={stop} index={idx} />)}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        {/* Stats */}
        <div className="card p-5">
          <h3 className="font-bold text-[#0b1c30] mb-4">Trip Stats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64748B] flex items-center gap-1.5"><Clock className="w-4 h-4" /> Duration</span>
              <span className="font-semibold text-[#0b1c30]">
                {Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / 86400000)} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Stops</span>
              <span className="font-semibold text-[#0b1c30]">{stops.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Activities</span>
              <span className="font-semibold text-[#0b1c30]">
                {stops.reduce((s, st) => s + (st.activities?.length ?? 0), 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget snapshot */}
        {budget && (
          <div className="card p-5">
            <h3 className="font-bold text-[#0b1c30] mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#E8604C]" /> Budget
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Budget</span>
                <span className="font-semibold">${Number(budget.total_budget ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Estimated</span>
                <span className={`font-semibold ${budget.over_budget ? 'text-[#dc2626]' : 'text-[#059669]'}`}>
                  ${Number(budget.estimated_cost ?? 0).toLocaleString()}
                </span>
              </div>
              {budget.over_budget && (
                <p className="text-xs text-[#dc2626] bg-[#fef2f2] rounded-lg px-2 py-1.5">⚠ Over budget</p>
              )}
            </div>
          </div>
        )}

        {trip.is_public && trip.share_token && (
          <div className="card p-4 border-[#E8604C]/20 border">
            <p className="text-xs font-semibold text-[#E8604C] mb-1">Public Share Link</p>
            <p className="text-xs text-[#64748B] break-all">{window.location.origin}/shared/{trip.share_token}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StopCard({ stop, index }: { stop: ApiStop; index: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-[#f1f5f9]">
        <div className="w-8 h-8 rounded-full bg-[#E8604C] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {index + 1}
        </div>
        <div>
          <p className="font-bold text-[#0b1c30]">
            {stop.city?.name ?? 'Unknown City'}, {stop.city?.country ?? ''}
          </p>
          <p className="text-xs text-[#94a3b8] flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3" />
            {new Date(stop.arrival_date).toLocaleDateString()} → {new Date(stop.departure_date).toLocaleDateString()}
          </p>
        </div>
      </div>
      {stop.activities && stop.activities.length > 0 && (
        <div className="p-4 space-y-2">
          {stop.activities.map((sa) => (
            <div key={sa.id} className="flex items-center gap-3 p-2.5 bg-[#f8fafc] rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-[#E8604C]/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#E8604C]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0b1c30] truncate">{sa.activity?.name ?? 'Activity'}</p>
                <p className="text-xs text-[#94a3b8]">
                  {sa.activity?.type ?? ''}
                  {sa.activity?.cost != null ? ` · $${Number(sa.custom_cost ?? sa.activity.cost).toFixed(0)}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
