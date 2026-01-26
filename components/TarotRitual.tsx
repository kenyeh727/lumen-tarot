import React, { useState } from 'react';
import { RotateCw, Sparkles } from 'lucide-react';
import { playSound } from '../utils/sound';
import { DECK_CONFIGS } from '../constants';
import { DeckType } from '../types';

interface TarotRitualProps {
    stage: 'SHUFFLING' | 'CUTTING';
    deckType: DeckType;
    onComplete: () => void;
}

const TarotRitual: React.FC<TarotRitualProps> = ({ deckType, onComplete }) => {
    const config = DECK_CONFIGS[deckType];
    const [isAnimating, setIsAnimating] = useState(false);

    const triggerHaptic = (duration: number | number[] = 10) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    };

    const handleShuffle = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        playSound('flip');
        triggerHaptic([10, 20, 10, 20, 10]);

        setTimeout(() => {
            setIsAnimating(false);
            onComplete();
        }, 3000);
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-[#020205]">
            {/* Ambient background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse"></div>
            </div>

            {/* Central Deck Animation */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-16">
                <div className={`relative w-40 h-64 md:w-48 md:h-72 ${isAnimating ? 'animate-ritual-shuffle' : 'animate-ritual-idle'}`}>
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 rounded-xl shadow-2xl border border-white/10 bg-cover bg-center overflow-hidden"
                            style={{
                                backgroundImage: `url(${config.cardBackImage})`,
                                transform: `translateY(${-i * 2}px) rotate(${(i - 4) * 0.5}deg)`,
                                zIndex: 10 - i,
                                opacity: 1 - (i * 0.05)
                            }}
                        >
                            {/* Shimmering effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 animate-shimmer pointer-events-none"></div>
                        </div>
                    ))}
                </div>

                {/* Particles around the deck during shuffle */}
                {isAnimating && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-amber-400/40 animate-bounce"><Sparkles size={20} /></div>
                        <div className="absolute bottom-0 left-1/4 text-indigo-400/40 animate-pulse"><Sparkles size={16} /></div>
                        <div className="absolute top-1/4 right-0 text-purple-400/40 animate-ping"><Sparkles size={14} /></div>
                    </div>
                )}
            </div>

            {/* Action Controls */}
            <div className="flex flex-col items-center gap-6 z-10">
                <div className="text-center space-y-2 mb-4">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {isAnimating ? "Mixing Fates" : "Ritual Phase"}
                    </h3>
                    <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
                </div>

                <button
                    onClick={handleShuffle}
                    disabled={isAnimating}
                    className="relative px-16 py-6 rounded-full overflow-hidden group transition-all duration-500 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-80"
                >
                    {/* Button Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 backdrop-blur-xl border border-white/10 group-hover:border-amber-400/40 transition-colors"></div>

                    {/* Content */}
                    <div className="relative flex items-center gap-4 text-white font-bold tracking-[0.25em] uppercase text-sm">
                        <RotateCw className={`text-amber-400 ${isAnimating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} size={20} />
                        <span>{isAnimating ? 'Channeling' : 'Begin Shuffle'}</span>
                    </div>

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                </button>

                <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-medium text-center max-w-[200px] leading-relaxed">
                    {isAnimating ? "Aligning stars with your query..." : "Cleansing energy from the previous seeker"}
                </p>

                {/* Shuffle Verification - shows a random number each time */}
                <p className="text-amber-400/40 text-[8px] font-mono mt-2">
                    Shuffle ID: {Math.random().toString(36).substring(7)}
                </p>
            </div>

            <style>{`
          @keyframes ritual-idle {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-10px) rotate(1deg); }
          }
          @keyframes ritual-shuffle {
            0% { transform: translateX(0) scale(1.0); }
            25% { transform: translateX(-60px) rotate(-15deg) scale(1.05); }
            50% { transform: translateX(0) scale(1.1); }
            75% { transform: translateX(60px) rotate(15deg) scale(1.05); }
            100% { transform: translateX(0) scale(1.0); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          .animate-ritual-idle { animation: ritual-idle 4s ease-in-out infinite; }
          .animate-ritual-shuffle { animation: ritual-shuffle 0.4s ease-in-out infinite; }
          .animate-shimmer { animation: shimmer 2s linear infinite; }
        `}</style>
        </div>
    );
};

export default TarotRitual;
