import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Trainer } from '../../types/index.ts';
import { ConfirmDeleteModal } from '../Modals/ConfirmDeleteModal.tsx';

interface TrainersScreenProps {
  trainers: Trainer[];
  onAddTrainer: () => void;
  onEditTrainer: (trainer: Trainer) => void;
  onDeleteTrainer: (id: number) => void;
}

export const TrainersScreen: React.FC<TrainersScreenProps> = ({
  trainers,
  onAddTrainer,
  onEditTrainer,
  onDeleteTrainer,
}) => {
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const assignedCount = trainers.filter((t) => (t.clients_assigned || 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-anton text-3xl tracking-wide text-[#EDEEEA]">Trainers</h1>
          <p className="text-xs text-[#9A9E9F] mt-1">
            {trainers.length} on staff · {assignedCount} currently assigned to clients
          </p>
        </div>
        <button
          onClick={onAddTrainer}
          className="bg-[#C9FF3D] hover:bg-[#b8eb32] text-[#101214] font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add trainer
        </button>
      </div>

      {/* Grid of trainer cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.map((t) => (
          <div
            key={t.id}
            className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-5 flex flex-col justify-between hover:border-[#5D6164] transition-all"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#212528] border border-[#2C3034] flex items-center justify-center font-bold text-xs text-[#EDEEEA] shrink-0">
                    {getInitials(t.full_name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#EDEEEA] leading-tight">
                      {t.full_name}
                    </h3>
                    <p className="text-xs text-[#9A9E9F] mt-0.5">{t.specialty}</p>
                    <span className="font-mono text-[10px] text-[#5D6164] uppercase tracking-wider">
                      {t.trainer_code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTrainer(t)}
                    title="Edit"
                    className="p-1 text-[#9A9E9F] hover:text-[#EDEEEA] rounded hover:bg-[#212528] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTrainerToDelete(t)}
                    title="Remove Trainer"
                    className="p-1 text-[#5D6164] hover:text-[#FF5F45] rounded hover:bg-[#FF5F45]/15 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#2C3034] text-xs">
                <div className="flex justify-between py-1 border-b border-[#2C3034]">
                  <span className="text-[#5D6164]">Clients assigned</span>
                  <span className="font-medium text-[#EDEEEA] font-mono">{t.clients_assigned || 0}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#5D6164]">Sessions this week</span>
                  <span className="font-medium text-[#EDEEEA] font-mono">{t.sessions_this_week || 16}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* In-app Confirmation Modal for Trainer Deletion */}
      <ConfirmDeleteModal
        isOpen={!!trainerToDelete}
        title="Remove Staff Trainer"
        message="Are you sure you want to remove this trainer from the system? Any members assigned to this coach will be unassigned, and their scheduled classes will be reassigned."
        itemDetails={trainerToDelete ? `${trainerToDelete.full_name} (${trainerToDelete.trainer_code}) — Specialty: ${trainerToDelete.specialty}` : undefined}
        confirmText="Yes, Remove Trainer"
        onClose={() => setTrainerToDelete(null)}
        onConfirm={() => {
          if (trainerToDelete) {
            onDeleteTrainer(trainerToDelete.id);
            setTrainerToDelete(null);
          }
        }}
      />
    </div>
  );
};
