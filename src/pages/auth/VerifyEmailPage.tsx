import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, LogOut, ShieldAlert, Inbox } from 'lucide-react';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyAuthErrorMessage } from '../../utils/authErrors';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, resendVerificationEmail, refreshUserProfile, logout } = useAuth();

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email to display: from auth user or navigation state
  const displayEmail = currentUser?.email || (location.state as any)?.email || 'your email address';

  // Handle URL with action code if clicked from verification link (e.g. ?oobCode=... or mode=verifyEmail)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    if (oobCode && (mode === 'verifyEmail' || !mode)) {
      setChecking(true);
      applyActionCode(auth, oobCode)
        .then(async () => {
          await refreshUserProfile();
          setSuccessMessage('Email verified successfully! Taking you to your Tschüss dashboard...');
          setTimeout(() => {
            navigate('/app/discover', { replace: true });
          }, 1500);
        })
        .catch((err) => {
          console.error('Error applying action code:', err);
          setErrorMessage('The verification link has expired or has already been used. Please request a new one below.');
        })
        .finally(() => {
          setChecking(false);
        });
    }
  }, [location.search, navigate, refreshUserProfile]);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setResending(true);

    try {
      await resendVerificationEmail();
      setSuccessMessage(`A fresh verification link was sent to ${displayEmail}. Please check your inbox and Spam/Junk folder.`);
      setCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    setErrorMessage(null);
    try {
      const profile = await refreshUserProfile();
      const updatedUser = auth.currentUser;
      if (updatedUser?.emailVerified) {
        setSuccessMessage('Email verified successfully! Redirecting to your dashboard...');
        setTimeout(() => {
          navigate('/app/discover', { replace: true });
        }, 1200);
      } else {
        setErrorMessage('Your email address is not yet verified. Please click the verification link sent to your email, then click this button again.');
      }
    } catch (err: any) {
      setErrorMessage(getFriendlyAuthErrorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#FAF9F5] via-emerald-50/20 to-[#F5F4EE] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-2xl shadow-xs">
          <Mail className="w-7 h-7 text-emerald-700" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-stone-900 tracking-tight">
            Verify your email address
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xs mx-auto">
            A verification link was dispatched to{' '}
            <span className="font-bold text-stone-900 break-all">{displayEmail}</span>.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-stone-200/70 shadow-xs space-y-6">
          {/* Status Banners */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Spam / Junk Notice Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs flex items-start gap-2.5">
            <Inbox className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950">Don't see the email?</p>
              <p className="text-2xs text-amber-900/90 leading-relaxed">
                Automated security emails often land in your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder. Sender: <code className="bg-amber-100/70 px-1 py-0.5 rounded text-amber-900 text-3xs break-all">noreply@project-37091182-0939-4d22-a92.firebaseapp.com</code>.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <p className="font-semibold text-stone-800">
              Steps to verify:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-stone-500">
              <li>Open your email inbox (and check Spam/Junk folder).</li>
              <li>Click the verification link provided in the message.</li>
              <li>Return to this page and click <strong>"I've Verified My Email"</strong> below.</li>
            </ol>
          </div>

          <div className="space-y-3 pt-2">
            {/* Check status button */}
            <button
              type="button"
              id="btn-check-verified"
              onClick={handleCheckVerified}
              disabled={checking}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {checking ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>I've Verified My Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend button with cooldown */}
            <button
              type="button"
              id="btn-resend-email"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="w-full py-2.5 px-4 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>
                {cooldown > 0 
                  ? `Resend available in ${cooldown}s` 
                  : resending 
                    ? 'Sending...' 
                    : 'Resend Verification Email'}
              </span>
            </button>
          </div>

          {/* Log out / Switch Account */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-center text-xs">
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login', { replace: true });
              }}
              className="text-stone-500 hover:text-stone-800 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Use a different account or sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
