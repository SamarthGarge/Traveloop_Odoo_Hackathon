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

  const [items, setItems] = useState<ApiPackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Category>('other');
  const [adding, setAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [resetting, setResetting] = useState(false);

  const fetchItems = () => {
    if (!id) return;
    setLoading(true);
    apiListPacking(id)
      .then((res) => setItems((res.data ?? res) as ApiPackingItem[]))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchItems(); }, [id]);

  const handleToggle = async (item: ApiPackingItem) => {
    if (!id) return;
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_packed: !i.is_packed } : i));
    try {
      await apiUpdatePackingItem(id, item.id, { is_packed: !item.is_packed });
    } catch {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_packed: item.is_packed } : i));
    }
  };

  const handleAdd = async () => {
    if (!id || !newItemName.trim()) return;
    setAdding(true);
    try {
      const res = await apiCreatePackingItem(id, { name: newItemName.trim(), category: newItemCategory });
      const newItem = res.data ?? res;
      setItems((prev) => [...prev, newItem]);
      setNewItemName('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!id) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await apiDeletePackingItem(id, itemId);
    } catch (err) {
      setError(extractError(err));
      fetchItems();
    }
  };

  const handleReset = async () => {
    if (!id || !confirm('Unpack all items?')) return;
    setResetting(true);
    try {
      await apiResetPacking(id);
      setItems((prev) => prev.map((i) => ({ ...i, is_packed: false })));
    } catch (err) {
      setError(extractError(err));
    } finally {
      setResetting(false);
    }
  };

  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);
  const packed = items.filter((i) => i.is_packed).length;
  const progress = items.length > 0 ? Math.round((packed / items.length) * 100) : 0;

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#0b1c30] font-['Montserrat']">Packing Checklist</h1>
          <p className="text-[#94a3b8] text-xs mt-0.5">{packed} of {items.length} items packed</p>
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

      {/* Progress */}
      <div className="card p-5 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#0b1c30]">Packing Progress</span>
          <span className="text-sm font-bold text-[#E8604C]">{progress}%</span>
        </div>
        <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E8604C] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs">
          <div>
            <p className="text-2xl font-bold text-[#0b1c30]">{items.length}</p>
            <p className="text-[#94a3b8]">Total Items</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#059669]">{packed}</p>
            <p className="text-[#94a3b8]">Packed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#E8604C]">{items.length - packed}</p>
            <p className="text-[#94a3b8]">Remaining</p>
          </div>
        </div>
      </div>

      {/* Add Item */}
      <div className="card p-4 mb-6">
        <div className="flex gap-3">
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value as Category)}
            className="input-field text-sm py-2.5 flex-shrink-0 w-36"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add item (e.g., Passport, T-shirts)"
            className="input-field text-sm flex-1"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newItemName.trim()}
            className="btn-primary text-sm py-2.5 px-4 flex-shrink-0 disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

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
                  {item.is_packed && <Check className="w-3 h-3" />}
                </button>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <p className={`flex-1 text-sm font-medium transition-colors ${item.is_packed ? 'line-through text-[#94a3b8]' : 'text-[#0b1c30]'}`}>
                  {item.name}
                </p>
                <span className="text-xs text-[#94a3b8] capitalize hidden sm:block">{item.category}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
