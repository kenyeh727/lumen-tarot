import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    email: string;
    usage_count: number;
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
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }

    return data as UserProfile;
};

export const incrementUsageCount = async (userId: string): Promise<boolean> => {
    // First, get current profile
    const profile = await getUserProfile(userId);

    if (!profile) {
        console.error('Profile not found');
        return false;
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

export const checkUsageLimit = async (userId: string): Promise<{ canUse: boolean; remaining: number }> => {
    const profile = await getUserProfile(userId);

    if (!profile) {
        return { canUse: false, remaining: 0 };
    }

    const remaining = USAGE_LIMIT - profile.usage_count;
    return {
        canUse: profile.usage_count < USAGE_LIMIT,
        remaining: Math.max(0, remaining),
    };
};

export { USAGE_LIMIT };
