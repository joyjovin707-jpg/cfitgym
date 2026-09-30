import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemDetails?: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemDetails,
  confirmText = 'Delete Permanently',
  onConfirm,
  onClose,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1A1D21] border border-[#FF5F45]/40 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2C3034]">
          <div className="flex items-center gap-2.5 text-[#FF5F45]">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-[#EDEEEA]">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9A9E9F] hover:text-[#EDEEEA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-[#EDEEEA] leading-relaxed">
            {message}
          </p>

          {itemDetails && (
            <div className="p-3 bg-[#212528] rounded-lg border border-[#2C3034] text-xs font-mono text-[#C9FF3D]">
              {itemDetails}
            </div>
          )}

          <p className="text-xs text-[#5D6164]">
            This action will update the SQLite database (<span className="text-[#9A9E9F]">cfit.db</span>) and cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2C3034]">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-xs font-bold text-[#EDEEEA] border border-[#2C3034] hover:bg-[#212528] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#FF5F45] text-[#1a0d08] hover:bg-[#e8533b] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
