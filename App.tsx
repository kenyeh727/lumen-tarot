
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Globe, RotateCcw, Check, History, X, Calendar, ArrowLeft, Hash, Book, Share2, LogOut } from 'lucide-react';
import StarField from './components/StarField';
import Typewriter from './components/Typewriter';
import DeckSelector from './components/DeckSelector';
import CursorParticles from './components/CursorParticles';
import CustomLoader from './components/CustomLoader';
import CardLibrary from './components/CardLibrary';
import TarotRitual from './components/TarotRitual';
import FanSpread from './components/FanSpread';
import CutDeck from './components/CutDeck';
import ShareCard from './components/ShareCard';
import LoginPage from './components/LoginPage';
import UsageLimitBanner from './components/UsageLimitBanner';
import UserMenu from './components/UserMenu';
import { AppStage, IntentCategory, SpreadType, TarotCard, SelectedCardData, Language, DeckType, ReadingResult, HistoryEntry } from './types';
import { FULL_DECK, LENORMAND_DECK, TRANSLATIONS, DECK_CONFIGS } from './constants';
import { analyzeIntent, generateReading, generateCardImage, getStoredImage } from './services/geminiService';
import { checkUsageLimit, incrementUsageCount } from './services/authService';
import { useAuth } from './contexts/AuthContext';
import { playSound } from './utils/sound';
import { shuffleArray } from './utils/common';
// @ts-ignore
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const { user, profile, loading, refreshProfile, logout } = useAuth();
  const [language, setLanguage] = useState<Language>(Language.ZH_TW);
  const [stage, setStage] = useState<AppStage>(AppStage.LOBBY);
  const [question, setQuestion] = useState('');
  const [intent, setIntent] = useState<IntentCategory>(IntentCategory.GENERAL);

  const [deckType, setDeckType] = useState<DeckType>(DeckType.TAROT);
  const [targetCardCount, setTargetCardCount] = useState<number>(1);
  const [spreadType, setSpreadType] = useState<SpreadType>(SpreadType.ONE_CARD);
  const [selectedCards, setSelectedCards] = useState<SelectedCardData[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<TarotCard | null>(null);

  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [cutEffect, setCutEffect] = useState<{ x: number, y: number } | null>(null);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);

  // Sharing State
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const selectionLock = useRef(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  // Responsive Dimensions
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    // console.log("App State:", { stage, user: user?.id, loading, profile: !!profile });
  }, [stage, user, loading, profile]);

  // Synchronized transition to READING stage
  useEffect(() => {
    if (stage === AppStage.REVEALING && reading && typewriterComplete) {
      console.log('✨ [FLOW] Both reading data and animation ready. Moving to READING.');
      const timer = setTimeout(() => {
        setStage(AppStage.READING);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stage, reading, typewriterComplete]);

  const t = TRANSLATIONS[language];

  const activeDeckData = useMemo(() => {
    switch (deckType) {
      case DeckType.LENORMAND: return LENORMAND_DECK;
      default: return FULL_DECK;
    }
  }, [deckType]);

  const activeConfig = DECK_CONFIGS[deckType];

  useEffect(() => {
    const saved = localStorage.getItem('oracle_history');
    if (saved) try { setHistory(JSON.parse(saved)); } catch (e) { }
  }, []);

  useEffect(() => {
    localStorage.setItem('oracle_history', JSON.stringify(history));
  }, [history]);

  // Shuffling moved to handleInquirySubmit to ensure fresh command execution


  const handleDeckSelect = (selectedMode: DeckType) => {
    setDeckType(selectedMode);
    setStage(AppStage.INQUIRY);
    setSelectedCards([]);
    setReading(null);
    setTypewriterComplete(false);
    if (selectedMode === DeckType.LENORMAND) setTargetCardCount(3);
    else setTargetCardCount(1);
  };

  const handleInquirySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isProcessing) return;

    // Check usage limit before proceeding
    if (!user) {
      alert(language === Language.ZH_TW ? '請先登入' : 'Please sign in first');
      return;
    }

    const { canUse, remaining } = await checkUsageLimit(user.id);
    if (!canUse) {
      alert(language === Language.ZH_TW ? '您的占卜額度已用完' : 'Your reading quota has been exhausted');
      return;
    }

    setIsProcessing(true);
    playSound('select');
    setSelectedCards([]);
    setReading(null);
    setTypewriterComplete(false);

    // Explicitly shuffle using Fisher-Yates (Knuth) algorithm 
    // This ensures true randomness on every single draw
    const newDeck = shuffleArray([...activeDeckData]);
    setShuffledDeck(newDeck);

    // Move to Shuffling Phase FIRST
    setStage(AppStage.SHUFFLING);

    let newSpread = SpreadType.ONE_CARD;
    if (targetCardCount === 2) newSpread = SpreadType.TWO_CARD;
    if (targetCardCount >= 3) newSpread = SpreadType.THREE_CARD;
    setSpreadType(newSpread);

    try {
      const result = await analyzeIntent(question);
      setIntent(result.category);
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    console.log('🔗 [SHARE] Share button clicked');
    if (!shareCardRef.current || isSharing) {
      console.warn('🔗 [SHARE] Blocked: shareCardRef.current=', !!shareCardRef.current, 'isSharing=', isSharing);
      return;
    }
    setIsSharing(true);
    playSound('select');

    try {
      console.log('🔗 [SHARE] Starting html2canvas capture...');
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true
      });
      console.log('🔗 [SHARE] Canvas created successfully');

      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) {
          console.error('🔗 [SHARE] Failed to create blob');
          alert(language === Language.ZH_TW ? '分享失敗，請重試' : 'Share failed, please try again');
          setIsSharing(false);
          return;
        }

        console.log('🔗 [SHARE] Blob created, size:', blob.size);
        const file = new File([blob], `lumen-tarot-${Date.now()}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            console.log('🔗 [SHARE] Using native share API...');
            await navigator.share({
              files: [file],
              title: 'Lumen Tarot Reading',
              text: `My reading for today: "${reading?.summary}" #LumenTarot`
            });
            console.log('🔗 [SHARE] Share completed successfully');
            alert(language === Language.ZH_TW ? '✨ 分享成功！' : '✨ Shared successfully!');
          } catch (err: any) {
            if (err.name !== 'AbortError') {
              console.error('🔗 [SHARE] Native share failed:', err);
              // Fallback to download
              const link = document.createElement('a');
              link.download = `lumen-tarot-${Date.now()}.png`;
              link.href = canvas.toDataURL();
              link.click();
              alert(language === Language.ZH_TW ? '📥 圖片已下載' : '📥 Image downloaded');
            } else {
              console.log('🔗 [SHARE] User cancelled share');
            }
          }
        } else {
          // Desktop fallback: try clipboard first, then download
          console.log('🔗 [SHARE] Native share not available, using fallback...');
          try {
            if (navigator.clipboard && window.ClipboardItem) {
              const clipboardItem = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([clipboardItem]);
              console.log('🔗 [SHARE] Image copied to clipboard');
              alert(language === Language.ZH_TW ? '📋 圖片已複製到剪貼簿！' : '📋 Image copied to clipboard!');
            } else {
              throw new Error('Clipboard API not available');
            }
          } catch (clipErr) {
            console.log('🔗 [SHARE] Clipboard failed, downloading instead:', clipErr);
            const link = document.createElement('a');
            link.download = `lumen-tarot-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            alert(language === Language.ZH_TW ? '📥 圖片已下載到您的裝置' : '📥 Image downloaded to your device');
          }
        }
        setIsSharing(false);
      }, 'image/png');
    } catch (e) {
      console.error("Share generation failed", e);
      setIsSharing(false);
    }
  };

  const finalizeCardSelect = async (card: TarotCard) => {
    if (selectionLock.current) return; // Prevent race conditions
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

    const cachedImage = getStoredImage(deckType, card.id, card.name);

    const newSelection: SelectedCardData = {
      card,
      isReversed: deckType === DeckType.TAROT && Math.random() > 0.3,
      position,
      generatedImageUrl: cachedImage || undefined
    };

    const updatedSelections = [...selectedCards, newSelection];
    setSelectedCards(updatedSelections);
    setSelectedCandidate(null);

    // Release lock after small delay
    setTimeout(() => { selectionLock.current = false; }, 500);


    if (updatedSelections.length === targetCardCount) {
      // Transition to REVEALING immediately to show the loading typewriter
      setStage(AppStage.REVEALING);
      setTypewriterComplete(false);

      try {
        console.log('🎴 [CARDS] All cards selected, generating reading...');
        const result = await generateReading(question, updatedSelections, intent, spreadType, deckType, language);
        console.log('📊 [READING] Generated reading data arrived');

        setReading(result);

        // Increment usage count after successful reading generation
        if (user) {
          try {
            await incrementUsageCount(user.id);
            // Refresh profile to update UI
            await refreshProfile();
          } catch (error) {
            console.error('Failed to increment usage count:', error);
          }
        }

        updatedSelections.forEach(async (sel, idx) => {
          if (sel.generatedImageUrl) return;

          const cardDisplayName = sel.isReversed ? `${sel.card.name} (Reversed)` : sel.card.name;
          const imageUrl = await generateCardImage(sel.card.id, cardDisplayName, deckType);

          if (imageUrl) {
            setSelectedCards(prev => {
              const newList = [...prev];
              if (newList[idx]) newList[idx] = { ...newList[idx], generatedImageUrl: imageUrl };
              return newList;
            });
          }
        });

        const entryId = Date.now().toString();
        const newEntry: HistoryEntry = {
          id: entryId,
          timestamp: Date.now(),
          question,
          intent,
          deckType,
          selectedCards: updatedSelections,
          reading: result
        };
        setHistory(prev => [newEntry, ...prev].slice(0, 50));

      } catch (error) {
        console.error("Critical Oracle Error:", error);
        setStage(AppStage.READING);
      }
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

  // --- RENDER STAGES ---

  const renderReadingStage = () => {
    if (!reading) {
      console.warn('📄 [RENDER] renderReadingStage called but reading is null');
      return null;
    }
    console.log('📄 [RENDER] Rendering full reading stage with data:', {
      summary: reading.summary?.substring(0, 50) + '...',
      analysisLength: reading.analysis?.length || 0,
      hasAllFields: !!(reading.summary && reading.analysis && reading.advice && reading.affirmation)
    });
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
                      {data.generatedImageUrl ? (
                        <img
                          src={data.generatedImageUrl}
                          loading="lazy"
                          className={`w-full h-full object-cover ${data.isReversed ? 'rotate-180' : ''}`}
                          alt={data.card.name}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <CustomLoader />
                        </div>
                      )}
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
          </div>

          <div className="flex-none pt-4 pb-2 flex justify-center">
            <button onClick={() => { setStage(AppStage.LOBBY); setQuestion(''); setSelectedCards([]); }} className="flex items-center gap-3 px-10 py-4 btn-primary rounded-full tracking-[0.2em] uppercase shadow-lg w-full md:w-auto justify-center font-bold">
              <RotateCcw size={16} /> {t.askAgain}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSelectionStage = () => {
    return (
      <div className="flex flex-col w-full h-full pt-16 md:pt-20 pb-safe overflow-hidden relative z-20">
        <div className="flex-none w-full text-center px-4 mb-2 md:mb-4 z-40">
          <h2 className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 font-bold tracking-[0.2em] uppercase">{t.drawTitle}</h2>
          <p className="text-white/50 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold">{t.drawSubtitle}</p>
        </div>

        {/* --- FAN SPREAD SELECTOR (FULL HEIGHT) --- */}
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
                <button onClick={() => finalizeCardSelect(selectedCandidate)} className="flex-1 py-4 btn-primary rounded-full text-[10px] tracking-widest uppercase shadow-xl active:scale-95 font-bold">
                  {language === Language.ZH_TW ? '確認' : 'CONFIRM'}
                </button>
                <button onClick={() => setSelectedCandidate(null)} className="flex-1 py-4 bg-white/5 text-gray-300 border border-white/10 rounded-full text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all active:scale-95 font-bold">
                  {language === Language.ZH_TW ? '返回' : 'BACK'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1c1d22] text-white p-6 text-center">
        <div className="max-w-md glass-panel p-8 rounded-[32px] border border-red-500/30">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ 配置缺失 / Config Missing</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            找不到 Supabase 環境變數。請確保您已建立 <b>.env</b> 檔案或是已在部署平台設置環境變數。
          </p>
          <div className="bg-black/40 p-4 rounded-xl text-left text-xs font-mono text-gray-400 mb-6">
            VITE_SUPABASE_URL=...<br />
            VITE_SUPABASE_ANON_KEY=...
          </div>
          <p className="text-sm text-gray-500">
            請參考 .env.example 並重新啟動開發伺服器。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex flex-col bg-quin-gradient-dark text-white selection:bg-primary selection:text-white">
      {/* Backgrounds */}
      <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      <div className="fixed -top-[20%] -left-[20%] w-[70%] h-[70%] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed -bottom-[20%] -right-[20%] w-[70%] h-[70%] bg-indigo-900/30 rounded-full blur-[120px] pointer-events-none"></div>
      <StarField />
      <CursorParticles />

      {cutEffect && (
        <div className="fixed pointer-events-none z-[9999]" style={{ left: cutEffect.x, top: cutEffect.y }}>
          <div className="absolute animate-[ping_1s_ease-out] w-32 h-32 bg-primary/30 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-accent rounded-full animate-bounce"
              style={{
                transform: `rotate(${i * 36}deg) translate(50px)`,
                animationDuration: '0.8s'
              }}></div>
          ))}
        </div>
      )}

      {/* Navigation Header */}
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-50 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-2">
          {(stage !== AppStage.LOBBY && stage !== AppStage.LIBRARY) && (
            <button onClick={() => setStage(AppStage.LOBBY)} className="flex items-center gap-2 text-gray-300 hover:text-white transition-all mr-2 bg-white/5 hover:bg-white/10 px-3 py-2 md:px-4 rounded-full backdrop-blur-md shadow-sm min-h-[44px] border border-white/10">
              <ArrowLeft size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {stage === AppStage.LOBBY && (
            <button onClick={() => setStage(AppStage.LIBRARY)} className="flex items-center gap-2 text-gray-300 hover:text-white transition-all uppercase text-[10px] tracking-widest group bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md font-bold shadow-sm min-h-[44px] border border-white/10">
              <Book size={14} />
              <span className="hidden md:inline">{t.library}</span>
            </button>
          )}

          <button className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm cursor-pointer min-h-[44px] border border-white/10" onClick={() => setLanguage(l => l === Language.ZH_TW ? Language.EN : Language.ZH_TW)}>
            <Globe size={14} className="text-primary" />
            <span className="text-[10px] tracking-widest text-gray-300 font-bold uppercase">
              {language === Language.ZH_TW ? 'EN/中' : '中/EN'}
            </span>
          </button>
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 text-gray-300 hover:text-white transition-all uppercase text-[10px] tracking-widest group bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md font-bold shadow-sm min-h-[44px] border border-white/10">
            <History size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline">{language === Language.ZH_TW ? '紀錄' : 'HISTORY'}</span>
          </button>

          {user && (
            <div className="flex items-center gap-2">
              <UserMenu language={language} />
              <button
                onClick={() => { if (window.confirm(language === Language.ZH_TW ? '確定要登出嗎？' : 'Are you sure you want to sign out?')) logout(); }}
                className="flex items-center justify-center text-gray-400 hover:text-red-400 transition-all bg-white/5 hover:bg-red-500/10 w-[44px] h-[44px] rounded-full backdrop-blur-md border border-white/10"
                title={language === Language.ZH_TW ? '登出' : 'Sign Out'}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Overlay ... (Kept as is) */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex animate-in duration-500">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowHistory(false)}></div>

          <div className={`
             absolute bg-[#1c1d22]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 border-l border-white/10
             bottom-0 inset-x-0 h-[85vh] rounded-t-[2rem] md:top-0 md:right-0 md:bottom-0 md:h-full md:w-[400px] md:rounded-none
             animate-in slide-in-from-bottom md:slide-in-from-right
          `}>
            <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-3"><History className="text-primary" size={20} /><h2 className="text-lg font-bold text-white tracking-widest uppercase">{language === Language.ZH_TW ? '星辰歷史' : 'COSMIC HISTORY'}</h2></div>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white p-2"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
              {history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Sparkles size={32} className="mb-2 opacity-50" />
                  <p className="text-xs tracking-widest uppercase font-bold">No Records Yet</p>
                </div>
              )}
              {history.map((item) => (
                <div key={item.id} onClick={() => { setDeckType(item.deckType); setStage(AppStage.READING); setSelectedCards(item.selectedCards); setReading(item.reading); setQuestion(item.question); setShowHistory(false); }} className="group bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest"><Calendar size={10} />{new Date(item.timestamp).toLocaleDateString()}</div>
                    <span className="text-[8px] px-2 py-0.5 bg-primary/20 text-primary-300 rounded-full font-bold">{item.deckType}</span>
                  </div>
                  <p className="text-gray-300 text-sm italic mb-3 line-clamp-1 font-medium">"{item.question}"</p>
                  <div className="flex gap-2">
                    {item.selectedCards.map((sel, idx) => (
                      <div key={idx} className="w-8 h-12 bg-gray-800 border border-white/20 rounded overflow-hidden">
                        <img src={sel.generatedImageUrl} className="w-full h-full object-cover opacity-80" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative z-20 w-full h-full flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
            <CustomLoader />
            <p className="text-[#a78bfa] text-xs tracking-[0.4em] uppercase font-bold animate-pulse">
              {language === Language.ZH_TW ? '正在連結星辰...' : 'CONNECTING TO STARS...'}
            </p>
          </div>
        ) : user ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {(() => {
              switch (stage) {
                case AppStage.LIBRARY:
                  return <CardLibrary language={language} onBack={() => setStage(AppStage.LOBBY)} />;
                case AppStage.LOBBY:
                  return <DeckSelector language={language} onSelect={handleDeckSelect} />;
                case AppStage.INQUIRY:
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
                            <button type="submit" disabled={!question.trim() || (profile && !profile.is_unlimited && profile.usage_count >= 10)} className="w-full py-5 btn-primary rounded-full text-sm tracking-[0.2em] uppercase font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1">{t.start}</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                case AppStage.SHUFFLING:
                  return (
                    <TarotRitual
                      stage={stage}
                      deckType={deckType}
                      language={language}
                      onComplete={() => setStage(AppStage.CUTTING)}
                    />
                  );
                case AppStage.CUTTING:
                  return (
                    <CutDeck
                      config={activeConfig}
                      language={language}
                      onComplete={() => setStage(AppStage.DRAWING)}
                    />
                  );
                case AppStage.DRAWING:
                  return (
                    <div className="flex flex-col w-full h-full pt-16 md:pt-20 pb-safe overflow-hidden relative z-20">
                      <div className="flex-none w-full text-center px-4 mb-2 md:mb-4 z-40">
                        <h2 className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 font-bold tracking-[0.2em] uppercase">{t.drawTitle}</h2>
                        <p className="text-white/50 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold">{t.drawSubtitle}</p>
                      </div>

                      <div className="flex-grow relative w-full flex items-center justify-center">
                        <FanSpread
                          key={`fan-${shuffledDeck[0]?.id}`}
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
                              <button onClick={() => finalizeCardSelect(selectedCandidate)} className="flex-1 py-4 btn-primary rounded-full text-[10px] tracking-widest uppercase shadow-xl active:scale-95 font-bold">
                                {language === Language.ZH_TW ? '確認' : 'CONFIRM'}
                              </button>
                              <button onClick={() => setSelectedCandidate(null)} className="flex-1 py-4 bg-white/5 text-gray-300 border border-white/10 rounded-full text-[10px] tracking-widest uppercase hover:bg-white/10 transition-all active:scale-95 font-bold">
                                {language === Language.ZH_TW ? '返回' : 'BACK'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                case AppStage.REVEALING:
                  return (
                    <div className="w-full h-full overflow-y-auto no-scrollbar">
                      <div className="min-h-full flex flex-col items-center justify-center px-6 text-center pt-24 pb-12">
                        <div className="min-h-[120px] max-w-2xl glass-panel p-10 flex items-center justify-center mb-8 rounded-[40px] border border-white/10 shadow-glass">
                          <Typewriter
                            text={reading?.flavorText || t.loadingFlavor}
                            className="text-xl md:text-2xl text-gray-200 font-medium leading-loose"
                            onComplete={() => {
                              console.log('⏱️ [TYPEWRITER] Animation complete');
                              setTypewriterComplete(true);
                            }}
                          />
                        </div>
                        <CustomLoader />
                        {!reading && (
                          <p className="text-gray-500 text-[10px] mt-4 uppercase tracking-[0.3em] animate-pulse font-bold">
                            {language === Language.ZH_TW ? '正在連結占星連結...' : 'Channeling astronomical links...'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                case AppStage.READING:
                  return renderReadingStage();
                default:
                  return <DeckSelector language={language} onSelect={handleDeckSelect} />;
              }
            })()}
          </div>
        ) : (
          <LoginPage language={language} />
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="fixed bottom-2 right-4 text-[8px] text-white/20 pointer-events-none z-[9999]">
        v1.2-SHUFFLE-FIX
      </div>
    </div>
  );
};

export default App;
