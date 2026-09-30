import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GymClass, Trainer } from '../../types/index.ts';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cls: Omit<GymClass, 'id'>) => Promise<void>;
  trainers: Trainer[];
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trainers,
}) => {
  const [className, setClassName] = useState('');
  const [trainerId, setTrainerId] = useState<number>(trainers[0]?.id || 1);
  const [studioLocation, setStudioLocation] = useState('Studio A');
  const [startTime, setStartTime] = useState('06:00 AM');
  const [maxCapacity, setMaxCapacity] = useState('20');
  const [bookedCount, setBookedCount] = useState('0');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (trainers.length > 0 && !trainerId) {
      setTrainerId(trainers[0].id);
    }
    setClassName('');
    setStudioLocation('Studio A');
    setStartTime('06:00 AM');
    setMaxCapacity('20');
    setBookedCount('0');
    setError('');
  }, [isOpen, trainers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !studioLocation.trim() || !startTime.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    const max = parseInt(maxCapacity, 10);
    const booked = parseInt(bookedCount, 10);
    if (isNaN(max) || max < 1) {
      setError('Max capacity must be at least 1.');
      return;
    }
    if (booked > max) {
      setError('Booked spots cannot exceed max capacity.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSave({
        class_name: className.trim(),
        trainer_id: trainerId,
        studio_location: studioLocation.trim(),
        start_time: startTime.trim(),
        max_capacity: max,
        booked_count: booked || 0,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to schedule class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <h2 className="text-lg font-bold text-[#EDEEEA]">Schedule New Class</h2>
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
              Class Name *
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Strength circuit"
              className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Assigned Coach *
              </label>
              <select
                value={trainerId}
                onChange={(e) => setTrainerId(Number(e.target.value))}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                required
              >
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Studio Location *
              </label>
              <select
                value={studioLocation}
                onChange={(e) => setStudioLocation(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
              >
                <option value="Studio A">Studio A (Main Floor)</option>
                <option value="Studio B">Studio B (Mind & Yoga)</option>
                <option value="Studio C">Studio C (Spin & RPM)</option>
                <option value="Outdoor Deck">Outdoor Turf Deck</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Start Time *
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="06:00 AM"
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] font-mono focus:outline-none focus:border-[#C9FF3D]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Max Capacity
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1">
                Initial Booked
              </label>
              <input
                type="number"
                min="0"
                value={bookedCount}
                onChange={(e) => setBookedCount(e.target.value)}
                className="w-full bg-[#212528] border border-[#2C3034] rounded-lg px-3 py-2 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D]"
                required
              />
            </div>
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
              {isSubmitting ? 'Scheduling...' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
