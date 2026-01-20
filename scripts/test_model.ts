
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// Load Env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim();
    });
}
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API KEY");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function testModel(modelName: string) {
    console.log(`Testing model: ${modelName}`);
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts: [{ text: "Hello" }] },
        });
        console.log(`[SUCCESS] ${modelName} responded (TEXT).`);
        return true;
    } catch (e: any) {
        console.error(`[FAIL] ${modelName}:`, e.message);
        return false;
    }
}

async function main() {
    try {
        // @ts-ignore
        const response = await ai.models.list();
        console.log("Available Models:");
        // @ts-ignore
        for (const m of response.models) {
            // @ts-ignore
            console.log(`- ${m.name} (${m.supportedGenerationMethods?.join(', ')})`);
        }
    } catch (e: any) {
        console.error("List Models Failed:", e.message);
    }
}

main();
