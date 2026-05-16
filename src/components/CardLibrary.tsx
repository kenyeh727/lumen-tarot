import React, { useState, useEffect, useRef } from 'react';
import { TarotCard, DeckType, Language } from '../types';
import { FULL_DECK, LENORMAND_DECK, TRANSLATIONS, DECK_CONFIGS } from '../constants';
import { generateCardImage, generateCardAnalysis } from '../services/geminiService';
import { getDefaultCardImage } from '../utils/cardAssets';
import { Search, X, ChevronRight, BookOpen, ArrowLeft, Loader2, Image as ImageIcon, Sparkles, Shuffle, MessageSquareQuote } from 'lucide-react';
import { playSound } from '../utils/sound';

interface CardLibraryProps {
  language: Language;
  onBack: () => void;
}

const CardLibrary: React.FC<CardLibraryProps> = ({ language, onBack }) => {
  const [activeDeck, setActiveDeck] = useState<DeckType>(DeckType.TAROT);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageMap, setImageMap] = useState<Record<number, string | null>>({});
  const [analysisMap, setAnalysisMap] = useState<Record<number, string | null>>({});

  // New state for shuffling
  const [displayedCards, setDisplayedCards] = useState<TarotCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const t = TRANSLATIONS[language];
  const activeDeckData = activeDeck === DeckType.TAROT ? FULL_DECK : LENORMAND_DECK;
  const config = DECK_CONFIGS[activeDeck];

  // Update displayed cards when deck or search changes (resets order)
  useEffect(() => {
    const filtered = activeDeckData.filter(card => {
      const nameEn = card.name_i18n[Language.EN].toLowerCase();
      const nameTw = card.name_i18n[Language.ZH_TW].toLowerCase();
      const search = searchTerm.toLowerCase();
      return nameEn.includes(search) || nameTw.includes(search);
    });
    setDisplayedCards(filtered);
  }, [activeDeckData, searchTerm]);

  // Load static images directly - no IndexedDB lookup
  useEffect(() => {
    if (selectedCard && !imageMap[selectedCard.id]) {
      const deckType = selectedCard.id >= 200 ? DeckType.LENORMAND : DeckType.TAROT;
      setImageMap(prev => ({ ...prev, [selectedCard.id]: getDefaultCardImage(selectedCard, deckType) }));
    }
  }, [selectedCard]);

  const handleCardClick = (card: TarotCard) => {
    playSound('select');
    setSelectedCard(card);
  };

  const handleShuffle = () => {
    if (isShuffling) return;
    playSound('flip');
    setIsShuffling(true);

    setTimeout(() => {
      setDisplayedCards(prev => {
        const shuffled = [...prev];
        // Fisher-Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      });
      setIsShuffling(false);
    }, 500);
  };

  const handleGenerateArt = async () => {
    if (!selectedCard || isGenerating) return;
    setIsGenerating(true);
    try {
      const name = selectedCard.name;
      const img = await generateCardImage(selectedCard.id, name, activeDeck);
      // We don't need to manually update imageMap anymore if CardItem fetches its own
      // But for immediate feedback, we can trigger a refresh or let the User know
      setImageMap(prev => ({ ...prev, [selectedCard.id]: img }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedCard || isAnalyzing) return;
    if (analysisMap[selectedCard.id]) return; // Already analyzed

    setIsAnalyzing(true);
    try {
      const analysis = await generateCardAnalysis(selectedCard.id, selectedCard.name, activeDeck, language);
      setAnalysisMap(prev => ({ ...prev, [selectedCard.id]: analysis }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDisplayImage = (cardId: number, deckType: DeckType) => {
    return imageMap[cardId] || null;
    // Note: We don't strictly fallback here because imageMap might just be loading. 
    // But effectively in the modal we wait for useEffect.
    // Actually, for immediate render we can fallback:
    // return imageMap[cardId] || getDefaultCardImage(activeDeckData.find(c => c.id === cardId)!, deckType);
    // But simpler to rely on the useEffect for the Modal.
  }

  return (
    <div className="w-full h-full flex flex-col pt-20 pb-safe px-4 md:px-8 max-w-7xl mx-auto z-20 relative">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="text-center md:text-left flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 group backdrop-blur-md"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold font-lora text-white tracking-tight">
              {t.library}
            </h1>
            <p className="text-white/60 text-xs tracking-[0.2em] uppercase font-bold mt-2">
              {t.librarySubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Deck Switcher */}
          <div className="flex bg-white/5 backdrop-blur-xl rounded-full p-1.5 border border-white/10 shadow-glass">
            <button
              onClick={() => setActiveDeck(DeckType.TAROT)}
              className={`px - 8 py - 3 rounded - full text - xs font - bold tracking - widest transition - all duration - 300 ${activeDeck === DeckType.TAROT ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'} `}
            >
              {t.tarot}
            </button>
            <button
              onClick={() => setActiveDeck(DeckType.LENORMAND)}
              className={`px - 8 py - 3 rounded - full text - xs font - bold tracking - widest transition - all duration - 300 ${activeDeck === DeckType.LENORMAND ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'} `}
            >
              {t.lenormand}
            </button>
          </div>

          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            onMouseEnter={() => playSound('hover')}
            className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-primary/50 transition-all shadow-glass group relative overflow-hidden active:scale-95"
            title="Shuffle Cards"
          >
            <div className={`absolute inset - 0 bg - primary / 20 transition - transform duration - 500 origin - bottom ${isShuffling ? 'scale-y-100' : 'scale-y-0'} `}></div>
            <Shuffle size={20} className={`relative z - 10 transition - transform duration - 700 ${isShuffling ? 'rotate-180' : 'group-hover:rotate-12'} `} />
          </button>
        </div>
      </div>

      {/* Search & Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="relative mb-8 max-w-lg mx-auto w-full">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all backdrop-blur-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 pb-20 transition-all duration-500 ease-out ${isShuffling ? 'opacity-0 scale-95 blur-sm translate-y-4' : 'opacity-100 scale-100 blur-0 translate-y-0'}`}>
            {displayedCards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                language={language}
                imageUrl={imageMap[card.id]}
                backImage={config.cardBackImage}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedCard(null)}
          ></div>
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#1c1d22] rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">

            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/50 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-sm border border-white/5"
            >
              <X size={24} />
            </button>

            {/* Left: Card Visual */}
            <div className="w-full md:w-5/12 bg-gradient-to-br from-gray-900 to-black p-8 md:p-12 flex items-center justify-center relative overflow-hidden">
              <div className={`absolute inset - 0 bg - gradient - to - br ${config.bgGradient} opacity - 30`}></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>

              <div className="relative w-full aspect-[3/4.5] rounded-2xl shadow-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center overflow-hidden group">
                {/* Image Display */}
                <img
                  src={imageMap[selectedCard.id] || getDefaultCardImage(selectedCard, activeDeck)}
                  loading="lazy"
                  alt={selectedCard.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* 
                   Wait, my logic above with onError is tricky in React. 
                   Better rely on imageMap being populated by useEffect.
                   The useEffect now sets imageMap to default if stored is missing.
                   So imageMap[selectedCard.id] SHOULD be populated quickly.
                */}

                {/* Generate Button Overlay (only if not generated or to re-gen) */}
                {!imageMap[selectedCard.id] && (
                  <div className="absolute bottom-8 z-20 w-full px-8">
                    <button
                      onClick={handleGenerateArt}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold tracking-widest shadow-lg backdrop-blur-md transition-all disabled:opacity-50 transform hover:-translate-y-1"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                      {t.generateArt}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Content */}
            <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto custom-scrollbar bg-[#151520]">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                  {activeDeck === DeckType.TAROT ? t.arcana : t.oracle}
                </span>
              </div>
              <div className="flex flex-col gap-2 mb-8 border-b border-white/10 pb-8">
                <h2 className="text-4xl md:text-5xl font-lora font-bold text-white leading-tight">
                  {selectedCard.name_i18n[language]}
                </h2>
                <h3 className="text-xl text-white/40 font-serif italic">
                  {selectedCard.name_i18n[language === Language.EN ? Language.ZH_TW : Language.EN]}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedCard.keywords[language].map((kw, i) => (
                  <span key={i} className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-medium">
                    # {kw}
                  </span>
                ))}
              </div>

              <div className="space-y-8">
                {/* AI Analysis Section */}
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 hover:border-primary/40 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-primary font-bold flex items-center gap-2 text-lg tracking-wide">
                      <MessageSquareQuote size={18} />
                      {language === Language.ZH_TW ? "深度解析" : "Deep Analysis"}
                    </h3>
                    {!analysisMap[selectedCard.id] && (
                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        {language === Language.ZH_TW ? "狐狸解讀" : "ASK THE FOX"}
                      </button>
                    )}
                  </div>

                  {analysisMap[selectedCard.id] ? (
                    <p className="text-gray-300 leading-loose font-medium text-sm whitespace-pre-wrap animate-in fade-in">
                      {analysisMap[selectedCard.id]}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      {language === Language.ZH_TW
                        ? "邀請星空狐狸為您解讀這張牌的深層含義..."
                        : "Invite the Star Fox to reveal the deeper meaning of this card..."}
                    </p>
                  )}
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg tracking-wide">
                    <ChevronRight size={18} className="text-primary" />
                    {t.upright}
                  </h3>
                  <p className="text-gray-300 leading-relaxed font-light text-base font-lora">
                    {selectedCard.meaningUpright[language]}
                  </p>
                </div>

                {activeDeck === DeckType.TAROT && (
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-colors">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg tracking-wide">
                      <ChevronRight size={18} className="text-rose-500" />
                      {t.reversed}
                    </h3>
                    <p className="text-gray-300 leading-relaxed font-light text-base font-lora">
                      {selectedCard.meaningReversed[language]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CardItemProps {
  card: TarotCard;
  language: Language;
  imageUrl: string | null;
  backImage: string;
  onClick: (card: TarotCard) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, language, imageUrl, backImage, onClick }) => {
  // Use static image directly - no async loading
  const deckType = card.id >= 200 ? DeckType.LENORMAND : DeckType.TAROT;
  const localImageUrl = getDefaultCardImage(card, deckType);

  return (
    <div
      onClick={() => onClick(card)}
      className="group relative aspect-[3/4.5] cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 hover:shadow-glass-hover hover:-translate-y-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>

      <div
        className="absolute inset-0 bg-center bg-cover transition-all duration-700 group-hover:scale-110"
        style={{
          backgroundImage: `url(${localImageUrl})`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

      {/* Removed icon indicator since all images are now static */}

      <div className="absolute bottom-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
        <p className="text-white font-lora font-bold text-lg leading-tight group-hover:text-primary transition-colors">
          {card.name_i18n[language]}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
          {card.name}
        </p>
      </div>
    </div>
  );
};

export default CardLibrary;
