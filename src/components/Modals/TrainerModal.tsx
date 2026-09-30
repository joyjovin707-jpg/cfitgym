import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Trainer } from '../../types/index.ts';

interface TrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trainer: Omit<Trainer, 'id'>, id?: number) => Promise<void>;
  editingTrainer?: Trainer | null;
}

export const TrainerModal: React.FC<TrainerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTrainer,
}) => {
  const [trainerCode, setTrainerCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [rating, setRating] = useState('5.0');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTrainer) {
      setTrainerCode(editingTrainer.trainer_code);
      setFullName(editingTrainer.full_name);
      setSpecialty(editingTrainer.specialty);
      setRating(String(editingTrainer.rating));
    } else {
      const codeNum = Math.floor(10 + Math.random() * 90);
      setTrainerCode(`TR-${codeNum}`);
      setFullName('');
      setSpecialty('');
      setRating('5.0');
    }
    setError('');
  }, [editingTrainer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerCode.trim() || !fullName.trim() || !specialty.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSave(
        {
          trainer_code: trainerCode.trim(),
          full_name: fullName.trim(),
          specialty: specialty.trim(),
          rating: parseFloat(rating) || 5.0,
        },
        editingTrainer?.id
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save trainer. Trainer code must be unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <h2 className="text-lg font-bold text-[#EDEEEA]">
            {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
          </h2>
          <button onClick={onClose} className="text-[#9A9E9F] hover:text-[#EDEEEA]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FF5F45]/15 border border-[#FF5F45]/40 text-[#FF5F45] text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Trainer Code *
            </label>
            <input
              type="text"
              value={trainerCode}
              onChange={(e) => setTrainerCode(e.target.value)}
              placeholder="e.g. TR-04"
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] font-mono focus:outline-none focus:border-[#C9FF3D]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rohan Varma"
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
              Specialty / Discipline *
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. CrossFit & Calisthenics"
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2C3034]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#EDEEEA] border border-[#2C3034] hover:bg-[#212528]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C9FF3D] text-[#101214] hover:bg-[#b8eb32]"
            >
              {isSubmitting ? 'Saving...' : editingTrainer ? 'Update Trainer' : 'Add Trainer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
