import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { getUserProfile, signInWithGoogle, signOut, UserProfile } from '../services/authService';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async (userId: string, isInitial: boolean = false) => {
        try {
            const userProfile = await getUserProfile(userId);
            setProfile(userProfile);
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await loadUserProfile(user.id, false);
        }
    };

    useEffect(() => {
        let mounted = true;

        // Cleanup URL hash if it contains auth tokens
        if (window.location.hash && window.location.hash.includes('access_token=')) {
            // Give Supabase a moment to pick it up, then clean
            setTimeout(() => {
                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
                }
            }, 1000);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth State Changed:", event, session?.user?.id);

            if (!mounted) return;

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // If we already have a user, this is a refresh/reauth, don't set global loading
                await loadUserProfile(currentUser.id, !user);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted && session) {
                console.log("Initial Session Found");
                setUser(session.user);
                loadUserProfile(session.user.id, true);
            } else if (mounted) {
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
