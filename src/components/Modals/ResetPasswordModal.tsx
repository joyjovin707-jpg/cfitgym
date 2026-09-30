import React, { useState } from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';
import { StaffUser } from '../../types/index.ts';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffUser: StaffUser | null;
  onConfirm: (id: number, newPass: string) => Promise<boolean>;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  staffUser,
  onConfirm,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !staffUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError('Please provide a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const ok = await onConfirm(staffUser.id, newPassword.trim());
      if (ok) {
        onClose();
      } else {
        setError('Failed to update password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C9FF3D]/15 text-[#C9FF3D] flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#EDEEEA]">Reset Staff Password</h2>
          </div>
          <button onClick={onClose} className="text-[#9A9E9F] hover:text-[#EDEEEA] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FF5F45]/15 border border-[#FF5F45]/40 text-[#FF5F45] text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#212528] rounded-lg border border-[#2C3034]">
            <p className="text-xs text-[#9A9E9F]">Target Account:</p>
            <p className="text-sm font-bold text-[#EDEEEA]">{staffUser.full_name}</p>
            <p className="text-xs text-[#5D6164] font-mono">@{staffUser.username} · {staffUser.role}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              New Password *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#2C3034]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#EDEEEA] border border-[#2C3034] hover:bg-[#212528] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newPassword}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9FF3D] text-[#101214] hover:bg-[#b8eb32] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Set New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
