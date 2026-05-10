import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Camera,
  Edit3,
  MapPin,
  Mail,
  Phone,
  Globe,
  Save,
  Compass,
  Calendar,
} from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, trips, updateProfile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
  });

  const handleSave = () => {
    updateProfile(form);
    setIsEditing(false);
  };

  const preplannedTrips = trips.filter((t) => t.status === 'upcoming');
  const previousTrips = trips.filter((t) => t.status === 'completed');

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-[#00202a] to-[#5b7f74]" />
          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                <img
                  src={user?.photo || '/images/user-avatar.jpg'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-1 left-24 p-2 rounded-full bg-[#ffcc66] text-[#00202a] shadow-md hover:bg-[#ffcc66]/90">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#1a1a1a]">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {user?.city}, {user?.country}
                </div>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={isEditing ? 'btn-primary' : 'btn-secondary !text-gray-600 !border-gray-200'}
              >
                {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
              </button>
            </div>

            {user?.bio && <p className="text-gray-600 mt-3">{user.bio}</p>}
          </div>
        </div>

        {/* Details & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Contact Information</h2>
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">First Name</label>
                    <input type="text" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Last Name</label>
                    <input type="text" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">City</label>
                    <input type="text" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Country</label>
                    <input type="text" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} className="input-field mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-500">Bio</label>
                    <textarea rows={3} value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} className="input-field mt-1 resize-none" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-[#5b7f74]" />
                    <span className="text-gray-600">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-[#5b7f74]" />
                    <span className="text-gray-600">{user?.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-[#5b7f74]" />
                    <span className="text-gray-600">{user?.city}, {user?.country}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-[#5b7f74]" />
                    <span className="text-gray-600">{trips.length} trips created</span>
                  </div>
                </div>
              )}
            </div>

            {/* Preplanned Trips */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Preplanned Trips</h2>
              {preplannedTrips.length === 0 ? (
                <p className="text-gray-400 text-sm">No upcoming trips planned</p>
              ) : (
                <div className="space-y-3">
                  {preplannedTrips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => { useStore.getState().setActiveTrip(trip); navigate('/itinerary/view'); }}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <img src={trip.coverImage} alt={trip.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className="font-medium text-[#1a1a1a]">{trip.name}</h4>
                        <p className="text-sm text-gray-500">{trip.startDate} - {trip.destination}</p>
                      </div>
                      <Compass className="w-4 h-4 text-gray-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Previous Trips */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4">Previous Trips</h2>
              {previousTrips.length === 0 ? (
                <p className="text-gray-400 text-sm">No completed trips yet</p>
              ) : (
                <div className="space-y-3">
                  {previousTrips.map((trip) => (
                    <button
                      key={trip.id}
                      onClick={() => { useStore.getState().setActiveTrip(trip); navigate('/itinerary/view'); }}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <img src={trip.coverImage} alt={trip.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className="font-medium text-[#1a1a1a]">{trip.name}</h4>
                        <p className="text-sm text-gray-500">{trip.startDate} - {trip.destination}</p>
                      </div>
                      <Calendar className="w-4 h-4 text-gray-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-[#1a1a1a] mb-4">Travel Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-[#5b7f74]">{trips.length}</p>
                  <p className="text-sm text-gray-500">Total Trips</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#ffcc66]">
                    {new Set(trips.map((t) => t.destination.split(',')[0])).size}
                  </p>
                  <p className="text-sm text-gray-500">Cities Visited</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#00202a]">
                    ${trips.reduce((a, t) => a + t.spent, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
