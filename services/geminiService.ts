
/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { IntentCategory, SpreadType, SelectedCardData, Language, DeckType, ReadingResult } from "../types";
import { DECK_CONFIGS } from "../constants";

// --- ASSETS MAPPING DB (Simulating S3 + SQL Table) ---
// Schema: { [key: "DeckType_CardID"]: "Base64_Image_String" }
const ASSETS_MAP_KEY = 'quin_assets_mapping_v1';

// Simulated DB Operations
const AssetsRepository = {
  get: (deckType: DeckType, cardId: number): string | null => {
    try {
      const dbStr = localStorage.getItem(ASSETS_MAP_KEY);
      if (!dbStr) return null;
      const db = JSON.parse(dbStr);
      const key = `${deckType}_${cardId}`;
      return db[key] || null;
    } catch (e) {
      console.error("Asset Map Read Error", e);
      return null;
    }
  },

  save: (deckType: DeckType, cardId: number, imageUrl: string) => {
    try {
      const dbStr = localStorage.getItem(ASSETS_MAP_KEY);
      const db = dbStr ? JSON.parse(dbStr) : {};
      const key = `${deckType}_${cardId}`;

      // Upsert
      db[key] = imageUrl;

      // Save back (Simulating upload to S3 and updating DB record)
      try {
        localStorage.setItem(ASSETS_MAP_KEY, JSON.stringify(db));
        console.log(`[Assets Map] Saved image for ${key}`);
      } catch (e) {
        console.warn("Storage quota full. In a real app, this would upload to S3.");
      }
    } catch (e) {
      console.error("Asset Map Save Error", e);
    }
  }
};

// Export synchronous helper for UI components to check existence
export const getCardImagePath = (deckType: DeckType, cardId: number, cardName: string): string => {
  const sanitizeFilename = (name: string) => name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  return `/assets/cards/${deckType}_${sanitizeFilename(cardName)}.png`;
};

export const getStoredImage = (deckType: DeckType, cardId: number, cardName?: string): string | null => {
  const local = AssetsRepository.get(deckType, cardId);
  if (local) return local;

  // No direct way to check static files synchronously without fetch, 
  // but for libraries/readings we often know the cardName.
  // We return the expected static path and the <img> tag handles the fallback if it fails.
  if (cardName) {
    return getCardImagePath(deckType, cardId, cardName);
  }
  return null;
};

// --- API FUNCTIONS ---

// --- API KEY HELPER ---
const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY || '';
};

export const analyzeIntent = async (question: string): Promise<{ category: IntentCategory }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Classify the intent of this query into one of these categories: Love, Career, Health, Spiritual, General. Query: "${question}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING }
          },
          required: ["category"]
        }
      }
    });
    const text = response.text || "{}";
    const result = JSON.parse(text);
    return { category: Object.values(IntentCategory).includes(result.category as IntentCategory) ? result.category as IntentCategory : IntentCategory.GENERAL };
  } catch (error) {
    return { category: IntentCategory.GENERAL };
  }
};

/**
 * Core Logic: Assets Mapping
 * 1. Check if the specific Card ID has an existing image in our Asset Map.
 * 2. If YES: Return it immediately (Zero Cost, Fast Load).
 * 3. If NO: Generate via AI -> Save to Asset Map -> Return it.
 */
export const generateCardImage = async (cardId: number, cardName: string, deckType: DeckType): Promise<string | null> => {

  // 1. Check for Static Asset (Pre-generated)
  const staticPath = getCardImagePath(deckType, cardId, cardName);
  try {
    const check = await fetch(staticPath, { method: 'HEAD' });
    if (check.ok) {
      console.log(`[Asset Map] Found static asset: ${staticPath}`);
      return staticPath;
    }
  } catch (e) {
    // Ignore fetch error, proceed to fallback
  }

  // 2. Check Asset Map (DB / LocalStorage)
  const existingAsset = AssetsRepository.get(deckType, cardId);
  if (existingAsset) {
    console.log(`[Asset Map] Found existing image for ${deckType} #${cardId}. Skipping generation.`);
    return existingAsset;
  }

  console.log(`[Asset Map] No image found for ${deckType} #${cardId}. Generating new asset...`);

  // 3. Generate New Asset
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const config = DECK_CONFIGS[deckType];

  // Construct precise prompt for consistent style
  const prompt = `${config.promptStyle.prefix}${cardName}${config.promptStyle.suffix}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        // @ts-ignore
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: "2:3"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;

        // 4. Save to Asset Map (Simulate Cloud Upload)
        AssetsRepository.save(deckType, cardId, base64Image);

        return base64Image;
      }
    }
    return null;
  } catch (error) {
    console.error("Asset Generation Failed:", error);
    // On live site, return null so UI shows loader/placeholder but doesn't crash
    return null;
  }
};

export const generateReading = async (
  question: string,
  selectedCards: SelectedCardData[],
  category: IntentCategory,
  spreadType: SpreadType,
  deckType: DeckType,
  language: Language
): Promise<ReadingResult> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const cardDetails = selectedCards.map(c => `- [${c.position}]: ${c.card.name} (${deckType === DeckType.TAROT && c.isReversed ? 'Reversed' : 'Upright'})`).join('\n');

  const langReq = language === Language.ZH_TW
    ? "使用繁體中文（台灣）。你是一位「星空狐狸 (Celestial Star Fox)」，語氣要非常可愛、療癒、溫暖。當解釋負面牌義（如高塔、寶劍十）時，請將其轉化為「清理空間迎接美好」的轉機。句子要像對好朋友說話一樣親切。最後請給予一個魔法祝福。"
    : "Tone: Kawaii, Uplifting, Warm, and Supportive. You are a 'Celestial Star Fox'. Frame negative cards as healing opportunities or clearing space for better things. Keep sentences conversational and friendly. End with a magical blessing.";

  const deckContext = `Deck Used: ${DeckType[deckType]}.`;

  const prompt = `
    Role: You are a 'Celestial Star Fox' - a gentle, empathetic, and slightly magical guide.
    ${deckContext}
    User Question: "${question}"
    Category: ${category}
    Spread: ${spreadType}
    Drawn Cards:
    ${cardDetails}
    
    Instructions: ${langReq}
    Provide a detailed analysis in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            analysis: { type: Type.STRING },
            advice: { type: Type.STRING },
            affirmation: { type: Type.STRING },
            luckyColor: { type: Type.STRING },
            luckyNumber: { type: Type.STRING },
            flavorText: { type: Type.STRING }
          },
          required: ["summary", "keywords", "analysis", "advice", "affirmation", "luckyColor", "luckyNumber", "flavorText"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
      summary: "The stars are veiled.",
      keywords: ["Patience", "Inner Peace", "Waiting"],
      analysis: "The cosmos is currently recalibrating. Trust in the timing of your life.",
      advice: "Take a moment for quiet reflection.",
      affirmation: "I am open to the guidance of the universe.",
      luckyColor: "Soft Indigo",
      luckyNumber: "11",
      flavorText: "Silence is also an answer."
    };
  }
};
