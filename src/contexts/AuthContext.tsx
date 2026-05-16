import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { getUserProfile, signInWithGoogle, signInWithEmail, signOut, UserProfile } from '../services/authService';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    login: () => Promise<void>;
    loginWithEmail: (email: string) => Promise<void>;
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
        let initialCheckDone = false;

        // Check for existing session immediately
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                try {
                    const userProfile = await getUserProfile(session.user.id);
                    if (mounted) setProfile(userProfile);
                } catch (err) {
                    console.error("Profile load error:", err);
                } finally {
                    if (mounted) {
                        setLoading(false);
                        initialCheckDone = true;
                    }
                }
            } else {
                if (mounted) {
                    setLoading(false);
                    initialCheckDone = true;
                }
            }
        };

        checkInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event, session?.user?.id);

            if (!mounted) return;

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // If we get an INITIAL_SESSION or SIGNED_IN, we need the profile
                try {
                    const userProfile = await getUserProfile(currentUser.id);
                    if (mounted) setProfile(userProfile);
                } catch (err) {
                    console.error("Profile load error:", err);
                } finally {
                    if (mounted) setLoading(false);
                }
            } else {
                // Not signed in or signed out
                if (mounted) {
                    setProfile(null);
                    setLoading(false);
                }
            }
        });

        // Recovery: ensure we don't hang if no event fires within 10 seconds
        const recoveryTimer = setTimeout(() => {
            if (mounted && loading && !initialCheckDone) {
                console.warn("Auth initialization timed out, forcing end of loading state");
                setLoading(false);
            }
        }, 10000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(recoveryTimer);
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

    const loginWithEmail = async (email: string) => {
        try {
            await signInWithEmail(email);
        } catch (error) {
            console.error('Email login error:', error);
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
        <AuthContext.Provider value={{ user, profile, loading, login, loginWithEmail, logout, refreshProfile }}>
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
