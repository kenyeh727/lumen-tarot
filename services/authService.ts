import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    email: string;
    usage_count: number;
    is_unlimited?: boolean;
    created_at: string;
    updated_at: string;
}

const USAGE_LIMIT = 10;

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });

    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // Treat connection errors or "Not Found" as a fresh user state (null profile)
            // PGRST116: JSON object requested, multiple (or no) rows returned
            if (error.code !== 'PGRST116') {
                console.warn('Supabase fetch error (handled as new user):', error.message);
            }
            return null;
        }

        return data as UserProfile;
    } catch (e) {
        // Network failures or other crashes should not block the user
        console.error('Critical Profile Fetch Error (handled as new user):', e);
        return null;
    }
};

export const incrementUsageCount = async (userId: string): Promise<boolean> => {
    // First, get current profile
    const profile = await getUserProfile(userId);

    if (!profile) {
        console.error('Profile not found');
        return false;
    }

    // Unlimited users don't need to increment usage count
    if (profile.is_unlimited) {
        return true;
    }

    if (profile.usage_count >= USAGE_LIMIT) {
        throw new Error('Usage limit exceeded');
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            usage_count: profile.usage_count + 1,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) {
        console.error('Error incrementing usage count:', error);
        return false;
    }

    return true;
};

export const checkUsageLimit = async (userId: string): Promise<{ canUse: boolean; remaining: number; isUnlimited: boolean }> => {
    const profile = await getUserProfile(userId);

    // If profile doesn't exist yet, it's a new user, allow use
    if (!profile) {
        return { canUse: true, remaining: USAGE_LIMIT, isUnlimited: false };
    }

    if (profile.is_unlimited) {
        return { canUse: true, remaining: 999, isUnlimited: true };
    }

    const remaining = USAGE_LIMIT - profile.usage_count;
    return {
        canUse: profile.usage_count < USAGE_LIMIT,
        remaining: Math.max(0, remaining),
        isUnlimited: !!profile.is_unlimited
    };
};

export { USAGE_LIMIT };
