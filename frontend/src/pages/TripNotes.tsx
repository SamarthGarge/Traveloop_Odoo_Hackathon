import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Share2,
  Save,
  Bold,
  Italic,
  Underline,
  List,
  Image,
  MapPin,
  Calendar,
  Plus,
  CheckSquare,
  Upload,
  Flag,
} from 'lucide-react';

export default function TripNotes() {
  const navigate = useNavigate();
  const { activeTrip } = useStore();
  const [activeDay, setActiveDay] = useState(0);
  const [noteContent, setNoteContent] = useState('');

  const days = [
    { label: 'Day 3: Arashiyama', active: true },
    { label: 'Day 4: Gion', active: false },
    { label: 'Day 5: Nara', active: false },
  ];

  const reminders = [
    { text: 'Buy tickets for the Bamboo Grove train in advance.', done: false },
    { text: 'Pack extra battery pack for photos.', done: true },
  ];

  const photos = [
    '/images/dest-tokyo.jpg',
    '/images/dest-kyoto.jpg',
    '/images/dest-osaka.jpg',
  ];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase mb-1">JAPAN 2024</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-['Montserrat']">
            {activeTrip?.name || 'Kyoto Reflections'}
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary py-2.5 text-sm">
            <Share2 className="w-4 h-4" /> Share Notes
          </button>
          <button className="btn-primary py-2.5 text-sm">
            <Save className="w-4 h-4" /> Save Entry
          </button>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeDay === i
                ? 'bg-[#f1f5f9] text-[#0b1c30] border border-[#e2e8f0]'
                : 'text-[#94a3b8] hover:text-[#64748B]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {day.label}
          </button>
        ))}
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[#94a3b8] hover:text-[#64748B] transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Day
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-3 border-b border-[#f1f5f9]">
              {[Bold, Italic, Underline].map((Icon, i) => (
                <button key={i} className="p-2 rounded-lg text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
              <div className="w-px h-5 bg-[#e2e8f0] mx-1" />
              <button className="px-3 py-1.5 rounded-lg text-sm font-bold text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors">H1</button>
              <button className="px-3 py-1.5 rounded-lg text-sm font-bold text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors">H2</button>
              <div className="w-px h-5 bg-[#e2e8f0] mx-1" />
              {[List, Image, MapPin].map((Icon, i) => (
                <button key={i} className="p-2 rounded-lg text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Editor Area */}
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start writing your journal entry..."
              className="w-full min-h-[400px] p-6 text-sm text-[#0b1c30] placeholder:text-[#94a3b8] resize-none focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-4">
          {/* Quick Reminders */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#E8604C]" />
                <h3 className="font-bold text-[#0b1c30] font-['Montserrat'] text-sm">Quick Reminders</h3>
              </div>
              <button className="w-6 h-6 rounded-full border border-[#e2e8f0] flex items-center justify-center text-[#94a3b8] hover:bg-[#f1f5f9] transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {reminders.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    r.done ? 'bg-[#E8604C] border-[#E8604C]' : 'border-[#e2e8f0]'
                  }`}>
                    {r.done && <CheckSquare className="w-3 h-3 text-white" />}
                  </div>
                  <p className={`text-sm leading-tight ${r.done ? 'line-through text-[#94a3b8]' : 'text-[#0b1c30]'}`}>
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Day Photos */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#0b1c30] font-['Montserrat'] text-sm">Day 3 Photos</h3>
              <span className="text-xs text-[#94a3b8]">12 items</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
              <button className="aspect-square rounded-xl bg-[#f1f5f9] flex flex-col items-center justify-center text-[#94a3b8] hover:bg-[#e2e8f0] transition-colors">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-xs">Upload</span>
              </button>
            </div>
          </div>

          {/* Location */}
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8604C]/8 flex items-center justify-center text-[#E8604C] flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0b1c30]">Arashiyama, Kyoto</p>
              <p className="text-xs text-[#94a3b8]">Logged 2.4 miles walked today.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
