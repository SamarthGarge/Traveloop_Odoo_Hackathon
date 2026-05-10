import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ShareTripModal from '../components/ShareTripModal';
import {
  Search,
  MapPin,
  Calendar,
  Eye,
  ArrowRight,
  SlidersHorizontal,
  CalendarDays,
  Trash2,
  X,
  AlertTriangle,
  Share2,
} from 'lucide-react';

type TabType = 'all' | 'upcoming' | 'ongoing' | 'completed';

export default function TripListing() {
  const navigate = useNavigate();
  const { trips, setActiveTrip, deleteTrip, activeTrip } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [shareTripId, setShareTripId] = useState<string | null>(null);

  const filtered = trips
    .filter((t) => activeTab === 'all' || t.status === activeTab)
    .filter((t) =>
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'All Trips', count: trips.length },
    { key: 'upcoming', label: 'Upcoming', count: trips.filter(t => t.status === 'upcoming').length },
    { key: 'ongoing', label: 'Ongoing', count: trips.filter(t => t.status === 'ongoing').length },
    { key: 'completed', label: 'Past', count: trips.filter(t => t.status === 'completed').length },
  ];

  const upcomingAndOngoing = filtered.filter(t => t.status !== 'completed');
  const past = filtered.filter(t => t.status === 'completed');

  const handleDelete = (tripId: string) => {
    if (activeTrip?.id === tripId) {
      // If deleting the active trip, set active to null or first available
      const remaining = trips.filter(t => t.id !== tripId);
      setActiveTrip(remaining.length > 0 ? remaining[0] : null);
    }
    deleteTrip(tripId);
    setConfirmDeleteId(null);
  };

  const tripToDelete = trips.find(t => t.id === confirmDeleteId);
  const tripToShare = trips.find(t => t.id === shareTripId);

  return (
    <div className="page-transition">
      {/* Share Modal */}
      {shareTripId && tripToShare && (
        <ShareTripModal trip={tripToShare} onClose={() => setShareTripId(null)} />
      )}
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0b1c30] font-heading">Delete Trip</h3>
                <p className="text-xs text-[#64748B]">This action cannot be undone</p>
              </div>
              <button onClick={() => setConfirmDeleteId(null)} className="ml-auto p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl mb-5 border border-[#e2e8f0]">
              <img src={tripToDelete.coverImage} alt={tripToDelete.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-[#0b1c30]">{tripToDelete.name}</p>
                <p className="text-xs text-[#94a3b8] flex items-center gap-1"><MapPin className="w-3 h-3" />{tripToDelete.destination}</p>
              </div>
            </div>

            <p className="text-sm text-[#64748B] mb-5">
              Are you sure you want to permanently delete <span className="font-semibold text-[#0b1c30]">"{tripToDelete.name}"</span>? All itinerary data, notes, and expenses will be lost.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-medium text-[#64748B] hover:bg-[#f1f5f9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-xl bg-[#dc2626] text-white text-sm font-bold hover:bg-[#b91c1c] transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">My Trips</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage your past, ongoing, and upcoming adventures.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations..."
              className="input-field pl-9 pr-4 py-2.5 text-sm w-52"
            />
          </div>
          <button className="btn-secondary py-2.5 text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Status
          </button>
          <button className="btn-secondary py-2.5 text-sm">
            <CalendarDays className="w-4 h-4" />
            Dates
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#001b26] text-white'
                : 'bg-white text-[#64748B] border border-[#e2e8f0] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Trip Cards */}
      {upcomingAndOngoing.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {upcomingAndOngoing.map((trip) => (
            <div
              key={trip.id}
              className="card card-interactive overflow-hidden text-left group relative"
            >
              {/* Action Buttons on card - hover reveal */}
              <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => { e.stopPropagation(); setShareTripId(trip.id); }}
                  className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#E8604C] transition-colors"
                  title="Share trip"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(trip.id); }}
                  className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#dc2626] transition-colors"
                  title="Delete trip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                className="cursor-pointer"
                onClick={() => { setActiveTrip(trip); navigate('/itinerary/view'); }}
              >
                <div className="relative h-48">
                  <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-3 left-3">
                    <span className={`badge ${
                      trip.status === 'ongoing' ? 'bg-[#E8604C] text-white' : 'bg-[#ecfdf5] text-[#059669]'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {trip.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-[#0b1c30] font-heading">{trip.name}</h3>
                    <button className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8]" onClick={(e) => e.stopPropagation()}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <div className="flex items-center gap-1.5 text-[#64748B] text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.destination}
                    </div>
                    <div className="text-xs text-[#94a3b8] ml-5">
                      {trip.destination.split(',').length} destination{trip.destination.split(',').length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f1f5f9]">
                    <div className="text-xs text-[#94a3b8]">
                      <span className="uppercase font-semibold tracking-wider">Start</span>
                      <p className="text-sm text-[#0b1c30] font-medium mt-0.5">{trip.startDate}</p>
                    </div>
                    <Plane className="w-4 h-4 text-[#e2e8f0]" />
                    <div className="text-xs text-[#94a3b8] text-right">
                      <span className="uppercase font-semibold tracking-wider">End</span>
                      <p className="text-sm text-[#0b1c30] font-medium mt-0.5">{trip.endDate}</p>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-medium text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-all flex items-center justify-center gap-1.5">
                    {trip.status === 'ongoing' ? 'View Itinerary' : 'Plan Details'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Trips */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#0b1c30] mb-4">Past Trips</h2>
          <div className="card divide-y divide-[#f1f5f9]">
            {past.map((trip) => (
              <div key={trip.id} className="flex items-center gap-4 p-4 hover:bg-[#f8fafc] transition-colors group">
                <img src={trip.coverImage} alt={trip.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#0b1c30] text-sm">{trip.name}</h3>
                    <span className="badge bg-[#f1f5f9] text-[#64748B]">Completed</span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{trip.description || trip.destination}</p>
                </div>
                <div className="text-right text-xs text-[#94a3b8] flex-shrink-0 hidden sm:block">
                  <p className="font-medium text-[#0b1c30]">{trip.startDate} - {trip.endDate}</p>
                  <p>{trip.destination.split(',').length} Destinations</p>
                </div>
                <button
                  onClick={() => { setActiveTrip(trip); navigate('/itinerary/view'); }}
                  className="w-9 h-9 rounded-xl border border-[#e2e8f0] flex items-center justify-center text-[#64748B] hover:bg-[#f1f5f9] transition-colors flex-shrink-0"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShareTripId(trip.id)}
                  className="w-9 h-9 rounded-xl border border-[#e2e8f0] flex items-center justify-center text-[#94a3b8] hover:bg-[#fef5f3] hover:text-[#E8604C] hover:border-[#E8604C]/20 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  title="Share trip"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(trip.id)}
                  className="w-9 h-9 rounded-xl border border-[#e2e8f0] flex items-center justify-center text-[#94a3b8] hover:bg-[#fef2f2] hover:text-[#dc2626] hover:border-[#dc2626]/20 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  title="Delete trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
          <p className="text-[#64748B] mb-4">No {activeTab === 'all' ? '' : activeTab} trips found</p>
          <button onClick={() => navigate('/trips/new')} className="btn-primary text-sm">
            Create a Trip
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 pb-4 border-t border-[#e2e8f0]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#0b1c30] font-heading">Traveloop</h3>
            <p className="text-xs text-[#94a3b8] mt-0.5">© 2024 Traveloop. Your premium travel assistant.</p>
          </div>
          <div className="flex gap-6 text-xs text-[#94a3b8]">
            <button className="hover:text-[#0b1c30] transition-colors">Privacy Policy</button>
            <button className="hover:text-[#0b1c30] transition-colors">Terms of Service</button>
            <button className="hover:text-[#0b1c30] transition-colors">Cookies</button>
            <button className="hover:text-[#0b1c30] transition-colors">Contact Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Plane(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  );
}
