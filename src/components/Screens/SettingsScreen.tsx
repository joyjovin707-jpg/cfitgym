import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { gymDb } from '../../db/database.ts';
import { StaffUser } from '../../types/index.ts';

interface SettingsScreenProps {
  onNotify: (msg: string) => void;
  currentUser?: StaffUser | null;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const [gymName] = useState('C-fit Fitness Club');
  const [branch] = useState('Thiruvananthapuram — Main');
  const [currency] = useState('INR (₹)');
  const [checkinMethod] = useState('Reception Desk');
  const [tableCounts, setTableCounts] = useState<{ table: string; count: number }[]>([]);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const db = await gymDb.getDb();
      const tables = ['staff_users', 'trainers', 'members', 'attendance', 'payments', 'classes', 'class_bookings'];
      const counts: { table: string; count: number }[] = [];
      for (const t of tables) {
        try {
          const res = db.exec(`SELECT COUNT(*) FROM ${t}`);
          const cnt = (res[0]?.values[0]?.[0] as number) || 0;
          counts.push({ table: t, count: cnt });
        } catch {
          // Table may not exist yet
        }
      }
      setTableCounts(counts);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-anton text-3xl tracking-wide text-[#EDEEEA]">Settings</h1>
          <p className="text-xs text-[#9A9E9F] mt-1">System and organization configuration</p>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#EDEEEA] border-b border-[#2C3034] pb-3">
          Gym Organization Details
        </h3>

        <div className="flex justify-between items-center py-2 border-b border-[#2C3034] text-xs">
          <span className="text-[#5D6164]">Gym name</span>
          <span className="font-medium text-[#EDEEEA]">{gymName}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-[#2C3034] text-xs">
          <span className="text-[#5D6164]">Branch</span>
          <span className="font-medium text-[#EDEEEA]">{branch}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-[#2C3034] text-xs">
          <span className="text-[#5D6164]">Check-in method</span>
          <span className="font-medium text-[#EDEEEA]">{checkinMethod}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-[#2C3034] text-xs">
          <span className="text-[#5D6164]">Currency</span>
          <span className="font-medium text-[#EDEEEA]">{currency}</span>
        </div>
      </div>

      {/* Database Schema Diagnostics */}
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#2C3034] pb-3">
          <Database className="w-4 h-4 text-[#C9FF3D]" />
          <h3 className="text-sm font-bold text-[#EDEEEA]">Database Diagnostics (SQLite)</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {tableCounts.map((tc) => (
            <div key={tc.table} className="bg-[#212528] p-3 rounded-lg border border-[#2C3034] text-center">
              <div className="text-[10px] text-[#5D6164] uppercase font-mono truncate">{tc.table}</div>
              <div className="text-xl font-bold font-mono text-[#EDEEEA] mt-1">{tc.count}</div>
              <div className="text-[10px] text-[#8FB82A]">records</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
