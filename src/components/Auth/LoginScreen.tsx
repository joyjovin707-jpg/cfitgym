import React, { useState } from 'react';
import { User, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { StaffUser } from '../../types/index.ts';
import { gymDb } from '../../db/database.ts';

interface LoginScreenProps {
  onLogin: (user: StaffUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await gymDb.authenticateUser(username.trim(), password.trim());
      if (!user) {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false);
        return;
      }

      if (user.status === 'Suspended') {
        setError('This account has been suspended by the administrator.');
        setIsLoading(false);
        return;
      }

      onLogin(user);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101214] text-[#EDEEEA] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Background Decorative Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C9FF3D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#FF5F45]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Header / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#C9FF3D] text-[#101214] rounded-2xl font-anton text-3xl shadow-lg shadow-[#C9FF3D]/10 mb-4">
            C
          </div>
          <h1 className="font-anton text-3xl tracking-wider text-[#EDEEEA]">C-FIT FITNESS CLUB</h1>
        </div>

        {/* Login Card */}
        <div className="bg-[#1A1D21] border border-[#2C3034] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="pb-4 mb-6 border-b border-[#2C3034]">
            <h2 className="text-base font-bold text-[#EDEEEA]">Sign In to Terminal</h2>
          </div>

          {error && (
            <div className="p-3 mb-5 bg-[#FF5F45]/15 border border-[#FF5F45]/40 text-[#FF5F45] text-xs rounded-xl flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#5D6164] absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-[#212528] border border-[#2C3034] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9A9E9F] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5D6164] absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#212528] border border-[#2C3034] rounded-xl pl-9 pr-10 py-2.5 text-sm text-[#EDEEEA] focus:outline-none focus:border-[#C9FF3D] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#5D6164] hover:text-[#EDEEEA] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#C9FF3D] hover:bg-[#b8eb32] text-[#101214] font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#C9FF3D]/10 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
