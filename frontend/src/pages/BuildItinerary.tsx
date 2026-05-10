import { useState } from 'react';
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
} from 'lucide-react';

export default function BuildItinerary() {
  const navigate = useNavigate();
  const { activeTrip, setActiveTrip } = useStore();
  const [sections, setSections] = useState(
    activeTrip?.sections || []
  );
  const [showAdd, setShowAdd] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    dateRange: '',
    budget: '',
  });

  const handleAddSection = () => {
    if (!newSection.title) return;
    const section = {
      id: Date.now().toString(),
      title: newSection.title,
      description: newSection.description,
      dateRange: newSection.dateRange,
      budget: Number(newSection.budget) || 0,
    };
    setSections([...sections, section]);
    setNewSection({ title: '', description: '', dateRange: '', budget: '' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (activeTrip) {
      setActiveTrip({ ...activeTrip, sections });
    }
    navigate('/itinerary/view');
  };

  const totalBudget = sections.reduce((sum, s) => sum + s.budget, 0);

  return (
    <div className="page-transition max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-['Montserrat']">
            {activeTrip?.name || 'Build Itinerary'}
          </h1>
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
                  <h3 className="font-bold text-[#0b1c30] font-['Montserrat']">{section.title}</h3>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-[#64748B] mb-3">{section.description}</p>
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
          onClick={() => setShowAdd(true)}
          className="w-full mt-6 py-4 border-2 border-dashed border-[#e2e8f0] rounded-2xl text-[#94a3b8] hover:border-[#E8604C] hover:text-[#E8604C] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Another Section
        </button>
      ) : (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0b1c30] font-['Montserrat']">New Section</h3>
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
                value={newSection.dateRange}
                onChange={(e) => setNewSection({ ...newSection, dateRange: e.target.value })}
                placeholder="Date range (e.g., Jun 10-14)"
                className="input-field"
              />
              <input
                type="number"
                value={newSection.budget}
                onChange={(e) => setNewSection({ ...newSection, budget: e.target.value })}
                placeholder="Budget ($)"
                className="input-field"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleAddSection} className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                Add Section
              </button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
