import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Plus,
  StickyNote,
  Trash2,
  Search,
  Calendar,
  MapPin,
} from 'lucide-react';

type FilterMode = 'all' | 'day' | 'stop';

export default function TripNotes() {
  const navigate = useNavigate();
  const { activeTrip, trips, addNote, deleteNote } = useStore();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', date: '', stop: '' });

  const currentTrip = activeTrip || trips[0];

  const filteredNotes = (currentTrip?.notes || []).filter((note) => {
    const matchSearch = !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === 'all' ||
      (filter === 'day' && note.date) ||
      (filter === 'stop' && note.stop);
    return matchSearch && matchFilter;
  });

  const handleAddNote = () => {
    if (!newNote.title.trim() || !currentTrip) return;
    addNote(currentTrip.id, {
      title: newNote.title,
      content: newNote.content,
      date: newNote.date || new Date().toISOString().split('T')[0],
      stop: newNote.stop || 'General',
    });
    setNewNote({ title: '', content: '', date: '', stop: '' });
    setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Trip Notes</h1>
            <p className="text-gray-500 text-sm mt-1">
              Trip: {currentTrip?.name || 'Paris & Rome Adventure'}
            </p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffcc66] text-sm"
              />
            </div>
            <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
              {([
                { key: 'all', label: 'All' },
                { key: 'day', label: 'By Day' },
                { key: 'stop', label: 'By Stop' },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === f.key ? 'bg-white text-[#00202a] shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add Note Form */}
        {showAdd && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-medium text-[#1a1a1a] mb-3">New Note</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title..."
                className="input-field"
              />
              <textarea
                rows={3}
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your note..."
                className="input-field resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={newNote.date}
                  onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                  className="input-field text-sm"
                />
                <input
                  type="text"
                  value={newNote.stop}
                  onChange={(e) => setNewNote({ ...newNote, stop: e.target.value })}
                  placeholder="Stop/Location"
                  className="input-field text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddNote} className="btn-primary text-sm">
                  Save Note
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="btn-secondary !text-gray-600 !border-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
              <StickyNote className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No notes yet</p>
              <button onClick={() => setShowAdd(true)} className="text-[#5b7f74] text-sm mt-2 hover:underline">
                Create your first note
              </button>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-[#1a1a1a]">{note.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {note.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {note.stop}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => currentTrip && deleteNote(currentTrip.id, note.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
