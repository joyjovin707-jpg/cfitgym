import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { StaffUser, UserRole } from '../../types/index.ts';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: any) => Promise<{ success: boolean; message?: string }>;
  initialData?: StaffUser | null;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = !!initialData;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState('Morning');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Suspended'>('Active');

  // Operational permissions
  const [canManageMembers, setCanManageMembers] = useState(true);
  const [canProcessPayments, setCanProcessPayments] = useState(true);
  const [canManageClasses, setCanManageClasses] = useState(true);
  const [canManageTrainers, setCanManageTrainers] = useState(true);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username);
      setPassword('');
      setFullName(initialData.full_name);
      setRole(initialData.role);
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setShift(initialData.shift || 'Morning');
      setStatus(initialData.status || 'Active');
      setCanManageMembers(initialData.can_manage_members);
      setCanProcessPayments(initialData.can_process_payments);
      setCanManageClasses(initialData.can_manage_classes);
      setCanManageTrainers(initialData.can_manage_trainers);
    } else {
      setUsername('');
      setPassword('staff123');
      setFullName('');
      setRole('Staff');
      setEmail('');
      setPhone('');
      setShift('Morning');
      setStatus('Active');
      setCanManageMembers(true);
      setCanProcessPayments(true);
      setCanManageClasses(true);
      setCanManageTrainers(true);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter staff member full name.');
      return;
    }
    if (!isEditing && !username.trim()) {
      setError('Please choose a unique username.');
      return;
    }
    if (!isEditing && !password.trim()) {
      setError('Please specify an initial password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload: any = {
        full_name: fullName.trim(),
        role,
        email: email.trim(),
        phone: phone.trim(),
        shift,
        status,
        can_manage_members: canManageMembers,
        can_process_payments: canProcessPayments,
        can_manage_classes: canManageClasses,
        can_manage_trainers: canManageTrainers,
      };

      if (!isEditing) {
        payload.username = username.trim().toLowerCase();
        payload.password = password.trim();
      } else if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await onSave(payload);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Failed to save staff record.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C9FF3D]/15 text-[#C9FF3D] flex items-center justify-center">
              {role === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#EDEEEA]">
                {isEditing ? `Edit Staff: ${initialData?.full_name}` : 'Add New Staff Member'}
              </h2>
              <p className="text-xs text-[#9A9E9F]">
                {isEditing ? 'Configure account details and access roles' : 'Create an administrative or staff terminal account'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9A9E9F] hover:text-[#EDEEEA] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#FF5F45]/15 border border-[#FF5F45]/40 text-[#FF5F45] text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vishnu Nair"
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                System Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                disabled={isEditing && initialData?.username === 'admin'}
              >
                <option value="Staff">Staff (Operations only)</option>
                <option value="Admin">Admin (Full access + Staff Control)</option>
              </select>
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. vishnu"
                disabled={isEditing}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] font-mono focus:outline-none focus:border-[#C9FF3D] disabled:opacity-50"
                required={!isEditing}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                {isEditing ? 'New Password (leave blank to keep)' : 'Initial Password *'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? '••••••••' : 'Enter password'}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                required={!isEditing}
              />
            </div>
          </div>

          {/* Contact: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@cfitgym.com"
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98470 12345"
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] font-mono focus:outline-none focus:border-[#C9FF3D]"
              />
            </div>
          </div>

          {/* Shift & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Duty Shift
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              >
                <option value="Morning">Morning (06:00 AM - 02:00 PM)</option>
                <option value="Evening">Evening (02:00 PM - 10:00 PM)</option>
                <option value="Full Day">Full Day (All Hours)</option>
                <option value="Night">Night Shift</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                disabled={isEditing && initialData?.username === 'admin'}
              >
                <option value="Active">Active (Can Log In)</option>
                <option value="Suspended">Suspended (Blocked Access)</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Module Permissions (Staff Controls) */}
          <div className="pt-2 border-t border-[#2C3034]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-2.5">
              Staff Operational Permissions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#212528] p-3 rounded-lg border border-[#2C3034]">
              <label className="flex items-center gap-2 text-xs text-[#EDEEEA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={canManageMembers}
                  onChange={(e) => setCanManageMembers(e.target.checked)}
                  className="rounded border-[#2C3034] text-[#C9FF3D] focus:ring-0 focus:ring-offset-0"
                />
                <span>Manage Members</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#EDEEEA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={canProcessPayments}
                  onChange={(e) => setCanProcessPayments(e.target.checked)}
                  className="rounded border-[#2C3034] text-[#C9FF3D] focus:ring-0 focus:ring-offset-0"
                />
                <span>Process Payments</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#EDEEEA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={canManageClasses}
                  onChange={(e) => setCanManageClasses(e.target.checked)}
                  className="rounded border-[#2C3034] text-[#C9FF3D] focus:ring-0 focus:ring-offset-0"
                />
                <span>Manage Classes</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#EDEEEA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={canManageTrainers}
                  onChange={(e) => setCanManageTrainers(e.target.checked)}
                  className="rounded border-[#2C3034] text-[#C9FF3D] focus:ring-0 focus:ring-offset-0"
                />
                <span>Manage Trainers</span>
              </label>
            </div>
            <p className="text-[11px] text-[#5D6164] mt-1.5">
              Note: The <strong>Staff Control</strong> module is strictly reserved for Admin accounts.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2C3034]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#EDEEEA] border border-[#2C3034] hover:bg-[#212528] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9FF3D] text-[#101214] hover:bg-[#b8eb32] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Staff Member' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
