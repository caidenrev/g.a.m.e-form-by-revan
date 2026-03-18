'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface GSAMemberData {
  name: string;
  email: string;
  campus: string;
  gsaId?: string | null;
  tier?: 'Rising Star' | 'Achiever' | 'Trailblazer' | null;
  photoURL?: string | null;
  linkedIn?: string | null;
  instagram?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

interface AuthContextType {
  user: User | null;
  memberData: GSAMemberData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, memberData: Omit<GSAMemberData, 'email' | 'createdAt'>) => Promise<void>;
  logout: () => Promise<void>;
  refreshMemberData: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  memberData: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
  refreshMemberData: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [memberData, setMemberData] = useState<GSAMemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch member data from Firestore
        const memberDoc = await getDoc(doc(db, 'members', user.uid));
        if (memberDoc.exists()) {
          setMemberData(memberDoc.data() as GSAMemberData);
        }
      } else {
        setMemberData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, memberData: Omit<GSAMemberData, 'email' | 'createdAt'>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: memberData.name,
        photoURL: memberData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberData.name)}&background=3b82f6&color=fff`
      });

      // Save member data to Firestore
      const fullMemberData: GSAMemberData = {
        ...memberData,
        email,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'members', user.uid), fullMemberData);
      setMemberData(fullMemberData);
    } catch (error) {
      console.error('Error signing up', error);
      throw error;
    }
  };

  const refreshMemberData = async () => {
    if (user) {
      const memberDoc = await getDoc(doc(db, 'members', user.uid));
      if (memberDoc.exists()) {
        setMemberData(memberDoc.data() as GSAMemberData);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setMemberData(null);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, memberData, loading, signIn, signUp, logout, refreshMemberData, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
