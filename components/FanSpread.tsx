import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
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

      // 1. Card Size (Mobile: 40x70, Desktop: 60x100)
      const cardW = isMobile ? 40 : 60;
      const cardH = isMobile ? 70 : 100;

      const padding = 20;

      // 2. Safe Area Calculation
      // X Radius: (width / 2) - (cardHeight / 2) - padding
      // Using cardH because cards on the side rotate 90deg, extending their height horizontally.
      let radiusX = (w / 2) - (cardH / 2) - padding;

      // Y Radius: Account for header/footer to prevent clipping
      // We assume the center is shifted up to 45%, so we calculate available space from that center point.
      // Approx distance from 45% center to top edge = 0.45 * h
      // Available Y Radius = (0.45 * h) - (cardHeight / 2) - TopUIBuffer
      const topUIBuffer = isMobile ? 80 : 100; // Space for "Fate Fan" title
      let radiusY = (h * 0.45) - (cardH / 2) - topUIBuffer;

      // Limits to prevent looking too small or too big
      const minRadius = isMobile ? 90 : 120;
      radiusX = Math.max(minRadius, radiusX);
      radiusY = Math.max(minRadius, radiusY);

      // Cap max radius for very large screens
      if (!isMobile) {
        radiusX = Math.min(radiusX, 500);
        radiusY = Math.min(radiusY, 350);
      } else {
        // Mobile caps
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

  const totalCards = cards.length;

  const cardVariants: Variants = {
    stacked: {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 0,
      opacity: 0,
      zIndex: 0,
      transition: { type: "spring", damping: 20 }
    },
    fanned: (i: number) => {
      const angleStep = (2 * Math.PI) / totalCards;
      const angle = i * angleStep - Math.PI / 2;

      const x = Math.cos(angle) * layout.radii.x;
      const y = Math.sin(angle) * layout.radii.y;
      const rotationRad = angle + Math.PI / 2;

      return {
        x,
        y,
        rotate: `${rotationRad}rad`,
        scale: 1,
        opacity: 1,
        zIndex: i,
        transition: {
          delay: i * 0.015,
          type: "spring",
          stiffness: 100,
          damping: 20
        }
      };
    }
  };

  if (layout.cardSize.w === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center z-30 perspective-[1000px]">
      {/* Central Hint Text - Shifted up to match card center */}
      <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-white/30 text-[10px] tracking-[0.3em] font-bold uppercase animate-pulse pointer-events-none z-0 text-center">
        <div>Fate</div>
        <div className="text-[8px] opacity-50">Circle</div>
      </div>

      {/* Card Container */}
      {cards.map((card, i) => {
        const isSelected = selectedCardIds.includes(card.id);
        if (isSelected) return null;

        return (
          <motion.div
            key={card.id}
            custom={i}
            variants={cardVariants}
            initial="stacked"
            animate="fanned"
            className="absolute cursor-pointer will-change-transform origin-center"
            style={{
              width: `${layout.cardSize.w}px`,
              height: `${layout.cardSize.h}px`,
              // Moving center UP to 45% (was 50%) to avoid top clipping
              left: '50%',
              top: '45%',
              marginLeft: `-${layout.cardSize.w / 2}px`,
              marginTop: `-${layout.cardSize.h / 2}px`,
            }}
            whileHover={{
              scale: 1.5,
              zIndex: 1000,
              filter: "brightness(1.3)",
              transition: { duration: 0.2 }
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
                            w-full h-full rounded-sm shadow-lg border border-white/10
                            bg-[#0f0f1a] overflow-hidden transition-all duration-300
                            ${hoveredIndex === i ? 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : ''}
                        `}
              style={{
                backgroundImage: `url(${config.cardBackImage})`,
                backgroundSize: 'cover',
              }}
            >
              <div className="absolute inset-[1px] border border-white/20 rounded-sm opacity-50"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FanSpread;
