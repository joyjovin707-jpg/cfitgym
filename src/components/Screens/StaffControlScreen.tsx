import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  PowerOff,
  UserCheck
} from 'lucide-react';
import { StaffUser } from '../../types/index.ts';
import { StaffModal } from '../Modals/StaffModal.tsx';
import { ResetPasswordModal } from '../Modals/ResetPasswordModal.tsx';
import { ConfirmDeleteModal } from '../Modals/ConfirmDeleteModal.tsx';

interface StaffControlScreenProps {
  staffList: StaffUser[];
  currentAdminUsername: string;
  onAddStaff: (data: any) => Promise<{ success: boolean; message?: string }>;
  onUpdateStaff: (id: number, data: Partial<StaffUser>) => Promise<{ success: boolean; message?: string }>;
  onDeleteStaff: (id: number) => Promise<{ success: boolean; message?: string }>;
  onToggleStatus: (id: number) => Promise<boolean>;
  onResetPassword: (id: number, newPass: string) => Promise<boolean>;
}

export const StaffControlScreen: React.FC<StaffControlScreenProps> = ({
  staffList,
  currentAdminUsername,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onToggleStatus,
  onResetPassword,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('All shifts');
  const [statusFilter, setStatusFilter] = useState('All status');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [resetPassStaff, setResetPassStaff] = useState<StaffUser | null>(null);
  const [deleteStaff, setDeleteStaff] = useState<StaffUser | null>(null);

  // Filtered staff list
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.phone && s.phone.includes(searchTerm));

    const matchesShift = shiftFilter === 'All shifts' || s.shift === shiftFilter;
    const matchesStatus = statusFilter === 'All status' || s.status === statusFilter;

    return matchesSearch && matchesShift && matchesStatus;
  });

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.status === 'Active').length;
  const morningShift = staffList.filter((s) => s.shift === 'Morning').length;
  const eveningShift = staffList.filter((s) => s.shift === 'Evening').length;

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffUser) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-anton text-3xl tracking-wide text-[#EDEEEA]">Staff Control</h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C9FF3D]/15 text-[#C9FF3D] border border-[#C9FF3D]/30 uppercase">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-[#9A9E9F] mt-1">
            Manage staff credentials, duty shifts, and operational system permissions
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#C9FF3D] hover:bg-[#b8eb32] text-[#101214] font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#9A9E9F] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-[#C9FF3D]" />
          </div>
          <p className="font-anton text-2xl text-[#EDEEEA]">{totalStaff}</p>
          <span className="text-[11px] text-[#5D6164] mt-0.5 block">Configured accounts</span>
        </div>

        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#9A9E9F] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Status</span>
            <UserCheck className="w-4 h-4 text-[#8FB82A]" />
          </div>
          <p className="font-anton text-2xl text-[#C9FF3D]">{activeStaff}</p>
          <span className="text-[11px] text-[#5D6164] mt-0.5 block">Can sign in to desk</span>
        </div>

        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#9A9E9F] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Morning Shift</span>
            <Clock className="w-4 h-4 text-[#9A9E9F]" />
          </div>
          <p className="font-anton text-2xl text-[#EDEEEA]">{morningShift}</p>
          <span className="text-[11px] text-[#5D6164] mt-0.5 block">06:00 AM – 02:00 PM</span>
        </div>

        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#9A9E9F] mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Evening Shift</span>
            <Clock className="w-4 h-4 text-[#9A9E9F]" />
          </div>
          <p className="font-anton text-2xl text-[#EDEEEA]">{eveningShift}</p>
          <span className="text-[11px] text-[#5D6164] mt-0.5 block">02:00 PM – 10:00 PM</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5D6164] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search staff by name, @username, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#212528] border border-[#2C3034] rounded-lg pl-9 pr-4 py-2 text-xs text-[#EDEEEA] placeholder-[#5D6164] focus:outline-none focus:border-[#C9FF3D]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-xs text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
          >
            <option value="All shifts">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Full Day">Full Day</option>
            <option value="Night">Night</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-xs text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
          >
            <option value="All status">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2C3034] bg-[#212528]/50 text-[11px] font-semibold text-[#9A9E9F] uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role & Access</th>
                <th className="py-3 px-4">Shift Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C3034]">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#9A9E9F]">
                    No staff members match the current filter.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isCurrent = staff.username === currentAdminUsername;
                  const isPrimaryAdmin = staff.username === 'admin';

                  return (
                    <tr key={staff.id} className="hover:bg-[#212528]/40 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            staff.role === 'Admin'
                              ? 'bg-[#C9FF3D]/20 text-[#C9FF3D] border border-[#C9FF3D]/40'
                              : 'bg-[#212528] text-[#EDEEEA] border border-[#2C3034]'
                          }`}>
                            {staff.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#EDEEEA]">{staff.full_name}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C9FF3D]/10 text-[#C9FF3D] font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#5D6164] font-mono mt-0.5">
                              @{staff.username}
                            </div>
                            {(staff.email || staff.phone) && (
                              <div className="flex items-center gap-2 text-[10px] text-[#9A9E9F] mt-0.5">
                                {staff.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-2.5 h-2.5" />
                                    {staff.email}
                                  </span>
                                )}
                                {staff.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-2.5 h-2.5" />
                                    {staff.phone}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Access */}
                      <td className="py-3 px-4 text-xs">
                        {staff.role === 'Admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C9FF3D]/15 text-[#C9FF3D] border border-[#C9FF3D]/30">
                            <Shield className="w-3 h-3" />
                            Admin Access
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#212528] text-[#EDEEEA] border border-[#2C3034]">
                            <UserCheck className="w-3 h-3 text-[#9A9E9F]" />
                            Staff Desk
                          </span>
                        )}
                      </td>

                      {/* Shift Schedule */}
                      <td className="py-3 px-4 text-xs">
                        <div className="flex items-center gap-1.5 text-[#EDEEEA]">
                          <Clock className="w-3.5 h-3.5 text-[#5D6164]" />
                          <span className="font-medium">{staff.shift}</span>
                        </div>
                        <span className="text-[10px] text-[#5D6164] ml-5">
                          {staff.shift === 'Morning' && '06:00 AM – 02:00 PM'}
                          {staff.shift === 'Evening' && '02:00 PM – 10:00 PM'}
                          {staff.shift === 'Full Day' && 'All operations'}
                          {staff.shift === 'Night' && '10:00 PM – 06:00 AM'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-xs">
                        {staff.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#8FB82A]/15 text-[#8FB82A] border border-[#8FB82A]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8FB82A] animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF5F45]/15 text-[#FF5F45] border border-[#FF5F45]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F45]" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Operational Permissions */}
                      <td className="py-3 px-4 text-xs">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {staff.can_manage_members && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#212528] text-[#9A9E9F] border border-[#2C3034]">
                              Members
                            </span>
                          )}
                          {staff.can_process_payments && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#212528] text-[#9A9E9F] border border-[#2C3034]">
                              Payments
                            </span>
                          )}
                          {staff.can_manage_classes && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#212528] text-[#9A9E9F] border border-[#2C3034]">
                              Classes
                            </span>
                          )}
                          {staff.can_manage_trainers && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#212528] text-[#9A9E9F] border border-[#2C3034]">
                              Trainers
                            </span>
                          )}
                          {!staff.can_manage_members && !staff.can_process_payments && !staff.can_manage_classes && (
                            <span className="text-[10px] text-[#5D6164]">Read-only desk</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Status */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => onToggleStatus(staff.id)}
                              title={staff.status === 'Active' ? 'Suspend Staff Account' : 'Activate Staff Account'}
                              className={`p-1.5 rounded transition-colors cursor-pointer ${
                                staff.status === 'Active'
                                  ? 'hover:bg-[#FF5F45]/20 text-[#9A9E9F] hover:text-[#FF5F45]'
                                  : 'hover:bg-[#8FB82A]/20 text-[#FF5F45] hover:text-[#8FB82A]'
                              }`}
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Reset Password */}
                          <button
                            onClick={() => setResetPassStaff(staff)}
                            title="Reset Staff Password"
                            className="p-1.5 rounded hover:bg-[#2C3034] text-[#9A9E9F] hover:text-[#C9FF3D] transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            title="Edit Staff Member"
                            className="p-1.5 rounded hover:bg-[#2C3034] text-[#9A9E9F] hover:text-[#EDEEEA] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account */}
                          {!isPrimaryAdmin && (
                            <button
                              onClick={() => setDeleteStaff(staff)}
                              title="Delete Staff Account"
                              className="p-1.5 rounded hover:bg-[#FF5F45]/20 text-[#5D6164] hover:text-[#FF5F45] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Create / Edit Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingStaff}
        onSave={async (data) => {
          if (editingStaff) {
            return await onUpdateStaff(editingStaff.id, data);
          } else {
            return await onAddStaff(data);
          }
        }}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={!!resetPassStaff}
        onClose={() => setResetPassStaff(null)}
        staffUser={resetPassStaff}
        onConfirm={async (id, newPass) => {
          const ok = await onResetPassword(id, newPass);
          if (ok) setResetPassStaff(null);
          return ok;
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteStaff}
        title="Delete Staff Account"
        message="Are you sure you want to permanently delete this staff member? They will no longer be able to log in to the terminal."
        itemDetails={deleteStaff ? `${deleteStaff.full_name} (@${deleteStaff.username})` : undefined}
        confirmText="Yes, Delete Staff Account"
        onClose={() => setDeleteStaff(null)}
        onConfirm={() => {
          if (deleteStaff) {
            onDeleteStaff(deleteStaff.id);
            setDeleteStaff(null);
          }
        }}
      />
    </div>
  );
};
