
export const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled;
};
