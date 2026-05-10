import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Plus,
  Calendar,
  DollarSign,
  Trash2,
  GripVertical,
  Save,
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
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Trips
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              {activeTrip?.name || 'Build Itinerary'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {sections.length} sections | Total budget: ${totalBudget.toLocaleString()}
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
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-gray-300 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#1a1a1a]">
                      Section {index + 1}: {section.title}
                    </h3>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {section.dateRange}
                    </span>
                    <span className="flex items-center gap-1 text-[#5b7f74]">
                      <DollarSign className="w-4 h-4" />
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
            className="w-full mt-4 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-[#ffcc66] hover:text-[#5b7f74] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Another Section
          </button>
        ) : (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mt-4">
            <h3 className="font-semibold text-[#1a1a1a] mb-4">New Section</h3>
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
              <div className="flex gap-2">
                <button onClick={handleAddSection} className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="btn-secondary !text-gray-600 !border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
