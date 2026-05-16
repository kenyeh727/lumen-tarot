
import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((window.innerWidth * window.innerHeight) / 10000); // Fewer stars for cleaner look
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1, // Larger sparkles
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random(),
        });
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      time += 16;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Transparent background (let CSS image show through)
      // Draw Stars/Sparkles
      particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Twinkle
        const flicker = Math.sin(time * 0.003 + p.x) * 0.3 + 0.6;
        ctx.globalAlpha = p.opacity * flicker;
        
        // Gold and Lavender sparkles
        ctx.fillStyle = index % 2 === 0 ? '#FFD700' : '#E6E6FA'; 
        
        ctx.beginPath();
        // Draw diamond shape for sparkles
        ctx.moveTo(p.x, p.y - p.size);
        ctx.lineTo(p.x + p.size/2, p.y);
        ctx.lineTo(p.x, p.y + p.size);
        ctx.lineTo(p.x - p.size/2, p.y);
        ctx.closePath();
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default StarField;
