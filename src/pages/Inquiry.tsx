import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useStore';
import { Language, DeckType, SpreadType } from '../types';
import { DECK_CONFIGS, TRANSLATIONS, FULL_DECK, LENORMAND_DECK } from '../constants';
import { checkUsageLimit } from '../services/authService';
import { analyzeIntent } from '../services/geminiService';
import { playSound } from '../utils/sound';
import { shuffleArray } from '../utils/common';
import UsageLimitBanner from '../components/UsageLimitBanner';

const Inquiry: React.FC = () => {
    const { deckType: deckTypeParam } = useParams<{ deckType: string }>();
    const navigate = useNavigate();
    const { user, profile, refreshProfile } = useAuth();
    const {
        language, question, setQuestion,
        isProcessing, setIsProcessing,
        setIntent, setDeckType,
        targetCardCount, setTargetCardCount,
        setSpreadType, setSelectedCards, setReading,
        setShuffledDeck
    } = useAppStore();

    const deckType = (deckTypeParam as DeckType) || DeckType.TAROT;
    const activeConfig = DECK_CONFIGS[deckType];
    const t = TRANSLATIONS[language];

    const handleInquirySubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Basic validation
        if (!question.trim() || isProcessing) return;

        // Immediate feedback
        setIsProcessing(true);
        playSound('select');

        try {
            // Check if user is logged in
            if (!user) {
                alert(language === Language.ZH_TW ? '請先登入' : 'Please sign in first');
                setIsProcessing(false);
                return;
            }

            // Usage check with 3s timeout protection
            const usageCheckPromise = checkUsageLimit(user.id);
            const timeoutPromise = new Promise<{ canUse: boolean }>((resolve) =>
                setTimeout(() => resolve({ canUse: true }), 3000)
            );

            // If backend is dead/slow, we auto-approve after 3s to let user play
            const { canUse } = await Promise.race([usageCheckPromise, timeoutPromise]);

            if (!canUse) {
                alert(language === Language.ZH_TW ? '您的占卜額度已用完' : 'Your reading quota has been exhausted');
                setIsProcessing(false);
                return;
            }

            // Prepare state
            setSelectedCards([]);
            setReading(null);

            const activeDeckData = deckType === DeckType.LENORMAND ? LENORMAND_DECK : FULL_DECK;
            const newDeck = shuffleArray([...activeDeckData]);
            setShuffledDeck(newDeck);

            let newSpread = SpreadType.ONE_CARD;
            if (targetCardCount === 2) newSpread = SpreadType.TWO_CARD;
            if (targetCardCount >= 3) newSpread = SpreadType.THREE_CARD;
            setSpreadType(newSpread);

            // Intent analysis (with fallback)
            try {
                const result = await analyzeIntent(question);
                setIntent(result.category);
            } catch (intentErr) {
                console.warn("Intent analysis failed (continuing to spread):", intentErr);
                // Continue to spread even if intent fails
            }

            navigate(`/spread/${deckType}`);
        } catch (err) {
            console.error("Critical Inquiry Error:", err);
            // Critical fallback - always try to navigate
            navigate(`/spread/${deckType}`);
        } finally {
            // Reset happens on mount of next page or if we stay here (error case handled above)
            // But if we navigated, this might run on unmounted component (React handles this safely now)
            // We'll keep the timeout just in case navigation didn't happen for some reason
            setTimeout(() => setIsProcessing(false), 2000);
        }
    };

    // Reset processing state on mount to prevent stale lock
    React.useEffect(() => {
        setIsProcessing(false);
    }, [setIsProcessing]);

    return (
        <div className="w-full h-full overflow-y-auto no-scrollbar z-20">
            <div className="min-h-full flex flex-col items-center justify-center p-6 pt-24 pb-safe animate-in fade-in zoom-in duration-500">
                <div className="relative z-10 animate-bounce mb-[-10px]">
                    <img src="https://cdn-icons-png.flaticon.com/512/4392/4392520.png" alt="Mascot" className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_30px_rgba(103,81,246,0.6)]" />
                </div>

                <UsageLimitBanner language={language} />

                <div className="glass-panel p-8 md:p-12 text-center max-w-xl w-full relative z-0 mt-4 rounded-[40px] border border-white/20 shadow-glass">
                    <h1 className="text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 font-bold tracking-tight drop-shadow-sm font-serif">{activeConfig.label[language]}</h1>
                    <p className="text-gray-400 text-[10px] tracking-[0.3em] uppercase mb-10 font-bold">{activeConfig.tagline[language]}</p>
                    <form onSubmit={handleInquirySubmit} className="w-full flex flex-col items-center">
                        <div className="relative w-full mb-8 group">
                            <input
                                type="text"
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                placeholder={t.placeholder}
                                className="w-full bg-black/20 shadow-inner border border-white/10 rounded-full py-6 px-8 text-center text-lg md:text-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-medium backdrop-blur-sm"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-10 justify-center mb-8 items-center w-full">
                            <div className="text-center w-full">
                                <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-3 font-bold">{t.cards}</div>
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3].map(n => (
                                        <button key={n} type="button" onClick={() => setTargetCardCount(n)} className={`w-12 h-12 rounded-full text-sm font-bold transition-all border ${targetCardCount === n ? 'bg-primary border-primary text-white shadow-lg scale-110' : 'bg-transparent border-white/20 text-gray-400 hover:border-white/40'}`}>{n}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={!question.trim() || isProcessing || (profile && !profile.is_unlimited && profile.usage_count >= 10)} className="w-full py-5 btn-primary rounded-full text-sm tracking-[0.2em] uppercase font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1">
                            {isProcessing ? '...' : t.start}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Inquiry;
