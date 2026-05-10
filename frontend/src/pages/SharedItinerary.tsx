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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Public Header - No sidebar, simplified navigation */}
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#001b26] flex items-center justify-center">
              <span className="text-white font-bold font-heading">T</span>
            </div>
            <span className="font-bold text-[#0b1c30] font-heading tracking-tight">Traveloop</span>
          </div>
          <span className="font-bold text-[#0b1c30]">Traveloop</span>
          <span className="text-[#94a3b8] text-sm hidden sm:inline">— Shared Itinerary</span>
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
              {new Date(trip.start_date).toLocaleDateString()} → {new Date(trip.end_date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {duration} days
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {stops.length} stops
            </span>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#001b26] border border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#E8604C] text-white hover:bg-[#ae311e] transition-colors shadow-sm"
            >
              Copy Trip
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 border border-[#e2e8f0] shadow-sm">
          <img 
            src={trip.coverImage || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200'} 
            alt={trip.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001b26]/90 via-[#001b26]/40 to-transparent flex flex-col justify-end p-6 md:p-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {trip.destination}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {trip.startDate} to {trip.endDate}</span>
              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Est. ₹{trip.budget}</span>
            </div>
                  </div>
                  <div>
                    <p className="font-bold text-[#0b1c30]">
                      {stop.city?.name || 'Unknown'}, {stop.city?.country || ''}
                    </p>
                    <p className="text-xs text-[#94a3b8] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(stop.arrival_date).toLocaleDateString()} → {new Date(stop.departure_date).toLocaleDateString()}
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
                            {sa.scheduled_time && ` • ${sa.scheduled_time}`}
                            {sa.activity?.cost && ` • $${Number(sa.activity.cost).toFixed(0)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-[#0b1c30] font-heading mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#E8604C]" />
                Share this Trip
              </h3>
              
              <div className="space-y-4">
                <button 
                  onClick={handleCopyLink}
                  className={`w-full py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    copied 
                      ? 'bg-[#ecfdf5] border-[#059669]/20 text-[#059669]' 
                      : 'border-[#e2e8f0] text-[#0b1c30] hover:bg-[#f1f5f9]'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </button>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors flex items-center justify-center">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="flex-1 py-2.5 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors flex items-center justify-center">
                    <Twitter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#e2e8f0]">
                <h3 className="font-bold text-[#0b1c30] font-heading text-sm mb-2">Like this trip?</h3>
                <p className="text-xs text-[#64748B] mb-4">
                  Copy this itinerary to your own Traveloop account and customize it for your needs.
                </p>
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Trip to My Account
                </button>
              </div>
            </div>
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
