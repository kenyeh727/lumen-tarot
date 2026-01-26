import React, { useState } from 'react';
import { Scissors } from 'lucide-react';
import { playSound } from '../utils/sound';
import { DeckConfig, Language } from '../types';

interface CutDeckProps {
    config: DeckConfig;
    language: Language;
    onComplete: () => void;
}

const CutDeck: React.FC<CutDeckProps> = ({ config, language, onComplete }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasCut, setHasCut] = useState(false);

    const TEXT = {
        TITLE: { [Language.EN]: "Divide the Deck", [Language.ZH_TW]: "切斷連結" },
        SUBTITLE: { [Language.EN]: "Tap to split the energy", [Language.ZH_TW]: "輕觸牌疊以劃分新的能量" }
    };

    const handleCut = () => {
        if (isAnimating || hasCut) return;
        setIsAnimating(true);
        playSound('flip');
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);

        // Animation plays, then triggers completion
        setTimeout(() => {
            setHasCut(true);
            setTimeout(() => {
                onComplete();
            }, 800);
        }, 1200);
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-auto overflow-hidden bg-[#020205]">
            {/* Instruction */}
            <div className="absolute top-[20%] text-center z-50 animate-in fade-in slide-in-from-bottom duration-700">
                <h3 className="text-3xl font-serif font-bold text-from-white to-white/60 tracking-[0.2em] uppercase text-white">
                    {TEXT.TITLE[language]}
                </h3>
                <p className="text-amber-400/60 text-[10px] uppercase tracking-[0.4em] mt-4 font-bold animate-pulse">
                    {TEXT.SUBTITLE[language]}
                </p>
            </div>

            {/* Deck Visualization */}
            <div className="relative w-64 h-80 flex items-center justify-center cursor-pointer group z-10" onClick={handleCut}>
                {/* Base Stack */}
                <div className="relative w-40 h-64">
                    <div
                        className="absolute inset-0 rounded-xl bg-indigo-950 border border-white/10 shadow-2xl transition-transform duration-500"
                        style={{
                            backgroundImage: `url(${config.cardBackImage})`,
                            backgroundSize: 'cover',
                            transform: 'translateY(4px)'
                        }}
                    >
                        <div className="absolute -right-1 top-1 bottom-1 w-1 bg-[#1a1a2e] border-r border-white/5 rounded-r-sm"></div>
                    </div>

                    {/* Top Half */}
                    <div
                        className={`absolute inset-0 rounded-xl bg-indigo-900 border border-amber-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 
                        ${isAnimating ? 'animate-cut-top' : ''} 
                        ${hasCut ? 'opacity-0 scale-95' : 'opacity-100'} 
                        transition-opacity duration-300`}
                        style={{
                            backgroundImage: `url(${config.cardBackImage})`,
                            backgroundSize: 'cover'
                        }}
                    >
                        <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
                        <div className="absolute inset-2 border border-amber-400/20 rounded-lg opacity-50"></div>
                    </div>
                </div>

                {/* Cut Icon Hint */}
                {!isAnimating && !hasCut && (
                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-amber-400/50 animate-bounce pointer-events-none">
                        <Scissors size={32} className="-rotate-90 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                    </div>
                )}
            </div>

            <style>{`
            @keyframes cut-top {
                0% { transform: translate(0, 0) rotate(0); z-index: 20; }
                40% { transform: translate(-100px, -40px) rotate(-10deg); z-index: 20; }
                60% { transform: translate(-100px, -40px) rotate(-10deg); z-index: 0; }
                100% { transform: translate(0, 4px) rotate(0); z-index: 0; }
            }
            .animate-cut-top { animation: cut-top 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        `}</style>
        </div>
    );
};

export default CutDeck;
