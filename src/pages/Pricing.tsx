import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useStore';
import { Language } from '../types';
import { handleCheckout } from '../utils/payment';

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useAppStore();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center pt-20 pb-safe z-30 px-6 animate-in fade-in duration-500">
            <div className="max-w-md w-full glass-panel p-8 rounded-[32px] text-center relative overflow-hidden border border-white/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest font-serif">{language === Language.ZH_TW ? '訂閱方案' : 'Premium Plan'}</h2>
                <p className="text-gray-400 text-[10px] tracking-[0.3em] uppercase mb-8 font-bold">{language === Language.ZH_TW ? '解鎖星辰之力' : 'Unlock Full Potential'}</p>

                <div className="border border-white/10 rounded-2xl p-6 bg-white/5 mb-8 hover:bg-white/10 transition-colors">
                    <div className="text-4xl font-bold text-primary mb-2">$399 <span className="text-sm text-gray-400 font-normal">TWD / mo</span></div>
                    <ul className="text-left space-y-4 mb-8 pl-4">
                        <li className="flex items-center gap-3 text-sm text-gray-300 font-medium"><Check size={16} className="text-primary" /> {language === Language.ZH_TW ? '無限次數解牌' : 'Unlimited Readings'}</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300 font-medium"><Check size={16} className="text-primary" /> {language === Language.ZH_TW ? '深度命理分析' : 'Deep Analysis'}</li>
                        <li className="flex items-center gap-3 text-sm text-gray-300 font-medium"><Check size={16} className="text-primary" /> {language === Language.ZH_TW ? '完整歷史紀錄' : 'Full History Access'}</li>
                    </ul>
                    <button
                        onClick={() => user ? handleCheckout(user.id, user.email || '', 'price_premium') : navigate('/login')}
                        className="w-full py-4 btn-primary rounded-full tracking-[0.2em] uppercase font-bold text-xs shadow-lg transform active:scale-95"
                    >
                        {user ? (language === Language.ZH_TW ? '立即訂閱' : 'Subscribe Now') : (language === Language.ZH_TW ? '登入後訂閱' : 'Login to Subscribe')}
                    </button>
                </div>

                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-[10px] tracking-widest uppercase font-bold transition-colors">
                    {language === Language.ZH_TW ? '稍後再說' : 'Maybe Later'}
                </button>
            </div>
        </div>
    );
};

export default Pricing;
