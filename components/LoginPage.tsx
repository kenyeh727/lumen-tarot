import React from 'react';
import { Sparkles, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Language } from '../types';

interface LoginPageProps {
    language: Language;
}

const LoginPage: React.FC<LoginPageProps> = ({ language }) => {
    const { login, loading } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);

    const handleLogin = async () => {
        try {
            setIsLoggingIn(true);
            await login();
        } catch (error) {
            console.error('Login failed:', error);
            alert(language === Language.ZH_TW ? '登入失敗，請重試' : 'Login failed, please try again');
            setIsLoggingIn(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <div className="relative z-10 animate-bounce mb-4">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/4392/4392520.png"
                    alt="Lumen Tarot"
                    className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_30px_rgba(103,81,246,0.6)]"
                />
            </div>

            <div className="glass-panel p-8 md:p-12 text-center max-w-md w-full rounded-[40px] border border-white/20 shadow-glass">
                <h1 className="text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 font-bold tracking-tight drop-shadow-sm font-serif">
                    {language === Language.ZH_TW ? '流光塔羅' : 'Lumen Tarot'}
                </h1>

                <p className="text-gray-400 text-xs tracking-[0.3em] uppercase mb-8 font-bold">
                    {language === Language.ZH_TW ? '探索命運的奧秘' : 'EXPLORE THE MYSTERIES OF FATE'}
                </p>

                <div className="border-t border-white/10 pt-8 mb-8">
                    <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                        {language === Language.ZH_TW
                            ? '請先登入以開始您的占卜旅程。每位使用者享有 10 次免費占卜機會。'
                            : 'Please sign in to begin your divination journey. Each user gets 10 free readings.'}
                    </p>
                </div>

                <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full py-5 btn-primary rounded-full text-sm tracking-[0.2em] uppercase font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                    {isLoggingIn ? (
                        <>
                            <Sparkles size={20} className="animate-spin" />
                            {language === Language.ZH_TW ? '登入中...' : 'SIGNING IN...'}
                        </>
                    ) : (
                        <>
                            <Mail size={20} />
                            {language === Language.ZH_TW ? '使用 Google 登入' : 'SIGN IN WITH GOOGLE'}
                        </>
                    )}
                </button>

                <p className="text-gray-500 text-xs mt-6">
                    {language === Language.ZH_TW
                        ? '登入即表示您同意我們的服務條款'
                        : 'By signing in, you agree to our Terms of Service'}
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
