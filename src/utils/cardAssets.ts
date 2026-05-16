import { TarotCard, DeckType } from '../types';

export const getDefaultCardImage = (card: TarotCard, deckType: DeckType): string => {
    if (deckType === DeckType.LENORMAND) {
        const safeName = card.name.replace(/\s+/g, '_');
        return `/assets/cards/LENORMAND_${safeName}.png`;
    } else {
        const safeName = card.name.replace(/\s+/g, '_');
        return `/assets/cards/TAROT_${safeName}.png`;
    }
};
