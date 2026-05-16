import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Share2, Hash, RotateCcw } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { Language, DeckType } from '../types';
import { DECK_CONFIGS, TRANSLATIONS } from '../constants';
import { playSound } from '../utils/sound';
import { getDefaultCardImage } from '../utils/cardAssets';
import ShareCard from '../components/ShareCard';
import CustomLoader from '../components/CustomLoader';
import FeedbackWidget from '../components/FeedbackWidget';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Screenshot } from '@capawesome/capacitor-screenshot';
// @ts-ignore
import html2canvas from 'html2canvas';

const ReadingPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        language, reading, selectedCards, deckType,
        setSelectedCards, resetReadingState, history
    } = useAppStore();

    const shareCardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    const activeConfig = DECK_CONFIGS[deckType];
    const t = TRANSLATIONS[language];

    if (!reading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <button onClick={() => navigate('/')} className="btn-primary px-8 py-3 rounded-full">
                    Back to Lobby
                </button>
            </div>
        );
    }

    const handleShare = async () => {
        if (!shareCardRef.current || isSharing) return;
        setIsSharing(true);
        playSound('select');

        try {
            // Native Screenshot Optimization (using the new plugin)
            if (Capacitor.isNativePlatform()) {
                try {
                    const result = await Screenshot.take();
                    // The plugin returns base64 in the 'base64' property (verify type cast if needed)
                    const b64 = (result as any).base64;
                    if (b64) {
                        await Share.share({
                            title: 'Lumen Tarot Reading',
                            text: `My reading: "${reading.summary}"`,
                            url: `data:image/png;base64,${b64}`,
                            dialogTitle: 'Share your destiny'
                        });
                    }
                } catch (e) {
                    console.error('Native screenshot failed', e);
                }
                setIsSharing(false);
                return;
            }

            // Web Fallback
            const canvas = await html2canvas(shareCardRef.current, {
                backgroundColor: null,
                scale: 2,
                logging: false,
                useCORS: true
            });

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    setIsSharing(false);
                    return;
                }

                const fileName = `lumen-tarot-${Date.now()}.png`;
                const file = new File([blob], fileName, { type: 'image/png' });

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Lumen Tarot Reading',
                            text: `My reading for today: "${reading.summary}" #LumenTarot`
                        });
                    } catch (err: any) {
                        if (err.name !== 'AbortError') console.error(err);
                    }
                } else {
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = canvas.toDataURL();
                    link.click();
                }
                setIsSharing(false);
            }, 'image/png');
        } catch (e) {
            console.error("Share failed", e);
            setIsSharing(false);
        }
    };

    const highlightKeywords = (text: string) => {
        const keywords = ['Love', 'Career', 'Health', 'Future', 'Past', 'Present', 'Opportunity', 'Change', 'Growth', 'Success', 'Harmony', 'Balance', 'Joy', 'Hope', 'Universe', 'Spirit'];
        let parts = text.split(new RegExp(`(${keywords.join('|')})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => {
                    const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
                    return isKeyword
                        ? <span key={i} className="text-primary font-bold">{part}</span>
                        : part;
                })}
            </span>
        );
    };

    return (
        <div className="w-full h-full flex flex-col pt-20 pb-safe z-30">
            <div className="absolute top-0 left-[-9999px] pointer-events-none">
                <ShareCard
                    ref={shareCardRef}
                    cards={selectedCards}
                    reading={reading}
                    date={new Date().toLocaleDateString()}
                    language={language}
                />
            </div>

            <div className="flex-1 w-full max-w-2xl px-6 mx-auto flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                    <div className="flex flex-wrap justify-center gap-6 mb-8 mt-4">
                        {selectedCards.map((data, i) => (
                            <div key={i} className="relative group w-32 h-52 md:w-40 md:h-64 rounded-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className={`absolute -inset-1 bg-gradient-to-t ${activeConfig.bgGradient} rounded-2xl opacity-60`}></div>
                                <div className="relative w-full h-full glass-panel overflow-hidden p-1">
                                    <div className="w-full h-full rounded-xl overflow-hidden relative bg-[#1c1d22]">
                                        <img
                                            src={data.generatedImageUrl || getDefaultCardImage(data.card, deckType)}
                                            loading="lazy"
                                            className={`w-full h-full object-cover ${data.isReversed ? 'rotate-180' : ''}`}
                                            alt={data.card.name}
                                        />
                                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-3">
                                            <p className="text-[9px] text-primary uppercase tracking-widest mb-1 font-bold">{data.position}</p>
                                            <p className="text-xs text-white font-bold tracking-widest uppercase truncate">{data.card.name_i18n[language]}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mb-6">
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all text-xs font-bold uppercase tracking-widest text-white"
                        >
                            {isSharing ? <Sparkles size={14} className="animate-spin" /> : <Share2 size={14} />}
                            {language === Language.ZH_TW ? '分享運勢' : 'SHARE DESTINY'}
                        </button>
                    </div>

                    <h2 className="text-2xl md:text-3xl text-white font-serif font-bold mb-6 leading-relaxed text-center drop-shadow-sm">"{reading.summary}"</h2>

                    {reading.keywords && (
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {reading.keywords.map((kw, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-300 flex items-center gap-1">
                                    <Hash size={10} /> {kw}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 w-full pb-8">
                        <div className="glass-panel p-6 md:p-8 text-left relative rounded-3xl">
                            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                                <span className="text-xl">🔮</span>
                                <h3 className="text-xs tracking-[0.3em] text-primary uppercase font-bold">{language === Language.ZH_TW ? '深度解析' : 'THE DEEP ANALYSIS'}</h3>
                            </div>
                            <p className="text-gray-300 text-base font-medium whitespace-pre-wrap leading-loose">
                                {highlightKeywords(reading.analysis)}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 relative mt-2">
                                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary/20 border border-primary/50 shadow-md overflow-hidden p-2 flex items-center justify-center">
                                        <Sparkles className="text-primary w-full h-full" />
                                    </div>
                                </div>
                                <div className="glass-panel p-5 text-left border-l-4 border-primary relative flex-1 rounded-r-3xl rounded-bl-3xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">🌟</span>
                                        <h3 className="text-[10px] tracking-[0.2em] text-white uppercase font-bold">{t.adviceLabel}</h3>
                                    </div>
                                    <p className="text-gray-300 text-sm font-medium">{reading.advice}</p>
                                </div>
                            </div>

                            <div className="glass-panel p-5 text-left border-l-4 border-accent ml-14 rounded-3xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">💖</span>
                                    <h3 className="text-[10px] tracking-[0.2em] text-accent uppercase font-bold">{t.affirmationLabel}</h3>
                                </div>
                                <p className="text-gray-300 text-sm italic">{reading.affirmation}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8 relative z-50">
                        <FeedbackWidget readingId={history.length > 0 ? history[0].id : (reading.summary ? 'current-reading' : 'unknown')} />
                    </div>

                </div>

                <div className="flex-none pt-4 pb-2 flex justify-center">
                    <button onClick={() => { resetReadingState(); navigate('/'); }} className="flex items-center gap-3 px-10 py-4 btn-primary rounded-full tracking-[0.2em] uppercase shadow-lg w-full md:w-auto justify-center font-bold">
                        <RotateCcw size={16} /> {t.askAgain}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReadingPage;
