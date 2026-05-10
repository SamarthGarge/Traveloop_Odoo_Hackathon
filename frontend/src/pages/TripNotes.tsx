import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import {
  Share2, Bold, Italic, Underline, List, Image as ImageIcon, MapPin,
  Calendar, Plus, CheckSquare, Upload, Flag, Search,
  Clock, Heart, Archive, Trash2, Edit3, X, AlignLeft, Heading1, Heading2,
  ListOrdered, Quote, Strikethrough,
} from 'lucide-react';

export default function TripNotes() {
  const { activeTrip, trips, addNote, updateNote, deleteNote } = useStore();

  const allNotes = useMemo(() => {
    return trips.flatMap(t => t.notes.map(n => ({ ...n, tripName: t.name, tripId: t.id })));
  }, [trips]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'archived'>('all');

  const filteredNotes = useMemo(() => {
    let result = allNotes;
    if (filter === 'favorites') result = result.filter(n => n.favorite);
    else if (filter === 'archived') result = result.filter(n => n.archived);
    else result = result.filter(n => !n.archived);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.stop.toLowerCase().includes(q) ||
        n.tripName.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.updatedAt || b.date).getTime() - new Date(a.updatedAt || a.date).getTime());
  }, [allNotes, searchQuery, filter]);

  const [activeNoteId, setActiveNoteId] = useState<string | null>(filteredNotes.length > 0 ? filteredNotes[0].id : null);

  const activeNote = useMemo(() => {
    return allNotes.find(n => n.id === activeNoteId);
  }, [activeNoteId, allNotes]);

  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Unsaved'>('Saved');
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Rich text editor ref
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load note into editor
  useEffect(() => {
    if (activeNote && editorRef.current) {
      setTitle(activeNote.title);
      editorRef.current.innerHTML = activeNote.content || '';
      setSaveStatus('Saved');
    } else if (!activeNote && editorRef.current) {
      setTitle('');
      editorRef.current.innerHTML = '';
    }
  }, [activeNoteId]);

  // Track active formatting states
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    setActiveFormats(formats);
  }, []);

  // Autosave on content change
  const handleEditorInput = useCallback(() => {
    if (!activeNote) return;
    const html = editorRef.current?.innerHTML || '';
    setSaveStatus('Unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveStatus('Saving...');
      updateNote(activeNote.tripId, activeNote.id, { content: html });
      setTimeout(() => setSaveStatus('Saved'), 400);
    }, 800);
    updateActiveFormats();
  }, [activeNote, updateNote, updateActiveFormats]);

  // Title autosave
  useEffect(() => {
    if (!activeNote) return;
    if (title === activeNote.title) return;
    setSaveStatus('Unsaved');
    const t = setTimeout(() => {
      setSaveStatus('Saving...');
      updateNote(activeNote.tripId, activeNote.id, { title });
      setTimeout(() => setSaveStatus('Saved'), 400);
    }, 800);
    return () => clearTimeout(t);
  }, [title, activeNote, updateNote]);

  // Rich text commands
  const execFormat = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateActiveFormats();
    handleEditorInput();
  };

  const execHeading = (tag: 'h1' | 'h2' | 'p') => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    updateActiveFormats();
    handleEditorInput();
  };

  const handleCreateNote = () => {
    if (!activeTrip) { alert("Please select an active trip first to create a note."); return; }
    addNote(activeTrip.id, {
      title: 'New Entry',
      content: '',
      date: new Date().toISOString(),
      stop: activeTrip.destination,
    });
    setTimeout(() => {
      const updatedNotes = useStore.getState().activeTrip?.notes;
      if (updatedNotes && updatedNotes.length > 0) {
        setActiveNoteId(updatedNotes[updatedNotes.length - 1].id);
      }
    }, 100);
  };

  const handleToggleFavorite = (noteId: string, tripId: string, current: boolean) =>
    updateNote(tripId, noteId, { favorite: !current });

  const handleArchive = (noteId: string, tripId: string, current: boolean) =>
    updateNote(tripId, noteId, { archived: !current });

  const fetchNotes = () => {
    if (!id) return;
    setLoading(true);
    apiListNotes(id)
      .then((res) => setNotes((res.data ?? res) as ApiNote[]))
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchNotes(); }, [id]);

  const photos = ['/images/dest-tokyo.jpg', '/images/image.png', '/images/dest-osaka.jpg'];

  // Toolbar button config
  const toolbarGroups = [
    [
      { label: 'Bold', icon: Bold, action: () => execFormat('bold'), key: 'bold' },
      { label: 'Italic', icon: Italic, action: () => execFormat('italic'), key: 'italic' },
      { label: 'Underline', icon: Underline, action: () => execFormat('underline'), key: 'underline' },
      { label: 'Strikethrough', icon: Strikethrough, action: () => execFormat('strikeThrough'), key: 'strikeThrough' },
    ],
    [
      { label: 'Heading 1', icon: Heading1, action: () => execHeading('h1'), key: 'h1' },
      { label: 'Heading 2', icon: Heading2, action: () => execHeading('h2'), key: 'h2' },
      { label: 'Paragraph', icon: AlignLeft, action: () => execHeading('p'), key: 'p' },
    ],
    [
      { label: 'Bullet List', icon: List, action: () => execFormat('insertUnorderedList'), key: 'ul' },
      { label: 'Ordered List', icon: ListOrdered, action: () => execFormat('insertOrderedList'), key: 'ol' },
      { label: 'Blockquote', icon: Quote, action: () => execFormat('formatBlock', 'blockquote' as any), key: 'blockquote' },
    ],
  ];

  return (
    <div className="page-transition h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">

      {/* 1. HISTORY SIDEBAR */}
      <div className="w-full md:w-80 flex flex-col gap-4 h-full bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-[#e2e8f0]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#0b1c30] font-heading text-lg">Journal History</h2>
            <button onClick={handleCreateNote} className="w-8 h-8 rounded-full bg-[#E8604C] text-white flex items-center justify-center hover:bg-[#d95543] transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search memories..."
              className="w-full pl-9 pr-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#E8604C] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-[#0b1c30] text-white' : 'bg-[#f1f5f9] text-[#64748B] hover:bg-[#e2e8f0]'}`}>All</button>
            <button onClick={() => setFilter('favorites')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'favorites' ? 'bg-[#E8604C] text-white' : 'bg-[#f1f5f9] text-[#64748B] hover:bg-[#e2e8f0]'}`}>Favorites</button>
            <button onClick={() => setFilter('archived')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'archived' ? 'bg-[#64748B] text-white' : 'bg-[#f1f5f9] text-[#64748B] hover:bg-[#e2e8f0]'}`}>Archived</button>
          </div>
        </div>
      </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="text-center p-6 text-[#94a3b8]">
              <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mx-auto mb-3">
                <Edit3 className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#0b1c30] mb-1">No notes found</p>
              <p className="text-xs">Your travel memories will appear here.</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${activeNoteId === note.id ? 'bg-[#f8fafc] border-[#E8604C]/30 shadow-sm' : 'bg-white border-[#e2e8f0] hover:border-[#94a3b8]'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-[#E8604C] uppercase tracking-wider">{note.tripName}</span>
                  <div className="flex items-center gap-1">
                    {note.favorite && <Heart className="w-3 h-3 text-[#E8604C] fill-current" />}
                    <span className="text-[10px] text-[#94a3b8]">{new Date(note.updatedAt || note.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <h4 className="font-semibold text-sm text-[#0b1c30] mb-1 truncate">{note.title || 'Untitled'}</h4>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {/* Strip HTML tags for preview */}
                  {note.content ? note.content.replace(/<[^>]*>/g, '') || <span className="italic">No content...</span> : <span className="italic">No content...</span>}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. EDITOR */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden min-h-[500px]">
        {activeNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex flex-col">
                <p className="text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {activeNote.stop}
                </p>
                <span className="text-xs text-[#64748B] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {saveStatus}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFavorite(activeNote.id, activeNote.tripId, !!activeNote.favorite)}
                  className={`p-2 rounded-lg transition-colors ${activeNote.favorite ? 'text-[#E8604C] bg-[#fef2f2]' : 'text-[#64748B] hover:bg-[#e2e8f0]'}`}
                >
                  <Heart className={`w-4 h-4 ${activeNote.favorite ? 'fill-current' : ''}`} />
                </button>
                <button onClick={() => handleArchive(activeNote.id, activeNote.tripId, !!activeNote.archived)} className="p-2 rounded-lg text-[#64748B] hover:bg-[#e2e8f0] transition-colors" title="Archive">
                  <Archive className="w-4 h-4" />
                </button>
                <button onClick={() => deleteNote(activeNote.tripId, activeNote.id)} className="p-2 rounded-lg text-[#64748B] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="btn-primary py-1.5 px-3 text-xs ml-2">
                  <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                </button>
              </div>
            </div>

            {/* RICH TEXT TOOLBAR */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-[#f1f5f9] bg-white flex-wrap">
              {toolbarGroups.map((group, gi) => (
                <div key={gi} className="flex items-center gap-0.5">
                  {gi > 0 && <div className="w-px h-5 bg-[#e2e8f0] mx-1.5" />}
                  {group.map((btn) => (
                    <button
                      key={btn.key}
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent editor blur
                        btn.action();
                      }}
                      title={btn.label}
                      className={`p-2 rounded-lg transition-colors ${
                        activeFormats.has(btn.key)
                          ? 'bg-[#E8604C]/10 text-[#E8604C]'
                          : 'text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
                      }`}
                    >
                      <btn.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Editor Body */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title your memory..."
                className="w-full text-3xl font-bold text-[#0b1c30] font-heading placeholder:text-[#cbd5e1] mb-4 focus:outline-none bg-transparent"
              />

              {/* contenteditable rich text area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                onSelect={updateActiveFormats}
                data-placeholder="Start writing your journal entry..."
                className="flex-1 w-full text-base text-[#334155] focus:outline-none leading-relaxed bg-transparent min-h-[300px] prose-editor"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#94a3b8] p-6">
            <div className="w-16 h-16 bg-[#f8fafc] rounded-full flex items-center justify-center mb-4">
              <Edit3 className="w-8 h-8 text-[#cbd5e1]" />
            </div>
            <h3 className="text-lg font-bold text-[#0b1c30] font-heading mb-2">Select a Note</h3>
            <p className="text-sm text-center max-w-sm mb-6">Choose an entry from the timeline to read and edit, or create a new memory for your active trip.</p>
            <button onClick={handleCreateNote} className="btn-primary py-2.5 px-6">
              Create New Entry
            </button>
          </div>
        )}
      </div>

      {/* 3. CONTEXT SIDEBAR */}
      <div className="hidden lg:flex w-72 flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-2">
        <div className="card p-5 border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-[#E8604C]" />
              <h3 className="font-bold text-[#0b1c30] font-heading text-sm">Quick Reminders</h3>
            </div>
            <button className="w-6 h-6 rounded-full border border-[#e2e8f0] flex items-center justify-center text-[#94a3b8] hover:bg-[#f1f5f9] transition-colors">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {reminders.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${r.done ? 'bg-[#E8604C] border-[#E8604C]' : 'border-[#e2e8f0]'}`}>
                  {r.done && <CheckSquare className="w-3 h-3 text-white" />}
                </div>
                <p className={`text-sm leading-tight ${r.done ? 'line-through text-[#94a3b8]' : 'text-[#0b1c30]'}`}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#059669]" />
              <h3 className="font-bold text-[#0b1c30] font-heading text-sm">Media attached</h3>
            </div>
            <span className="text-xs text-[#94a3b8]">3 items</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm">
                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
            <button className="aspect-square rounded-xl bg-[#f8fafc] border-2 border-dashed border-[#e2e8f0] flex flex-col items-center justify-center text-[#94a3b8] hover:border-[#E8604C] hover:text-[#E8604C] transition-colors">
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">Upload</span>
            </button>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0] shadow-sm">
          <h3 className="font-bold text-[#0b1c30] font-heading text-sm mb-2 flex items-center gap-2">✨ AI Highlight Suggestion</h3>
          <p className="text-xs text-[#64748B] leading-relaxed mb-3">
            Based on your location in Arashiyama, consider adding your experience at the Bamboo Grove or the Tenryu-ji Temple gardens to today's entry.
          </p>
          <button className="text-xs font-semibold text-[#E8604C] hover:text-[#d95543]">Generate summary</button>
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
