import React, { useState } from 'react';
import { Plus, UserPlus, UserMinus, Trash2, Users } from 'lucide-react';
import { GymClass, Member } from '../../types/index.ts';
import { ConfirmDeleteModal } from '../Modals/ConfirmDeleteModal.tsx';
import { BookSpotModal } from '../Modals/BookSpotModal.tsx';
import { RemoveSpotModal } from '../Modals/RemoveSpotModal.tsx';

interface ScheduleScreenProps {
  classes: GymClass[];
  members: Member[];
  onNewClass: () => void;
  onBookMember: (classId: number, memberId: string) => Promise<{ success: boolean; message?: string }>;
  onRemoveMember: (classId: number, memberId: string) => Promise<boolean>;
  onDeleteClass: (id: number) => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  classes,
  members,
  onNewClass,
  onBookMember,
  onRemoveMember,
  onDeleteClass,
}) => {
  const [classToDelete, setClassToDelete] = useState<GymClass | null>(null);
  const [classToBook, setClassToBook] = useState<GymClass | null>(null);
  const [classToRemoveSpot, setClassToRemoveSpot] = useState<GymClass | null>(null);

  return (
    <div className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-anton text-3xl tracking-wide text-[#EDEEEA]">Class Schedule</h1>
          <p className="text-xs text-[#9A9E9F] mt-1">Weekly studio bookings and member capacity tracking</p>
        </div>
        <button
          onClick={onNewClass}
          className="bg-[#C9FF3D] hover:bg-[#b8eb32] text-[#101214] font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New class
        </button>
      </div>

      {/* Class Schedule Panel */}
      <div className="bg-[#1A1D21] border border-[#2C3034] rounded-xl p-5 divide-y divide-[#2C3034]">
        {classes.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#9A9E9F]">
            No studio classes scheduled. Click "+ New class" to add one.
          </div>
        ) : (
          classes.map((cls) => {
            const isFull = cls.booked_count >= cls.max_capacity;
            const percentage = Math.min(100, Math.round((cls.booked_count / cls.max_capacity) * 100));
            const bookings = cls.bookings || [];

            return (
              <div
                key={cls.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col justify-between gap-3.5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="font-mono text-sm font-semibold text-[#C9FF3D] bg-[#212528] px-2.5 py-1.5 rounded border border-[#2C3034] shrink-0">
                      {cls.start_time.replace(' AM', 'a').replace(' PM', 'p')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#EDEEEA] flex items-center gap-2">
                        {cls.class_name} — {cls.studio_location}
                        {isFull && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#FF5F45]/20 text-[#FF5F45] font-semibold">
                            FULL
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[#9A9E9F] mt-1">
                        Coach {cls.trainer_name || 'Staff'} · {cls.booked_count} / {cls.max_capacity} spots booked
                      </p>

                      {/* Capacity bar */}
                      <div className="w-48 bg-[#212528] h-1.5 rounded-full mt-2 overflow-hidden border border-[#2C3034]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull ? 'bg-[#FF5F45]' : 'bg-[#C9FF3D]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setClassToBook(cls)}
                      disabled={isFull}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                        isFull
                          ? 'bg-[#212528] text-[#5D6164] cursor-not-allowed border border-[#2C3034]'
                          : 'bg-[#C9FF3D] text-[#101214] hover:bg-[#b8eb32] font-semibold cursor-pointer'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Book Spot
                    </button>

                    <button
                      onClick={() => setClassToRemoveSpot(cls)}
                      disabled={cls.booked_count <= 0}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-[#212528] text-[#EDEEEA] hover:bg-[#2C3034] border border-[#2C3034] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Remove a booked member from class"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Remove Spot</span>
                    </button>

                    <button
                      onClick={() => setClassToDelete(cls)}
                      className="p-1.5 text-[#5D6164] hover:text-[#FF5F45] rounded hover:bg-[#FF5F45]/15 transition-colors cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Booked Members Roster Section */}
                {bookings.length > 0 && (
                  <div className="bg-[#212528]/50 border border-[#2C3034] rounded-lg p-2.5 mt-1">
                    <div className="text-[11px] font-semibold text-[#9A9E9F] flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5 text-[#C9FF3D]" />
                      <span>Booked Members ({bookings.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {bookings.map((b) => (
                        <div
                          key={b.id || b.member_id}
                          className="inline-flex items-center gap-1.5 bg-[#101214] border border-[#2C3034] px-2.5 py-1 rounded text-xs text-[#EDEEEA]"
                        >
                          <span className="font-medium">{b.member_name}</span>
                          <span className="text-[10px] font-mono text-[#5D6164]">({b.member_id})</span>
                          <button
                            type="button"
                            onClick={() => onRemoveMember(cls.id, b.member_id)}
                            title={`Remove ${b.member_name} from class`}
                            className="text-[#5D6164] hover:text-[#FF5F45] ml-0.5 font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Book Spot Modal - Asks which member to add */}
      <BookSpotModal
        isOpen={!!classToBook}
        onClose={() => setClassToBook(null)}
        gymClass={classToBook}
        members={members}
        onConfirm={onBookMember}
      />

      {/* Remove Spot Modal - Asks which member to delete */}
      <RemoveSpotModal
        isOpen={!!classToRemoveSpot}
        onClose={() => setClassToRemoveSpot(null)}
        gymClass={classToRemoveSpot}
        onConfirm={onRemoveMember}
      />

      {/* In-app Confirmation Modal for Class Deletion */}
      <ConfirmDeleteModal
        isOpen={!!classToDelete}
        title="Delete Studio Class"
        message="Are you sure you want to remove this scheduled class? Booked member reservations for this class will also be removed."
        itemDetails={classToDelete ? `${classToDelete.class_name} — ${classToDelete.studio_location} (${classToDelete.start_time})` : undefined}
        confirmText="Yes, Delete Class"
        onClose={() => setClassToDelete(null)}
        onConfirm={() => {
          if (classToDelete) {
            onDeleteClass(classToDelete.id);
            setClassToDelete(null);
          }
        }}
      />
    </div>
  );
};
