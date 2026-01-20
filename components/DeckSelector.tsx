
import React from 'react';
import { DeckType, Language } from '../types';
import { DECK_CONFIGS, TRANSLATIONS } from '../constants';
import { playSound } from '../utils/sound';
import { Sparkles, Clover, ArrowRight } from 'lucide-react';

interface DeckSelectorProps {
  language: Language;
  onSelect: (mode: DeckType) => void;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ language, onSelect }) => {
  const modes = Object.values(DECK_CONFIGS);
  const t = TRANSLATIONS[language];

  const handleSelect = (modeId: DeckType) => {
    playSound('select');
    onSelect(modeId);
  };

  return (
    // Change: overflow-hidden -> overflow-y-auto to allow scrolling on small screens
    // Wrapped content in a min-h-full flex container to handle vertical centering/scrolling
    <div className="relative w-full h-full overflow-y-auto custom-scrollbar z-20">
      <div className="min-h-full w-full flex flex-col items-center justify-center py-20 md:py-safe">
        
        {/* 1. Header Section */}
        <div className="flex-none w-full px-4 text-center z-30 animate-in fade-in slide-in-from-top-8 duration-1000 mb-8 md:mb-12">
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 tracking-tight drop-shadow-2xl mb-4 font-lora">
            {t.selectDeck}
          </h1>
          <p className="text-white/70 text-xs md:text-base font-medium tracking-[0.3em] uppercase drop-shadow-md">
            {language === Language.ZH_TW ? '開啟你的命運之門' : 'OPEN THE GATE OF DESTINY'}
          </p>
        </div>

        {/* 2. Selection Area */}
        <div className="flex-grow-0 w-full flex items-center justify-center p-4">
          <div className="flex flex-col md:flex-row gap-6 md:gap-16 max-w-6xl w-full items-center md:items-stretch justify-center">
            {modes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => handleSelect(mode.id)}
                onMouseEnter={() => playSound('hover')}
                className="group relative w-full max-w-sm md:w-[360px] cursor-pointer perspective-[1000px]"
              >
                {/* Card Container with Quin-style Glassmorphism */}
                <div 
                  className={`
                    relative h-full w-full
                    rounded-[32px] md:rounded-[40px] overflow-hidden
                    bg-gradient-to-b from-white/10 to-white/5
                    backdrop-blur-xl border border-white/20
                    shadow-quin transition-all duration-500 ease-out
                    group-hover:scale-105 group-hover:-translate-y-4 group-hover:shadow-glass-hover
                    flex flex-col
                  `}
                >
                   {/* Visual Header Area with Gradient Overlay */}
                   <div className={`relative h-56 md:h-64 w-full overflow-hidden bg-gradient-to-br ${mode.bgGradient} p-6 md:p-8 flex flex-col justify-between`}>
                      
                      {/* Texture Pattern */}
                      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: `url(${mode.cardBackImage})`, backgroundSize: '150px' }}></div>
                      
                      {/* Animated Glow */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-[60px] transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:scale-110 transition-transform duration-700 ease-in-out"></div>
                      
                      <div className="relative z-10 flex justify-between items-start">
                          <div className="p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 shadow-lg group-hover:bg-white/20 transition-colors">
                              {mode.id === DeckType.TAROT ? <Sparkles size={24} className="md:w-7 md:h-7" /> : <Clover size={24} className="md:w-7 md:h-7" />}
                          </div>
                      </div>

                      <h2 className="relative z-10 text-3xl md:text-4xl font-serif font-bold text-white leading-none mt-auto drop-shadow-md font-lora">
                         {mode.label[language]}
                      </h2>
                   </div>
                  
                  {/* Content Body */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow bg-[#151520]/60">
                    <div className="mb-6 md:mb-8 flex-grow">
                      <p className="text-lg md:text-xl text-white/90 font-serif italic mb-4 leading-relaxed font-lora">
                        "{mode.tagline[language]}"
                      </p>
                      <div className="w-12 h-1 bg-white/20 rounded-full mb-4"></div>
                      <p className="text-[10px] md:text-xs text-white/60 font-bold uppercase tracking-widest leading-relaxed">
                        {mode.description[language]}
                      </p>
                    </div>

                    <div className="mt-auto">
                       <button className="w-full py-4 md:py-5 rounded-2xl flex items-center justify-center gap-3 text-xs md:text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 bg-white/10 text-white border border-white/10 group-hover:bg-primary group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(103,81,246,0.4)] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          <span className="relative z-10">{language === Language.ZH_TW ? '開始占卜' : 'START READING'}</span>
                          <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform relative z-10 md:w-[18px] md:h-[18px]" />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extra spacing for mobile scroll */}
        <div className="h-10 w-full md:hidden flex-none"></div>
      </div>
    </div>
  );
};

export default DeckSelector;
