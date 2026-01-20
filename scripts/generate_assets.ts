
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

// Helper to load .env.local
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim();
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.warn("Could not load .env.local", e);
    }
}

loadEnv();

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    console.error("Error: GEMINI_API_KEY is missing or invalid in .env.local. Please provide a valid API key.");
    process.exit(1);
}

// Mocking the types/constants imports to avoid complex TS setup for now, 
// or we rely on tsx handling it. We'll try to import directly.
// If direct import fails due to execution context, we will copy the data structure.
// Let's try importing first.
import { FULL_DECK, LENORMAND_DECK, DECK_CONFIGS } from '../constants';
import { DeckType } from '../types';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/assets/cards');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ai = new GoogleGenAI({ apiKey });

async function generateAndSave(card: any, deckType: DeckType) {
    const filename = `${deckType}_${card.id}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(filepath)) {
        console.log(`[SKIP] ${filename} already exists.`);
        return;
    }

    const config = DECK_CONFIGS[deckType];
    // Determine card name (use English for generation)
    const cardName = card.name;

    const prompt = `${config.promptStyle.prefix}${cardName}${config.promptStyle.suffix}`;

    console.log(`[GENERATE] ${filename} for "${cardName}"...`);

    try {
        // Note: The model name usually is 'imagen-3.0-generate-001' or similar for Google GenAI images, 
        // or 'gemini-2.5-flash' if it supports images. 
        // The previously seen code used 'gemini-2.5-flash-image'.
        // We will stick to that if it works, or fallback to a known working model.
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Using a current valid model or the one from valid code
            contents: { parts: [{ text: prompt }] },
            config: {
                // @ts-ignore
                responseMimeType: 'image/png' // Requesting image directly if supported, or base64 in JSON
            }
        });

        // The SDK usage in the previous file was checking `inlineData`. 
        // Let's adapt to how the user's service was doing it, but standardizing.
        // Specifying 'gemini-2.0-flash-exp' might not generate images directly. 
        // Usually image generation models are separate. e.g. 'imagen-3.0-generate-001'.
        // However, the user's `geminiService.ts` used `gemini-2.5-flash-image`.
        // We'll trust that model name exists for them, or try 'imagen-3.0-generate-001'.

        // Let's use the exact model from geminiService.ts
        const modelName = 'gemini-2.0-flash-exp'; // 2.5 is not public yet likely, 2.0-flash-exp is.
        // Actually, let's look at `geminiService.ts` again. It had `gemini-2.5-flash-image`.
        // I will use that.

        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Switching to 2.0 as 2.5 might be a placeholder or private
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: ["IMAGE"]
            }
        });

        // Wait... GoogleGenAI SDK usually returns base64 in parts for images?
        // Or we use the specific Imagen model.
        // If we look at `geminiService.ts`: 
        // contents: { parts: [{ text: prompt }] }
        // config: { imageConfig: { aspectRatio: "3:4" } }

        // I will replicate that call structure exactly to matching what worked for them (theoretically).
    } catch (e) {
        // Fallback implementation logic if SDK differs
    }
}

// Re-implementing the simpler generation function
async function generateImage(prompt: string, filename: string) {
    console.log(`Generating: ${filename}`);
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: { parts: [{ text: prompt + " Generate an image." }] },
            // This model handles text and maybe images? 
            // Actually, usually you use `imagen-3.0-generate-001` via REST or `models.generateImages` if available. 
            // The SDK might have distinct methods. 
            // Let's use a simpler text check first because I'm not sure if the user has access to image models.
        });

        // If the model returns text describing an image, that's not what we want.
        // We really need an image generation model.
        // `geminiService.ts` calls `gemini-2.5-flash-image`.
    } catch (e) {
        console.error(`Failed to generate ${filename}`, e);
    }
}

// We will use a simplified script that mimics the Service exactly.
async function generateExact(cardId: any, cardName: string, deckType: DeckType) {
    const config = DECK_CONFIGS[deckType];
    const prompt = `${config.promptStyle.prefix}${cardName}${config.promptStyle.suffix}`;

    // Sanitize filename
    const sanitizeFilename = (name: string) => name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const filename = `${deckType}_${sanitizeFilename(cardName)}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(filepath)) {
        console.log(`[SKIP] ${filename} already exists.`);
        return;
    }

    console.log(`[START] ${filename} (REGENerate if missing)`);

    let retryCount = 0;
    const maxRetries = 5;

    while (retryCount < maxRetries) {
        try {
            // Note: `imageConfig` implies an image model.
            // Valid models: `imagen-3.0-generate-001` usually. 
            // `gemini-2.5-flash-image` might be a custom fine-tuned or future model.
            // I'll try `imagen-3.0-generate-001` as a safe bet for Google GenAI if 2.5 fails.
            let model = 'imagen-3.0-generate-001';

            // The SDK usage:
            // If `google-genai` package is new (v1+), standard image gen might be:
            // await client.models.generateImages(...)
            // But `geminiService.ts` uses `generateContent`. 
            // This suggests a multimodal model that outputs image data in `inlineData`.

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: {
                    responseModalities: ["IMAGE"],
                    imageConfig: {
                        aspectRatio: "2:3"
                    }
                }
            });


            const candidates = response.candidates;
            if (candidates && candidates[0]?.content?.parts) {
                for (const part of candidates[0].content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        const buffer = Buffer.from(part.inlineData.data, 'base64');
                        fs.writeFileSync(filepath, buffer);
                        console.log(`[SAVED] ${filename}`);
                        return;
                    }
                }
            }
            console.warn(`[FAILED] No image data for ${filename}`);
            break; // No error but no data, don't retry endlessly

        } catch (error: any) {
            if (error.status === 429 || error.message.includes('429') || error.message.includes('Quota exceeded')) {
                console.log("[RATE LIMIT ERROR]", error.message);
                // Extract wait time
                let waitTime = 35000; // Default 35s
                const match = error.message.match(/retry in ([\d\.]+)s/);
                if (match) {
                    waitTime = Math.ceil(parseFloat(match[1]) * 1000) + 2000;
                }
                console.log(`[RATE LIMIT] ${filename}: Waiting ${waitTime / 1000}s... (Attempt ${retryCount + 1}/${maxRetries})`);
                await new Promise(r => setTimeout(r, waitTime));
                retryCount++;
            } else {
                console.error(`[ERROR] ${filename}:`, error.message);
                break; // Non-retriable error
            }
        }
    }
}

async function main() {
    console.log(`Docs: ${FULL_DECK.length} Tarot, ${LENORMAND_DECK.length} Lenormand`);

    // Iterate Tarot
    for (const card of FULL_DECK) {
        await generateExact(card.id, card.name, DeckType.TAROT);
        // Rate limiting - wait 2 seconds between generations
        await new Promise(r => setTimeout(r, 2000));
    }

    // Iterate Lenormand
    for (const card of LENORMAND_DECK) {
        await generateExact(card.id, card.name, DeckType.LENORMAND);
        // Rate limiting - wait 2 seconds between generations
        await new Promise(r => setTimeout(r, 2000));
    }
}

main().catch(console.error);
