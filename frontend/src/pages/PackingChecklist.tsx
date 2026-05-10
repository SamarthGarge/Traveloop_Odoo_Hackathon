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
  const { checklist, toggleChecklistItem, addChecklistItem, resetChecklist, activeTrip } = useStore();
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
            <span className="badge badge-primary text-[10px]">TOKYO 2024</span>
            <span className="badge bg-[#f1f5f9] text-[#64748B] text-[10px]">7 DAYS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-['Montserrat']">Packing Checklist</h1>
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

      {/* Trip Readiness */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-[#0b1c30] font-['Montserrat']">Trip Readiness</h2>
            <p className="text-sm text-[#64748B] mt-0.5">You're making good progress. {packedCount} of {totalCount} items packed.</p>
          </div>
          <span className="text-4xl font-bold text-[#E8604C] font-['Montserrat']">{progress}%</span>
        </div>
        <div className="h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div className="h-full bg-[#E8604C] rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Categories */}
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
                    <h3 className="font-bold text-[#0b1c30] font-['Montserrat'] text-base">{category}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge bg-[#f1f5f9] text-[#64748B]">{catPacked}/{items.length} Packed</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-[#94a3b8]" /> : <ChevronDown className="w-5 h-5 text-[#94a3b8]" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#f1f5f9]">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors"
                      >
                        <button
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            item.packed
                              ? 'bg-[#E8604C] border-[#E8604C]'
                              : 'border-[#e2e8f0] hover:border-[#E8604C]'
                          }`}
                        >
                          {item.packed && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`flex-1 text-sm ${item.packed ? 'line-through text-[#94a3b8]' : 'text-[#0b1c30]'}`}>
                          {item.name}
                        </span>
                        {item.name.includes('Insurance') && (
                          <span className="badge badge-error text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> High Priority
                          </span>
                        )}
                      </div>
                    ))}
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

        {/* Right: Destination Card + Quick Actions */}
        <div className="space-y-4">
          {/* Destination Image */}
          <div className="relative rounded-2xl overflow-hidden h-52">
            <img src={activeTrip?.coverImage || '/images/dest-tokyo.jpg'} alt="Destination" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-2xl font-bold text-white font-['Montserrat']">
                {activeTrip?.destination || 'Tokyo'} Awaits
              </h3>
              <p className="text-white/60 text-sm mt-1">Expected weather: 65°F - 75°F. Perfect for light layers.</p>
            </div>
          </div>

          {/* Quick Add */}
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
          <div className="flex gap-3">
            <button onClick={resetChecklist} className="btn-secondary flex-1 py-2.5 text-sm">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button className="btn-secondary flex-1 py-2.5 text-sm">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
