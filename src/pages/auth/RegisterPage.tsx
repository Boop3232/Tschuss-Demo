import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Store, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyAuthErrorMessage } from '../../utils/authErrors';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, currentUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Only redirect if currentUser is already logged in AND email is verified
  React.useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      navigate('/app/discover', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Client-side validations
    if (!name.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      // Registers Firebase user, assigns role="consumer", dispatches verification email, sets Firestore users/{uid}
      await register(email, password, name);
      
      // Navigate to email verification guidance page
      navigate('/verify-email', { 
        state: { email: email.trim(), registeredNow: true },
        replace: true 
      });
    } catch (err: any) {
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setErrorMessage(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#FAF9F5] via-emerald-50/20 to-[#F5F4EE] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        {/* Brand Icon */}
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-xs group-hover:scale-105 transition-all">
            T
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-stone-900 font-display">
            Tschüss
          </span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900 tracking-tight">
            Create an account
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xs mx-auto">
            Join Tschüss to rescue delicious surplus food at steep discounts.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-stone-200/70 shadow-xs space-y-6">
          <div className="flex rounded-2xl bg-stone-100 p-1" role="tablist" aria-label="Choose account type">
            <button
              type="button"
              role="tab"
              aria-selected="true"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              Consumer
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              onClick={() => navigate('/login', { state: { accountType: 'retailer' } })}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-stone-500 transition-all hover:text-stone-700"
            >
              <Store className="w-3.5 h-3.5" />
              Retailer
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div 
              id="auth-error-banner"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label 
                htmlFor="register-name"
                className="block text-xs font-bold text-stone-700 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hannah Becker"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="register-email"
                className="block text-xs font-bold text-stone-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hannah@example.de"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="register-password"
                className="block text-xs font-bold text-stone-700 mb-1"
              >
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                htmlFor="register-confirm-password"
                className="block text-xs font-bold text-stone-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Role Notice */}
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-950 text-2xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Standard registration creates a verified consumer shopper profile. Retailers and partners are onboarded via the business portal.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-submit-register"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Consumer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
            <p>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
