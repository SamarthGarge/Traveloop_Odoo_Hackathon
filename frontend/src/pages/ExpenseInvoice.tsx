import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ExpenseInvoice() {
  const navigate = useNavigate();
  const { activeTrip } = useStore();

  const trip = activeTrip || {
    name: 'Trip to Europe Adventure',
    destination: 'Paris, Rome',
    startDate: 'May 15',
    endDate: 'Jun 05, 2025',
    budget: 20000,
    spent: 22000,
    sections: [],
    createdBy: 'James',
  };

  const travelers = ['James', 'Arjun', 'Jerry', 'Cristina'];

  const invoiceItems = [
    { id: 1, category: 'hotel', description: 'hotel booking paris', qty: '3 nights', unitCost: 3000, amount: 9000 },
    { id: 2, category: 'travel', description: 'flight bookings (DEL -> PAR)', qty: '1', unitCost: 12000, amount: 12000 },
  ];

  const subtotal = invoiceItems.reduce((acc, curr) => acc + curr.amount, 0);
  const tax = subtotal * 0.05;
  const discount = 50;
  const grandTotal = subtotal + tax - discount;

  const totalBudget = trip.budget;
  const totalSpent = trip.spent;
  const remaining = totalBudget - totalSpent;
  const progressPercent = Math.min((totalSpent / totalBudget) * 100, 100);

  return (
    <div className="page-transition max-w-5xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate('/trips')}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#0b1c30] mb-6 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        back to My Trips
      </button>

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
              <h2 className="font-bold text-[#0b1c30] font-['Montserrat'] text-sm leading-tight mb-2">
                {trip.name}
              </h2>
              <p className="text-[11px] text-[#64748B] mb-1">
                {trip.startDate} - {trip.endDate} - 4 cities
              </p>
              <p className="text-[11px] text-[#64748B]">created by {trip.createdBy}</p>
            </div>
          </div>

          <div className="hidden md:block w-px bg-[#e2e8f0]"></div>

          {/* Invoice Details */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-[#0b1c30] mb-0.5">Invoice Id</p>
              <p className="text-[11px] text-[#64748B] mb-4">INV-xyz-30290</p>

              <p className="text-[11px] font-semibold text-[#0b1c30] mb-1">Traveler Details:</p>
              <div className="text-[11px] text-[#64748B] space-y-0.5">
                {travelers.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#0b1c30] mb-0.5">Generated date</p>
              <p className="text-[11px] text-[#64748B] mb-4">May 20, 2025</p>

              <p className="text-[11px] text-[#0b1c30]">
                Payment status - <span className="text-[#E8604C] font-medium">pending</span>
              </p>
            </div>
          </div>
        </div>

        {/* Budget Insights */}
        <div className="card p-6">
          <h3 className="font-bold text-[#0b1c30] font-['Montserrat'] text-sm mb-6">
            budget Insights
          </h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#001b26"
                  strokeWidth="2"
                  strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
                />
                {/* Visual marker line matching the wireframe */}
                <line x1="18" y1="18" x2="18" y2="2" stroke="#0b1c30" strokeWidth="1" transform="rotate(90 18 18)" />
                <line x1="18" y1="18" x2="18" y2="2" stroke="#0b1c30" strokeWidth="1" transform="rotate(180 18 18)" />
              </svg>
            </div>
            <div className="text-[11px] space-y-1">
              <p>
                <span className="text-[#64748B]">Total Budget:</span>{' '}
                <span className="font-medium text-[#0b1c30]">{totalBudget}</span>
              </p>
              <p>
                <span className="text-[#64748B]">total spent:</span>{' '}
                <span className="font-medium text-[#0b1c30]">{totalSpent}</span>
              </p>
              <p>
                <span className="text-[#64748B]">Remaining:</span>{' '}
                <span className={`font-medium ${remaining < 0 ? 'text-[#E8604C]' : 'text-[#059669]'}`}>
                  {remaining}
                </span>
              </p>
            </div>
          </div>
          <button className="w-full py-2 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#0b1c30] hover:bg-[#f1f5f9] transition-colors">
            View Full Budget
          </button>
        </div>
      </div>

      {/* Invoice Table Area */}
      <div className="card overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-[#e2e8f0] bg-[#f8fafc]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-medium text-[#0b1c30] border-r border-[#e2e8f0] w-12 text-center">#</th>
                <th className="px-6 py-4 text-[12px] font-medium text-[#0b1c30] border-r border-[#e2e8f0]">Category</th>
                <th className="px-6 py-4 text-[12px] font-medium text-[#0b1c30] border-r border-[#e2e8f0]">Description</th>
                <th className="px-6 py-4 text-[12px] font-medium text-[#0b1c30] border-r border-[#e2e8f0]">Qty/details</th>
                <th className="px-6 py-4 text-[12px] font-medium text-[#0b1c30] border-r border-[#e2e8f0]">Unit Cost</th>
                <th className="px-6 py-4 text-[12px] font-medium text-[#0b1c30]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {invoiceItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8fafc]/50">
                  <td className="px-6 py-4 text-[12px] text-[#64748B] border-r border-[#e2e8f0] text-center">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 text-[12px] text-[#64748B] border-r border-[#e2e8f0]">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 text-[12px] text-[#64748B] border-r border-[#e2e8f0]">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-[12px] text-[#64748B] border-r border-[#e2e8f0]">
                    {item.qty}
                  </td>
                  <td className="px-6 py-4 text-[12px] text-[#64748B] border-r border-[#e2e8f0]">
                    {item.unitCost}
                  </td>
                  <td className="px-6 py-4 text-[12px] text-[#64748B]">
                    {item.amount}
                  </td>
                </tr>
              ))}
              {/* Empty Rows for visual spacing matching wireframe */}
              {[...Array(3)].map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="px-6 py-6 border-r border-[#e2e8f0]"></td>
                  <td className="px-6 py-6 border-r border-[#e2e8f0]"></td>
                  <td className="px-6 py-6 border-r border-[#e2e8f0]"></td>
                  <td className="px-6 py-6 border-r border-[#e2e8f0]"></td>
                  <td className="px-6 py-6 border-r border-[#e2e8f0]"></td>
                  <td className="px-6 py-6"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="border-t border-[#e2e8f0] p-6 bg-[#f8fafc]">
          <div className="flex justify-end pr-8">
            <div className="w-64 space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#0b1c30]">Subtotal</span>
                <span className="text-[#0b1c30]">$ {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#0b1c30]">tax(5%)</span>
                <span className="text-[#0b1c30]">$ {tax}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-[#0b1c30]">Discount</span>
                <span className="text-[#0b1c30]">$ {discount}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#e2e8f0]">
                <span className="text-[#0b1c30]">Grand Total</span>
                <span className="text-[#0b1c30]">$ {grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="btn-secondary py-2.5 px-6 text-xs flex-1 sm:flex-none justify-center">
            Download Invoice
          </button>
          <button className="btn-secondary py-2.5 px-6 text-xs flex-1 sm:flex-none justify-center">
            Export as PDF
          </button>
        </div>
        <button className="btn-secondary py-2.5 px-8 text-xs w-full sm:w-auto justify-center">
          Mark as paid
        </button>
      </div>
    </div>
  );
}
