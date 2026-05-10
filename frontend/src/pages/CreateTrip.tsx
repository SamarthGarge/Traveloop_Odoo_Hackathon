import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Select from 'react-select';
import { Country, City } from 'country-state-city';
import {
  ArrowLeft, MapPin, Calendar, Camera, Plus, Sparkles, Loader2,
} from 'lucide-react';
import { apiCreateTrip, extractError } from '../lib/api';

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '46px',
    borderRadius: '0.75rem',
    borderWidth: '1px',
    borderColor: state.isFocused ? 'transparent' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(0, 27, 38, 0.08)' : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    '&:hover': { borderColor: state.isFocused ? 'transparent' : '#94a3b8' },
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#001b26' : state.isFocused ? '#f1f5f9' : 'white',
    color: state.isSelected ? '#ffffff' : '#0b1c30',
    cursor: 'pointer',
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
    zIndex: 50,
  }),
  singleValue: (p: any) => ({ ...p, color: '#0b1c30' }),
  placeholder: (p: any) => ({ ...p, color: '#94a3b8' }),
};

export default function CreateTrip() {
  const navigate = useNavigate();
  const { setActiveTrip } = useStore();

  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    coverImage: '',
  });
  const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string } | null>(null);
  const [step, setStep] = useState(1);
  const [dateError, setDateError] = useState('');

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    []
  );
  const cityOptions = useMemo(
    () =>
      selectedCountry
        ? City.getCitiesOfCountry(selectedCountry.value)?.map((c) => ({ value: c.name, label: c.name })) || []
        : [],
    [selectedCountry]
  );

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.destination || !form.startDate || !form.endDate) return;
    const dest = destinations.find((d) => form.destination.includes(d.name));
    createTrip({
      name: form.name,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
      coverImage: form.coverImage || dest?.image || '/images/dest-paris.jpg',
      status: 'upcoming',
      budget: 5000,
      spent: 0,
      createdBy: 'James Wilson',
    });
    navigate('/trips');
  };

  const today = new Date().toISOString().split('T')[0];
  const destinationLabel = selectedCity && selectedCountry
    ? `${selectedCity.label}, ${selectedCountry.label}`
    : '';

  return (
    <div className="page-transition max-w-3xl">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-[#94a3b8] hover:text-[#0b1c30] mb-6 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="card overflow-hidden">
        {/* Progress Steps */}
        <div className="flex border-b border-[#f1f5f9]">
          {['Trip Details', 'Dates & Place', 'Suggestions'].map((label, i) => (
            <div
              key={label}
              className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
                step >= i + 1 ? 'text-[#E8604C] border-b-2 border-[#E8604C]' : 'text-[#94a3b8]'
              }`}
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-2 ${
                step >= i + 1 ? 'bg-[#E8604C] text-white' : 'bg-[#f1f5f9] text-[#94a3b8]'
              }`}>
                {i + 1}
              </span>
              {label}
            </div>
          ))}
        </div>

        <div className="p-6 lg:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
          )}

          {/* Step 1: Trip Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0b1c30] font-['Montserrat'] mb-1">Name your trip</h2>
                <p className="text-[#64748B] text-sm">Give your adventure a memorable name</p>
              </div>

              <div className="border-2 border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center hover:border-[#E8604C]/40 transition-colors cursor-pointer">
                <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Upload a cover photo</p>
                <p className="text-xs text-gray-400 mt-1">Optional</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Trip Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., European Adventure 2025"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of your trip..."
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Total Budget ($)</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                  placeholder="e.g., 5000"
                  className="input-field"
                  min="0"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.name}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Dates & Place */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#0b1c30] font-['Montserrat'] mb-1">When and where?</h2>
                <p className="text-[#64748B] text-sm">Set your travel dates and destination</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-1">Name your trip</h2>
                  <p className="text-[#64748B] text-sm">Give your adventure a memorable name</p>
                </div>

                {/* Cover Photo Upload */}
                <div className="relative border-2 border-dashed border-[#e2e8f0] rounded-2xl text-center hover:border-[#E8604C]/40 transition-colors cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleChange('coverImage', URL.createObjectURL(file));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {form.coverImage ? (
                    <img src={form.coverImage} alt="Cover Preview" className="w-full h-40 object-cover" />
                  ) : (
                    <div className="p-8">
                      <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Upload a cover photo</p>
                      <p className="text-xs text-gray-400 mt-1">Optional</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin className="w-4 h-4 inline mr-1 text-transparent" /> City
                  </label>
                  <Select
                    options={cityOptions} value={selectedCity}
                    onChange={(option) => setSelectedCity(option)}
                    isDisabled={!selectedCountry}
                    styles={customSelectStyles}
                    placeholder={selectedCountry ? 'Search city...' : 'Select country first'}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" /> Start Date *
                  </label>
                  <input
                    type="date" value={form.startDate} min={today}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" /> End Date *
                  </label>
                  <input
                    type="date" value={form.endDate} min={form.startDate || today}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-1">When and where?</h2>
                  <p className="text-[#64748B] text-sm">Set your travel dates and destination</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Country *
                    </label>
                    <Select
                      options={countryOptions}
                      value={selectedCountry}
                      onChange={(option) => {
                        setSelectedCountry(option);
                        setSelectedCity(null);
                        handleChange('destination', '');
                        setSelectedPlace('');
                      }}
                      styles={customSelectStyles}
                      placeholder="Search country..."
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="w-4 h-4 inline mr-1 text-transparent" />
                      City *
                    </label>
                    <Select
                      options={cityOptions}
                      value={selectedCity}
                      onChange={(option) => {
                        setSelectedCity(option);
                        const dest = option ? `${option.label}, ${selectedCountry?.label}` : '';
                        handleChange('destination', dest);
                        setSelectedPlace(option?.label || '');
                      }}
                      isDisabled={!selectedCountry}
                      styles={customSelectStyles}
                      placeholder={selectedCountry ? "Search city..." : "Select country first"}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      min={today}
                      onChange={(e) => {
                        handleChange('startDate', e.target.value);
                        if (form.endDate && e.target.value >= form.endDate) {
                          setDateError('End date must be after the start date.');
                        } else {
                          setDateError('');
                        }
                      }}
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
                      min={form.startDate || today}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (form.startDate && val && val <= form.startDate) {
                          setDateError('End date must be after the start date.');
                        } else {
                          setDateError('');
                        }
                        handleChange('endDate', val);
                      }}
                      className="input-field"
                    />
                    {dateError && (
                      <p className="text-xs text-[#dc2626] mt-1.5 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {dateError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(1)} className="btn-secondary">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => { setStep(3); setShowSuggestions(true); }}
                    disabled={!form.destination || !form.startDate || !form.endDate || !!dateError}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-1">Suggested Activities</h2>
                  <p className="text-[#64748B] text-sm">
                    Popular activities in {selectedPlace || form.destination || 'your destination'}
                  </p>
                </div>
                {destinationLabel && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Destination</span>
                    <span className="font-semibold text-[#0b1c30]">{destinationLabel}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Dates</span>
                  <span className="font-semibold text-[#0b1c30]">
                    {new Date(form.startDate).toLocaleDateString()} → {new Date(form.endDate).toLocaleDateString()}
                  </span>
                </div>
                {form.budget && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Budget</span>
                    <span className="font-semibold text-[#E8604C]">${Number(form.budget).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="bg-[#E8604C]/5 rounded-xl p-4 border border-[#E8604C]/15">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#E8604C] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#0b1c30]">
                      After creating, you'll be taken to the Itinerary Builder
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Add stops, cities, and activities to build your perfect trip.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button onClick={() => setStep(2)} className="btn-secondary">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Trip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
