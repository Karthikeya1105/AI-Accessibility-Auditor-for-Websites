import React, { useEffect, useState } from 'react';
import { ShieldCheck, History, Cpu, User, LogIn, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { ConfirmLogoutModal } from './ConfirmLogoutModal';

export const Navbar = ({ onOpenHistory, onLogout }) => {
  const [health, setHealth] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    api.checkHealth()
      .then(res => setHealth(res))
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  const handleConfirmLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  return (
    <>
      <header class="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck class="w-6 h-6 text-white" />
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-bold text-lg text-white tracking-tight">a11yAuditor</span>
                <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  WCAG 2.1 AI
                </span>
              </div>
              <p class="text-xs text-slate-400">Automated Web Accessibility Auditor & Fix Generator</p>
            </div>
          </div>

          {/* Status Indicators & Auth Controls */}
          <div class="flex items-center space-x-3 sm:space-x-4">
            
            {/* Groq AI Badge */}
            <div class="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Cpu class="w-3.5 h-3.5 text-purple-400" />
              <span>AI Engine:</span>
              <span class="font-semibold text-purple-300">
                {health?.groqEnabled ? 'Groq Llama-3' : 'Smart Template'}
              </span>
            </div>

            {/* API Server Health */}
            <div class="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <span class={`w-2 h-2 rounded-full ${health?.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span class="text-slate-400">{health?.status === 'online' ? 'API Online' : 'Connecting...'}</span>
            </div>

            {/* Scan History Button */}
            <button
              onClick={onOpenHistory}
              class="flex items-center space-x-1.5 text-xs font-medium px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            >
              <History class="w-4 h-4 text-blue-400" />
              <span class="hidden sm:inline">Scan History</span>
            </button>

            {/* Auth Controls */}
            {isAuthenticated ? (
              <div class="flex items-center space-x-2 border-l border-slate-800 pl-3">
                <div class="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                  <div class="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span class="font-bold text-slate-200 hidden sm:inline">{user?.name}</span>
                </div>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  title="Sign Out"
                  class="p-2 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                >
                  <LogOut class="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                class="flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md"
              >
                <LogIn class="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Login / Register Modal - Mandated for unauthenticated visitors */}
      <LoginModal
        isOpen={!isAuthenticated || isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isRequired={!isAuthenticated}
      />

      {/* Confirm Logout Modal */}
      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};
