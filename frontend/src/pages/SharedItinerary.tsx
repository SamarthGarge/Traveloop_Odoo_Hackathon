import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ApiTrip, ApiStop } from '../store/useStore';
import { MapPin, Calendar, Clock, Loader2, Share2, Copy } from 'lucide-react';
import { apiGetPublicTrip, apiCopyPublicTrip, extractError } from '../lib/api';
import { useStore } from '../store/useStore';

export default function SharedItinerary() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useStore();

  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!token) { setError('Invalid share link.'); setLoading(false); return; }
    apiGetPublicTrip(token)
      .then((res) => setTrip(res.data ?? res))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCopy = async () => {
    if (!token) return;
    if (!isLoggedIn) { navigate('/login'); return; }
    setCopying(true);
    try {
      await apiCopyPublicTrip(token);
      setCopySuccess(true);
      setTimeout(() => navigate('/trips'), 2000);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setCopying(false);
    }
  };

  const shareUrl = `${window.location.origin}/shared/${token}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8604C]" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
          <p className="text-[#0b1c30] font-bold mb-2">Trip Not Found</p>
          <p className="text-[#94a3b8] text-sm mb-4">{error || 'This itinerary is no longer public.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Traveloop
          </button>
        </div>
      </div>
    );
  }

  const stops = (trip.stops || []).sort((a, b) => a.order_index - b.order_index);
  const duration = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E8604C] flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[#0b1c30]">Traveloop</span>
          <span className="text-[#94a3b8] text-sm hidden sm:inline">ΓÇö Shared Itinerary</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { navigator.clipboard.writeText(shareUrl); }}
            className="btn-secondary text-sm py-2"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={handleCopy}
            disabled={copying || copySuccess}
            className="btn-primary text-sm py-2"
          >
            {copying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            {copySuccess ? 'Copied to My Trips!' : 'Copy Trip'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Trip header */}
        {trip.cover_photo_url && (
          <div className="rounded-2xl overflow-hidden h-52 mb-6">
            <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0b1c30] font-['Montserrat'] mb-2">{trip.name}</h1>
          <div className="flex items-center gap-4 text-sm text-[#94a3b8]">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(trip.start_date).toLocaleDateString()} ΓåÆ {new Date(trip.end_date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {duration} days
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {stops.length} stops
            </span>
          </div>
          {trip.description && (
            <p className="text-[#64748B] mt-3 text-sm leading-relaxed">{trip.description}</p>
          )}
        </div>

        {/* Stops */}
        {stops.length === 0 ? (
          <div className="card p-8 text-center">
            <MapPin className="w-10 h-10 text-[#e2e8f0] mx-auto mb-2" />
            <p className="text-[#94a3b8]">No stops added to this itinerary.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stops.map((stop, idx) => (
              <div key={stop.id} className="card overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-[#f1f5f9]">
                  <div className="w-8 h-8 rounded-full bg-[#E8604C] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-[#0b1c30]">
                      {stop.city?.name || 'Unknown'}, {stop.city?.country || ''}
                    </p>
                    <p className="text-xs text-[#94a3b8] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(stop.arrival_date).toLocaleDateString()} ΓåÆ {new Date(stop.departure_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {stop.activities && stop.activities.length > 0 && (
                  <div className="p-4 space-y-2">
                    {stop.activities.map((sa) => (
                      <div key={sa.id} className="flex items-center gap-3 py-2 border-b border-[#f8fafc] last:border-0">
                        <div className="w-6 h-6 rounded-lg bg-[#E8604C]/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3 h-3 text-[#E8604C]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#0b1c30]">{sa.activity?.name}</p>
                          <p className="text-xs text-[#94a3b8]">
                            {sa.activity?.type}
                            {sa.scheduled_time && ` ΓÇó ${sa.scheduled_time}`}
                            {sa.activity?.cost && ` ΓÇó $${Number(sa.activity.cost).toFixed(0)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[#94a3b8] mb-3">Want to plan trips like this?</p>
          <button onClick={() => navigate('/register')} className="btn-primary">
            Create a Free Account
          </button>
        </div>
      </div>
    </div>
  );
}
