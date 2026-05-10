import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, DollarSign, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { apiGetBudget, apiGetTrip, extractError } from '../lib/api';

interface BudgetBreakdown {
  category: string;
  amount: number;
}

interface BudgetData {
  total_budget?: number;
  estimated_cost: number;
  breakdown: BudgetBreakdown[];
  over_budget: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  activities: '#E8604C',
  accommodation: '#3b82f6',
  food: '#f59e0b',
  transport: '#10b981',
  other: '#8b5cf6',
};

export default function ExpenseInvoice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [tripName, setTripName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([apiGetBudget(id), apiGetTrip(id)])
      .then(([budgetRes, tripRes]) => {
        setBudget(budgetRes.data ?? budgetRes);
        setTripName((tripRes.data ?? tripRes).name ?? '');
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-transition flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8604C]" />
      </div>
    );
  }

  const total = budget?.estimated_cost ?? 0;
  const budgetLimit = budget?.total_budget ?? 0;
  const remaining = budgetLimit ? budgetLimit - total : 0;
  const usedPct = budgetLimit ? Math.min((total / budgetLimit) * 100, 100) : 0;

  return (
    <div className="page-transition max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#0b1c30] font-['Montserrat']">Budget Report</h1>
          <p className="text-[#94a3b8] text-xs mt-0.5">{tripName}</p>
        </div>
        <button className="btn-secondary text-sm py-2">
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
      )}

      {!budget ? (
        <div className="card p-12 text-center">
          <DollarSign className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
          <p className="text-[#94a3b8]">No budget data available. Add activities to your trip to see estimates.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Over/Under banner */}
          {budget.over_budget ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#fef2f2] border border-[#dc2626]/15">
              <TrendingUp className="w-5 h-5 text-[#dc2626]" />
              <div>
                <p className="text-sm font-semibold text-[#dc2626]">Over Budget</p>
                <p className="text-xs text-[#64748B]">Your estimated cost exceeds the budget by ${(total - budgetLimit).toFixed(0)}</p>
              </div>
            </div>
          ) : budgetLimit > 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f0fdf4] border border-[#059669]/15">
              <TrendingDown className="w-5 h-5 text-[#059669]" />
              <div>
                <p className="text-sm font-semibold text-[#059669]">Within Budget</p>
                <p className="text-xs text-[#64748B]">You have ${remaining.toFixed(0)} remaining in your budget</p>
              </div>
            </div>
          ) : null}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="card p-5 text-center">
              <p className="text-2xl font-bold text-[#E8604C]">${total.toFixed(0)}</p>
              <p className="text-xs text-[#94a3b8] mt-1">Estimated Total</p>
            </div>
            {budgetLimit > 0 && (
              <>
                <div className="card p-5 text-center">
                  <p className="text-2xl font-bold text-[#0b1c30]">${budgetLimit.toFixed(0)}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">Budget Limit</p>
                </div>
                <div className="card p-5 text-center col-span-2 sm:col-span-1">
                  <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                    {remaining >= 0 ? '+' : ''}${remaining.toFixed(0)}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-1">Remaining</p>
                </div>
              </>
            )}
          </div>

          {/* Budget used bar */}
          {budgetLimit > 0 && (
            <div className="card p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-[#0b1c30]">Budget Used</span>
                <span className={budget.over_budget ? 'text-[#dc2626] font-bold' : 'text-[#64748B]'}>{usedPct.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${budget.over_budget ? 'bg-[#dc2626]' : 'bg-[#E8604C]'}`}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div className="card p-5">
            <h3 className="font-bold text-[#0b1c30] mb-4">Cost Breakdown</h3>
            {budget.breakdown && budget.breakdown.length > 0 ? (
              <div className="space-y-4">
                {budget.breakdown.map((item) => {
                  const pct = total > 0 ? (item.amount / total) * 100 : 0;
                  const color = CATEGORY_COLORS[item.category.toLowerCase()] ?? '#94a3b8';
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-sm font-medium text-[#334155] capitalize">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#0b1c30]">${item.amount.toFixed(0)}</span>
                          <span className="text-xs text-[#94a3b8] ml-2">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[#94a3b8] text-sm">
                  No cost breakdown available. Add activities with costs to your trip stops.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
