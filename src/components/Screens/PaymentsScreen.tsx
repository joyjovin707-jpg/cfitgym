import React, { useState } from 'react';
import { Plus, Check, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { PaymentRecord } from '../../types/index.ts';

interface PaymentsScreenProps {
  payments: PaymentRecord[];
  collectedMtd: number;
  pendingDues: number;
  overdueCount: number;
  onRecordPayment: () => void;
  onUpdateStatus: (id: number, status: 'Paid' | 'Overdue' | 'Pending') => void;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({
  payments,
  collectedMtd,
  pendingDues,
  overdueCount,
  onRecordPayment,
  onUpdateStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = payments.filter((p) => {
    if (statusFilter === 'All') return true;
    return p.payment_status === statusFilter;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getDueStatusMeta = (dueDate: string, status: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (status === 'Paid') {
        return { text: 'Settled', color: 'text-[#8FB82A]' };
      }
      if (diffDays < 0) {
        return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-[#FF5F45]' };
      }
      if (diffDays === 0) {
        return { text: 'Due today', color: 'text-[#FF5F45]' };
      }
      return { text: `Due in ${diffDays}d`, color: 'text-[#9A9E9F]' };
    } catch {
      return { text: '', color: '' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-anton text-3xl tracking-wide text-[#EDEEEA]">Payments</h1>
          <p className="text-xs text-[#9A9E9F] mt-1">Billing, invoices and dues tracking</p>
        </div>
        <button
          onClick={onRecordPayment}
          className="bg-[#C9FF3D] hover:bg-[#b8eb32] text-[#101214] font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Record payment
        </button>
      </div>

      {/* Stat Grid (3 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4.5">
          <div className="text-[11px] uppercase tracking-wider text-[#5D6164] mb-2 font-medium">
            Collected (MTD)
          </div>
          <div className="font-mono text-2xl font-semibold text-[#EDEEEA]">
            {formatCurrency(collectedMtd)}
          </div>
          <div className="text-xs mt-1.5 text-[#8FB82A]">From paid invoices</div>
        </div>

        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4.5">
          <div className="text-[11px] uppercase tracking-wider text-[#5D6164] mb-2 font-medium">
            Pending dues
          </div>
          <div className="font-mono text-2xl font-semibold text-[#EDEEEA]">
            {formatCurrency(pendingDues)}
          </div>
          <div className="text-xs mt-1.5 text-[#9A9E9F]">Scheduled collections</div>
        </div>

        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4.5">
          <div className="text-[11px] uppercase tracking-wider text-[#5D6164] mb-2 font-medium">
            Overdue accounts
          </div>
          <div className="font-mono text-2xl font-semibold text-[#FF5F45]">
            {overdueCount}
          </div>
          <div className="text-xs mt-1.5 text-[#FF5F45]">Requires follow-up</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'Paid', 'Pending', 'Overdue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === tab
                ? 'bg-[#212528] text-[#C9FF3D] border border-[#2C3034]'
                : 'text-[#9A9E9F] hover:text-[#EDEEEA] hover:bg-[#1A1D21]'
            }`}
          >
            {tab} ({tab === 'All' ? payments.length : payments.filter((p) => p.payment_status === tab).length})
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4 sm:p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#2C3034]">
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Member
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Plan Description
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Amount
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Due date
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider text-right">
                  Change Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-[#9A9E9F]">
                    No payment records found under this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#2C3034] last:border-b-0 hover:bg-[#212528]/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-[#EDEEEA]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#212528] border border-[#2C3034] flex items-center justify-center text-[11px] font-bold text-[#9A9E9F] shrink-0">
                          {getInitials(item.member_name || item.member_id)}
                        </div>
                        <div>
                          <span className="font-medium text-[#EDEEEA]">{item.member_name}</span>
                          <span className="block text-[11px] text-[#5D6164] font-mono">
                            {item.member_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#EDEEEA]">{item.plan_description}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#EDEEEA]">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-[#9A9E9F]">
                      <div>{item.due_date}</div>
                      {(() => {
                        const meta = getDueStatusMeta(item.due_date, item.payment_status);
                        return meta.text ? (
                          <div className={`text-[10px] ${meta.color} font-sans font-medium mt-0.5`}>
                            {meta.text}
                          </div>
                        ) : null;
                      })()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.payment_status === 'Paid'
                            ? 'bg-[#C9FF3D]/15 text-[#C9FF3D]'
                            : item.payment_status === 'Overdue'
                            ? 'bg-[#FF5F45]/15 text-[#FF5F45]'
                            : 'bg-[#9A9E9F]/15 text-[#9A9E9F]'
                        }`}
                      >
                        {item.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.payment_status !== 'Paid' && (
                          <button
                            onClick={() => onUpdateStatus(item.id, 'Paid')}
                            title="Mark as Paid"
                            className="px-2 py-1 text-xs rounded bg-[#212528] hover:bg-[#C9FF3D]/20 text-[#C9FF3D] border border-[#2C3034] transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        {item.payment_status === 'Pending' && (
                          <button
                            onClick={() => onUpdateStatus(item.id, 'Overdue')}
                            title="Mark Overdue"
                            className="px-2 py-1 text-xs rounded bg-[#212528] hover:bg-[#FF5F45]/20 text-[#FF5F45] border border-[#2C3034] transition-colors"
                          >
                            Mark Overdue
                          </button>
                        )}
                        {item.payment_status === 'Paid' && (
                          <span className="text-xs text-[#5D6164] font-mono">Cleared</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
