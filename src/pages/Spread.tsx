import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useStore';
import { AppStage, DeckType, TarotCard, SelectedCardData, Language } from '../types';
import { DECK_CONFIGS, TRANSLATIONS } from '../constants';
import { playSound } from '../utils/sound';
import { generateReading, generateCardImage, getStoredImage } from '../services/geminiService';
import { incrementUsageCount } from '../services/authService';
import TarotRitual from '../components/TarotRitual';
import CutDeck from '../components/CutDeck';
import FanSpread from '../components/FanSpread';

const Spread: React.FC = () => {
    const { deckType: deckTypeParam } = useParams<{ deckType: string }>();
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth();
    const {
        language, question, intent, spreadType,
        shuffledDeck, targetCardCount,
        selectedCards, setSelectedCards,
        selectedCandidate, setSelectedCandidate,
        setReading,
        isGenerating, setIsGenerating,
        setHistory
    } = useAppStore();

    const [ritualStage, setRitualStage] = useState<'shuffling' | 'cutting' | 'drawing'>('shuffling');
    const selectionLock = useRef(false);

    // Reset generating state on mount to prevent stale UI
    useEffect(() => {
        setIsGenerating(false);
    }, [setIsGenerating]);

    const deckType = (deckTypeParam as DeckType) || DeckType.TAROT;
    const activeConfig = DECK_CONFIGS[deckType];
    const t = TRANSLATIONS[language];

    const finalizeCardSelect = async (card: TarotCard) => {
        if (selectionLock.current) return;
        if (selectedCards.length >= targetCardCount) return;

        selectionLock.current = true;
        playSound('flip');

        let position: any = 'Single';
        if (targetCardCount === 2) position = selectedCards.length === 0 ? 'Situation' : 'Challenge';
        else if (targetCardCount >= 3) {
            if (selectedCards.length === 0) position = 'Past';
            else if (selectedCards.length === 1) position = 'Present';
            else position = 'Future';
        }

        const cachedImage = await getStoredImage(deckType, card.id);

        const newSelection: SelectedCardData = {
            card,
            isReversed: deckType === DeckType.TAROT && Math.random() > 0.3,
            position,
            generatedImageUrl: cachedImage || undefined
        };

        const updatedSelections = [...selectedCards, newSelection];
        setSelectedCards(updatedSelections);

        if (updatedSelections.length < targetCardCount) {
            setSelectedCandidate(null);
        }

        setTimeout(() => { selectionLock.current = false; }, 500);

        if (updatedSelections.length === targetCardCount) {
            setIsGenerating(true);
            setSelectedCandidate(null); // Close modal immediately

            console.log('[Spread] Reading generation triggered', {
                cards: updatedSelections.map(s => s.card.name),
                question
            });

            try {
                // Critical path: Get reading and navigate
                const result = await generateReading(question, updatedSelections, intent, spreadType, deckType, language);

                if (!result) {
                    throw new Error('Received empty reading result');
                }

                console.log('[Spread] Reading data received, setting state');
                setReading(result);

                // Navigate immediately, don't wait for background tasks
                navigate('/reading');

                // Background tasks: Usage count & Image gen & History
                // Wrap in fire-and-forget promise chain
                (async () => {
                    try {
                        // Usage
                        if (user) {
                            try {
                                console.log('[Spread] Updating usage count');
                                await incrementUsageCount(user.id);
                                await refreshProfile();
                            } catch (e) {
                                console.error('[Spread] Usage count failed (non-blocking)', e);
                            }
                        }

                        // Background image generation
                        updatedSelections.forEach(async (sel, idx) => {
                            if (sel.generatedImageUrl) return;
                            const cardDisplayName = sel.isReversed ? `${sel.card.name} (Reversed)` : sel.card.name;
                            try {
                                const imageUrl = await generateCardImage(sel.card.id, cardDisplayName, deckType);
                                if (imageUrl) {
                                    setSelectedCards(prev => {
                                        const newList = [...prev];
                                        if (newList[idx]) newList[idx] = { ...newList[idx], generatedImageUrl: imageUrl };
                                        return newList;
                                    });
                                }
                            } catch (err) {
                                console.error('[Spread] Background image gen failed', err);
                            }
                        });

                        // History
                        console.log('[Spread] Saving history');
                        const newEntry: any = {
                            id: Date.now().toString(),
                            timestamp: Date.now(),
                            question,
                            intent,
                            deckType,
                            selectedCards: updatedSelections,
                            reading: result
                        };
                        setHistory(prev => [newEntry, ...prev].slice(0, 50));
                    } catch (bgError) {
                        console.error('[Spread] Background task failed', bgError);
                    }
                })();

            } catch (error) {
                console.error("[Spread] Critical Oracle Error:", error);
                // Ensure we turn off loading state on error
                setIsGenerating(false);
                setSelectedCandidate(null);

                // Optional: Show error toast/alert to user here
                let errorMsg = language === Language.ZH_TW 
                    ? '星辰連結中斷，請重試。' 
                    : 'Connection to the stars interrupted. Please try again.';
                
                if (error && error.message) {
                    try {
                        // Extract JSON payload from error message if exists
                        const jsonStart = error.message.indexOf('{');
                        if (jsonStart !== -1) {
                            const parsed = JSON.parse(error.message.substring(jsonStart));
                            if (parsed.error) {
                                errorMsg = typeof parsed.error === 'string' 
                                    ? parsed.error 
                                    : (parsed.error.message || JSON.stringify(parsed.error));
                            }
                        } else {
                            errorMsg = error.message;
                        }
                    } catch (e) {
                        errorMsg = error.message;
                    }
                }
                alert(errorMsg);
                navigate('/');
            } finally {
                // Ensure generating is off if we haven't navigated away (though navigate should unmount)
                // Note: If navigate happens, component unmounts, this might run on unmounted component 
                // which is harmless but can be silenced if needed.
                if (window.location.pathname === '/spread') {
                    setIsGenerating(false);
                }
            }
        }
    };

    const renderShuffling = () => (
        <TarotRitual
            stage={AppStage.SHUFFLING}
            deckType={deckType}
            language={language}
            onComplete={() => setRitualStage('cutting')}
        />
    );

    const renderCutting = () => (
        <CutDeck
            config={activeConfig}
            language={language}
            onComplete={() => setRitualStage('drawing')}
        />
    );

    const renderDrawing = () => (
        <div className="flex flex-col w-full h-full pt-16 md:pt-20 pb-safe overflow-hidden relative z-20">
            <div className="flex-none w-full text-center px-4 mb-2 md:mb-4 z-40">
                <h2 className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 font-bold tracking-[0.2em] uppercase">{t.drawTitle}</h2>
                <p className="text-white/50 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold">{t.drawSubtitle}</p>
            </div>

            <div className="flex-grow relative w-full flex items-center justify-center">
                <FanSpread
                    cards={shuffledDeck}
                    config={activeConfig}
                    onSelect={(card) => { setSelectedCandidate(card); playSound('select'); }}
                    selectedCardIds={selectedCards.map(s => s.card.id)}
                />
            </div>

            <div className="flex-none flex flex-col items-center gap-6 z-40 mt-4 absolute bottom-24 left-0 w-full pointer-events-none">
                <div className="flex gap-4">
                    {[...Array(targetCardCount)].map((_, i) => (
                        <div key={i} className={`w-10 h-14 rounded-lg border border-dashed transition-all duration-500 backdrop-blur-sm ${i < selectedCards.length ? 'border-primary bg-primary/20' : 'border-white/20'}`}>
                            {i < selectedCards.length && <div className="w-full h-full flex items-center justify-center"><Check className="text-primary" size={16} /></div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Global Loader for Drawing Stage */}
            {isGenerating && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                        <Sparkles size={48} className="text-primary relative z-10 animate-bounce" />
                    </div>
                    <h2 className="text-2xl text-white font-lora font-bold mt-8 tracking-widest animate-pulse">
                        {language === Language.ZH_TW ? '解讀星辰中...' : 'READING STARS...'}
                    </h2>
                    <p className="text-white/40 text-xs tracking-[0.3em] uppercase mt-4">
                        {language === Language.ZH_TW ? 'Lumen 正在連接命運...' : 'Lumen is connecting your fate...'}
                    </p>
                </div>
            )}

            {selectedCandidate && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedCandidate(null)}></div>
                    <div className="relative w-full max-w-sm aspect-square glass-panel flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-3xl border border-white/10">
                        <Sparkles className="text-primary mb-6 animate-pulse" size={32} />
                        <h3 className="text-xl md:text-2xl text-white font-bold mb-2 tracking-widest uppercase">
                            {language === Language.ZH_TW ? '這就是命運的指引嗎？' : 'Is this your fate?'}
                        </h3>
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] mb-10 font-bold">{selectedCandidate.name_i18n[language]}</p>
                        <div className="flex gap-6 w-full">
                            <button
                                onClick={() => finalizeCardSelect(selectedCandidate)}
                                disabled={isGenerating}
                                className="flex-1 py-4 btn-primary rounded-full text-[10px] tracking-widest uppercase shadow-xl active:scale-95 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating && <Sparkles size={12} className="animate-spin" />}
                                {isGenerating
                                    ? (language === Language.ZH_TW ? '解讀星辰中...' : 'READING STARS...')
                                    : (language === Language.ZH_TW ? '確認' : 'CONFIRM')
                                }
                            </button>
                            <button
                                onClick={() => setSelectedCandidate(null)}
                                disabled={isGenerating}
                                className="flex-1 py-4 bg-white/5 text-gray-300 border border-white/10 rounded-full text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all active:scale-95 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {language === Language.ZH_TW ? '返回' : 'BACK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    switch (ritualStage) {
        case 'shuffling': return renderShuffling();
        case 'cutting': return renderCutting();
        case 'drawing': return renderDrawing();
        default: return renderShuffling();
    }
};

export default Spread;
