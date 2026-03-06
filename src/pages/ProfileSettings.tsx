import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { Save, User as UserIcon } from 'lucide-react';
import { apiUrl } from '../lib/api';

export default function ProfileSettings() {
  const { token, user, refreshUser, addNotification, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const saveProfile = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      addNotification('Validation Error', 'Name cannot be empty.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(apiUrl('/api/user/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to update profile' }));
        addNotification('Update Failed', data.error || 'Could not save profile.', 'error');
        return;
      }

      await refreshUser();
      addNotification('Profile Updated', 'Your profile settings were saved.', 'success');
    } catch (error) {
      console.error('Profile update error:', error);
      addNotification('Network Error', 'Unable to save profile right now.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Profile Settings</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your public account details.</p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
          <div className="h-12 w-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center">
            <UserIcon size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest">Signed in as</p>
            <p className="font-medium text-[var(--text-primary)]">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-[var(--text-secondary)]">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Enter your name"
          />
        </div>

        <button
          onClick={saveProfile}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-black font-semibold disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
