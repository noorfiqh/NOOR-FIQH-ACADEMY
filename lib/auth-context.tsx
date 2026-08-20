'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateFbProfile,
  signOut, 
  onAuthStateChanged, 
  db, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  FirebaseUser
} from './firebase';
import { UserProfile } from './types';
import { AppStore } from './store';

export type { UserProfile };

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changeUserRole: (userIdOrEmail: string, newRole: 'student' | 'admin' | 'scholar') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SUPER_ADMIN_EMAIL = 'noorfiqhaca@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync Firebase Auth & Local Storage & Firestore
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!isMounted) return;

      if (fbUser) {
        const userEmail = (fbUser.email || '').toLowerCase().trim();
        const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL.toLowerCase();

        let assignedRole: 'student' | 'admin' | 'scholar' = isSuperAdmin ? 'admin' : 'student';

        // Check local store or Firestore for custom role assigned by admin
        try {
          const storedUser = AppStore.getUserByEmail(userEmail);
          if (storedUser?.role) {
            assignedRole = isSuperAdmin ? 'admin' : storedUser.role;
          }
        } catch {
          // ignore
        }

        const baseProfile: UserProfile = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'ব্যবহারকারী',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || undefined,
          phone: fbUser.phoneNumber || undefined,
          role: assignedRole,
          isSuperAdmin: isSuperAdmin,
          joinedAt: fbUser.metadata?.creationTime || new Date().toISOString()
        };

        // Sync to Firestore
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            const finalRole = isSuperAdmin ? 'admin' : (data.role || assignedRole);
            const merged: UserProfile = {
              ...baseProfile,
              ...data,
              role: finalRole,
              isSuperAdmin: isSuperAdmin
            };
            setUser(merged);
            AppStore.saveUser(merged);
            localStorage.setItem('nfa_active_user', JSON.stringify(merged));
          } else {
            await setDoc(userDocRef, baseProfile, { merge: true });
            setUser(baseProfile);
            AppStore.saveUser(baseProfile);
            localStorage.setItem('nfa_active_user', JSON.stringify(baseProfile));
          }
        } catch {
          setUser(baseProfile);
          AppStore.saveUser(baseProfile);
          localStorage.setItem('nfa_active_user', JSON.stringify(baseProfile));
        }
      } else {
        // If not logged in via Firebase, check if an active session is in localStorage
        try {
          const stored = localStorage.getItem('nfa_active_user');
          if (stored) {
            const parsed = JSON.parse(stored) as UserProfile;
            // Verify if super admin session is legitimately noorfiqhaca@gmail.com
            if (parsed.role === 'admin' && parsed.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
              const checked = AppStore.getUserByEmail(parsed.email);
              if (checked?.role !== 'admin') {
                parsed.role = 'student';
              }
            }
            setUser(parsed);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userEmail = (fbUser.email || '').toLowerCase().trim();
      const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL.toLowerCase();

      let userRole: 'student' | 'admin' | 'scholar' = isSuperAdmin ? 'admin' : 'student';
      const storedUser = AppStore.getUserByEmail(userEmail);
      if (storedUser?.role && !isSuperAdmin) {
        userRole = storedUser.role;
      }

      const profile: UserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'ব্যবহারকারী',
        email: fbUser.email || '',
        avatar: fbUser.photoURL || undefined,
        phone: fbUser.phoneNumber || undefined,
        role: userRole,
        isSuperAdmin,
        joinedAt: new Date().toISOString()
      };

      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        await setDoc(userDocRef, profile, { merge: true });
      } catch (err) {
        console.warn('Firestore sync skipped', err);
      }

      setUser(profile);
      AppStore.saveUser(profile);
      localStorage.setItem('nfa_active_user', JSON.stringify(profile));
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('Google Auth error:', error);
      setLoading(false);
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'গুগল লগইন উইন্ডো বন্ধ করা হয়েছে।' };
      }
      return { success: false, error: 'গুগল দিয়ে লগইন করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const normalizedEmail = (email || '').toLowerCase().trim();
    const isSuperAdminEmail = normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase();

    if (!normalizedEmail || !password) {
      setLoading(false);
      return { success: false, error: 'ইমেইল ও পাসওয়ার্ড উভয়ই প্রদান করুন।' };
    }

    try {
      // 1. Attempt real Firebase Auth Sign In
      let fbUser: FirebaseUser | null = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        fbUser = userCredential.user;
      } catch (fbErr: any) {
        const errorCode = fbErr?.code || '';

        // If user not found in Firebase Auth:
        if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
          // If it's the Super Admin email, try creating it with this master password or check if password is correct
          if (isSuperAdminEmail) {
            try {
              const newAdminCred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
              fbUser = newAdminCred.user;
              await updateFbProfile(newAdminCred.user, { displayName: 'মুফতী আব্দুল্লাহ আন-নূর (এডমিন)' });
            } catch (createErr: any) {
              if (createErr?.code === 'auth/email-already-in-use') {
                setLoading(false);
                return { success: false, error: 'এডমিন পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।' };
              }
              throw createErr;
            }
          } else {
            // For standard students: If user not found in Firebase Auth, automatically create student account
            try {
              const newStudentCred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
              fbUser = newStudentCred.user;
            } catch (studCreateErr: any) {
              if (studCreateErr?.code === 'auth/email-already-in-use') {
                setLoading(false);
                return { success: false, error: 'পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।' };
              }
              setLoading(false);
              return { success: false, error: 'লগইন ব্যর্থ হয়েছে। পাসওয়ার্ড যাচাই করুন।' };
            }
          }
        } else if (errorCode === 'auth/wrong-password') {
          setLoading(false);
          return { success: false, error: 'পাসওয়ার্ডটি সঠিক নয়। সঠিক পাসওয়ার্ড প্রদান করুন।' };
        } else if (errorCode === 'auth/invalid-email') {
          setLoading(false);
          return { success: false, error: 'সঠিক ইমেইল এড্রেস প্রদান করুন।' };
        } else if (errorCode === 'auth/too-many-requests') {
          setLoading(false);
          return { success: false, error: 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।' };
        } else {
          // In sandboxed environments if network fails, check store
          console.warn('Firebase signIn failed, evaluating local credential fallback:', fbErr);
        }
      }

      // Check role assignment
      let role: 'student' | 'admin' | 'scholar' = isSuperAdminEmail ? 'admin' : 'student';
      const storedUser = AppStore.getUserByEmail(normalizedEmail);
      if (storedUser?.role && !isSuperAdminEmail) {
        role = storedUser.role;
      }

      const uid = fbUser?.uid || `usr-${Date.now()}`;
      const name = fbUser?.displayName || storedUser?.name || normalizedEmail.split('@')[0];

      const profile: UserProfile = {
        uid,
        name,
        email: normalizedEmail,
        role,
        isSuperAdmin: isSuperAdminEmail,
        joinedAt: storedUser?.joinedAt || new Date().toISOString()
      };

      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, profile, { merge: true });
      } catch (err) {
        console.warn('Firestore user doc sync skipped', err);
      }

      setUser(profile);
      AppStore.saveUser(profile);
      localStorage.setItem('nfa_active_user', JSON.stringify(profile));
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      setLoading(false);
      return { success: false, error: err?.message || 'লগইন সম্পন্ন করা সম্ভব হয়নি।' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const normalizedEmail = (email || '').toLowerCase().trim();
    const isSuperAdminEmail = normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase();

    if (!normalizedEmail || !password || !name) {
      setLoading(false);
      return { success: false, error: 'নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক।' };
    }

    try {
      let uid = `usr-${Date.now()}`;
      try {
        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        uid = cred.user.uid;
        await updateFbProfile(cred.user, { displayName: name });
      } catch (fbErr: any) {
        if (fbErr?.code === 'auth/email-already-in-use') {
          setLoading(false);
          return { success: false, error: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি একাউন্ট তৈরি করা আছে। লগইন করুন।' };
        }
        if (fbErr?.code === 'auth/weak-password') {
          setLoading(false);
          return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
        }
      }

      const role: 'student' | 'admin' | 'scholar' = isSuperAdminEmail ? 'admin' : 'student';
      const profile: UserProfile = {
        uid,
        name,
        email: normalizedEmail,
        phone: phone || undefined,
        role,
        isSuperAdmin: isSuperAdminEmail,
        joinedAt: new Date().toISOString()
      };

      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, profile, { merge: true });
      } catch (err) {
        console.warn('Firestore register doc sync skipped', err);
      }

      setUser(profile);
      AppStore.saveUser(profile);
      localStorage.setItem('nfa_active_user', JSON.stringify(profile));
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err?.message || 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignored
    }
    setUser(null);
    localStorage.removeItem('nfa_active_user');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    AppStore.saveUser(updated);
    localStorage.setItem('nfa_active_user', JSON.stringify(updated));
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updated, { merge: true });
    } catch (e) {
      console.warn('Could not sync updated profile to Firestore', e);
    }
  };

  const changeUserRole = async (userIdOrEmail: string, newRole: 'student' | 'admin' | 'scholar') => {
    // Update in local store
    const updated = AppStore.updateUserRole(userIdOrEmail, newRole);
    
    // Update in Firestore
    try {
      if (updated?.uid) {
        const userDocRef = doc(db, 'users', updated.uid);
        await updateDoc(userDocRef, { role: newRole });
      }
    } catch (e) {
      console.warn('Could not update role in Firestore', e);
    }

    // If changing currently active user, update state
    if (user && (user.uid === userIdOrEmail || user.email.toLowerCase() === userIdOrEmail.toLowerCase())) {
      const isSuper = user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      const finalRole = isSuper ? 'admin' : newRole;
      const updatedUser = { ...user, role: finalRole };
      setUser(updatedUser);
      localStorage.setItem('nfa_active_user', JSON.stringify(updatedUser));
    }
  };

  const isAdmin = user?.role === 'admin' || (user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        changeUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

