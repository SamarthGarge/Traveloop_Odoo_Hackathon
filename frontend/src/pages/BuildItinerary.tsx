import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Plus,
  Calendar,
  DollarSign,
  Trash2,
  GripVertical,
  Save,
  X,
  MapPin,
} from 'lucide-react';
import {
  apiGetTrip, apiSearchCities, apiGetCityActivities,
  apiCreateStop, apiDeleteStop, apiAddStopActivity,
  apiDeleteStopActivity, extractError,
} from '../lib/api';

export default function BuildItinerary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeTrip, setActiveTrip, trips } = useStore();
  const [sections, setSections] = useState(
    activeTrip?.sections || []
  );

  useEffect(() => {
    if (activeTrip) {
      setSections(activeTrip.sections || []);
    }
  }, [activeTrip]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    dateRange: '',
    budget: '',
    city: '',
    activities: '',
  });

  const handleAddSection = () => {
    if (!newSection.title) return;
    const section = {
      id: Date.now().toString(),
      title: newSection.title,
      description: newSection.description,
      dateRange: newSection.dateRange,
      budget: Number(newSection.budget) || 0,
      city: newSection.city,
      activities: newSection.activities.split(',').map(a => a.trim()).filter(Boolean),
    };
    setSections([...sections, section]);
    setNewSection({ title: '', description: '', dateRange: '', budget: '', city: '', activities: '' });
    setShowAdd(false);
  };
  useEffect(() => { loadTrip(); }, [id]);

  // fetch cities
  useEffect(() => {
    apiSearchCities({ q: citySearch, limit: 20 })
      .then((res) => setCities((res.data ?? res) as ApiCity[]))
      .catch(() => {});
  }, [citySearch]);

  // fetch activities when city is selected
  useEffect(() => {
    if (!selectedCity) { setActivities([]); return; }
    setLoadingActivities(true);
    apiGetCityActivities(selectedCity.id)
      .then((res) => setActivities((res.data ?? res) as ApiActivity[]))
      .catch(() => setActivities([]))
      .finally(() => setLoadingActivities(false));
  }, [selectedCity]);

  const handleAddStop = async () => {
    if (!id || !selectedCity || !stopForm.arrival || !stopForm.departure) return;
    setAddingStop(true);
    try {
      await apiCreateStop(id, {
        city_id: selectedCity.id,
        arrival_date: stopForm.arrival,
        departure_date: stopForm.departure,
      });
      setShowAddStop(false);
      setSelectedCity(null);
      setStopForm({ arrival: '', departure: '' });
      loadTrip();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setAddingStop(false);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!id || !confirm('Remove this stop?')) return;
    try {
      await apiDeleteStop(id, stopId);
      setStops((prev) => prev.filter((s) => s.id !== stopId));
    } catch (err) {
      setError(extractError(err));
    }
  };

  const handleAddActivity = async (stopId: string, activityId: string) => {
    if (!id) return;
    try {
      await apiAddStopActivity(id, stopId, { activity_id: activityId });
      loadTrip();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const handleRemoveActivity = async (stopId: string, saId: string) => {
    if (!id) return;
    try {
      await apiDeleteStopActivity(id, stopId, saId);
      loadTrip();
    } catch (err) {
      setError(extractError(err));
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="page-transition flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8604C]" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <select
              value={activeTrip?.id || ''}
              onChange={(e) => {
                const trip = trips.find((t) => t.id === e.target.value);
                if (trip) setActiveTrip(trip);
              }}
              className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading bg-transparent border-b-2 border-transparent hover:border-[#E8604C]/30 focus:border-[#E8604C] outline-none cursor-pointer pb-1 pr-8 appearance-none"
              style={{ background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right center` }}
            >
              <option value="" disabled>Select a trip</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id} className="text-base font-medium">
                  {trip.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[#64748B] text-sm mt-1">
            {sections.length} sections • Total budget: ${totalBudget.toLocaleString()}
          </p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" />
          Save Itinerary
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="card p-5 group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 text-[#e2e8f0] cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#001b26] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[#0b1c30] font-heading">{section.title}</h3>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-[#64748B] mb-3">{section.description}</p>
                {section.city && (
                  <div className="mb-2 text-sm text-[#0b1c30] font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E8604C]" />
                    {section.city}
                  </div>
                )}
                {section.activities && section.activities.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {section.activities.map((act, i) => (
                      <span key={i} className="px-2 py-1 bg-[#f1f5f9] text-[#64748B] rounded-md text-xs">
                        {act}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-[#94a3b8]">
                    <Calendar className="w-3.5 h-3.5" />
                    {section.dateRange}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#E8604C] font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    ${section.budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Section */}
      {!showAdd ? (
        <button
          onClick={() => navigate(`/trips/${id}/view`)}
          className="ml-auto btn-primary text-sm"
        >
          View Itinerary <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Stops */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0b1c30] font-heading">New Section</h3>
            <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              placeholder="Section title (e.g., Hotel Stay, Flight, Activity)"
              className="input-field"
            />
            <textarea
              rows={2}
              value={newSection.description}
              onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
              placeholder="Description of this section..."
              className="input-field resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newSection.city}
                onChange={(e) => setNewSection({ ...newSection, city: e.target.value })}
                placeholder="City/Destination"
                className="input-field"
              />
              <input
                type="text"
                value={newSection.activities}
                onChange={(e) => setNewSection({ ...newSection, activities: e.target.value })}
                placeholder="Activities (comma separated)"
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newSection.dateRange}
                onChange={(e) => setNewSection({ ...newSection, dateRange: e.target.value })}
                placeholder="Date range (e.g., Jun 10-14)"
                className="input-field"
              />
              <input
                type="number"
                value={newSection.budget}
                onChange={(e) => setNewSection({ ...newSection, budget: e.target.value })}
                placeholder="Budget (₹)"
                className="input-field"
              />
            </div>
          )}

          {/* Stops List */}
          {stops.length === 0 ? (
            <div className="card p-8 text-center">
              <MapPin className="w-10 h-10 text-[#e2e8f0] mx-auto mb-2" />
              <p className="text-[#94a3b8] text-sm">Add your first destination stop</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stops.sort((a, b) => a.order_index - b.order_index).map((stop, idx) => (
                <div key={stop.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E8604C] flex items-center justify-center text-white text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0b1c30]">
                          {stop.city?.name || 'Unknown City'}, {stop.city?.country || ''}
                        </p>
                        <p className="text-xs text-[#94a3b8] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(stop.arrival_date).toLocaleDateString()} → {new Date(stop.departure_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Activities on this stop */}
                  {stop.activities && stop.activities.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#f1f5f9] space-y-1.5">
                      {stop.activities.map((sa) => (
                        <div key={sa.id} className="flex items-center justify-between text-xs">
                          <span className="text-[#64748B]">{sa.activity?.name}</span>
                          <button
                            onClick={() => handleRemoveActivity(stop.id, sa.id)}
                            className="text-[#94a3b8] hover:text-[#dc2626] transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add activity button */}
                  <button
                    onClick={() => setSelectedCity(stop.city || null)}
                    className="mt-3 w-full py-1.5 border border-dashed border-[#e2e8f0] rounded-lg text-xs text-[#94a3b8] hover:border-[#E8604C] hover:text-[#E8604C] transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Activity
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Activity Picker */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#0b1c30]">
              {selectedCity ? `Activities in ${selectedCity.name}` : 'Select a Stop to Add Activities'}
            </h2>
          </div>

          {!selectedCity ? (
            <div className="card p-8 text-center">
              <Search className="w-10 h-10 text-[#e2e8f0] mx-auto mb-2" />
              <p className="text-[#94a3b8] text-sm">Click "Add Activity" on a stop to browse activities</p>
            </div>
          ) : loadingActivities ? (
            <div className="card p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#E8604C] mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const stopForCity = stops.find((s) => s.city?.id === selectedCity.id || s.city_id === selectedCity.id);
                const alreadyAdded = stopForCity?.activities?.some((sa) => sa.activity_id === activity.id);
                return (
                  <div key={activity.id} className="card p-4 flex items-center gap-4">
                    <img
                      src={activity.image_url || '/images/dest-paris.jpg'}
                      alt={activity.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0b1c30] text-sm">{activity.name}</p>
                      <p className="text-xs text-[#94a3b8] mt-0.5">{activity.type}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                        <span className="font-semibold text-[#E8604C]">${Number(activity.cost).toFixed(0)}</span>
                        {activity.duration_mins && <span>{Math.round(activity.duration_mins / 60)}h</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => stopForCity && !alreadyAdded && handleAddActivity(stopForCity.id, activity.id)}
                      disabled={!stopForCity || alreadyAdded}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                        alreadyAdded
                          ? 'bg-[#E8604C]/10 text-[#E8604C] cursor-default'
                          : stopForCity
                          ? 'bg-[#E8604C] text-white hover:bg-[#ae311e]'
                          : 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed'
                      }`}
                    >
                      {alreadyAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <div className="card p-8 text-center">
                  <p className="text-[#94a3b8] text-sm">No activities found for {selectedCity.name}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
