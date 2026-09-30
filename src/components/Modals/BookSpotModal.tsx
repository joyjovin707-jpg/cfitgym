import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { GymClass, Member } from '../../types/index.ts';

interface BookSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymClass: GymClass | null;
  members: Member[];
  onConfirm: (classId: number, memberId: string) => Promise<{ success: boolean; message?: string }>;
}

export const BookSpotModal: React.FC<BookSpotModalProps> = ({
  isOpen,
  onClose,
  gymClass,
  members,
  onConfirm,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter available members or find first eligible member
  useEffect(() => {
    if (gymClass && members.length > 0) {
      const bookedIds = new Set(gymClass.bookings?.map((b) => b.member_id) || []);
      const firstAvailable = members.find((m) => !bookedIds.has(m.member_id));
      setSelectedMemberId(firstAvailable ? firstAvailable.member_id : members[0]?.member_id || '');
    }
    setError('');
  }, [gymClass, isOpen, members]);

  if (!isOpen || !gymClass) return null;

  const bookedIds = new Set(gymClass.bookings?.map((b) => b.member_id) || []);
  const spotsLeft = Math.max(0, gymClass.max_capacity - gymClass.booked_count);
  const selectedMember = members.find((m) => m.member_id === selectedMemberId);
  const isAlreadyBooked = selectedMemberId ? bookedIds.has(selectedMemberId) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError('Please select a member to book into this class.');
      return;
    }
    if (isAlreadyBooked) {
      setError('This member is already booked in this class.');
      return;
    }
    if (spotsLeft <= 0) {
      setError('This class is already at maximum capacity.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await onConfirm(gymClass.id, selectedMemberId);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Failed to book member.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to book spot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#C9FF3D]/15 flex items-center justify-center text-[#C9FF3D]">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#EDEEEA]">Book Class Spot</h2>
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

          {/* Class details badge */}
          <div className="p-3 bg-[#212528] border border-[#2C3034] rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-[#EDEEEA]">{gymClass.class_name}</h4>
                <p className="text-xs text-[#9A9E9F] mt-0.5">
                  {gymClass.studio_location} · {gymClass.start_time} · Coach {gymClass.trainer_name || 'Staff'}
                </p>
              </div>
              <span className="text-xs font-mono text-[#C9FF3D] font-bold bg-[#C9FF3D]/10 px-2 py-0.5 rounded border border-[#C9FF3D]/30">
                {spotsLeft} spots left
              </span>
            </div>
          </div>

          {/* Member select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1.5">
              Which member to add? *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2.5 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              required
            >
              <option value="" disabled>-- Select member to add --</option>
              {members.map((m) => {
                const booked = bookedIds.has(m.member_id);
                return (
                  <option key={m.member_id} value={m.member_id} disabled={booked}>
                    {m.member_id} — {m.full_name} ({m.plan_type} • {m.status}) {booked ? '— [Already Booked]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selected member preview */}
          {selectedMember && (
            <div className="p-3 bg-[#101214] border border-[#2C3034] rounded-lg flex justify-between items-center text-xs">
              <div>
                <span className="text-[#EDEEEA] font-semibold">{selectedMember.full_name}</span>
                <span className="text-[#5D6164] ml-2 font-mono">{selectedMember.member_id}</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  selectedMember.status === 'Active'
                    ? 'bg-[#C9FF3D]/15 text-[#C9FF3D]'
                    : 'bg-[#FF5F45]/15 text-[#FF5F45]'
                }`}
              >
                {selectedMember.status}
              </span>
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
              disabled={isSubmitting || !selectedMemberId || isAlreadyBooked || spotsLeft <= 0}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9FF3D] text-[#101214] hover:bg-[#b8eb32] cursor-pointer disabled:opacity-40"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
