import React from 'react';
import { AlertCircle, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { USAGE_LIMIT } from '../services/authService';
import { Language } from '../types';

interface UsageLimitBannerProps {
    language: Language;
}

const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({ language }) => {
    const { profile } = useAuth();

    if (!profile) return null;

    if (profile.is_unlimited) {
        return (
            <div className="w-full max-w-xl mx-auto mb-6 glass-panel p-4 rounded-2xl border border-primary/50 bg-primary/10">
                <div className="flex items-center gap-3">
                    <Zap className="text-primary flex-shrink-0 animate-pulse" size={20} />
                    <div className="flex-1">
                        <p className="text-primary-200 font-bold text-sm">
                            {language === Language.ZH_TW ? '✨ 無限次數占卜已啟用' : '✨ Unlimited readings enabled'}
                        </p>
                        <p className="text-primary-300/60 text-xs mt-1">
                            {language === Language.ZH_TW ? '盡情探索星辰的指引吧！' : 'Explore the guidance of the stars as much as you wish!'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const remaining = USAGE_LIMIT - profile.usage_count;
    const percentage = (remaining / USAGE_LIMIT) * 100;

    // 用完了
    if (remaining <= 0) {
        return (
            <div className="w-full max-w-xl mx-auto mb-6 glass-panel p-4 rounded-2xl border-2 border-red-500/50 bg-red-900/20">
                <div className="flex items-center gap-3">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
                    <div className="flex-1">
                        <p className="text-red-200 font-bold text-sm">
                            {language === Language.ZH_TW ? '您的占卜額度已用完' : 'Your reading quota has been exhausted'}
                        </p>
                        <p className="text-red-300/70 text-xs mt-1">
                            {language === Language.ZH_TW
                                ? '感謝您的使用！期待未來再次為您服務。'
                                : 'Thank you for using our service! We look forward to serving you again.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 剩餘 <= 3 次，顯示警告
    if (remaining <= 3) {
        return (
            <div className="w-full max-w-xl mx-auto mb-6 glass-panel p-4 rounded-2xl border border-yellow-500/50 bg-yellow-900/10">
                <div className="flex items-center gap-3">
                    <AlertCircle className="text-yellow-400 flex-shrink-0" size={20} />
                    <div className="flex-1">
                        <p className="text-yellow-200 font-bold text-sm">
                            {language === Language.ZH_TW
                                ? `⚠️ 您還剩 ${remaining} 次占卜機會`
                                : `⚠️ You have ${remaining} reading${remaining > 1 ? 's' : ''} remaining`}
                        </p>
                        <p className="text-yellow-300/60 text-xs mt-1">
                            {language === Language.ZH_TW ? '請珍惜每次占卜' : 'Please cherish each reading'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 正常狀態
    return (
        <div className="w-full max-w-xl mx-auto mb-6 glass-panel p-4 rounded-2xl border border-primary/30">
            <div className="flex items-center gap-3">
                <Sparkles className="text-primary flex-shrink-0" size={20} />
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-300 font-bold text-sm">
                            {language === Language.ZH_TW
                                ? `✨ 您還有 ${remaining} 次占卜機會`
                                : `✨ ${remaining} reading${remaining > 1 ? 's' : ''} remaining`}
                        </p>
                        <span className="text-primary text-xs font-bold">{remaining}/{USAGE_LIMIT}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageLimitBanner;
