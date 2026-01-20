
import fs from 'fs';
import path from 'path';
import { FULL_DECK, LENORMAND_DECK } from '../constants';
import { DeckType } from '../types';

const ASSETS_DIR = path.resolve(process.cwd(), 'public/assets/cards');

function sanitizeFilename(name: string): string {
    return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}

function processDeck(deck: any[], deckType: DeckType) {
    console.log(`Processing ${deckType}...`);
    let count = 0;
    deck.forEach(card => {
        const oldName = `${deckType}_${card.id}.png`;
        const newName = `${deckType}_${sanitizeFilename(card.name)}.png`;

        const oldPath = path.join(ASSETS_DIR, oldName);
        const newPath = path.join(ASSETS_DIR, newName);

        if (fs.existsSync(oldPath)) {
            // Check if new path already exists (idempotency)
            if (!fs.existsSync(newPath)) {
                fs.renameSync(oldPath, newPath);
                console.log(`[RENAMED] ${oldName} -> ${newName}`);
                count++;
            } else {
                console.log(`[SKIP] ${newName} already exists. Removing old.`);
                // Optional: remove old if duplicate? or just keep. Let's keep for safety unless safe.
                // fs.unlinkSync(oldPath); 
            }
        }
    });
    console.log(`Renamed ${count} cards for ${deckType}.`);
}

if (fs.existsSync(ASSETS_DIR)) {
    processDeck(FULL_DECK, DeckType.TAROT);
    processDeck(LENORMAND_DECK, DeckType.LENORMAND);
} else {
    console.error(`Directory not found: ${ASSETS_DIR}`);
}
