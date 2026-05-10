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
  ArrowRight,
} from 'lucide-react';

const COLORS = ['#001b26', '#E8604C', '#059669', '#d97706', '#6366f1', '#94a3b8'];

export default function ItineraryView() {
  const navigate = useNavigate();
  const { activeTrip } = useStore();

  if (!activeTrip) {
    return (
      <div className="page-transition flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-[#64748B] mb-4">No trip selected</p>
          <button onClick={() => navigate('/trips')} className="btn-primary">
            View My Trips
          </button>
        </div>
      </div>
    );
  }

  const remaining = activeTrip.budget - activeTrip.spent;
  const budgetData = activeTrip.sections.map((s, i) => ({
    name: s.title,
    value: s.budget,
    color: COLORS[i % COLORS.length],
    percent: Math.round((s.budget / activeTrip.budget) * 100),
  }));

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
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Montserrat']">{activeTrip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-white/70 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{activeTrip.destination}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{activeTrip.startDate} - {activeTrip.endDate}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />${activeTrip.budget.toLocaleString()} budget</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 p-4 border-t border-[#f1f5f9]">
          <button onClick={() => navigate('/itinerary/build')} className="btn-ghost text-sm">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button className="btn-ghost text-sm">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button className="btn-ghost text-sm">
            <Copy className="w-3.5 h-3.5" /> Copy Trip
          </button>
          <button onClick={() => navigate('/invoice')} className="btn-ghost text-sm ml-auto">
            <Receipt className="w-3.5 h-3.5" /> View Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itinerary Timeline */}
        <div className="lg:col-span-2 space-y-1">
          <h2 className="text-xl font-bold text-[#0b1c30] font-['Montserrat'] mb-4">Itinerary</h2>
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
                      <h3 className="font-bold text-[#0b1c30] font-['Montserrat']">{section.title}</h3>
                      <span className="badge bg-[#f1f5f9] text-[#64748B]" style={{ color: COLORS[index % COLORS.length] }}>
                        ${section.budget.toLocaleString()}
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

          {/* Notes */}
          {activeTrip.notes?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#0b1c30] font-['Montserrat'] mb-4">Trip Notes</h2>
              <div className="space-y-3">
                {activeTrip.notes.map((note) => (
                  <div key={note.id} className="card p-4 border-l-4 border-l-[#E8604C]">
                    <div className="flex items-center gap-2 mb-1">
                      <StickyNote className="w-4 h-4 text-[#E8604C]" />
                      <h4 className="font-semibold text-[#0b1c30] text-sm">{note.title}</h4>
                    </div>
                    <p className="text-sm text-[#64748B]">{note.content}</p>
                    <p className="text-xs text-[#94a3b8] mt-2">{note.date} | {note.stop}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Budget Sidebar */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold text-[#0b1c30] font-['Montserrat'] mb-4">Budget Breakdown</h3>
            
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
                  }, { elements: [] as JSX.Element[], offset: 0 }).elements}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-[#0b1c30] font-['Montserrat']">{activeTrip.sections.length}</span>
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
                  <span className="font-medium text-[#0b1c30]">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-[#0b1c30] font-['Montserrat'] mb-4">Budget Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Total Budget</span>
                <span className="font-semibold text-[#0b1c30]">${activeTrip.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Total Spent</span>
                <span className="font-semibold text-[#E8604C]">${activeTrip.spent.toLocaleString()}</span>
              </div>
              <div className="border-t border-[#f1f5f9] pt-3 flex justify-between text-sm">
                <span className="text-[#64748B]">Remaining</span>
                <span className={`font-bold ${remaining >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                  ${remaining.toLocaleString()}
                </span>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#001b26] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((activeTrip.spent / activeTrip.budget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[#94a3b8] mt-1">
                  {Math.round((activeTrip.spent / activeTrip.budget) * 100)}% of budget used
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
