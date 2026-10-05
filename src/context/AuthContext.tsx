import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

export interface AuthContextType {
  currentUser: User | null;
  user: User | null; // Alias for convenience
  firebaseUser: User | null; // Alias
  userProfile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  login: (email: string, pass: string) => Promise<UserProfile | null>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: (email?: string, password?: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<UserProfile | null>;
  // Development Role Switching (Deprecated in production)
  devRole: UserRole | null;
  isDevRoleActive: boolean;
  switchToRetailerDev: () => Promise<void>;
  switchToConsumerDev: () => Promise<void>;
  switchToAdminDev: () => Promise<void>;
  setDevRole: (role: UserRole | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Only verified Firebase users should receive a Firestore profile.
  const fetchUserProfile = useCallback(async (firebaseUser: User): Promise<UserProfile | null> => {
    if (!firebaseUser.emailVerified) {
      setUserProfile(null);
      return null;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setUserProfile(data);
        return data;
      } else {
        // Automatically create initial profile if document does not exist yet
        const defaultProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Tschüss User',
          email: firebaseUser.email || '',
          role: 'consumer', // Always defaults to consumer
          language: 'de',
          notificationPreferences: {
            email: true,
            push: true,
            dealsNearMe: true,
            reservationUpdates: true,
            savedPriceDrops: true
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(userDocRef, defaultProfile);
        setUserProfile(defaultProfile);
        return defaultProfile;
      }
    } catch (err) {
      console.error('Error retrieving Firestore user profile:', err);
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Tschüss User',
        email: firebaseUser.email || '',
        role: 'consumer',
        language: 'de'
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  }, []);

  // Listen to centralized Firebase Auth state changes - 100% Real Live Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        if (user.emailVerified) {
          await fetchUserProfile(user);
        } else {
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Deprecated Dev Stubs
  const switchToRetailerDev = useCallback(async () => {}, []);
  const switchToConsumerDev = useCallback(async () => {}, []);
  const switchToAdminDev = useCallback(async () => {}, []);
  const setDevRole = useCallback(async (_newRole: UserRole | null) => {}, []);

  // Real Email/Password login with strict verification enforcement
  const login = useCallback(async (email: string, pass: string): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      
      // Strict verification check:
      if (!cred.user.emailVerified) {
        // Keep the session so the verification page can resend the email.
        // Protected routes still block this user until email verification.
        setCurrentUser(cred.user);
        setUserProfile(null);
        throw new Error('auth/unverified-email');
      }

      setCurrentUser(cred.user);
      const profile = await fetchUserProfile(cred.user);
      return profile;
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Real Email/Password consumer registration with mandatory email verification and rollback
  const register = useCallback(async (email: string, pass: string, name: string): Promise<void> => {
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();

      // 1. Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      
      // 2. Set Firebase User Display Name
      await updateFirebaseProfile(cred.user, { displayName: trimmedName });

      // 3. Dispatch Firebase Verification Email with fallback & strict rollback on failure
      let emailDispatched = false;
      try {
        const actionCodeSettings = typeof window !== 'undefined' ? {
          url: `${window.location.origin}/verify-email?verified=true`,
          handleCodeInApp: true,
        } : undefined;
        await sendEmailVerification(cred.user, actionCodeSettings);
        emailDispatched = true;
        console.info('Verification email dispatched to:', trimmedEmail);
        } catch (actionErr) {
          console.warn('ActionCodeSettings dispatch failed, attempting standard dispatch:', actionErr);
          if ((actionErr as any)?.code === 'auth/too-many-requests') {
            throw actionErr;
          }
          try {
            await sendEmailVerification(cred.user);
          emailDispatched = true;
          console.info('Verification email dispatched via standard template to:', trimmedEmail);
        } catch (defaultErr: any) {
          console.error('All verification email dispatch attempts failed:', defaultErr);
          // Keep the Auth account so the user can retry from the verification page.
          // Deleting it here causes every retry to create another account and can
          // repeatedly trigger Firebase's signup and email-send limits.
          setCurrentUser(cred.user);
          setUserProfile(null);
          return;
        }
      }

      // The profile is created after email verification by refreshUserProfile().
      setCurrentUser(cred.user);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      localStorage.removeItem('tschuess_dev_role');
      localStorage.removeItem('tschuess_dev_mock_user');
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Password Reset
  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  // Resend Verification Email (Supports both active session and temporary credential sign-in)
  const resendVerificationEmail = useCallback(async (email?: string, password?: string) => {
    let targetUser = auth.currentUser;
    let temporaryLogin = false;

    if (!targetUser && email && password) {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      targetUser = cred.user;
      temporaryLogin = true;
    }

    if (!targetUser) {
      throw new Error('auth/user-not-found');
    }

    try {
      const actionCodeSettings = typeof window !== 'undefined' ? {
        url: `${window.location.origin}/verify-email?verified=true`,
        handleCodeInApp: true,
      } : undefined;
      await sendEmailVerification(targetUser, actionCodeSettings);
      } catch (resendErr: any) {
        if (resendErr?.code === 'auth/too-many-requests') {
          throw resendErr;
        }
        await sendEmailVerification(targetUser);
      } finally {
      if (temporaryLogin) {
        await firebaseSignOut(auth);
      }
    }
  }, []);

  // Refresh Profile & Auth State
  const refreshUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const refreshed = auth.currentUser;
      setCurrentUser(refreshed ? (Object.assign(Object.create(Object.getPrototypeOf(refreshed)), refreshed) as User) : null);
      return await fetchUserProfile(refreshed);
    }
    return null;
  }, [fetchUserProfile]);

  // Update Profile (Disallows changing role!)
  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // Explicitly strip role so client cannot self-elevate
    const { role: _forbiddenRole, ...safeData } = data;

    const payload = {
      ...safeData,
      updatedAt: serverTimestamp()
    };

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, payload);

    setUserProfile(prev => prev ? ({ ...prev, ...safeData } as UserProfile) : null);
  }, [currentUser]);

  const effectiveRole: UserRole | null = userProfile?.role || null;

  const contextValue = useMemo<AuthContextType>(() => ({
    currentUser,
    user: currentUser,
    firebaseUser: currentUser,
    userProfile,
    loading,
    role: effectiveRole,
    isAuthenticated: !!currentUser,
    isEmailVerified: !!currentUser?.emailVerified,
    login,
    register,
    logout,
    resetPassword,
    resendVerificationEmail,
    updateUserProfile,
    refreshUserProfile,
    devRole: null,
    isDevRoleActive: false,
    switchToRetailerDev,
    switchToConsumerDev,
    switchToAdminDev,
    setDevRole,
  }), [
    currentUser,
    userProfile,
    loading,
    effectiveRole,
    login,
    register,
    logout,
    resetPassword,
    resendVerificationEmail,
    updateUserProfile,
    refreshUserProfile,
    switchToRetailerDev,
    switchToConsumerDev,
    switchToAdminDev,
    setDevRole,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

