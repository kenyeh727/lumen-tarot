
import React, { useEffect, useRef } from 'react';

interface Point { x: number; y: number; age: number; color: string; vx: number; vy: number }

const CursorParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Point[]>([]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
        // Add point on move
        for(let i=0; i<2; i++) {
            points.current.push({
                x: e.clientX,
                y: e.clientY,
                age: 0,
                color: Math.random() > 0.5 ? '#F472B6' : '#A78BFA', // Pink or Purple
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            });
        }
    };
    window.addEventListener('mousemove', handleMove);
    
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
        if(!ctx) return;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        // Update and draw
        for (let i = points.current.length - 1; i >= 0; i--) {
            const p = points.current[i];
            p.age++;
            p.x += p.vx;
            p.y += p.vy + 1; // gravity
            
            if (p.age > 25) {
                points.current.splice(i, 1);
                continue;
            }
            
            ctx.globalAlpha = 1 - (p.age / 25);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            
            // Draw star shape
            const size = 3 * (1 - p.age/25);
            ctx.moveTo(p.x, p.y - size);
            ctx.lineTo(p.x + size/2, p.y);
            ctx.lineTo(p.x, p.y + size);
            ctx.lineTo(p.x - size/2, p.y);
            
            ctx.fill();
        }
        requestAnimationFrame(animate);
    }
    
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
    animate();
    
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
}
export default CursorParticles;
