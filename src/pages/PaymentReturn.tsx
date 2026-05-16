import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { Language } from '../types';

const PaymentReturn: React.FC = () => {
    const navigate = useNavigate();
    const { language } = useAppStore();

    return (
        <div className="w-full h-full flex items-center justify-center p-6 text-center z-30 animate-in fade-in zoom-in duration-500">
            <div className="max-w-md glass-panel p-10 rounded-[32px] border border-white/20 shadow-glass">
                <Sparkles size={48} className="text-primary mx-auto mb-6 animate-pulse" />
                <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest font-serif">{language === Language.ZH_TW ? '付款處理中' : 'Payment Pending'}</h2>
                <p className="text-gray-300 mb-8 leading-relaxed text-sm font-medium">
                    {language === Language.ZH_TW ? '星辰正在校準軌道... 您的訂閱正在處理中。' : 'Allowing the stars to align... your subscription is being processed.'}
                </p>
                <button onClick={() => navigate('/')} className="px-8 py-3 btn-primary rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    {language === Language.ZH_TW ? '返回首頁' : 'Return Home'}
                </button>
            </div>
        </div>
    );
};

export default PaymentReturn;
