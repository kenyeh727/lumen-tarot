
export enum AppStage {
  LOBBY = 'LOBBY',
  INQUIRY = 'INQUIRY',
  SHUFFLING = 'SHUFFLING',
  CUTTING = 'CUTTING',  // Cut phase
  DRAWING = 'DRAWING',  // Manual draw phase (formerly SELECTING)
  REVEALING = 'REVEALING',
  READING = 'READING',
  FEEDBACK = 'FEEDBACK',
  LIBRARY = 'LIBRARY'
}

export enum IntentCategory {
  LOVE = 'Love',
  CAREER = 'Career',
  HEALTH = 'Health',
  SPIRITUAL = 'Spiritual',
  GENERAL = 'General'
}

export enum SpreadType {
  ONE_CARD = 'ONE_CARD',         
  TWO_CARD = 'TWO_CARD',         
  THREE_CARD = 'THREE_CARD'      
}

export enum DeckType {
  TAROT = 'TAROT',
  LENORMAND = 'LENORMAND'
}

export enum Language {
  EN = 'EN',
  ZH_TW = 'ZH_TW'
}

export interface BilingualText {
  [Language.EN]: string;
  [Language.ZH_TW]: string;
}

export interface BilingualArray {
  [Language.EN]: string[];
  [Language.ZH_TW]: string[];
}

export interface TarotCard {
  id: number;
  name: string; // Internal/Display name handled via localization in component usually, but we keep this for ID
  name_i18n: BilingualText;
  image?: string; 
  desc: BilingualText;
  keywords: BilingualArray; 
  meaningUpright: BilingualText;
  meaningReversed: BilingualText; // For Lenormand, this can be "Negative Context"
}

export interface DeckConfig {
  id: DeckType;
  label: { [key in Language]: string };
  tagline: { [key in Language]: string };
  description: { [key in Language]: string };
  themeColor: string;
  bgGradient: string;
  cardBackImage: string;
  promptStyle: {
    prefix: string;
    suffix: string;
  };
}

export interface SelectedCardData {
  card: TarotCard;
  isReversed: boolean;
  position: 'Single' | 'Past' | 'Present' | 'Future' | 'Situation' | 'Challenge';
  generatedImageUrl?: string; 
}

export interface ReadingResult {
  summary: string;
  keywords: string[];
  analysis: string;
  advice: string;
  affirmation: string;
  luckyColor: string;
  luckyNumber: string;
  flavorText: string; 
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  question: string;
  intent: IntentCategory;
  deckType: DeckType;
  selectedCards: SelectedCardData[];
  reading: ReadingResult;
}

export interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}
