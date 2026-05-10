import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Search,
  MapPin,
  Calendar,
  Eye,
  ArrowRight,
  SlidersHorizontal,
  CalendarDays,
} from 'lucide-react';

type TabType = 'all' | 'upcoming' | 'ongoing' | 'completed';

export default function TripListing() {
  const navigate = useNavigate();
  const { trips, setActiveTrip } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-['Montserrat']">My Trips</h1>
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
            <button
              key={trip.id}
              onClick={() => { setActiveTrip(trip); navigate('/itinerary/view'); }}
              className="card card-interactive overflow-hidden text-left group"
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
                  <h3 className="text-lg font-bold text-[#0b1c30] font-['Montserrat']">{trip.name}</h3>
                  <button className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8]">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[#64748B] text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {trip.destination}
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
            </button>
          ))}
        </div>
      )}

      {/* Past Trips */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#0b1c30] mb-4">Past Trips</h2>
          <div className="card divide-y divide-[#f1f5f9]">
            {past.map((trip) => (
              <div key={trip.id} className="flex items-center gap-4 p-4 hover:bg-[#f8fafc] transition-colors">
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
                  <p>{trip.sections?.length || 4} Days</p>
                </div>
                <button 
                  onClick={() => { setActiveTrip(trip); navigate('/itinerary/view'); }}
                  className="w-9 h-9 rounded-xl border border-[#e2e8f0] flex items-center justify-center text-[#64748B] hover:bg-[#f1f5f9] transition-colors flex-shrink-0"
                >
                  <Eye className="w-4 h-4" />
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
            <h3 className="font-bold text-[#0b1c30] font-['Montserrat']">Traveloop</h3>
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
