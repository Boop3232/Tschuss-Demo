import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Real Email/Password login
  const login = async (email: string, pass: string): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setCurrentUser(cred.user);
      const profile = await fetchUserProfile(cred.user);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  // Real Email/Password consumer registration
  const register = async (email: string, pass: string, name: string): Promise<UserProfile> => {
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
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // Resend Verification Email
  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('auth/user-not-found');
    }
    await sendEmailVerification(auth.currentUser);
  };

  // Refresh Profile
  const refreshUserProfile = async (): Promise<UserProfile | null> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
      return await fetchUserProfile(auth.currentUser);
    }
    return null;
  };

  // Update Profile (Disallows changing role!)
  const updateUserProfile = async (data: Partial<UserProfile>) => {
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
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        firebaseUser: currentUser,
        userProfile,
        loading,
        role: userProfile?.role || null,
        isAuthenticated: !!currentUser,
        isEmailVerified: !!currentUser?.emailVerified,
        login,
        register,
        logout,
        resetPassword,
        resendVerificationEmail,
        updateUserProfile,
        refreshUserProfile
      }}
    >
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
