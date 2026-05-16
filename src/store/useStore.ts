import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppStage, IntentCategory, SpreadType, TarotCard, SelectedCardData, Language, DeckType, ReadingResult, HistoryEntry } from '../types';
import { Language as Lang } from '../types';

interface AppState {
    language: Language;
    question: string;
    intent: IntentCategory;
    deckType: DeckType;
    targetCardCount: number;
    spreadType: SpreadType;
    selectedCards: SelectedCardData[];
    selectedCandidate: TarotCard | null;
    reading: ReadingResult | null;
    isProcessing: boolean;
    isGenerating: boolean;
    history: HistoryEntry[];
    showHistory: boolean;
    shuffledDeck: TarotCard[];

    // Actions
    setLanguage: (lang: Language) => void;
    setQuestion: (q: string) => void;
    setIntent: (intent: IntentCategory) => void;
    setDeckType: (type: DeckType) => void;
    setTargetCardCount: (count: number) => void;
    setSpreadType: (spread: SpreadType) => void;
    setSelectedCards: (cards: SelectedCardData[] | ((prev: SelectedCardData[]) => SelectedCardData[])) => void;
    setSelectedCandidate: (card: TarotCard | null) => void;
    setReading: (reading: ReadingResult | null) => void;
    setIsProcessing: (loading: boolean) => void;
    setIsGenerating: (loading: boolean) => void;
    setHistory: (history: HistoryEntry[] | ((prev: HistoryEntry[]) => HistoryEntry[])) => void;
    setShowHistory: (show: boolean) => void;
    setShuffledDeck: (deck: TarotCard[]) => void;
    resetReadingState: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            language: Lang.ZH_TW,
            question: '',
            intent: IntentCategory.GENERAL,
            deckType: DeckType.TAROT,
            targetCardCount: 1,
            spreadType: SpreadType.ONE_CARD,
            selectedCards: [],
            selectedCandidate: null,
            reading: null,
            isProcessing: false,
            isGenerating: false,
            history: [],
            showHistory: false,
            shuffledDeck: [],

            setLanguage: (language) => set({ language }),
            setQuestion: (question) => set({ question }),
            setIntent: (intent) => set({ intent }),
            setDeckType: (deckType) => set({ deckType }),
            setTargetCardCount: (targetCardCount) => set({ targetCardCount }),
            setSpreadType: (spreadType) => set({ spreadType }),
            setSelectedCards: (cards) => set((state) => ({
                selectedCards: typeof cards === 'function' ? cards(state.selectedCards) : cards
            })),
            setSelectedCandidate: (selectedCandidate) => set({ selectedCandidate }),
            setReading: (reading) => set({ reading }),
            setIsProcessing: (isProcessing) => set({ isProcessing }),
            setIsGenerating: (isGenerating) => set({ isGenerating }),
            setHistory: (history) => set((state) => ({
                history: typeof history === 'function' ? history(state.history) : history
            })),
            setShowHistory: (showHistory) => set({ showHistory }),
            setShuffledDeck: (shuffledDeck) => set({ shuffledDeck }),
            resetReadingState: () => set({
                question: '',
                selectedCards: [],
                reading: null,
                selectedCandidate: null,
                shuffledDeck: []
            }),
        }),
        {
            name: 'oracle-storage',
            partialize: (state) => ({ language: state.language, history: state.history }),
        }
    )
);
