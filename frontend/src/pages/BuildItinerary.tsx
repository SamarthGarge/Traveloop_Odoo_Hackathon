import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ApiTrip, ApiStop, ApiCity, ApiActivity } from '../store/useStore';
import {
  ArrowLeft, Plus, Trash2, MapPin, Calendar, Search, ChevronRight,
  Loader2, Check,
} from 'lucide-react';
import {
  apiGetTrip, apiSearchCities, apiGetCityActivities,
  apiCreateStop, apiDeleteStop, apiAddStopActivity,
  apiDeleteStopActivity, extractError,
} from '../lib/api';

export default function BuildItinerary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [stops, setStops] = useState<ApiStop[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<ApiCity | null>(null);
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [addingStop, setAddingStop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stopForm, setStopForm] = useState({ arrival: '', departure: '' });
  const [showAddStop, setShowAddStop] = useState(false);

  // fetch trip + stops
  const loadTrip = () => {
    if (!id) return;
    setLoading(true);
    apiGetTrip(id)
      .then((res) => {
        const t = res.data ?? res;
        setTrip(t);
        setStops(t.stops || []);
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
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
          <h1 className="text-xl font-bold text-[#0b1c30] font-['Montserrat']">Build Itinerary</h1>
          <p className="text-[#64748B] text-sm">{trip?.name}</p>
        </div>
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
            <h2 className="font-bold text-[#0b1c30]">Stops ({stops.length})</h2>
            <button
              onClick={() => setShowAddStop(!showAddStop)}
              className="btn-primary text-sm py-2"
            >
              <Plus className="w-4 h-4" /> Add Stop
            </button>
          </div>

          {/* Add Stop Form */}
          {showAddStop && (
            <div className="card p-5 mb-4 border-2 border-[#E8604C]/20">
              <h3 className="font-semibold text-[#0b1c30] mb-4">New Stop</h3>
              <div className="mb-3">
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Search City</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => { setCitySearch(e.target.value); setSelectedCity(null); }}
                    placeholder="e.g., Paris, Tokyo..."
                    className="input-field pl-9 text-sm"
                  />
                </div>
                {cities.length > 0 && !selectedCity && (
                  <div className="mt-1 border border-[#e2e8f0] rounded-xl overflow-hidden max-h-40 overflow-y-auto bg-white shadow-lg z-10 relative">
                    {cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 8).map((city) => (
                      <button
                        key={city.id}
                        onClick={() => { setSelectedCity(city); setCitySearch(city.name); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#f1f5f9] flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#E8604C]" />
                        {city.name}, {city.country}
                      </button>
                    ))}
                  </div>
                )}
                {selectedCity && (
                  <div className="mt-2 px-3 py-2 bg-[#E8604C]/10 rounded-lg text-sm text-[#E8604C] font-medium">
                    <Check className="w-3.5 h-3.5 inline mr-1" />
                    {selectedCity.name}, {selectedCity.country}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Arrival</label>
                  <input
                    type="date" value={stopForm.arrival} min={trip?.start_date?.split('T')[0] || today}
                    max={trip?.end_date?.split('T')[0]}
                    onChange={(e) => setStopForm((f) => ({ ...f, arrival: e.target.value }))}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Departure</label>
                  <input
                    type="date" value={stopForm.departure} min={stopForm.arrival || today}
                    max={trip?.end_date?.split('T')[0]}
                    onChange={(e) => setStopForm((f) => ({ ...f, departure: e.target.value }))}
                    className="input-field text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowAddStop(false); setSelectedCity(null); setCitySearch(''); }} className="btn-secondary text-sm flex-1">Cancel</button>
                <button
                  onClick={handleAddStop}
                  disabled={!selectedCity || !stopForm.arrival || !stopForm.departure || addingStop}
                  className="btn-primary text-sm flex-1 disabled:opacity-50"
                >
                  {addingStop ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Stop'}
                </button>
              </div>
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
                          {new Date(stop.arrival_date).toLocaleDateString()} ΓåÆ {new Date(stop.departure_date).toLocaleDateString()}
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
