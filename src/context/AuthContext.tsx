
"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '@/lib/firebase';
import {
    signInAnonymously,
    onAuthStateChanged,
    signOut,
    User as FirebaseUser
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    serverTimestamp,
    collection,
    addDoc
} from 'firebase/firestore';

type UserRole = 'visitor' | 'user' | 'admin';

interface User {
    uid: string;
    username: string;
    role: UserRole;
    hasVoted: Record<string, string>; // categoryId -> candidateId
}

interface AuthContextType {
    user: User | null;
    login: (username: string, role?: UserRole) => Promise<void>;
    logout: () => Promise<void>;
    vote: (categoryId: string, candidateId: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Sync Auth State
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                // Fetch user profile from Firestore
                const userRef = doc(db, 'users', fbUser.uid);

                // Real-time listener for user document (including hasVoted)
                const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUser({
                            uid: fbUser.uid,
                            username: userData.username || 'Anonymous',
                            role: userData.role || 'user',
                            hasVoted: userData.hasVoted || {}
                        });
                    } else {
                        setUser({
                            uid: fbUser.uid,
                            username: 'Guest',
                            role: 'user',
                            hasVoted: {}
                        });
                    }
                    setIsLoading(false);
                });

                return () => unsubscribeUser();
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const login = async (username: string, role: UserRole = 'user') => {
        try {
            setIsLoading(true);
            const userCredential = await signInAnonymously(auth);
            const fbUser = userCredential.user;

            const userData = {
                username,
                role,
                hasVoted: {} 
            };

            const userRef = doc(db, 'users', fbUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, userData);
            } else {
                await setDoc(userRef, { username, role }, { merge: true });
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    const vote = async (categoryId: string, candidateId: string) => {
        if (!user) return;

        // PROTECCIÓN: Evitar múltiples votos en la misma categoría
        if (user.hasVoted && user.hasVoted[categoryId]) {
            console.warn("User has already voted in this category");
            return;
        }

        // 1. Update User's hasVoted in Firestore
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            hasVoted: {
                ...user.hasVoted,
                [categoryId]: candidateId
            }
        }, { merge: true });

        // 2. Record vote in global votes collection
        await addDoc(collection(db, 'votes'), {
            categoryId,
            candidateId,
            userId: user.uid,
            username: user.username,
            timestamp: serverTimestamp(),
            ip: 'Handled by Firebase'
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, vote, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
