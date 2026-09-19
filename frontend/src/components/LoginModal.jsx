import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register({ name: formData.name, email: formData.email, password: formData.password });
      } else {
        await login({ email: formData.email, password: formData.password });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div class="glass-card w-full max-w-md rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div class="text-center space-y-1">
          <div class="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
            {isRegisterMode ? <UserPlus class="w-6 h-6" /> : <LogIn class="w-6 h-6" />}
          </div>
          <h3 class="text-xl font-bold text-white">
            {isRegisterMode ? 'Create Auditor Account' : 'Welcome Back'}
          </h3>
          <p class="text-xs text-slate-400">
            {isRegisterMode ? 'Register to save audit snapshots & continuous trends' : 'Sign in to access saved site audits & domain trends'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-4 text-xs">
          
          {isRegisterMode && (
            <div>
              <label class="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div class="relative">
                <User class="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label class="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div class="relative">
              <Mail class="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                placeholder="auditor@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-slate-300 font-semibold mb-1">Password</label>
            <div class="relative">
              <Lock class="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span class="animate-pulse">Processing...</span>
            ) : isRegisterMode ? (
              <><span>Create Account</span> <UserPlus class="w-4 h-4" /></>
            ) : (
              <><span>Sign In</span> <LogIn class="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Toggle Register/Login Mode */}
        <div class="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          {isRegisterMode ? (
            <span>Already have an account? <button onClick={() => { setIsRegisterMode(false); setError(''); }} class="text-blue-400 font-bold hover:underline">Sign In</button></span>
          ) : (
            <span>Don't have an account? <button onClick={() => { setIsRegisterMode(true); setError(''); }} class="text-blue-400 font-bold hover:underline">Register Now</button></span>
          )}
        </div>

      </div>
    </div>
  );
};
