import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div class="glass-card w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-6 relative">
        
        {/* Close Icon */}
        <button
          onClick={onClose}
          class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div class="text-center space-y-2">
          <div class="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <h3 class="text-xl font-bold text-white">Confirm Logout</h3>
          <p class="text-xs text-slate-400">
            Are you sure you want to end your current session? You will need to sign in again to view user-bound scan history.
          </p>
        </div>

        {/* Actions */}
        <div class="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-1.5"
          >
            <LogOut class="w-4 h-4" />
            <span>Logout Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
