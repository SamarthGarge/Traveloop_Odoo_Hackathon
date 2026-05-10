import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { destinations } from '../data/destinations';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Camera,
  Plus,
  Sparkles,
} from 'lucide-react';

export default function CreateTrip() {
  const navigate = useNavigate();
  const createTrip = useStore((s) => s.createTrip);
  const [form, setForm] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [selectedPlace, setSelectedPlace] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.destination || !form.startDate || !form.endDate) return;
    const dest = destinations.find((d) => d.name === form.destination);
    createTrip({
      name: form.name,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
      coverImage: dest?.image || '/images/dest-paris.jpg',
      status: 'upcoming',
      budget: 5000,
      spent: 0,
      createdBy: 'James Wilson',
    });
    navigate('/trips');
  };

  const suggestions = destinations.filter((d) =>
    !selectedPlace || d.name !== selectedPlace
  );

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Progress Steps */}
          <div className="flex border-b border-gray-100">
            {['Trip Details', 'Dates & Place', 'Suggestions'].map((label, i) => (
              <div
                key={label}
                className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
                  step >= i + 1 ? 'text-[#5b7f74] border-b-2 border-[#5b7f74]' : 'text-gray-400'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-2 ${
                  step >= i + 1 ? 'bg-[#5b7f74] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>

          <div className="p-6 lg:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">Name your trip</h2>
                  <p className="text-gray-500 text-sm">Give your adventure a memorable name</p>
                </div>

                {/* Cover Photo Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#ffcc66] transition-colors cursor-pointer">
                  <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Upload a cover photo</p>
                  <p className="text-xs text-gray-400 mt-1">Optional</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Trip Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., European Adventure 2025"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of your trip..."
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!form.name}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">When and where?</h2>
                  <p className="text-gray-500 text-sm">Set your travel dates and destination</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Select a Place *
                  </label>
                  <select
                    value={form.destination}
                    onChange={(e) => {
                      handleChange('destination', e.target.value);
                      setSelectedPlace(e.target.value);
                    }}
                    className="input-field"
                  >
                    <option value="">Choose a destination...</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}, {d.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(1)} className="btn-secondary !text-gray-600 !border-gray-200">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => { setStep(3); setShowSuggestions(true); }}
                    disabled={!form.destination || !form.startDate || !form.endDate}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">Suggested Activities</h2>
                  <p className="text-gray-500 text-sm">
                    Popular activities in {form.destination || 'your destination'}
                  </p>
                </div>

                {showSuggestions && selectedPlace && (
                  <div className="bg-[#ffcc66]/10 rounded-xl p-4 border border-[#ffcc66]/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[#ffcc66] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">
                          AI-powered suggestions for {selectedPlace}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on your destination, here are recommended activities and experiences.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {suggestions.slice(0, 5).map((dest) => (
                    <div
                      key={dest.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-[#ffcc66]/50 hover:bg-[#ffcc66]/5 transition-all cursor-pointer"
                    >
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-[#1a1a1a]">{dest.name}</h4>
                        <p className="text-sm text-gray-500">{dest.activities.slice(0, 3).join(', ')}</p>
                      </div>
                      <button className="p-2 rounded-full bg-[#5b7f74]/10 text-[#5b7f74] hover:bg-[#5b7f74]/20">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button onClick={() => setStep(2)} className="btn-secondary !text-gray-600 !border-gray-200">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button onClick={handleSubmit} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Create Trip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
