import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ApiNote } from '../store/useStore';
import { ArrowLeft, Plus, Trash2, Pencil, Check, X, Loader2, StickyNote } from 'lucide-react';
import { apiListNotes, apiCreateNote, apiUpdateNote, apiDeleteNote, extractError } from '../lib/api';

export default function TripNotes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newContent, setNewContent] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchNotes = () => {
    if (!id) return;
    setLoading(true);
    apiListNotes(id)
      .then((res) => setNotes((res.data ?? res) as ApiNote[]))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchNotes(); }, [id]);

  const handleAdd = async () => {
    if (!id || !newContent.trim()) return;
    setAdding(true);
    try {
      const res = await apiCreateNote(id, { content: newContent.trim() });
      const note = res.data ?? res;
      setNotes((prev) => [note, ...prev]);
      setNewContent('');
    } catch (err) {
      setError(extractError(err));
    } finally {
      setAdding(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!id || !editingId || !editContent.trim()) return;
    try {
      const res = await apiUpdateNote(id, editingId, { content: editContent.trim() });
      const updated = res.data ?? res;
      setNotes((prev) => prev.map((n) => n.id === editingId ? updated : n));
      setEditingId(null);
    } catch (err) {
      setError(extractError(err));
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!id) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      await apiDeleteNote(id, noteId);
    } catch (err) {
      setError(extractError(err));
      fetchNotes();
    }
  };

  const startEdit = (note: ApiNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  // Separate trip-level notes from stop-level notes
  const tripNotes = notes.filter((n) => !n.stop_id);
  const stopNotes = notes.filter((n) => n.stop_id);

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#0b1c30] font-['Montserrat']">Trip Notes</h1>
          <p className="text-[#94a3b8] text-xs mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{error}</div>
      )}

      {/* Add note */}
      <div className="card p-4 mb-6">
        <textarea
          rows={3}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write a note about your trip... (visa reminders, packing thoughts, booking references)"
          className="input-field resize-none text-sm"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleAdd}
            disabled={adding || !newContent.trim()}
            className="btn-primary text-sm py-2 disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Note
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#E8604C] mx-auto" />
        </div>
      ) : notes.length === 0 ? (
        <div className="card p-12 text-center">
          <StickyNote className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
          <p className="text-[#94a3b8]">No notes yet. Start capturing your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trip-level notes */}
          {tripNotes.length > 0 && (
            <div>
              <h2 className="font-bold text-[#0b1c30] mb-3">General Notes</h2>
              <div className="space-y-3">
                {tripNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    editingId={editingId}
                    editContent={editContent}
                    setEditContent={setEditContent}
                    startEdit={startEdit}
                    handleSaveEdit={handleSaveEdit}
                    cancelEdit={() => setEditingId(null)}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stop-level notes */}
          {stopNotes.length > 0 && (
            <div>
              <h2 className="font-bold text-[#0b1c30] mb-3">Stop Notes</h2>
              <div className="space-y-3">
                {stopNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    editingId={editingId}
                    editContent={editContent}
                    setEditContent={setEditContent}
                    startEdit={startEdit}
                    handleSaveEdit={handleSaveEdit}
                    cancelEdit={() => setEditingId(null)}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note, editingId, editContent, setEditContent,
  startEdit, handleSaveEdit, cancelEdit, handleDelete,
}: {
  note: ApiNote;
  editingId: string | null;
  editContent: string;
  setEditContent: (v: string) => void;
  startEdit: (n: ApiNote) => void;
  handleSaveEdit: () => void;
  cancelEdit: () => void;
  handleDelete: (id: string) => void;
}) {
  const isEditing = editingId === note.id;
  return (
    <div className="card p-4 group">
      {isEditing ? (
        <>
          <textarea
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="input-field resize-none text-sm w-full"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={cancelEdit} className="btn-secondary text-xs py-1.5 px-3">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button onClick={handleSaveEdit} disabled={!editContent.trim()} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50">
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-[#334155] whitespace-pre-wrap leading-relaxed">{note.content}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-[#94a3b8]">
              {new Date(note.updated_at).toLocaleDateString()} {new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(note)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#f1f5f9] transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(note.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
