import React, { useState, useEffect } from 'react';
import { TarotCard, DeckConfig } from '../types';
import { playSound } from '../utils/sound';

interface FanSpreadProps {
  cards: TarotCard[];
  config: DeckConfig;
  onSelect: (card: TarotCard) => void;
  selectedCardIds: number[];
}

const FanSpread: React.FC<FanSpreadProps> = ({ cards, config, onSelect, selectedCardIds }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [layout, setLayout] = useState({
    radii: { x: 0, y: 0 },
    cardSize: { w: 0, h: 0 }
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;

      const cardW = isMobile ? 40 : 60;
      const cardH = isMobile ? 70 : 100;
      const padding = 20;

      let radiusX = (w / 2) - (cardH / 2) - padding;
      const topUIBuffer = isMobile ? 80 : 100;
      let radiusY = (h * 0.45) - (cardH / 2) - topUIBuffer;

      const minRadius = isMobile ? 90 : 120;
      radiusX = Math.max(minRadius, radiusX);
      radiusY = Math.max(minRadius, radiusY);

      if (!isMobile) {
        radiusX = Math.min(radiusX, 500);
        radiusY = Math.min(radiusY, 350);
      } else {
        radiusX = Math.min(radiusX, 160);
        radiusY = Math.min(radiusY, 250);
      }

      setLayout({
        radii: { x: radiusX, y: radiusY },
        cardSize: { w: cardW, h: cardH }
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (layout.cardSize.w === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center z-30 overflow-hidden">
      {/* Central Hint */}
      <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-white/20 text-[10px] tracking-[0.4em] font-bold uppercase animate-pulse pointer-events-none z-0 text-center">
        <div>Circle of Fate</div>
        <div className="text-[8px] opacity-40 mt-1">Choose your truth</div>
      </div>

      {/* Card Circle */}
      <div className="relative w-full h-full">
        {cards.map((card, i) => {
          const isSelected = selectedCardIds.includes(card.id);
          if (isSelected) return null;

          const angleStep = (2 * Math.PI) / cards.length;
          const angle = i * angleStep - Math.PI / 2;
          const x = Math.cos(angle) * layout.radii.x;
          const y = Math.sin(angle) * layout.radii.y;
          const rotation = angle + Math.PI / 2;

          return (
            <div
              key={card.id}
              className="absolute cursor-pointer transition-all duration-500 hover:brightness-125"
              style={{
                width: `${layout.cardSize.w}px`,
                height: `${layout.cardSize.h}px`,
                left: '50%',
                top: '45%',
                marginLeft: `-${layout.cardSize.w / 2}px`,
                marginTop: `-${layout.cardSize.h / 2}px`,
                transform: `translate(${x}px, ${y}px) rotate(${rotation}rad) ${hoveredIndex === i ? 'scale(1.5)' : 'scale(1)'}`,
                zIndex: hoveredIndex === i ? 1000 : i,
                opacity: 1,
              }}
              onMouseEnter={() => {
                setHoveredIndex(i);
                playSound('hover');
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect(card)}
            >
              <div
                className={`
                                w-full h-full rounded shadow-2xl border border-white/10
                                bg-[#0f0f1a] overflow-hidden transition-all duration-300
                                ${hoveredIndex === i ? 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : ''}
                            `}
                style={{
                  backgroundImage: `url(${config.cardBackImage})`,
                  backgroundSize: 'cover',
                }}
              >
                <div className="absolute inset-[1px] border border-white/20 rounded-sm opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FanSpread;
