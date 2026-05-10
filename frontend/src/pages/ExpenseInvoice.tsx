import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Receipt,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ExpenseInvoice() {
  const navigate = useNavigate();
  const { activeTrip } = useStore();

  const trip = activeTrip || {
    name: 'Trip to Europe Adventure',
    destination: 'Paris, Rome',
    startDate: '2025-06-10',
    endDate: '2025-06-20',
    budget: 20000,
    spent: 22000,
    sections: [
      { id: '1', title: 'Hotel Booking Paris', description: '3 nights accommodation', dateRange: 'Jun 10-13', budget: 9000 },
      { id: '2', title: 'Flights DEL-PAR', description: 'Round trip flights', dateRange: 'Jun 10', budget: 12000 },
      { id: '3', title: 'Rome Accommodation', description: '4 nights in Rome', dateRange: 'Jun 14-18', budget: 6000 },
      { id: '4', title: 'Food & Dining', description: 'Restaurants and meals', dateRange: 'Jun 10-20', budget: 3000 },
    ],
    createdBy: 'James',
  };

  const invoiceItems = trip.sections.map((s, i) => ({
    id: i + 1,
    category: i % 2 === 0 ? 'Hotel' : 'Travel',
    description: s.title,
    qty: i % 2 === 0 ? `${i + 2} nights` : `${i + 1} ticket(s)`,
    unitCost: Math.round(s.budget / ((i % 2 === 0 ? i + 2 : i + 1) || 1)),
    amount: s.budget,
  }));

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.round(subtotal * 0.05);
  const discount = 50;
  const grandTotal = subtotal + tax - discount;

  const chartData = trip.sections.map((s) => ({
    name: s.title.length > 15 ? s.title.substring(0, 15) + '...' : s.title,
    budget: s.budget,
  }));

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/itinerary/view')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Itinerary
        </button>

        {/* Invoice Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-[#00202a] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="w-6 h-6 text-[#ffcc66]" />
              <h1 className="text-xl font-bold text-white">Expense Invoice</h1>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Payment Pending
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Trip</p>
                <p className="font-semibold text-[#1a1a1a]">{trip.name}</p>
                <p className="text-sm text-gray-500">{trip.startDate} - {trip.endDate}</p>
                <p className="text-sm text-gray-500">{trip.destination} - {trip.sections.length} cities</p>
                <p className="text-sm text-gray-500 mt-1">Created by {trip.createdBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Invoice ID</p>
                <p className="font-mono text-sm text-[#1a1a1a]">INV-xyz-30290</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 mt-3">Generated</p>
                <p className="text-sm text-[#1a1a1a]">May 20, 2025</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Travelers</p>
                <div className="flex -space-x-2 mb-3">
                  {['James', 'Arjun', 'Jerry', 'Cristina'].map((name) => (
                    <div key={name} className="w-8 h-8 rounded-full bg-[#5b7f74] border-2 border-white flex items-center justify-center text-xs text-white font-medium">
                      {name[0]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">James, Arjun, Jerry, Cristina</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Qty/Details</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{item.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#5b7f74]/10 text-[#5b7f74] text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1a1a1a]">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.qty}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">${item.unitCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#1a1a1a] text-right">${item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 p-6">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (5%)</span>
                <span className="font-medium">${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-green-600">-${discount.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="font-semibold text-[#1a1a1a]">Grand Total</span>
                <span className="font-bold text-xl text-[#00202a]">${grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1a1a1a] mb-4">Budget Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Budget</span>
                <span className="font-bold text-[#1a1a1a]">${trip.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Spent</span>
                <span className="font-bold text-[#ff9966]">${trip.spent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Remaining</span>
                <span className={`font-bold ${trip.budget - trip.spent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ${(trip.budget - trip.spent).toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff9966] rounded-full"
                  style={{ width: `${Math.min((trip.spent / trip.budget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1a1a1a] mb-4">Expense by Category</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Bar dataKey="budget" fill="#5b7f74" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary">
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
          <button className="btn-secondary !text-gray-600 !border-gray-200">
            <FileText className="w-4 h-4" />
            Export as PDF
          </button>
          <button className="btn-secondary !text-gray-600 !border-gray-200 ml-auto">
            <CheckCircle className="w-4 h-4" />
            Mark as Paid
          </button>
        </div>
      </div>
    </div>
  );
}
