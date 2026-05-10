import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Edit3,
  Heart,
  CreditCard,
  Shield,
  ChevronRight,
  Mountain,
  Sparkles,
  Palmtree,
  UtensilsCrossed,
  Landmark,
  Trees,
  Plus,
  LogOut,
  Trash2,
} from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useStore();
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [form, setForm] = useState({
    firstName: user?.firstName || 'Alex',
    lastName: user?.lastName || 'Mercer',
    email: user?.email || 'alex.mercer@example.com',
    language: user?.language || 'English (US)',
  });

  const handleSave = () => {
    updateProfile(form);
    setEditMode(false);
  };

  const travelStyles = [
    { label: 'Luxury', icon: Sparkles, active: true },
    { label: 'Adventure', icon: Mountain, active: false },
    { label: 'Relaxation', icon: Palmtree, active: false },
  ];

  const interests = [
    { label: 'Food & Culinary', icon: UtensilsCrossed },
    { label: 'History & Art', icon: Landmark },
    { label: 'Nature', icon: Trees },
  ];

  const menuItems = [
    { label: 'My Saved Places', icon: Heart, color: '#E8604C' },
    { label: 'Payment Methods', icon: CreditCard, color: '#001b26' },
    { label: 'Privacy & Security', icon: Shield, color: '#059669' },
  ];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">Profile & Settings</h1>
        <p className="text-[#64748B] text-sm mt-1">Manage your account details and travel preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="card p-6 text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <img
                src={user?.photo || '/images/user-avatar.jpg'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#001b26] flex items-center justify-center text-white shadow-md hover:bg-[#0d313f] transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h2 className="text-lg font-bold text-[#0b1c30] font-heading">
              {user?.firstName || 'Alex'} {user?.lastName || 'Mercer'}
            </h2>
            <p className="text-sm text-[#64748B] mt-1">{user?.bio || 'Global Explorer & Food Enthusiast'}</p>
            <p className="text-xs text-[#94a3b8] mt-2">{user?.city || 'San Francisco'}, CA • Joined 2022</p>
          </div>

          {/* Quick Menu */}
          <div className="card divide-y divide-[#f1f5f9]">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 p-4 hover:bg-[#f8fafc] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}10` }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="flex-1 text-sm font-medium text-[#0b1c30]">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-[#94a3b8]" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Info */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-[#0b1c30] font-heading mb-6">Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  disabled={!editMode}
                  className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  disabled={!editMode}
                  className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!editMode}
                  className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Password</label>
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    value="••••••••"
                    disabled
                    className="input-field flex-1 disabled:bg-[#f8fafc] disabled:text-[#64748B]"
                  />
                  <button className="text-sm font-medium text-[#64748B] hover:text-[#0b1c30] transition-colors">Change</button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Language Preference</label>
                <select
                  value={form.language || 'English (US)'}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  disabled={!editMode}
                  className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B]"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              {editMode ? (
                <div className="flex gap-3">
                  <button onClick={() => setEditMode(false)} className="btn-secondary py-2.5 text-sm">Cancel</button>
                  <button onClick={handleSave} className="btn-primary py-2.5 text-sm">Save Changes</button>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)} className="btn-primary py-2.5 text-sm">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-[#0b1c30] font-heading mb-4">Travel Preferences</h3>
            
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#0b1c30] mb-3">Preferred Travel Style</p>
              <div className="flex flex-wrap gap-2">
                {travelStyles.map((style) => (
                  <button
                    key={style.label}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      style.active
                        ? 'bg-[#001b26] text-white'
                        : 'bg-white text-[#64748B] border border-[#e2e8f0] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <style.icon className="w-4 h-4" />
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#0b1c30] mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((item) => (
                  <span
                    key={item.label}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-[#64748B] border border-[#e2e8f0]"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                ))}
                <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#94a3b8] border border-dashed border-[#e2e8f0] hover:bg-[#f1f5f9] hover:text-[#64748B] transition-colors">
                  <Plus className="w-4 h-4" /> Add Interest
                </button>
              </div>
            </div>
          </div>

          {/* Saved Destinations */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#0b1c30] font-heading">Saved Destinations</h3>
              <button className="text-sm font-medium text-[#E8604C] hover:text-[#ae311e] transition-colors">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Kyoto, Japan', image: '/images/dest-tokyo.jpg', saved: '2 days ago' },
                { name: 'Reykjavik, Iceland', image: '/images/dest-iceland.jpg', saved: '1 week ago' },
              ].map((dest, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#e2e8f0] hover:border-[#E8604C]/30 hover:bg-[#E8604C]/5 transition-all cursor-pointer group overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#0b1c30] text-sm truncate">{dest.name}</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Saved {dest.saved}</p>
                  </div>
                  <Heart className="w-4 h-4 text-[#E8604C] fill-current" />
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border border-red-100">
            <h3 className="text-base font-bold text-[#0b1c30] font-heading mb-1">Danger Zone</h3>
            <p className="text-sm text-[#64748B] mb-4">
              Once you delete your account, all your trips, notes, and data will be permanently removed. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#dc2626] border border-[#dc2626]/30 hover:bg-[#fef2f2] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </button>
            ) : (
              <div className="bg-[#fef2f2] rounded-xl p-4 border border-[#dc2626]/20 space-y-3">
                <p className="text-sm font-medium text-[#dc2626]">
                  Type <strong>DELETE</strong> to confirm account deletion:
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE here"
                  className="input-field border-[#dc2626]/30 focus:ring-[#dc2626]/20 text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                    className="btn-secondary py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleteInput !== 'DELETE'}
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Permanently Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Logout Action */}
          <div className="md:hidden pt-4">
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full bg-white border border-[#e2e8f0] hover:border-[#E8604C]/30 hover:bg-[#fef2f2] text-[#E8604C] py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
