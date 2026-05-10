import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  Filter,
} from 'lucide-react';

type TabType = 'ongoing' | 'upcoming' | 'completed';

export default function TripListing() {
  const navigate = useNavigate();
  const { trips, deleteTrip, setActiveTrip } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('ongoing');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const filtered = trips
    .filter((t) => t.status === activeTab)
    .filter((t) =>
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (sortBy === 'budget') return b.budget - a.budget;
      return a.name.localeCompare(b.name);
    });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">My Trips</h1>
          <button onClick={() => navigate('/trips/new')} className="btn-primary text-sm">
            + Plan New Trip
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trips..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffcc66] text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ffcc66]"
              >
                <option value="date">Sort by Date</option>
                <option value="budget">Sort by Budget</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#00202a] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-60">
                ({trips.filter((t) => t.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>

        {/* Trip Cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400 mb-3">No {activeTab} trips found</p>
            <button onClick={() => navigate('/trips/new')} className="btn-primary text-sm">
              Create a Trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0">
                    <img
                      src={trip.coverImage}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[#1a1a1a] text-lg">{trip.name}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {trip.destination}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'ongoing'
                          ? 'bg-green-100 text-green-700'
                          : trip.status === 'upcoming'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{trip.description}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {trip.startDate} - {trip.endDate}
                      </span>
                      <span className="font-medium text-[#5b7f74]">
                        ${trip.budget.toLocaleString()}
                      </span>
                      <span>{trip.sections.length} sections</span>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                      <button
                        onClick={() => { setActiveTrip(trip); navigate('/itinerary/view'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5b7f74]/10 text-[#5b7f74] text-sm font-medium hover:bg-[#5b7f74]/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => { setActiveTrip(trip); navigate('/itinerary/build'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTrip(trip.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
