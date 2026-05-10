import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Check,
  Plus,
  RotateCcw,
  Share2,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Shirt,
  Smartphone,
  Droplets,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  Documents: FileText,
  Clothing: Shirt,
  Electronics: Smartphone,
  Toiletries: Droplets,
};

export default function PackingChecklist() {
  const navigate = useNavigate();
  const { checklist, toggleChecklistItem, addChecklistItem, resetChecklist, activeTrip, trips, setActiveTrip } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Documents');
  const [showAdd, setShowAdd] = useState(false);
  const [sharedMode, setSharedMode] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Documents: true,
    Clothing: true,
    Electronics: true,
    Toiletries: true,
  });

  const categories = [...new Set(checklist.map((item) => item.category))];

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    addChecklistItem({ name: newItem, packed: false, category: newCategory });
    setNewItem('');
    setShowAdd(false);
  };

  const packedCount = checklist.filter((i) => i.packed).length;
  const totalCount = checklist.length;
  const progress = totalCount ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <div className="page-transition max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-primary text-[10px] uppercase">
              {activeTrip?.destination || 'No Destination'}
            </span>
            <span className="badge bg-[#f1f5f9] text-[#64748B] text-[10px] uppercase">
              {activeTrip ? `${activeTrip.startDate} - ${activeTrip.endDate}` : 'No Dates'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading whitespace-nowrap">Packing For:</h1>
            <select
              value={activeTrip?.id || ''}
              onChange={(e) => {
                const trip = trips.find((t) => t.id === e.target.value);
                if (trip) setActiveTrip(trip);
              }}
              className="text-xl lg:text-2xl font-bold text-[#E8604C] font-heading bg-transparent border-b-2 border-transparent hover:border-[#E8604C]/30 focus:border-[#E8604C] outline-none cursor-pointer pb-1 pr-8 appearance-none max-w-full"
              style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23e8604c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right center` }}
            >
              <option value="" disabled>Select a trip</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id} className="text-base font-medium text-[#0b1c30]">
                  {trip.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span className="font-medium">Shared Checklist</span>
            <button onClick={() => setSharedMode(!sharedMode)} className="text-[#E8604C]">
              {sharedMode ? <ToggleRight className="w-8 h-5" /> : <ToggleLeft className="w-8 h-5" />}
            </button>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#E8604C] border-2 border-white flex items-center justify-center text-white text-xs font-bold">JS</div>
            <div className="w-8 h-8 rounded-full bg-[#001b26] border-2 border-white flex items-center justify-center text-white text-xs font-bold">AL</div>
          </div>
        </div>
      </div>

      <div className="border-b border-[#e2e8f0] mb-8" />

      {/* Full-Width Destination Banner */}
      {activeTrip && (
        <div className="relative rounded-2xl overflow-hidden h-56 mb-6 shadow-md">
          <img
            src={activeTrip.coverImage || '/images/dest-tokyo.jpg'}
            alt={activeTrip.destination}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          {/* Progress bar overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-[#E8604C] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Text */}
          <div className="absolute inset-0 flex flex-col justify-center p-8">
            <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">Packing For</p>
            <h2 className="text-3xl font-bold text-white font-heading drop-shadow-sm">
              {activeTrip.destination} Awaits
            </h2>
            <p className="text-white/70 text-sm mt-1">
              {activeTrip.startDate} → {activeTrip.endDate} · {progress}% packed
            </p>
          </div>
          {/* Readiness badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center">
              <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">Readiness</p>
              <p className="text-white text-2xl font-bold font-heading">{progress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Trip Readiness */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-[#0b1c30] font-heading">Trip Readiness</h2>
            <p className="text-sm text-[#64748B] mt-0.5">You're making good progress. {packedCount} of {totalCount} items packed.</p>
          </div>
          <span className="text-4xl font-bold text-[#E8604C] font-heading">{progress}%</span>
        </div>
        <div className="h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div className="h-full bg-[#E8604C] rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Categories - Full Width */}
      <div className="space-y-4">
          {categories.map((category) => {
            const items = checklist.filter(
              (item) =>
                item.category === category &&
                (!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            if (items.length === 0) return null;

            const catPacked = items.filter((i) => i.packed).length;
            const isExpanded = expandedCategories[category] !== false;
            const CatIcon = categoryIcons[category] || FileText;

            return (
              <div key={category} className="card overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#f8fafc] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748B]">
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-[#0b1c30] font-heading text-base">{category}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge bg-[#f1f5f9] text-[#64748B]">{catPacked}/{items.length} Packed</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-[#94a3b8]" /> : <ChevronDown className="w-5 h-5 text-[#94a3b8]" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#f1f5f9]">
                    {/* Items Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-[#f1f5f9]">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`relative flex items-start gap-2.5 p-3.5 cursor-pointer transition-all bg-white hover:bg-[#f8fafc] group ${
                            item.packed ? 'bg-[#fafffe]' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                              item.packed
                                ? 'bg-[#E8604C] border-[#E8604C]'
                                : 'border-[#e2e8f0] group-hover:border-[#E8604C]/60'
                            }`}
                          >
                            {item.packed && <Check className="w-3 h-3 text-white" />}
                          </div>
                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm leading-tight block ${
                              item.packed ? 'line-through text-[#94a3b8]' : 'text-[#0b1c30]'
                            }`}>
                              {item.name}
                            </span>
                            {item.name.includes('Insurance') && (
                              <span className="text-[10px] font-semibold text-[#dc2626] flex items-center gap-0.5 mt-0.5">
                                <AlertTriangle className="w-3 h-3" /> Priority
                              </span>
                            )}
                          </div>
                          {/* Packed indicator dot */}
                          {item.packed && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#E8604C]" />
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setNewCategory(category); setShowAdd(true); }}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#f8fafc] transition-colors border-t border-[#f1f5f9]"
                    >
                      <Plus className="w-4 h-4" /> Add {category} Item
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Quick Add + Actions Row */}
      <div className="flex flex-col sm:flex-row gap-4 mt-2">
          {showAdd && (
            <div className="card p-4">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Item name..."
                  className="input-field"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <div className="flex gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="input-field flex-1"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button onClick={handleAddItem} className="btn-primary text-sm py-2.5">Add</button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 sm:ml-auto">
            <button onClick={resetChecklist} className="btn-secondary py-2.5 text-sm px-6">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button className="btn-secondary py-2.5 text-sm px-6">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
      </div>
    </div>
  );
}
