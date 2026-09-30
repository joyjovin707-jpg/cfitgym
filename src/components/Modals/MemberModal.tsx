import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Member, Trainer } from '../../types/index.ts';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<Member, 'id'>, id?: number) => Promise<void>;
  editingMember?: Member | null;
  trainers: Trainer[];
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember,
  trainers,
}) => {
  const [memberId, setMemberId] = useState('');
  const [fullName, setFullName] = useState('');
  const [planType, setPlanType] = useState('Gold');
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [joinDate, setJoinDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<'Active' | 'Expiring' | 'Paused' | 'Expired'>('Active');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingMember) {
      setMemberId(editingMember.member_id);
      setFullName(editingMember.full_name);
      setPlanType(editingMember.plan_type);
      setTrainerId(editingMember.trainer_id || null);
      setJoinDate(editingMember.join_date);
      setExpiryDate(editingMember.expiry_date);
      setStatus(editingMember.status);
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setMemberId(`GYM-0${randomNum}`);
      setFullName('');
      setPlanType('Gold');
      setTrainerId(trainers[0]?.id || null);
      const today = new Date().toISOString().split('T')[0];
      setJoinDate(today);
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setExpiryDate(nextYear.toISOString().split('T')[0]);
      setStatus('Active');
    }
    setError('');
  }, [editingMember, isOpen, trainers]);

  if (!isOpen) return null;

  const handleDurationPreset = (months: number) => {
    const start = joinDate ? new Date(joinDate) : new Date();
    start.setMonth(start.getMonth() + months);
    const pad = (n: number) => String(n).padStart(2, '0');
    const newExp = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    setExpiryDate(newExp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId.trim() || !fullName.trim() || !joinDate || !expiryDate) {
      setError('Please fill in all required fields.');
      return;
    }
    if (new Date(expiryDate) < new Date(joinDate)) {
      setError('Expiry date cannot be earlier than join date.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSave(
        {
          member_id: memberId.trim(),
          full_name: fullName.trim(),
          plan_type: planType,
          trainer_id: trainerId,
          join_date: joinDate,
          expiry_date: expiryDate,
          status,
        },
        editingMember?.id
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save member. Please check Member ID uniqueness.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <h2 className="text-lg font-bold text-[#EDEEEA]">
            {editingMember ? 'Edit Member' : 'New Member Registration'}
          </h2>
          <button onClick={onClose} className="text-[#9A9E9F] hover:text-[#EDEEEA] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FF5F45]/15 border border-[#FF5F45]/40 text-[#FF5F45] text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Member ID *
              </label>
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="e.g. GYM-0142"
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] font-mono focus:outline-none focus:border-[#C9FF3D]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Membership Plan *
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Krishnan"
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Assigned Trainer
              </label>
              <select
                value={trainerId ?? ''}
                onChange={(e) => setTrainerId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              >
                <option value="">No trainer assigned</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.specialty})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Membership Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              >
                <option value="Active">Active</option>
                <option value="Expiring">Expiring</option>
                <option value="Paused">Paused</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Join Date *
              </label>
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F]">
                  Expiry Date *
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDurationPreset(1)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#212528] hover:bg-[#2C3034] text-[#C9FF3D] border border-[#2C3034]"
                  >
                    +1M
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDurationPreset(3)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#212528] hover:bg-[#2C3034] text-[#C9FF3D] border border-[#2C3034]"
                  >
                    +3M
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDurationPreset(6)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#212528] hover:bg-[#2C3034] text-[#C9FF3D] border border-[#2C3034]"
                  >
                    +6M
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDurationPreset(12)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#212528] hover:bg-[#2C3034] text-[#C9FF3D] border border-[#2C3034]"
                  >
                    +1Y
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2C3034]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#EDEEEA] border border-[#2C3034] hover:bg-[#212528] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9FF3D] text-[#101214] hover:bg-[#b8eb32] transition-colors"
            >
              {isSubmitting ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
