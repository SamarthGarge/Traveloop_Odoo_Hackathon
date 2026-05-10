import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  Copy,
  Edit3,
  Receipt,
  StickyNote,
  Clock,
  List,
  Globe,
  Link as LinkIcon,
  Check,
  X,
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
  const { activeTrip, createTrip } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareToCommunity, setShareToCommunity] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (activeTrip) {
      navigator.clipboard.writeText(`${window.location.origin}/shared/${activeTrip.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyTrip = () => {
    if (!activeTrip) return;
    createTrip({
      name: `${activeTrip.name} (Copy)`,
      destination: activeTrip.destination,
      startDate: activeTrip.startDate,
      endDate: activeTrip.endDate,
      description: activeTrip.description,
      coverImage: activeTrip.coverImage,
      status: 'upcoming',
      budget: activeTrip.budget,
      spent: 0,
      createdBy: 'You',
    });
    // Assuming createTrip handles setting the new trip as active
    navigate('/itinerary/build');
  };

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
      {/* Trip Header */}
      <div className="card overflow-hidden mb-8">
        <div className="relative h-48 sm:h-64">
          <img src={activeTrip.coverImage} alt={activeTrip.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001b26]/80 via-[#001b26]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${
                activeTrip.status === 'ongoing' ? 'bg-[#E8604C] text-white' :
                activeTrip.status === 'upcoming' ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-white/20 text-white'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {activeTrip.status.charAt(0).toUpperCase() + activeTrip.status.slice(1)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">{activeTrip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-white/70 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{activeTrip.destination}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{activeTrip.startDate} - {activeTrip.endDate}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />₹{activeTrip.budget.toLocaleString()} budget</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 p-4 border-t border-[#f1f5f9]">
          <button onClick={() => navigate('/itinerary/build')} className="btn-ghost text-sm">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => setShowShareModal(true)} className="btn-ghost text-sm">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button onClick={handleCopyTrip} className="btn-ghost text-sm">
            <Copy className="w-3.5 h-3.5" /> Copy Trip
          </button>
          <button onClick={() => navigate('/invoice')} className="btn-ghost text-sm ml-auto">
            <Receipt className="w-3.5 h-3.5" /> View Invoice
          </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itinerary Timeline */}
        <div className="lg:col-span-2 space-y-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#0b1c30] font-heading">Itinerary</h2>
            <div className="flex bg-[#f1f5f9] rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === 'list' ? 'bg-white text-[#0b1c30] shadow-sm' : 'text-[#64748B] hover:text-[#0b1c30]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === 'calendar' ? 'bg-white text-[#0b1c30] shadow-sm' : 'text-[#64748B] hover:text-[#0b1c30]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Calendar
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <div className="card p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-[#e2e8f0] bg-[#f8fafc]">
              <Calendar className="w-12 h-12 text-[#94a3b8] mb-3" />
              <h3 className="text-lg font-bold text-[#0b1c30] font-heading mb-1">Calendar View</h3>
              <p className="text-sm text-[#64748B]">Full calendar integration is coming soon.</p>
            </div>
          ) : (
            <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-[#e2e8f0]" />
            
            <div className="space-y-4">
              {activeTrip.sections.map((section, index) => (
                <div key={section.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="card p-5 flex-1 card-interactive">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-[#0b1c30] font-heading">{section.title}</h3>
                      <span className="badge bg-[#f1f5f9] text-[#64748B]" style={{ color: COLORS[index % COLORS.length] }}>
                        ₹{section.budget.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748B] mt-1">{section.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#94a3b8]">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{section.dateRange}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Full day</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Notes */}
          {activeTrip.notes?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-4">Trip Notes</h2>
              <div className="space-y-3">
                {[...(activeTrip.notes || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((note) => (
                  <div key={note.id} className="card p-4 border-l-4 border-l-[#E8604C]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-[#E8604C]" />
                        <h4 className="font-semibold text-[#0b1c30] text-sm">{note.title}</h4>
                      </div>
                      <span className="text-[10px] text-[#94a3b8] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {note.time || '09:00 AM'}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748B]">{note.content}</p>
                    <p className="text-xs text-[#94a3b8] mt-2">{note.date} | {note.stop}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Budget snapshot */}
        {budget && (
          <div className="card p-5">
            <h3 className="font-bold text-[#0b1c30] font-heading mb-4">Budget Breakdown</h3>
            
            {/* Mini donut */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {budgetData.reduce((acc, item, i) => {
                    const offset = acc.offset;
                    acc.elements.push(
                      <circle
                        key={i}
                        cx="18" cy="18" r="14"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="3.5"
                        strokeDasharray={`${item.percent * 0.88} ${88 - item.percent * 0.88}`}
                        strokeDashoffset={-offset * 0.88}
                      />
                    );
                    acc.offset += item.percent;
                    return acc;
                  }, { elements: [] as any[], offset: 0 }).elements}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-[#0b1c30] font-heading">{activeTrip.sections.length}</span>
                  <span className="text-[10px] text-[#94a3b8]">Sections</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {budgetData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#64748B]">{item.name}</span>
                  </span>
                  <span className="font-medium text-[#0b1c30]">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-[#0b1c30] font-heading mb-4">Budget Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Total Budget</span>
                <span className="font-semibold text-[#0b1c30]">₹{activeTrip.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Total Spent</span>
                <span className="font-semibold text-[#E8604C]">₹{activeTrip.spent.toLocaleString()}</span>
              </div>
              <div className="border-t border-[#f1f5f9] pt-3 flex justify-between text-sm">
                <span className="text-[#64748B]">Remaining</span>
                <span className={`font-bold ${remaining >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                  ₹{remaining.toLocaleString()}
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 text-[#94a3b8] hover:text-[#0b1c30] rounded-full hover:bg-[#f1f5f9] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-2">Share Trip</h2>
            <p className="text-sm text-[#64748B] mb-6">Invite friends or publish to the community.</p>

            <div className="space-y-6">
              {/* Share to Community Toggle */}
              <div className="flex items-center justify-between p-4 border border-[#e2e8f0] rounded-xl bg-[#f8fafc]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8604C]/10 flex items-center justify-center text-[#E8604C]">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0b1c30]">Publish to Community</h4>
                    <p className="text-xs text-[#64748B]">Make this itinerary visible to everyone.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShareToCommunity(!shareToCommunity)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${shareToCommunity ? 'bg-[#059669]' : 'bg-[#cbd5e1]'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${shareToCommunity ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              {/* Shareable Link */}
              <div>
                <h4 className="text-sm font-semibold text-[#0b1c30] mb-2">Public Link</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm text-[#64748B] overflow-hidden">
                    <LinkIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{window.location.origin}/shared/{activeTrip.id}</span>
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0 ${
                      copiedLink ? 'bg-[#ecfdf5] text-[#059669] border border-[#059669]/20' : 'bg-[#001b26] text-white hover:bg-[#0b1c30]'
                    }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowShareModal(false)}
              className="w-full mt-8 btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      )}
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
