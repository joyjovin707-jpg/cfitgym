import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, Trash2 } from 'lucide-react';
import { Member, Trainer } from '../../types/index.ts';
import { ConfirmDeleteModal } from '../Modals/ConfirmDeleteModal.tsx';

interface MembersScreenProps {
  members: Member[];
  trainers: Trainer[];
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: number) => void;
}

export const MembersScreen: React.FC<MembersScreenProps> = ({
  members,
  trainers,
  onAddMember,
  onEditMember,
  onDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('All plans');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const activeCount = members.filter((m) => m.status === 'Active').length;
  const expiringCount = members.filter((m) => m.status === 'Expiring').length;
  const pausedCount = members.filter((m) => m.status === 'Paused').length;

  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.full_name.toLowerCase().includes(term) ||
      m.member_id.toLowerCase().includes(term);

    const matchesPlan = planFilter === 'All plans' || m.plan_type === planFilter;
    const matchesStatus = statusFilter === 'All status' || m.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const exportCsv = () => {
    const headers = ['Member ID', 'Full Name', 'Plan Type', 'Trainer ID', 'Join Date', 'Expiry Date', 'Status'];
    const rows = filteredMembers.map((m) => [
      `"${m.member_id}"`,
      `"${m.full_name}"`,
      `"${m.plan_type}"`,
      `"${m.trainer_name || ''}"`,
      `"${m.join_date}"`,
      `"${m.expiry_date}"`,
      `"${m.status}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cfit_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getExpiryMeta = (expiryDate: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exp = new Date(expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return { text: `Expired ${Math.abs(diffDays)}d ago`, isExpired: true };
      if (diffDays === 0) return { text: 'Expires today', isExpiring: true };
      if (diffDays <= 7) return { text: `${diffDays}d left`, isExpiring: true };
      if (diffDays <= 30) return { text: `${diffDays}d left`, isNormal: true };
      const months = Math.round(diffDays / 30);
      return { text: `${months}mo left`, isNormal: true };
    } catch {
      return { text: '', isNormal: true };
    }
  };

  return (
    <div className="space-y-5">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-anton text-3xl tracking-wide text-[#EDEEEA]">Members</h1>
          <p className="text-xs text-[#9A9E9F] mt-1">
            {activeCount} active · {expiringCount} expiring · {pausedCount} paused
          </p>
        </div>
        <button
          onClick={onAddMember}
          className="bg-[#C9FF3D] hover:bg-[#b8eb32] text-[#101214] font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add member
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5D6164] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or member ID..."
            className="w-full sm:w-72 bg-[#212528] border border-[#2C3034] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-[#1A1D21] border border-[#2C3034] text-[#EDEEEA] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#C9FF3D]"
          >
            <option value="All plans">Filter: All plans</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1A1D21] border border-[#2C3034] text-[#EDEEEA] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#C9FF3D]"
          >
            <option value="All status">Filter: All status</option>
            <option value="Active">Active</option>
            <option value="Expiring">Expiring</option>
            <option value="Paused">Paused</option>
          </select>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 bg-[#1A1D21] hover:bg-[#212528] border border-[#2C3034] text-[#EDEEEA] text-xs rounded-lg px-3 py-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4 sm:p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#2C3034]">
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Member
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Member ID
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Plan
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Trainer
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Joined / Expires
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-[#9A9E9F]">
                    No members match the search query or filters.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-[#2C3034] last:border-b-0 hover:bg-[#212528]/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-[#EDEEEA]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#212528] border border-[#2C3034] flex items-center justify-center text-[11px] font-bold text-[#9A9E9F] shrink-0">
                          {getInitials(m.full_name)}
                        </div>
                        <span className="font-medium text-[#EDEEEA]">{m.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-[#9A9E9F]">
                      {m.member_id}
                    </td>
                    <td className="py-3 px-3 text-[#EDEEEA]">
                      <span className="font-medium">{m.plan_type}</span>
                    </td>
                    <td className="py-3 px-3 text-[#9A9E9F]">
                      {m.trainer_name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-[#9A9E9F]">
                      <div>{m.join_date}</div>
                      {(() => {
                        const meta = getExpiryMeta(m.expiry_date);
                        return (
                          <div className="text-[11px] flex items-center gap-1.5 mt-0.5">
                            <span className="text-[#5D6164]">Exp: {m.expiry_date}</span>
                            {meta.text && (
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-medium ${
                                  meta.isExpired
                                    ? 'bg-[#FF5F45]/20 text-[#FF5F45]'
                                    : meta.isExpiring
                                    ? 'bg-[#FF5F45]/15 text-[#FF5F45]'
                                    : 'bg-[#212528] text-[#8FB82A]'
                                }`}
                              >
                                {meta.text}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          m.status === 'Active'
                            ? 'bg-[#C9FF3D]/15 text-[#C9FF3D]'
                            : m.status === 'Expiring'
                            ? 'bg-[#FF5F45]/15 text-[#FF5F45]'
                            : m.status === 'Expired'
                            ? 'bg-[#FF5F45]/25 text-[#FF5F45]'
                            : 'bg-[#9A9E9F]/15 text-[#9A9E9F]'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditMember(m)}
                          title="Edit Member"
                          className="p-1.5 rounded hover:bg-[#2C3034] text-[#9A9E9F] hover:text-[#EDEEEA] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMemberToDelete(m)}
                          title="Delete Member"
                          className="p-1.5 rounded hover:bg-[#FF5F45]/20 text-[#5D6164] hover:text-[#FF5F45] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-app Confirmation Modal for Member Deletion */}
      <ConfirmDeleteModal
        isOpen={!!memberToDelete}
        title="Delete Member Record"
        message="Are you sure you want to permanently delete this member? All associated check-in logs and billing records will also be removed from cfit.db."
        itemDetails={memberToDelete ? `${memberToDelete.full_name} (${memberToDelete.member_id}) — ${memberToDelete.plan_type} Tier` : undefined}
        confirmText="Yes, Delete Member"
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => {
          if (memberToDelete) {
            onDeleteMember(memberToDelete.id);
            setMemberToDelete(null);
          }
        }}
      />
    </div>
  );
};
