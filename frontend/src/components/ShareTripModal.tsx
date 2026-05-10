import { useState } from 'react';
import { X, Link2, Check, Send } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
}

interface ShareTripModalProps {
  trip: Trip;
  onClose: () => void;
}

const PLATFORMS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    color: '#25D366',
    bg: '#f0fdf4',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    getUrl: (text: string, url: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    color: '#000000',
    bg: '#f9fafb',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    getUrl: (text: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    bg: '#eff6ff',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    getUrl: (_text: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    color: '#2AABEE',
    bg: '#eff9fe',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    getUrl: (text: string, url: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    bg: '#eff6ff',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    getUrl: (text: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
  },
  {
    id: 'email',
    name: 'Email',
    color: '#E8604C',
    bg: '#fef2f2',
    icon: <Send className="w-5 h-5" />,
    getUrl: (text: string, url: string) =>
      `mailto:?subject=${encodeURIComponent('Check out my trip plan!')}&body=${encodeURIComponent(text + '\n\n' + url)}`,
  },
];

export default function ShareTripModal({ trip, onClose }: ShareTripModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/shared/${trip.id}`;
  const shareText = `✈️ Check out my trip plan: "${trip.name}" to ${trip.destination} (${trip.startDate} → ${trip.endDate}) — planned on Traveloop!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: typeof PLATFORMS[0]) => {
    window.open(platform.getUrl(shareText, shareUrl), '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with trip preview */}
        <div className="relative h-32 overflow-hidden">
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4">
            <p className="text-white/70 text-[10px] font-semibold tracking-widest uppercase">Share Trip</p>
            <h3 className="text-white font-bold text-lg font-heading leading-tight">{trip.name}</h3>
          </div>
        </div>

        <div className="p-6">
          {/* Trip meta */}
          <p className="text-sm text-[#64748B] mb-5">
            Share your <span className="font-semibold text-[#0b1c30]">{trip.destination}</span> adventure with friends and family!
          </p>

          {/* Platform Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleShare(platform)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-[#e2e8f0] hover:border-transparent transition-all group hover:shadow-md"
                style={{ '--hover-bg': platform.bg } as React.CSSProperties}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = platform.bg;
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '';
                  (e.currentTarget as HTMLElement).style.borderColor = '';
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ color: platform.color, backgroundColor: platform.bg }}
                >
                  {platform.icon}
                </div>
                <span className="text-[11px] font-semibold text-[#64748B] group-hover:text-[#0b1c30] transition-colors text-center leading-tight">
                  {platform.name}
                </span>
              </button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="border-t border-[#f1f5f9] pt-5">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Or copy link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl overflow-hidden">
                <Link2 className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
                <span className="text-xs text-[#64748B] truncate font-mono">{shareUrl}</span>
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  copied
                    ? 'bg-[#ecfdf5] text-[#059669] border border-[#059669]/20'
                    : 'bg-[#0b1c30] text-white hover:bg-[#1e3a4f]'
                }`}
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5" /> Copied!</>
                ) : (
                  <><Link2 className="w-3.5 h-3.5" /> Copy</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
