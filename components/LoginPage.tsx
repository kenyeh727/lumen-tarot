import React from 'react';
import { Sparkles, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Language } from '../types';
import { isWebView, getWebViewType } from '../utils/browser';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface LoginPageProps {
    language: Language;
}

const LoginPage: React.FC<LoginPageProps> = ({ language }) => {
    const { login, loginWithEmail, loading } = useAuth();
    const [email, setEmail] = React.useState('');
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);
    const [isEmailSent, setIsEmailSent] = React.useState(false);

    const handleGoogleLogin = async () => {
        try {
            setIsLoggingIn(true);
            await login();
        } catch (error) {
            console.error('Google login failed:', error);
            alert(language === Language.ZH_TW ? '登入失敗，請重試' : 'Login failed, please try again');
            setIsLoggingIn(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || isLoggingIn) return;

        try {
            setIsLoggingIn(true);
            await loginWithEmail(email.trim());
            setIsEmailSent(true);
            setIsLoggingIn(false);
        } catch (error) {
            console.error('Email login failed:', error);
            alert(language === Language.ZH_TW ? '信箱登入失敗，請檢查格式' : 'Email login failed, please check format');
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

            <div className="glass-panel p-8 md:p-10 text-center max-w-md w-full rounded-[40px] border border-white/20 shadow-glass">
                <h1 className="text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 font-bold tracking-tight drop-shadow-sm font-serif">
                    {language === Language.ZH_TW ? '流光塔羅' : 'Lumen Tarot'}
                </h1>

                <p className="text-gray-400 text-[10px] tracking-[0.3em] uppercase mb-8 font-bold">
                    {language === Language.ZH_TW ? '探索命運的奧秘' : 'EXPLORE THE MYSTERIES OF FATE'}
                </p>

                <div className="border-t border-white/10 pt-8 mb-6">
                    {isWebView() ? (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl mb-6 text-left">
                            <div className="flex items-center gap-2 text-amber-500 mb-2 font-bold text-sm">
                                <AlertTriangle size={16} />
                                <span>{language === Language.ZH_TW ? '環境限制' : 'Environment Restriction'}</span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">
                                {language === Language.ZH_TW
                                    ? `偵測到 ${getWebViewType()} 內建瀏覽器。Google 禁止在此環境登入，建議使用下方的「信箱登入」或點擊右上角「使用瀏覽器開啟」。`
                                    : `Detected ${getWebViewType()}'s in-app browser. Google login is prohibited here. Please use "Email Login" below or "Open in Browser" to continue.`}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                            {language === Language.ZH_TW
                                ? '請先登入以開始您的占卜旅程。'
                                : 'Please sign in to begin your divination journey.'}
                        </p>
                    )}
                </div>

                {isEmailSent ? (
                    <div className="bg-primary/10 border border-primary/30 p-6 rounded-3xl animate-in zoom-in duration-300">
                        <Sparkles className="text-primary mx-auto mb-4" size={32} />
                        <h3 className="text-white font-bold mb-2">
                            {language === Language.ZH_TW ? '登入連結已發送' : 'Login Link Sent'}
                        </h3>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            {language === Language.ZH_TW
                                ? `請前往信箱 ${email} 查看登入連結。如果沒看到，請檢查垃圾信件匣。`
                                : `Please check ${email} for the login link. Don't forget to check your spam folder.`}
                        </p>
                        <button
                            onClick={() => setIsEmailSent(false)}
                            className="mt-6 text-primary text-xs font-bold uppercase tracking-widest hover:underline"
                        >
                            {language === Language.ZH_TW ? '返回修改信箱' : 'BACK TO CHANGE EMAIL'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={language === Language.ZH_TW ? '請輸入電子信箱' : 'Enter your email'}
                                    className="w-full bg-black/20 border border-white/10 rounded-full py-4 px-6 text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoggingIn || !email.trim()}
                                className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-xs tracking-[0.2em] uppercase font-bold text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <Mail size={16} />
                                {language === Language.ZH_TW ? '信箱驗證碼登入' : 'EMAIL LOGIN'}
                            </button>
                        </form>

                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{language === Language.ZH_TW ? '或' : 'OR'}</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn}
                            className="w-full py-4 btn-primary rounded-full text-xs tracking-[0.2em] uppercase font-bold shadow-lg disabled:opacity-50 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                        >
                            {isLoggingIn ? <Sparkles size={16} className="animate-spin" /> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="G" />}
                            {language === Language.ZH_TW ? 'Google 快速登入' : 'GOOGLE SIGN IN'}
                        </button>
                    </div>
                )}

                <p className="text-gray-500 text-[10px] mt-8 leading-relaxed">
                    {language === Language.ZH_TW
                        ? '登入即表示您同意我們的服務條款與每位使用者 10 次的免費額度限制。'
                        : 'By signing in, you agree to our Terms of Service and 10 free readings per user.'}
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
