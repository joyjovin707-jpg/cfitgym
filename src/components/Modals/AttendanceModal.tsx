import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { Member } from '../../types/index.ts';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (memberId: string, method: string) => Promise<void>;
  members: Member[];
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  onCheckIn,
  members,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const method = 'Reception Desk';
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].member_id);
    }
    setError('');
  }, [isOpen, members]);

  if (!isOpen) return null;

  const selectedMember = members.find((m) => m.member_id === selectedMemberId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError('Please select a member to check in.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onCheckIn(selectedMemberId, method);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record check-in.');
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
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#EDEEEA]">Reception Desk Check-in</h2>
          </div>
          <button onClick={onClose} className="text-[#9A9E9F] hover:text-[#EDEEEA] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FF5F45]/15 border border-[#FF5F45]/40 text-[#FF5F45] text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1.5">
              Select Member *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2.5 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              required
            >
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.member_id} — {m.full_name} ({m.plan_type} • {m.status})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Member Detail Summary */}
          {selectedMember && (
            <div className="p-3 bg-[#212528] border border-[#2C3034] rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#EDEEEA]">{selectedMember.full_name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    selectedMember.status === 'Active'
                      ? 'bg-[#C9FF3D]/15 text-[#C9FF3D]'
                      : selectedMember.status === 'Expiring'
                      ? 'bg-[#FF5F45]/15 text-[#FF5F45]'
                      : selectedMember.status === 'Expired'
                      ? 'bg-[#FF5F45]/25 text-[#FF5F45]'
                      : 'bg-[#9A9E9F]/15 text-[#9A9E9F]'
                  }`}
                >
                  {selectedMember.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#9A9E9F]">
                <div>
                  <span className="text-[#5D6164]">ID: </span>
                  <span className="font-mono text-[#EDEEEA]">{selectedMember.member_id}</span>
                </div>
                <div>
                  <span className="text-[#5D6164]">Plan: </span>
                  <span className="text-[#EDEEEA]">{selectedMember.plan_type}</span>
                </div>
                <div>
                  <span className="text-[#5D6164]">Expiry: </span>
                  <span className="font-mono text-[#EDEEEA]">{selectedMember.expiry_date}</span>
                </div>
                <div>
                  <span className="text-[#5D6164]">Trainer: </span>
                  <span className="text-[#EDEEEA]">{selectedMember.trainer_name || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Fixed Check-in Method: Reception Desk */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1.5">
              Check-in Method
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-[#C9FF3D]/40 bg-[#212528] text-xs font-medium text-[#EDEEEA]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C9FF3D]" />
                <span className="font-semibold text-[#EDEEEA]">Reception Desk</span>
              </div>
              <span className="text-[10px] font-mono text-[#8FB82A] uppercase">Active</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#2C3034]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#EDEEEA] border border-[#2C3034] hover:bg-[#212528] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9FF3D] text-[#101214] hover:bg-[#b8eb32] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Confirm Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
