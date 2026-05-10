import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  User, Mail, Phone, MapPin, Lock, Trash2, Eye, EyeOff,
  Loader2, Check, AlertTriangle,
} from 'lucide-react';
import {
  apiGetProfile, apiUpdateProfile, apiChangePassword,
  apiDeleteAccount, extractError,
} from '../lib/api';

export default function UserProfile() {
  const { user, updateUser, logout } = useStore();

  const [form, setForm] = useState({
    first_name: user?.firstName ?? '',
    last_name: user?.lastName ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    country: user?.country ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Fetch fresh profile
  useEffect(() => {
    apiGetProfile().then((res) => {
      const d = res.data ?? res;
      setForm({
        first_name: d.first_name ?? '',
        last_name: d.last_name ?? '',
        phone: d.phone ?? '',
        city: d.city ?? '',
        country: d.country ?? '',
      });
    }).catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    try {
      const res = await apiUpdateProfile(form);
      const d = res.data ?? res;
      updateUser({
        firstName: d.first_name,
        lastName: d.last_name,
        phone: d.phone,
        city: d.city,
        country: d.country,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setProfileError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    setPasswordError('');
    try {
      await apiChangePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccess(true);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(extractError(err));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all trips. This cannot be undone.')) return;
    setDeletingAccount(true);
    try {
      await apiDeleteAccount();
      logout();
    } catch (err) {
      alert(extractError(err));
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="page-transition max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0b1c30] font-['Montserrat']">Profile Settings</h1>
        <p className="text-[#64748B] text-sm mt-1">Manage your account details and preferences</p>
      </div>

      {/* Avatar */}
      <div className="card p-6 mb-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#E8604C]/10 flex items-center justify-center text-[#E8604C] text-2xl font-bold flex-shrink-0">
          {(user?.firstName?.[0] ?? '?').toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-[#0b1c30] text-lg">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-[#94a3b8]">{user?.email}</p>
          {user?.isAdmin && (
            <span className="badge bg-[#E8604C]/10 text-[#E8604C] text-[10px] mt-1">Administrator</span>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="card p-6 mb-5 space-y-5">
        <h2 className="font-bold text-[#0b1c30] text-base">Personal Information</h2>

        {profileError && (
          <div className="p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{profileError}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1" /> First Name
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Last Name</label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">
            <Mail className="w-3.5 h-3.5 inline mr-1" /> Email Address
          </label>
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="input-field opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-[#94a3b8] mt-1">Email cannot be changed</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">
              <Phone className="w-3.5 h-3.5 inline mr-1" /> Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+1 555 000 0000"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">
              <MapPin className="w-3.5 h-3.5 inline mr-1" /> Country
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="e.g., United States"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">
            <MapPin className="w-3.5 h-3.5 inline mr-1" /> City
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="e.g., New York"
            className="input-field"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : null}
            {saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="card p-6 mb-5 space-y-4">
        <h2 className="font-bold text-[#0b1c30] text-base">Change Password</h2>

        {passwordError && (
          <div className="p-3 rounded-xl bg-[#fef2f2] text-[#dc2626] text-sm border border-[#dc2626]/10">{passwordError}</div>
        )}
        {passwordSuccess && (
          <div className="p-3 rounded-xl bg-[#f0fdf4] text-[#059669] text-sm border border-[#059669]/10">
            Password changed successfully!
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">
            <Lock className="w-3.5 h-3.5 inline mr-1" /> Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPwd ? 'text' : 'password'}
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm((f) => ({ ...f, current_password: e.target.value }))}
              className="input-field pr-10"
              placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
            />
            <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
              {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
                className="input-field pr-10"
                placeholder="Min 8 characters"
              />
              <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}
              className="input-field"
              placeholder="Repeat new password"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={changingPassword || !passwordForm.current_password || !passwordForm.new_password}
            className="btn-primary disabled:opacity-60 text-sm"
          >
            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="card p-6 border-[#dc2626]/20 border">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#dc2626] mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="font-bold text-[#dc2626] text-base">Danger Zone</h2>
            <p className="text-sm text-[#64748B] mt-1">
              Deleting your account is irreversible. All trips, stops, activities, and data will be permanently removed.
            </p>
          </div>
        </div>
        <button
          onClick={handleDeleteAccount}
          disabled={deletingAccount}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#dc2626]/30 text-[#dc2626] hover:bg-[#fef2f2] text-sm font-medium transition-all disabled:opacity-60"
        >
          {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Account
        </button>
      </div>
    </div>
  );
}
