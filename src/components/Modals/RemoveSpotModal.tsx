import React, { useState, useEffect } from 'react';
import { X, UserMinus, AlertTriangle } from 'lucide-react';
import { GymClass } from '../../types/index.ts';

interface RemoveSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymClass: GymClass | null;
  onConfirm: (classId: number, memberId: string) => Promise<boolean>;
}

export const RemoveSpotModal: React.FC<RemoveSpotModalProps> = ({
  isOpen,
  onClose,
  gymClass,
  onConfirm,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (gymClass && gymClass.bookings && gymClass.bookings.length > 0) {
      setSelectedMemberId(gymClass.bookings[0].member_id);
    } else {
      setSelectedMemberId('');
    }
    setError('');
  }, [gymClass, isOpen]);

  if (!isOpen || !gymClass) return null;

  const bookings = gymClass.bookings || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookings.length > 0 && !selectedMemberId) {
      setError('Please select which member to remove.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onConfirm(gymClass.id, selectedMemberId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove member from class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF5F45]/15 flex items-center justify-center text-[#FF5F45]">
              <UserMinus className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#EDEEEA]">Remove Booked Member</h2>
          </div>
          <button onClick={onClose} className="text-[#9A9E9F] hover:text-[#EDEEEA] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FF5F45]/15 border border-[#FF5F45]/40 text-[#FF5F45] text-xs rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Class details badge */}
          <div className="p-3 bg-[#212528] border border-[#2C3034] rounded-lg">
            <h4 className="text-sm font-bold text-[#EDEEEA]">{gymClass.class_name}</h4>
            <p className="text-xs text-[#9A9E9F] mt-0.5">
              {gymClass.studio_location} · {gymClass.start_time} · {gymClass.booked_count} booked
            </p>
          </div>

          {/* Member select */}
          {bookings.length > 0 ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1.5">
                Which member to delete from class roster? *
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2.5 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#FF5F45]"
                required
              >
                {bookings.map((b) => (
                  <option key={b.member_id} value={b.member_id}>
                    {b.member_id} — {b.member_name} (Booked: {b.booked_at ? b.booked_at.split(' ')[0] : 'Scheduled'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3.5 bg-[#FF5F45]/10 border border-[#FF5F45]/30 rounded-lg text-xs text-[#EDEEEA]">
              Are you sure you want to remove 1 booked spot from this class?
            </div>
          )}

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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#FF5F45] text-[#101214] hover:bg-[#e04830] cursor-pointer disabled:opacity-40"
            >
              {isSubmitting ? 'Removing...' : 'Remove Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
