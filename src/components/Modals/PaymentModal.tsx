import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check, Sparkles } from 'lucide-react';
import { Member, PaymentRecord } from '../../types/index.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<PaymentRecord, 'id'>) => Promise<void>;
  members: Member[];
  initialMemberId?: string;
}

type BillingCycle = 'monthly' | 'quarterly' | 'half-yearly' | 'annual';

/**
 * Standard Gym Membership Plan Rates (in INR ₹)
 */
export const getPlanAmount = (planType?: string, cycle: BillingCycle = 'monthly'): number => {
  const norm = (planType || '').trim().toLowerCase();

  if (norm.includes('silver')) {
    switch (cycle) {
      case 'quarterly':
        return 5000;
      case 'half-yearly':
        return 9500;
      case 'annual':
        return 18000;
      case 'monthly':
      default:
        return 1800;
    }
  } else if (norm.includes('gold')) {
    switch (cycle) {
      case 'quarterly':
        return 7000;
      case 'half-yearly':
        return 14000;
      case 'annual':
        return 25000;
      case 'monthly':
      default:
        return 2500;
    }
  } else if (norm.includes('platinum')) {
    switch (cycle) {
      case 'quarterly':
        return 9800;
      case 'half-yearly':
        return 18500;
      case 'annual':
        return 28000;
      case 'monthly':
      default:
        return 3500;
    }
  }

  // Fallback for custom or other plan tiers
  switch (cycle) {
    case 'quarterly':
      return 6000;
    case 'half-yearly':
      return 12000;
    case 'annual':
      return 22000;
    case 'monthly':
    default:
      return 2000;
  }
};

const cycleDescriptions: Record<BillingCycle, string> = {
  monthly: 'monthly',
  quarterly: 'quarterly',
  'half-yearly': '6 month',
  annual: 'annual',
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  initialMemberId,
}) => {
  const [memberId, setMemberId] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [amount, setAmount] = useState('2500');
  const [dueDate, setDueDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Paid');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or update fields when modal opens or members list changes
  useEffect(() => {
    if (!isOpen) return;

    const targetId =
      initialMemberId && members.some((m) => m.member_id === initialMemberId)
        ? initialMemberId
        : memberId && members.some((m) => m.member_id === memberId)
        ? memberId
        : members[0]?.member_id || '';

    setMemberId(targetId);
    setBillingCycle('monthly');

    const selectedMember = members.find((m) => m.member_id === targetId);
    if (selectedMember) {
      const defaultAmount = getPlanAmount(selectedMember.plan_type, 'monthly');
      setAmount(String(defaultAmount));
    } else {
      setAmount('2500');
    }

    const today = new Date().toISOString().split('T')[0];
    setDueDate(today);
    setPaymentStatus('Paid');
    setError('');
  }, [isOpen, initialMemberId, members]);

  if (!isOpen) return null;

  // Selected member object
  const selectedMember = members.find((m) => m.member_id === memberId);

  // When a user selects a different member from the dropdown, immediately adjust the amount based on their plan
  const handleMemberChange = (newMemberId: string) => {
    setMemberId(newMemberId);
    const chosen = members.find((m) => m.member_id === newMemberId);
    if (chosen) {
      const calculatedAmount = getPlanAmount(chosen.plan_type, billingCycle);
      setAmount(String(calculatedAmount));
    }
  };

  // When changing billing cycle, recalculate amount for the selected member's plan
  const handleCycleChange = (newCycle: BillingCycle) => {
    setBillingCycle(newCycle);
    if (selectedMember) {
      const calculatedAmount = getPlanAmount(selectedMember.plan_type, newCycle);
      setAmount(String(calculatedAmount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const planDesc = selectedMember
        ? `${selectedMember.plan_type} — ${cycleDescriptions[billingCycle]}`
        : 'Membership fee';

      await onSave({
        member_id: memberId,
        plan_description: planDesc,
        amount: parsedAmount,
        due_date: dueDate,
        payment_status: paymentStatus,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save payment record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#C9FF3D]" />
            <h2 className="text-lg font-bold text-[#EDEEEA]">Record Payment / Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9A9E9F] hover:text-[#EDEEEA] transition-colors cursor-pointer"
          >
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Select Member *
            </label>
            <select
              value={memberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2.5 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D] transition-colors"
              required
            >
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.member_id} — {m.full_name} ({m.plan_type} Tier)
                </option>
              ))}
            </select>

            {/* Dynamic Member Plan Info Callout */}
            {selectedMember && (
              <div className="mt-2.5 p-2.5 bg-[#212528] border border-[#2C3034] rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#9A9E9F]">Membership Plan:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        selectedMember.plan_type.toLowerCase() === 'platinum'
                          ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50'
                          : selectedMember.plan_type.toLowerCase() === 'gold'
                          ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                          : 'bg-slate-700/40 text-slate-300 border border-slate-600/50'
                      }`}
                    >
                      {selectedMember.plan_type}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#5D6164] mt-0.5">
                    Standard Rate: ₹{getPlanAmount(selectedMember.plan_type, 'monthly').toLocaleString('en-IN')}/mo
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#5D6164] block">Account Status</span>
                  <span
                    className={`text-xs font-semibold ${
                      selectedMember.status === 'Active'
                        ? 'text-[#8FB82A]'
                        : selectedMember.status === 'Expiring'
                        ? 'text-amber-400'
                        : selectedMember.status === 'Paused'
                        ? 'text-sky-400'
                        : 'text-[#FF5F45]'
                    }`}
                  >
                    {selectedMember.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Billing Cycle / Duration Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Billing Duration / Cycle
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'monthly', label: '1 Mo', desc: 'Monthly' },
                { id: 'quarterly', label: '3 Mo', desc: 'Quarterly' },
                { id: 'half-yearly', label: '6 Mo', desc: 'Half-Yr' },
                { id: 'annual', label: '1 Yr', desc: 'Annual' },
              ].map((item) => {
                const isSelected = billingCycle === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCycleChange(item.id as BillingCycle)}
                    className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#C9FF3D] text-[#101214] font-bold border-[#C9FF3D] shadow-sm'
                        : 'bg-[#212528] text-[#EDEEEA] border-[#2C3034] hover:border-[#5D6164]'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div
                      className={`text-[9px] ${
                        isSelected ? 'text-[#101214]/80' : 'text-[#5D6164]'
                      }`}
                    >
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F]">
                  Amount (₹) *
                </label>
                {selectedMember && (
                  <span className="text-[10px] text-[#C9FF3D] flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Auto-set
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] font-mono focus:outline-none focus:border-[#C9FF3D] transition-colors"
                  required
                />
              </div>
              <p className="text-[10px] text-[#5D6164] mt-1">
                Based on {selectedMember?.plan_type || 'selected'} tier
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Due / Paid Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D] transition-colors"
                required
              />
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2C3034]">
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
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9FF3D] text-[#101214] hover:bg-[#b8eb32] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording...' : 'Record Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
