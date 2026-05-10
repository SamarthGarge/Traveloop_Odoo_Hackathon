import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Check,
  Plus,
  RotateCcw,
  Share2,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function PackingChecklist() {
  const navigate = useNavigate();
  const { checklist, toggleChecklistItem, addChecklistItem, resetChecklist, activeTrip } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Documents');
  const [showAdd, setShowAdd] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Documents: true,
    Clothing: true,
    Electronics: true,
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

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Packing Checklist</h1>
            <span className="text-2xl font-bold text-[#5b7f74]">
              {packedCount}/{totalCount}
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Trip: {activeTrip?.name || 'Paris & Rome Adventure'}
          </p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5b7f74] rounded-full transition-all duration-500"
              style={{ width: `${totalCount ? (packedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {totalCount ? Math.round((packedCount / totalCount) * 100) : 0}% packed
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffcc66] text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#5b7f74] text-white text-sm font-medium hover:bg-[#4a6b61] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
            <button
              onClick={resetChecklist}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Add Item Form */}
        {showAdd && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Item name..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffcc66] text-sm"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffcc66]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button onClick={handleAddItem} className="btn-primary text-sm py-2.5">
                Add
              </button>
            </div>
          </div>
        )}

        {/* Categories */}
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

            return (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#1a1a1a]">{category}</h3>
                    <span className="text-sm text-gray-400">
                      {catPacked}/{items.length}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-50">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                      >
                        <button
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            item.packed
                              ? 'bg-[#5b7f74] border-[#5b7f74]'
                              : 'border-gray-300 hover:border-[#5b7f74]'
                          }`}
                        >
                          {item.packed && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`flex-1 text-sm ${item.packed ? 'line-through text-gray-400' : 'text-[#1a1a1a]'}`}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
