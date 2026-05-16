import React, { useState } from 'react';
import { User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { USAGE_LIMIT } from '../services/authService';
import { Language } from '../types';

interface UserMenuProps {
    language: Language;
}

const UserMenu: React.FC<UserMenuProps> = ({ language }) => {
    const { user, profile, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (!user) return null;

    const isUnlimited = profile?.is_unlimited ?? false;

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoggingOut(false);
        }
    };

    const remaining = profile ? USAGE_LIMIT - profile.usage_count : 0;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-full backdrop-blur-md shadow-sm border border-white/10 transition-all min-h-[44px]"
            >
                <User size={16} className="text-primary" />
                <span className="text-xs text-gray-300 font-bold hidden md:inline max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-14 z-50 w-72 glass-panel rounded-2xl border border-white/20 shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="border-b border-white/10 pb-3 mb-3">
                            <p className="text-white font-bold text-sm truncate">{user.email}</p>
                        </div>

                        {profile && (
                            <div className="bg-white/5 rounded-xl p-3 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                                        {language === Language.ZH_TW ? '剩餘次數' : 'REMAINING'}
                                    </span>
                                    <span className="text-primary font-bold">
                                        {isUnlimited ? (language === Language.ZH_TW ? '無限' : '∞') : `${remaining}/${USAGE_LIMIT}`}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                        style={{ width: isUnlimited ? '100%' : `${(remaining / USAGE_LIMIT) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            {isLoggingOut ? (
                                <>
                                    <Sparkles size={14} className="animate-spin" />
                                    {language === Language.ZH_TW ? '登出中' : 'SIGNING OUT'}
                                </>
                            ) : (
                                <>
                                    <LogOut size={14} />
                                    {language === Language.ZH_TW ? '登出' : 'SIGN OUT'}
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserMenu;
