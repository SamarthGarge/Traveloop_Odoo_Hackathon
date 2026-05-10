import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  Copy,
  Edit3,
  Receipt,
  StickyNote,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#5b7f74', '#ffcc66', '#ff9966', '#66cc99', '#6699cc', '#cc99ff'];

export default function ItineraryView() {
  const navigate = useNavigate();
  const { activeTrip } = useStore();

  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No trip selected</p>
          <button onClick={() => navigate('/trips')} className="btn-primary">
            View My Trips
          </button>
        </div>
      </div>
    );
  }

  const budgetData = activeTrip.sections.map((s, i) => ({
    name: s.title,
    value: s.budget,
    color: COLORS[i % COLORS.length],
  }));

  const remaining = activeTrip.budget - activeTrip.spent;

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Trips
        </button>

        {/* Trip Header */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <div className="relative h-48 sm:h-64">
            <img src={activeTrip.coverImage} alt={activeTrip.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activeTrip.status === 'ongoing' ? 'bg-green-500 text-white' :
                  activeTrip.status === 'upcoming' ? 'bg-[#ffcc66] text-[#00202a]' : 'bg-gray-500 text-white'
                }`}>
                  {activeTrip.status.charAt(0).toUpperCase() + activeTrip.status.slice(1)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{activeTrip.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {activeTrip.destination}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {activeTrip.startDate} - {activeTrip.endDate}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ${activeTrip.budget.toLocaleString()} budget
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 p-4 border-t border-gray-100">
            <button onClick={() => navigate('/itinerary/build')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#5b7f74]/10 text-[#5b7f74] text-sm font-medium hover:bg-[#5b7f74]/20">
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">
              <Copy className="w-3.5 h-3.5" />
              Copy Trip
            </button>
            <button onClick={() => navigate('/invoice')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 ml-auto">
              <Receipt className="w-3.5 h-3.5" />
              View Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Day-wise Itinerary */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Itinerary</h2>
            {activeTrip.sections.map((section, index) => (
              <div key={section.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5b7f74]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#5b7f74]">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1a1a1a]">{section.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {section.dateRange}
                      </span>
                      <span className="flex items-center gap-1 text-[#5b7f74]">
                        <DollarSign className="w-3.5 h-3.5" />
                        ${section.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Notes */}
            {activeTrip.notes.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Trip Notes</h2>
                <div className="space-y-3">
                  {activeTrip.notes.map((note) => (
                    <div key={note.id} className="bg-[#ffcc66]/10 rounded-xl p-4 border border-[#ffcc66]/20">
                      <div className="flex items-center gap-2 mb-1">
                        <StickyNote className="w-4 h-4 text-[#ffcc66]" />
                        <h4 className="font-medium text-[#1a1a1a]">{note.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{note.content}</p>
                      <p className="text-xs text-gray-400 mt-2">{note.date} | {note.stop}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Budget Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-[#1a1a1a] mb-4">Budget Breakdown</h3>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {budgetData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-medium">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-[#1a1a1a] mb-4">Budget Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Budget</span>
                  <span className="font-medium">${activeTrip.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Spent</span>
                  <span className="font-medium text-[#ff9966]">${activeTrip.spent.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                  <span className="text-gray-500">Remaining</span>
                  <span className={`font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    ${remaining.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5b7f74] rounded-full transition-all"
                      style={{ width: `${Math.min((activeTrip.spent / activeTrip.budget) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.round((activeTrip.spent / activeTrip.budget) * 100)}% of budget used
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
