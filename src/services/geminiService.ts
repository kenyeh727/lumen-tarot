import { saveImage, getImage } from '../utils/imageStorage';

export const analyzeIntent = async (question: string) => {
    const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_intent', question })
    });
    return await res.json();
};

export const generateReading = async (question: string, cards: any[], intent: string, spread: string, deck: string, lang: string) => {
    console.log('[GeminiService] generateReading started:', { question, cardsCount: cards.length, intent, spread, deck, lang });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.error('[GeminiService] Request timed out after 60s');
        controller.abort();
    }, 60000); // 60s timeout for reading (it can be slow)

    try {
        const res = await fetch('/api/reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reading', question, cards, intent, spread, deck, lang }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[GeminiService] API Error ${res.status}:`, errText);
            throw new Error(`API Error ${res.status}: ${errText}`);
        }

        const data = await res.json();
        console.log('[GeminiService] generateReading success, data received');
        return data;
    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error("[GeminiService] Generate Reading Failed:", error);
        throw error; // Propagate to Spread.tsx catch block
    }
};

export const generateCardAnalysis = async (cardId: number, cardName: string, deckType: string, lang: string) => {
    const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_card', cardId, cardName, deckType, lang })
    });
    const data = await res.json();
    // Verify structure matching backend prompt: { meaning, keywords, element }
    if (data.meaning) return data.meaning;
    if (data.result) return data.result;
    return typeof data === 'string' ? data : JSON.stringify(data);
};

export const generateCardImage = async (cardId: number, cardName: string, deckType: string) => {
    const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_image', cardId, cardName, deckType })
    });
    const data = await res.json();
    if (data.imageUrl) {
        const key = `card_image_${deckType}_${cardId}`;
        await saveImage(key, data.imageUrl);
    }
    return data.imageUrl;
};

export const getStoredImage = async (deckType: string, cardId: number) => {
    const key = `card_image_${deckType}_${cardId}`;
    let img = await getImage(key);

    // Fallback and migration for legacy images
    if (!img) {
        const legacyImg = localStorage.getItem(key);
        if (legacyImg) {
            img = legacyImg;
            await saveImage(key, legacyImg); // Migrate to IndexedDB
            localStorage.removeItem(key); // Cleanup
        }
    }
    return img;
};
