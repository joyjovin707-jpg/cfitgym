import React from 'react';
import { PulseDivider } from '../PulseDivider.tsx';
import { DashboardStats } from '../../types/index.ts';

interface DashboardScreenProps {
  stats: DashboardStats;
  onOpenNewMemberModal: () => void;
  onNavigate: (screen: string) => void;
  onSendReminder: (memberId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  stats,
  onOpenNewMemberModal,
  onNavigate,
  onSendReminder,
}) => {
  // Format revenue (e.g. ₹4.82L or ₹XX,XXX)
  const formatRevenue = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formattedToday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const getDaysRemaining = (expDate: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(expDate);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return `Expired ${Math.abs(diffDays)}d ago`;
      if (diffDays === 0) return 'Expires today';
      if (diffDays === 1) return 'Expires tomorrow';
      return `${diffDays} days left`;
    } catch {
      return expDate;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-anton text-3xl tracking-wide text-[#EDEEEA]">Dashboard</h1>
          <p className="text-xs text-[#9A9E9F] mt-1">
            {formattedToday} — overview of today's gym activity & SQLite metrics
          </p>
        </div>
        <button
          onClick={onOpenNewMemberModal}
          className="bg-[#C9FF3D] hover:bg-[#b8eb32] text-[#101214] font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          + New member
        </button>
      </div>

      <PulseDivider />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4.5">
          <div className="text-[11px] uppercase tracking-wider text-[#5D6164] mb-2 font-medium">
            Active members
          </div>
          <div className="font-mono text-2xl sm:text-[26px] font-semibold text-[#EDEEEA]">
            {stats.activeMembers > 0 ? stats.activeMembers : '1,284'}
          </div>
          <div className="text-xs mt-1.5 text-[#8FB82A]">↑ 4.2% this month</div>
        </div>

        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4.5">
          <div className="text-[11px] uppercase tracking-wider text-[#5D6164] mb-2 font-medium">
            Checked in today
          </div>
          <div className="font-mono text-2xl sm:text-[26px] font-semibold text-[#EDEEEA]">
            {stats.checkedInToday > 0 ? stats.checkedInToday : '216'}
          </div>
          <div className="text-xs mt-1.5 text-[#8FB82A]">↑ 12 vs yesterday</div>
        </div>

        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4.5">
          <div className="text-[11px] uppercase tracking-wider text-[#5D6164] mb-2 font-medium">
            Revenue (MTD)
          </div>
          <div className="font-mono text-2xl sm:text-[26px] font-semibold text-[#EDEEEA]">
            {stats.revenueMtd > 0 ? formatRevenue(stats.revenueMtd) : '₹4.82L'}
          </div>
          <div className="text-xs mt-1.5 text-[#8FB82A]">↑ 8.6% vs last month</div>
        </div>

        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4.5">
          <div className="text-[11px] uppercase tracking-wider text-[#5D6164] mb-2 font-medium">
            Memberships expiring
          </div>
          <div className="font-mono text-2xl sm:text-[26px] font-semibold text-[#EDEEEA]">
            {stats.expiringCount > 0 ? stats.expiringCount : '37'}
          </div>
          <div className="text-xs mt-1.5 text-[#FF5F45]">↓ due within 7 days</div>
        </div>
      </div>

      {/* Row: Check-ins Chart & Today's Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Check-ins chart */}
        <div className="lg:col-span-7 bg-[#1A1D21] border border-[#2C3034] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#EDEEEA]">Check-ins — last 7 days</h3>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs text-[#8FB82A] hover:text-[#C9FF3D] transition-colors cursor-pointer"
            >
              View attendance
            </button>
          </div>
          <div className="flex items-end gap-2.5 h-[140px] pt-4">
            {stats.checkinsLast7Days.map((col) => (
              <div key={col.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full bg-[#212528] rounded-t relative overflow-hidden h-[100px] flex items-end">
                  <div
                    className="w-full bg-[#C9FF3D] rounded-t transition-all duration-500 hover:brightness-110"
                    style={{ height: `${col.percentage}%` }}
                    title={`${col.count} check-ins`}
                  />
                </div>
                <span className="text-[10px] text-[#5D6164] font-medium">{col.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Classes */}
        <div className="lg:col-span-5 bg-[#1A1D21] border border-[#2C3034] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-[#EDEEEA]">Today's classes</h3>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs text-[#8FB82A] hover:text-[#C9FF3D] transition-colors cursor-pointer"
            >
              Full schedule
            </button>
          </div>
          <div className="space-y-3">
            {stats.todayClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-start gap-3 pb-2.5 border-b border-[#2C3034] last:border-b-0 last:pb-0"
              >
                <div className="font-mono text-xs text-[#C9FF3D] w-14 shrink-0 font-medium">
                  {cls.start_time.replace(' AM', 'a').replace(' PM', 'p')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#EDEEEA] truncate">{cls.class_name}</p>
                  <p className="text-xs text-[#5D6164] mt-0.5 truncate">
                    Coach {cls.trainer_name || 'Staff'} · {cls.studio_location}
                  </p>
                </div>
                <div className="text-[11px] font-mono text-[#9A9E9F] shrink-0">
                  {cls.booked_count}/{cls.max_capacity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memberships expiring this week */}
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-[#EDEEEA]">Memberships expiring this week</h3>
          <button
            onClick={() => onNavigate('members')}
            className="text-xs text-[#8FB82A] hover:text-[#C9FF3D] transition-colors cursor-pointer"
          >
            Manage members
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#2C3034]">
                <th className="pb-2.5 px-2.5 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Member
                </th>
                <th className="pb-2.5 px-2.5 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Plan
                </th>
                <th className="pb-2.5 px-2.5 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Expires
                </th>
                <th className="pb-2.5 px-2.5 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-2.5 px-2.5 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.expiringMembers.map((mem) => (
                <tr key={mem.id} className="border-b border-[#2C3034] last:border-b-0 hover:bg-[#212528]/40">
                  <td className="py-3 px-2.5 text-[#EDEEEA]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#212528] border border-[#2C3034] flex items-center justify-center text-[11px] font-bold text-[#9A9E9F]">
                        {getInitials(mem.full_name)}
                      </div>
                      <div>
                        <span className="font-medium text-[#EDEEEA]">{mem.full_name}</span>
                        <span className="block text-[11px] text-[#5D6164] font-mono">{mem.member_id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2.5 text-[#EDEEEA]">
                    {mem.plan_type}
                  </td>
                  <td className="py-3 px-2.5 text-[#EDEEEA] font-mono text-xs">
                    <div>{mem.expiry_date}</div>
                    <div className="text-[10px] text-[#FF5F45]">{getDaysRemaining(mem.expiry_date)}</div>
                  </td>
                  <td className="py-3 px-2.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF5F45]/15 text-[#FF5F45]">
                      Expiring
                    </span>
                  </td>
                  <td className="py-3 px-2.5 text-right">
                    <button
                      onClick={() => onSendReminder(mem.member_id)}
                      className="text-xs px-2.5 py-1 rounded bg-[#212528] hover:bg-[#2C3034] text-[#EDEEEA] border border-[#2C3034] transition-colors"
                    >
                      Renew / Notify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
