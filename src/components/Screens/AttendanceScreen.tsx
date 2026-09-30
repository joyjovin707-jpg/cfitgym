import React from 'react';
import { UserCheck, LogOut, CheckCircle } from 'lucide-react';
import { AttendanceRecord } from '../../types/index.ts';

interface AttendanceScreenProps {
  logs: AttendanceRecord[];
  onScanCard: () => void;
  onCheckOut: (id: number) => void;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  logs,
  onScanCard,
  onCheckOut,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDisplayTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '—';
    try {
      const parts = dateTimeStr.split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || '';

      let formattedTime = '';
      if (timePart) {
        const [h, m] = timePart.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        formattedTime = `${String(displayHour).padStart(2, '0')}:${m} ${ampm}`;
      }

      if (datePart) {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const yDate = new Date(now);
        yDate.setDate(yDate.getDate() - 1);
        const yStr = `${yDate.getFullYear()}-${pad(yDate.getMonth() + 1)}-${pad(yDate.getDate())}`;

        if (datePart === todayStr) {
          return formattedTime ? `Today, ${formattedTime}` : 'Today';
        } else if (datePart === yStr) {
          return formattedTime ? `Yesterday, ${formattedTime}` : 'Yesterday';
        } else {
          const d = new Date(datePart);
          const monthName = d.toLocaleString('en-US', { month: 'short' });
          return `${d.getDate()} ${monthName}, ${formattedTime}`;
        }
      }
      return formattedTime || dateTimeStr;
    } catch {
      return dateTimeStr;
    }
  };

  const activeCheckins = logs.filter((l) => !l.check_out_time).length;

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-anton text-3xl tracking-wide text-[#EDEEEA]">Attendance</h1>
          <p className="text-xs text-[#9A9E9F] mt-1">
            Live check-in / check-out log · {activeCheckins} members currently on gym floor
          </p>
        </div>
        <button
          onClick={onScanCard}
          className="bg-[#C9FF3D] hover:bg-[#b8eb32] text-[#101214] font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          Check in member
        </button>
      </div>

      {/* Attendance Table */}
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-4 sm:p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#2C3034]">
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Member
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Check-in
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Check-out
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Duration
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider">
                  Method
                </th>
                <th className="pb-3 px-3 text-[11px] font-medium text-[#5D6164] uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-[#9A9E9F]">
                    No attendance logs recorded yet. Scan a member ID card to get started.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isInProgress = !log.check_out_time;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-[#2C3034] last:border-b-0 hover:bg-[#212528]/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-[#EDEEEA]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#212528] border border-[#2C3034] flex items-center justify-center text-[11px] font-bold text-[#9A9E9F] shrink-0">
                            {getInitials(log.member_name || log.member_id)}
                          </div>
                          <div>
                            <span className="font-medium text-[#EDEEEA]">{log.member_name}</span>
                            <span className="block text-[11px] text-[#5D6164] font-mono">
                              {log.member_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-[#EDEEEA]">
                        {formatDisplayTime(log.check_in_time)}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-[#9A9E9F]">
                        {log.check_out_time ? formatDisplayTime(log.check_out_time) : '—'}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {isInProgress ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#C9FF3D]/10 text-[#C9FF3D] animate-pulse">
                            In progress
                          </span>
                        ) : (
                          <span className="font-mono text-[#EDEEEA]">{log.duration}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#9A9E9F]">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#212528] text-[11px] border border-[#2C3034]">
                          {log.check_in_method}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isInProgress ? (
                          <button
                            onClick={() => onCheckOut(log.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-[#212528] hover:bg-[#FF5F45]/20 text-[#EDEEEA] hover:text-[#FF5F45] border border-[#2C3034] transition-colors"
                          >
                            <LogOut className="w-3 h-3" />
                            Check out
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#5D6164]">
                            <CheckCircle className="w-3 h-3 text-[#8FB82A]" />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
