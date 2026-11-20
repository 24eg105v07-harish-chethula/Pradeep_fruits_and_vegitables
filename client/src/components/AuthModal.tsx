import React, { useState } from 'react';
import { X, Phone, Lock, User as UserIcon, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext.tsx';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    customerLogin,
    customerRegister,
    isLoading
  } = useAuthContext();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authModalMode === 'login') {
      if (!mobile || !password) {
        setError('Please enter both mobile number and password.');
        return;
      }
      const res = await customerLogin(mobile, password);
      if (!res.success) {
        setError(res.message);
      }
    } else {
      if (!name || !mobile || !password) {
        setError('Name, 10-digit mobile number, and password are required.');
        return;
      }
      const res = await customerRegister(name, mobile, password, email);
      if (!res.success) {
        setError(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
            PRADEEP FRUITS AND VEGETABLES
          </span>
          <h2 className="text-2xl font-extrabold mt-1">
            {authModalMode === 'login' ? 'Welcome Back!' : 'Create an Account'}
          </h2>
          <p className="text-emerald-100 text-xs mt-1">
            {authModalMode === 'login'
              ? 'Login to view your orders and get fast 30-min delivery'
              : 'Sign up to shop fresh veggies & fruits in Bhadradri Kothagudem'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            type="button"
            onClick={() => { setError(null); openAuthModal('login'); }}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${
              authModalMode === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Customer Login
          </button>
          <button
            type="button"
            onClick={() => { setError(null); openAuthModal('register'); }}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all ${
              authModalMode === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-600 text-sm font-medium">
                +91
              </span>
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{authModalMode === 'login' ? 'Login Securely' : 'Create Customer Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-gray-500">
            {authModalMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setError(null); openAuthModal('register'); }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setError(null); openAuthModal('login'); }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Login here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
