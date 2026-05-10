import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ApiPackingItem } from '../store/useStore';
import {
  ArrowLeft, Plus, Trash2, RotateCcw, Check, Loader2,
  Shirt, FileText, Cpu, Droplets, Backpack, MoreHorizontal,
} from 'lucide-react';
import {
  apiListPacking, apiCreatePackingItem, apiUpdatePackingItem,
  apiDeletePackingItem, apiResetPacking, extractError,
} from '../lib/api';

const CATEGORIES = ['clothing', 'documents', 'electronics', 'toiletries', 'gear', 'other'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_ICONS: Record<Category, typeof Shirt> = {
  clothing: Shirt,
  documents: FileText,
  electronics: Cpu,
  toiletries: Droplets,
  gear: Backpack,
  other: MoreHorizontal,
};

const CATEGORY_COLORS: Record<Category, string> = {
  clothing: 'bg-blue-50 text-blue-600',
  documents: 'bg-amber-50 text-amber-600',
  electronics: 'bg-purple-50 text-purple-600',
  toiletries: 'bg-teal-50 text-teal-600',
  gear: 'bg-green-50 text-green-600',
  other: 'bg-gray-50 text-gray-500',
};

export default function PackingChecklist() {
  const { id } = useParams<{ id: string }>();
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
        </div>
        <button
          onClick={handleReset}
          disabled={resetting || packed === 0}
          className="btn-secondary text-sm py-2 disabled:opacity-40"
        >
          {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          Reset
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
      )}

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

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeCategory === 'all' ? 'bg-[#001b26] text-white' : 'bg-white border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9]'
          }`}
        >
          All ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const count = items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat ? 'bg-[#001b26] text-white' : 'bg-white border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9]'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Items */}
      {loading ? (
        <div className="card p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#E8604C] mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <Backpack className="w-10 h-10 text-[#e2e8f0] mx-auto mb-2" />
          <p className="text-[#94a3b8] text-sm">No items in this category. Add some above!</p>
        </div>
      ) : (
        <div className="card divide-y divide-[#f8fafc]">
          {filtered.map((item) => {
            const cat = item.category as Category;
            const Icon = CATEGORY_ICONS[cat] ?? MoreHorizontal;
            const colorClass = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other;
            return (
              <div key={item.id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${item.is_packed ? 'bg-[#f8fafc]' : 'bg-white hover:bg-[#fafafa]'}`}>
                <button
                  onClick={() => handleToggle(item)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    item.is_packed ? 'bg-[#E8604C] border-[#E8604C] text-white' : 'border-[#e2e8f0] hover:border-[#E8604C]'
                  }`}
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
