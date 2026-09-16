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
  register: (email: string, pass: string, name: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<UserProfile | null>;
  // Development Role Switching
  devRole: UserRole | null;
  isDevRoleActive: boolean;
  switchToRetailerDev: () => Promise<void>;
  switchToConsumerDev: () => Promise<void>;
  setDevRole: (role: UserRole | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [devRoleOverride, setDevRoleOverride] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('tschuess_dev_role');
    if (saved === 'retailer' || saved === 'consumer' || saved === 'admin') {
      return saved as UserRole;
    }
    return null;
  });

  // Helper to fetch or create user profile from Firestore
  const fetchUserProfile = useCallback(async (firebaseUser: User): Promise<UserProfile | null> => {
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
      // Fallback in-memory profile representation if Firestore read is denied
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

  // Listen to centralized Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user);
      } else {
        // Check if dev mock retailer session was active
        const isMock = localStorage.getItem('tschuess_dev_mock_user');
        const savedDevRole = localStorage.getItem('tschuess_dev_role');
        if (isMock === 'true' && savedDevRole === 'retailer') {
          const devMockUser = {
            uid: 'dev_retailer_kleve',
            email: 'partner.kleve@rewe-group.de',
            displayName: 'REWE Kleve (Dev Partner)',
            emailVerified: true
          } as unknown as User;
          const devMockProfile: UserProfile = {
            uid: 'dev_retailer_kleve',
            name: 'REWE Kleve (Dev Partner)',
            email: 'partner.kleve@rewe-group.de',
            role: 'retailer',
            language: 'de',
            notificationPreferences: {
              email: true,
              push: true,
              dealsNearMe: true,
              reservationUpdates: true,
              savedPriceDrops: true
            }
          };
          setCurrentUser(devMockUser);
          setUserProfile(devMockProfile);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Development Role Switching Methods
  const switchToRetailerDev = useCallback(async () => {
    localStorage.setItem('tschuess_dev_role', 'retailer');
    setDevRoleOverride('retailer');

    if (currentUser) {
      setUserProfile((prev) => {
        if (!prev) return null;
        return { ...prev, role: 'retailer' };
      });
    } else {
      const devMockUser = {
        uid: 'dev_retailer_kleve',
        email: 'partner.kleve@rewe-group.de',
        displayName: 'REWE Kleve (Dev Partner)',
        emailVerified: true
      } as unknown as User;
      const devMockProfile: UserProfile = {
        uid: 'dev_retailer_kleve',
        name: 'REWE Kleve (Dev Partner)',
        email: 'partner.kleve@rewe-group.de',
        role: 'retailer',
        language: 'de',
        notificationPreferences: {
          email: true,
          push: true,
          dealsNearMe: true,
          reservationUpdates: true,
          savedPriceDrops: true
        }
      };
      localStorage.setItem('tschuess_dev_mock_user', 'true');
      setCurrentUser(devMockUser);
      setUserProfile(devMockProfile);
    }
  }, [currentUser]);

  const switchToConsumerDev = useCallback(async () => {
    localStorage.setItem('tschuess_dev_role', 'consumer');
    setDevRoleOverride('consumer');

    if (currentUser) {
      setUserProfile((prev) => {
        if (!prev) return null;
        return { ...prev, role: 'consumer' };
      });
    }
    if (localStorage.getItem('tschuess_dev_mock_user') === 'true' && currentUser?.uid === 'dev_retailer_kleve') {
      setUserProfile((prev) => (prev ? { ...prev, role: 'consumer', name: 'Dev Consumer' } : null));
    }
  }, [currentUser]);

  const setDevRole = useCallback(async (newRole: UserRole | null) => {
    if (newRole === 'retailer') {
      await switchToRetailerDev();
    } else if (newRole === 'consumer') {
      await switchToConsumerDev();
    } else if (newRole === 'admin') {
      localStorage.setItem('tschuess_dev_role', 'admin');
      setDevRoleOverride('admin');
      if (currentUser) {
        setUserProfile((prev) => (prev ? { ...prev, role: 'admin' } : null));
      }
    } else {
      localStorage.removeItem('tschuess_dev_role');
      localStorage.removeItem('tschuess_dev_mock_user');
      setDevRoleOverride(null);
      if (currentUser && currentUser.uid !== 'dev_retailer_kleve') {
        await fetchUserProfile(currentUser);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
    }
  }, [currentUser, fetchUserProfile, switchToConsumerDev, switchToRetailerDev]);

  // Real Email/Password login
  const login = useCallback(async (email: string, pass: string): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setCurrentUser(cred.user);
      const profile = await fetchUserProfile(cred.user);
      return profile;
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Real Email/Password consumer registration
  const register = useCallback(async (email: string, pass: string, name: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();

      // 1. Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      
      // 2. Set Firebase User Display Name
      await updateFirebaseProfile(cred.user, { displayName: trimmedName });

      // 3. Dispatch Firebase Verification Email
      try {
        await sendEmailVerification(cred.user);
      } catch (emailErr) {
        console.warn('Could not send immediate verification email:', emailErr);
      }

      // 4. Create Firestore profile with strictly role = "consumer"
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        name: trimmedName,
        email: trimmedEmail,
        role: 'consumer', // Mandatory default for public sign-up
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

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setCurrentUser(cred.user);
      setUserProfile(newProfile);
      return newProfile;
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
      setDevRoleOverride(null);
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

  // Resend Verification Email
  const resendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error('auth/user-not-found');
    }
    await sendEmailVerification(auth.currentUser);
  }, []);

  // Refresh Profile
  const refreshUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
      return await fetchUserProfile(auth.currentUser);
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

  const effectiveRole: UserRole | null = devRoleOverride || userProfile?.role || null;
  const effectiveProfile: UserProfile | null = useMemo(() => {
    if (!userProfile) return null;
    return {
      ...userProfile,
      role: effectiveRole || userProfile.role,
    };
  }, [userProfile, effectiveRole]);

  const contextValue = useMemo<AuthContextType>(() => ({
    currentUser,
    user: currentUser,
    firebaseUser: currentUser,
    userProfile: effectiveProfile,
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
    devRole: devRoleOverride,
    isDevRoleActive: !!devRoleOverride,
    switchToRetailerDev,
    switchToConsumerDev,
    setDevRole,
  }), [
    currentUser,
    effectiveProfile,
    loading,
    effectiveRole,
    login,
    register,
    logout,
    resetPassword,
    resendVerificationEmail,
    updateUserProfile,
    refreshUserProfile,
    devRoleOverride,
    switchToRetailerDev,
    switchToConsumerDev,
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
