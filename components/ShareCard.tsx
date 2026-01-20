
import React, { forwardRef } from 'react';
import { SelectedCardData, ReadingResult, Language } from '../types';
import { Sparkles, Star } from 'lucide-react';
import { DECK_CONFIGS } from '../constants';

interface ShareCardProps {
  cards: SelectedCardData[];
  reading: ReadingResult | null;
  date: string;
  language: Language;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ cards, reading, date, language }, ref) => {
  const mainCard = cards[0];
  const config = mainCard ? DECK_CONFIGS[mainCard.card.id >= 200 ? 'LENORMAND' : 'TAROT'] : null;

  return (
    <div 
      ref={ref}
      className="w-[400px] bg-[#08090c] relative overflow-hidden flex flex-col items-center text-center p-8 border-8 border-[#1c1d22]"
      style={{ 
        aspectRatio: '9/16',
        backgroundImage: 'linear-gradient(180deg, #1f1c3b 0%, #08090c 100%)'
      }}
    >
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[50%] bg-purple-600/20 blur-[80px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[40%] bg-indigo-600/20 blur-[80px] rounded-full"></div>

        {/* Header */}
        <div className="relative z-10 w-full flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary rounded-lg">
                    <Sparkles size={16} className="text-white" />
                </div>
                <span className="text-white font-serif tracking-[0.2em] font-bold text-sm">LUMEN TAROT</span>
            </div>
            <span className="text-white/40 text-xs font-mono tracking-widest">{date}</span>
        </div>

        {/* Card Visual */}
        <div className="relative z-10 w-full flex-grow flex flex-col items-center justify-center mb-6">
            {mainCard && (
                <div className="relative w-48 aspect-[2/3] rounded-xl shadow-2xl border border-white/20 p-1 bg-white/5 backdrop-blur-sm transform rotate-[-2deg]">
                    <div className="w-full h-full rounded-lg overflow-hidden bg-black">
                        {mainCard.generatedImageUrl ? (
                            <img src={mainCard.generatedImageUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Star className="text-white/20" />
                            </div>
                        )}
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
                            <p className="text-white text-xs font-bold uppercase tracking-widest text-center">
                                {mainCard.card.name_i18n[language]}
                            </p>
                            {mainCard.isReversed && (
                                <p className="text-[8px] text-red-300 text-center uppercase tracking-widest font-bold">REVERSED</p>
                            )}
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-2 -right-2 text-yellow-400">
                        <Sparkles size={24} fill="currentColor" />
                    </div>
                </div>
            )}
            
            {/* If multiple cards, show simplified indicators */}
            {cards.length > 1 && (
                <div className="flex gap-2 mt-4">
                    {cards.slice(1).map((c, i) => (
                        <div key={i} className="w-8 h-12 bg-white/10 rounded border border-white/20 overflow-hidden">
                             {c.generatedImageUrl && <img src={c.generatedImageUrl} className="w-full h-full object-cover opacity-60" />}
                        </div>
                    ))}
                    <div className="flex items-center text-white/40 text-xs font-bold px-2">
                        +{cards.length - 1}
                    </div>
                </div>
            )}
        </div>

        {/* Quote / Summary */}
        <div className="relative z-10 w-full bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 mb-8">
            <Sparkles size={16} className="text-primary absolute top-4 left-4 opacity-50" />
            <p className="text-white/90 font-serif italic text-lg leading-relaxed mb-4">
                "{reading?.summary || 'The stars are silent.'}"
            </p>
            <div className="w-8 h-0.5 bg-primary/50 mx-auto mb-3"></div>
            <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
                {reading?.keywords?.[0] || 'DESTINY'} • {reading?.keywords?.[1] || 'FATE'}
            </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-auto">
            <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold">
                READING BY LUMEN AI
            </p>
            <div className="mt-2 flex justify-center gap-1 opacity-20">
                {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-white"></div>)}
            </div>
        </div>
    </div>
  );
});

export default ShareCard;
