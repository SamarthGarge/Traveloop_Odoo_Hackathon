import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download, Printer, Edit2, Check, X, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ExpenseInvoice() {
  const navigate = useNavigate();
  const { activeTrip, user, trips, setActiveTrip, updateTripBudget, updateSectionBudget, addExpense, updateExpense, deleteExpense } = useStore();
  const [isPaid, setIsPaid] = useState(false);

  // States for Inline Editing
  const [editingTotalBudget, setEditingTotalBudget] = useState(false);
  const [totalBudgetVal, setTotalBudgetVal] = useState('');

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [rowAmountVal, setRowAmountVal] = useState('');

  // States for Adding New Expense
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'Miscellaneous', title: '', description: '', qty: '1', amount: '' });

  // Fallback empty state if somehow there's no trip
  const trip = activeTrip || {
    id: 'placeholder',
    name: 'Untitled Trip',
    destination: 'Unknown Destination',
    startDate: 'TBD',
    endDate: 'TBD',
    budget: 0,
    spent: 0,
    sections: [],
    notes: [],
    expenses: [],
    createdBy: 'Unknown',
    coverImage: '/images/dest-paris.jpg',
    status: 'upcoming' as const
  };

  // Combine sections and expenses into unified invoice items
  const invoiceItems = useMemo(() => {
    const items: any[] = [];
    
    trip.sections.forEach((section) => {
      const lowerStr = (section.title + ' ' + section.description).toLowerCase();
      let category = 'Activities';
      if (lowerStr.includes('hotel') || lowerStr.includes('stay') || lowerStr.includes('resort')) category = 'Hotel';
      else if (lowerStr.includes('flight') || lowerStr.includes('train') || lowerStr.includes('travel') || lowerStr.includes('transfer')) category = 'Travel';
      else if (lowerStr.includes('food') || lowerStr.includes('meal') || lowerStr.includes('dinner') || lowerStr.includes('cooking')) category = 'Meals';

      items.push({
        id: section.id,
        isSection: true,
        category,
        title: section.title,
        description: section.description || 'No description provided',
        qty: section.dateRange || '1',
        amount: section.budget || 0
      });
    });

    (trip.expenses || []).forEach(exp => {
      items.push({
        id: exp.id,
        isSection: false,
        category: exp.category,
        title: exp.title,
        description: exp.description || '',
        qty: exp.qty || '1',
        amount: exp.amount || 0
      });
    });

    return items;
  }, [trip.sections, trip.expenses]);

  const subtotal = invoiceItems.reduce((acc, curr) => acc + curr.amount, 0);
  const tax = subtotal * 0.05; // Dynamic 5% tax computation
  const discount = 0; // Configurable if needed
  const grandTotal = subtotal + tax - discount;

  // Real-time spent tracking based on itinerary
  const totalSpent = subtotal > 0 ? grandTotal : trip.spent;
  const totalBudget = trip.budget;
  const remaining = totalBudget - totalSpent;
  const progressPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  // Extract dynamically aggregated categories
  const categories = useMemo(() => {
    const cats = {
      Hotel: { amount: 0, color: '#001b26' },
      Travel: { amount: 0, color: '#E8604C' },
      Activities: { amount: 0, color: '#059669' },
      Meals: { amount: 0, color: '#d97706' },
      Miscellaneous: { amount: 0, color: '#64748B' },
    };

    invoiceItems.forEach(item => {
      if (cats[item.category as keyof typeof cats]) {
        cats[item.category as keyof typeof cats].amount += item.amount;
      } else {
        cats.Miscellaneous.amount += item.amount;
      }
    });

    return Object.entries(cats)
      .map(([label, data]) => ({ label, amount: data.amount, color: data.color }))
      .filter(c => c.amount > 0);
  }, [invoiceItems]);

  const categoryTotal = categories.reduce((a, c) => a + c.amount, 0);

  // Split Logic
  const travelersList = [user?.firstName || trip.createdBy, 'Traveler 2', 'Traveler 3'];
  const splitAmount = travelersList.length > 0 ? grandTotal / travelersList.length : grandTotal;

  // Date Diff for Daily Avg
  const days = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return 1;
    const s = new Date(trip.startDate).getTime();
    const e = new Date(trip.endDate).getTime();
    if (isNaN(s) || isNaN(e)) return 1;
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
  }, [trip.startDate, trip.endDate]);

  const dailyAvg = totalSpent / days;

  // Handlers
  const handleSaveTotalBudget = () => {
    const val = parseFloat(totalBudgetVal);
    if (!isNaN(val) && val >= 0) {
      updateTripBudget(trip.id, val);
    }
    setEditingTotalBudget(false);
  };

  const handleSaveRowAmount = (id: string, isSection: boolean) => {
    const val = parseFloat(rowAmountVal);
    if (!isNaN(val) && val >= 0) {
      if (isSection) updateSectionBudget(trip.id, id, val);
      else updateExpense(trip.id, id, { amount: val });
    }
    setEditingRowId(null);
  };

  const handleAddExpense = () => {
    const amt = parseFloat(newExpense.amount);
    if (newExpense.title.trim() && !isNaN(amt) && amt > 0) {
      addExpense(trip.id, {
        title: newExpense.title,
        description: newExpense.description,
        category: newExpense.category,
        qty: newExpense.qty || '1',
        amount: amt
      });
      setIsAddingExpense(false);
      setIsCustomCategory(false);
      setNewExpense({ category: 'Miscellaneous', title: '', description: '', qty: '1', amount: '' });
    }
  };

  return (
    <div className="page-transition max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 text-[#64748B] hover:text-[#0b1c30] text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          back to My Trips
        </button>

        {/* Global Trip Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#64748B]">Active Finance Profile:</span>
          <select
            value={activeTrip?.id || ''}
            onChange={(e) => {
              const selectedTrip = trips.find((t) => t.id === e.target.value);
              if (selectedTrip) setActiveTrip(selectedTrip);
            }}
            className="text-sm font-bold text-[#0b1c30] font-heading bg-transparent border-b-2 border-transparent hover:border-[#E8604C]/30 focus:border-[#E8604C] outline-none cursor-pointer pb-0.5 appearance-none pr-4"
            style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right center` }}
          >
            <option value="" disabled>Select Trip</option>
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Cards Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Trip Info Card */}
        <div className="lg:col-span-2 card p-6 flex flex-col md:flex-row gap-6">
          {/* Trip Summary */}
          <div className="flex gap-4 flex-1">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#f1f5f9] border border-[#e2e8f0] flex-shrink-0">
              <img 
                src={trip.coverImage || '/images/dest-paris.jpg'} 
                alt="Trip Cover" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h2 className="font-bold text-[#0b1c30] font-heading text-lg leading-tight mb-2">
                {trip.name}
              </h2>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="badge badge-primary text-[10px] uppercase">{trip.destination}</span>
                <span className="badge bg-[#f1f5f9] text-[#64748B] text-[10px] uppercase">
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">Manager: {user?.firstName || trip.createdBy}</p>
            </div>
          </div>

          <div className="hidden md:block w-px bg-[#e2e8f0]"></div>

          {/* Invoice Details */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-[#0b1c30] mb-0.5">Invoice Ref</p>
              <p className="text-[11px] font-mono text-[#64748B] mb-4">INV-{trip.id.slice(0,6).toUpperCase()}</p>

              <p className="text-[11px] font-semibold text-[#0b1c30] mb-1">Travelers Split ({travelersList.length}):</p>
              <div className="text-[11px] text-[#64748B] space-y-0.5">
                {travelersList.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span>{t}</span>
                    <span className="font-medium">₹{Math.round(splitAmount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#0b1c30] mb-0.5">Last Sync</p>
              <p className="text-[11px] text-[#64748B] mb-4">{new Date().toLocaleString()}</p>

              <p className="text-[11px] text-[#0b1c30] mb-1">Payment Status</p>
              <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fffbeb] text-[#d97706]'}`}>
                {isPaid ? 'Settled' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Insights */}
        <div className="card p-6 flex flex-col h-full relative">
          <h3 className="font-bold text-[#0b1c30] font-heading text-sm mb-4">
            Live Budget Insights
          </h3>

          {/* Donut Chart */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke={totalSpent > totalBudget ? '#dc2626' : '#E8604C'}
                  strokeWidth="4"
                  strokeDasharray={`${progressPercent * 0.879} ${100 - (progressPercent * 0.879)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[10px] font-bold ${totalSpent > totalBudget ? 'text-[#dc2626]' : 'text-[#0b1c30]'}`}>
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
            <div className="text-[11px] space-y-1.5 flex-1">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[#64748B] flex items-center gap-1">
                  Total Budget
                  {!editingTotalBudget && (
                    <button onClick={() => { setEditingTotalBudget(true); setTotalBudgetVal(totalBudget.toString()); }} className="text-[#94a3b8] hover:text-[#E8604C]">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
                {editingTotalBudget ? (
                  <div className="flex items-center gap-1">
                    <input 
                      autoFocus
                      type="number" 
                      className="w-16 px-1 py-0.5 text-xs border rounded outline-none" 
                      value={totalBudgetVal} 
                      onChange={(e) => setTotalBudgetVal(e.target.value)} 
                    />
                    <button onClick={handleSaveTotalBudget} className="text-[#059669]"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingTotalBudget(false)} className="text-[#dc2626]"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <span className="font-semibold text-[#0b1c30]">₹{totalBudget.toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#64748B]">Spent</span>
                <span className={`font-semibold ${totalSpent > totalBudget ? 'text-[#dc2626]' : 'text-[#E8604C]'}`}>
                  ₹{Math.round(totalSpent).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#64748B]">Remaining</span>
                <span className={`font-semibold ${remaining < 0 ? 'text-[#dc2626]' : 'text-[#059669]'}`}>
                  ₹{Math.abs(Math.round(remaining)).toLocaleString()}{remaining < 0 ? ' over' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Over-budget alert */}
          {remaining < 0 && (
            <div className="mb-4 flex items-center gap-2 p-2.5 rounded-lg bg-[#fef2f2] border border-[#dc2626]/15 animate-pulse">
              <svg className="w-4 h-4 text-[#dc2626] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-[10px] font-medium text-[#dc2626]">You're over budget by ₹{Math.abs(Math.round(remaining)).toLocaleString()}</span>
            </div>
          )}

          {/* Category Bar Chart */}
          <div className="space-y-2.5 flex-1">
            <p className="text-[11px] font-semibold text-[#0b1c30] mb-1">By Category</p>
            {categories.length > 0 ? (
              categories.map((cat) => {
                const pct = categoryTotal > 0 ? Math.round((cat.amount / categoryTotal) * 100) : 0;
                return (
                  <div key={cat.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-[#64748B]">{cat.label}</span>
                      <span className="text-[10px] font-medium text-[#0b1c30]">₹{cat.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#64748B] italic">No categorical expenses yet.</p>
            )}
          </div>

          {/* Avg per day */}
          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex justify-between items-center">
            <span className="text-[10px] text-[#64748B]">Avg. Daily Spend</span>
            <span className="text-[11px] font-bold text-[#0b1c30]">₹{Math.round(dailyAvg).toLocaleString()} / day</span>
          </div>
        </div>
      </div>

      {/* Invoice Table Area */}
      <div className="card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#0b1c30] border-r border-[#e2e8f0] w-12 text-center">#</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#0b1c30] border-r border-[#e2e8f0]">Category</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#0b1c30] border-r border-[#e2e8f0]">Description</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#0b1c30] border-r border-[#e2e8f0]">Timeline</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#0b1c30] border-r border-[#e2e8f0]">Cost (₹)</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#0b1c30]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {invoiceItems.length > 0 ? (
                invoiceItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                    <td className="px-6 py-4 text-[12px] text-[#64748B] border-r border-[#e2e8f0] text-center font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 border-r border-[#e2e8f0]">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#f1f5f9] text-[#0b1c30]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-[#e2e8f0]">
                      <p className="text-[12px] font-medium text-[#0b1c30]">{item.title}</p>
                      <p className="text-[11px] text-[#64748B] max-w-xs truncate">{item.description}</p>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-[#64748B] border-r border-[#e2e8f0]">
                      {item.qty}
                    </td>
                    <td className="px-6 py-4 text-[12px] text-[#64748B] border-r border-[#e2e8f0] font-mono">
                      {editingRowId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input 
                            autoFocus
                            type="number"
                            className="w-20 px-2 py-1 text-xs border rounded outline-none"
                            value={rowAmountVal}
                            onChange={(e) => setRowAmountVal(e.target.value)}
                          />
                          <button onClick={() => handleSaveRowAmount(item.id, item.isSection)} className="text-[#059669] p-1"><Check className="w-4 h-4"/></button>
                          <button onClick={() => setEditingRowId(null)} className="text-[#dc2626] p-1"><X className="w-4 h-4"/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingRowId(item.id); setRowAmountVal(item.amount.toString()); }}>
                          <span className="font-medium text-[#0b1c30]">₹{item.amount.toLocaleString()}</span>
                          <Edit2 className="w-3 h-3 text-transparent group-hover:text-[#94a3b8]" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[12px] font-medium">
                      {!item.isSection && (
                        <button onClick={() => deleteExpense(trip.id, item.id)} className="text-[#94a3b8] hover:text-[#dc2626] transition-colors p-1" title="Delete custom expense">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#64748B]">
                      <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-[#94a3b8]" />
                      </div>
                      <p className="text-sm font-medium text-[#0b1c30] mb-1">No expenses tracked yet</p>
                      <p className="text-xs mb-4">Start building your itinerary to auto-generate invoice items.</p>
                      <button onClick={() => navigate('/itinerary')} className="btn-primary py-2 px-4">
                        Go to Itinerary Builder
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              
              {/* Add New Row Form */}
              {isAddingExpense && (
                <tr className="bg-[#f8fafc]">
                  <td className="px-6 py-4 border-r border-[#e2e8f0] text-center">
                    <span className="text-[10px] text-[#E8604C] font-bold">NEW</span>
                  </td>
                  <td className="px-6 py-4 border-r border-[#e2e8f0]">
                    {!isCustomCategory ? (
                      <select 
                        className="w-full bg-white border border-[#e2e8f0] rounded px-2 py-1 text-xs outline-none"
                        value={newExpense.category}
                        onChange={e => {
                          if (e.target.value === 'Custom...') {
                            setIsCustomCategory(true);
                            setNewExpense({...newExpense, category: ''});
                          } else {
                            setNewExpense({...newExpense, category: e.target.value});
                          }
                        }}
                      >
                        <option>Hotel</option>
                        <option>Travel</option>
                        <option>Activities</option>
                        <option>Meals</option>
                        <option>Miscellaneous</option>
                        <option value="Custom...">Custom...</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input 
                          autoFocus
                          placeholder="Custom Category"
                          className="w-full bg-white border border-[#e2e8f0] rounded px-2 py-1 text-xs outline-none"
                          value={newExpense.category}
                          onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                        />
                        <button 
                          onClick={() => {
                            setIsCustomCategory(false);
                            if (!newExpense.category.trim()) setNewExpense({...newExpense, category: 'Miscellaneous'});
                          }} 
                          className="text-[#94a3b8] hover:text-[#0b1c30] p-0.5"
                          title="Cancel custom category"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 border-r border-[#e2e8f0]">
                    <input 
                      placeholder="Title"
                      className="w-full mb-1 bg-white border border-[#e2e8f0] rounded px-2 py-1 text-xs outline-none"
                      value={newExpense.title}
                      onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                    />
                    <input 
                      placeholder="Description"
                      className="w-full bg-white border border-[#e2e8f0] rounded px-2 py-1 text-[10px] outline-none"
                      value={newExpense.description}
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-[#e2e8f0]">
                    <input 
                      placeholder="e.g. 1 ticket"
                      className="w-full bg-white border border-[#e2e8f0] rounded px-2 py-1 text-xs outline-none"
                      value={newExpense.qty}
                      onChange={e => setNewExpense({...newExpense, qty: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-[#e2e8f0]">
                    <input 
                      type="number"
                      placeholder="Amount"
                      className="w-20 bg-white border border-[#e2e8f0] rounded px-2 py-1 text-xs outline-none"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={handleAddExpense} className="text-[#059669] hover:bg-[#ecfdf5] p-1.5 rounded"><Check className="w-4 h-4"/></button>
                      <button onClick={() => { setIsAddingExpense(false); setIsCustomCategory(false); }} className="text-[#dc2626] hover:bg-[#fef2f2] p-1.5 rounded"><X className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Add Row Button */}
        {!isAddingExpense && (
          <div className="bg-white border-t border-[#e2e8f0] p-3 flex justify-center">
            <button 
              onClick={() => setIsAddingExpense(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0b1c30] hover:text-[#E8604C] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Custom Expense
            </button>
          </div>
        )}

        {/* Totals Section */}
        {invoiceItems.length > 0 && (
          <div className="border-t border-[#e2e8f0] p-6 bg-gradient-to-br from-[#f8fafc] to-white">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="hidden md:block text-xs text-[#64748B]">
                * Automated tax calculation is set to 5% standard GST.<br />
                * Final amounts may vary based on conversion rates.
              </div>
              <div className="w-full md:w-80 space-y-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] font-medium">Subtotal</span>
                  <span className="text-[#0b1c30] font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B] font-medium">Platform Tax (5%)</span>
                  <span className="text-[#0b1c30] font-mono">₹{tax.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-[#059669]">
                    <span className="font-medium">Discount applied</span>
                    <span className="font-mono">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-[#e2e8f0]">
                  <span className="text-[#0b1c30] font-heading font-bold text-base">Grand Total</span>
                  <span className="text-[#E8604C] font-heading font-bold text-xl tracking-tight">₹{Math.round(grandTotal).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="btn-secondary py-2.5 px-6 text-xs flex-1 sm:flex-none justify-center group">
            <Download className="w-4 h-4 text-[#64748B] group-hover:text-[#0b1c30] transition-colors" />
            Download CSV
          </button>
          <button onClick={() => window.print()} className="btn-secondary py-2.5 px-6 text-xs flex-1 sm:flex-none justify-center group">
            <Printer className="w-4 h-4 text-[#64748B] group-hover:text-[#0b1c30] transition-colors" />
            Export PDF
          </button>
        </div>
        <button
          onClick={() => setIsPaid((v) => !v)}
          className={`py-2.5 px-8 text-xs w-full sm:w-auto justify-center rounded-xl font-heading font-bold border transition-all flex items-center gap-2 shadow-sm ${
            isPaid
              ? 'bg-[#ecfdf5] text-[#059669] border-[#059669]/30 hover:bg-[#d1fae5]'
              : 'bg-[#0b1c30] text-white border-[#0b1c30] hover:bg-[#001b26] shadow-md hover:shadow-lg'
          }`}
        >
          {isPaid ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Marked as Settled
            </>
          ) : (
            'Mark as Settled'
          )}
        </button>
      </div>
    </div>
  );
}
