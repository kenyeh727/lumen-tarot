
import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const MESSAGES = [
  'Shuffling the stars...',
  'Asking the spirits...',
  'Gathering moonbeams...',
  'Consulting the constellations...',
  'Polishing the crystal ball...',
  'Chasing a shooting star...',
  'Whispering to the moon...'
];

const CustomLoader: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Bouncing Star / Moon Animation */}
      <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
         {/* Orbiting Moon */}
         <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
            <div className="w-4 h-4 bg-yellow-200 rounded-full shadow-[0_0_10px_#fef08a] absolute top-0 left-1/2 -translate-x-1/2"></div>
         </div>
         
         {/* Central Pulsing Star */}
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping"></div>
             <Sparkles size={48} className="text-purple-500 animate-bounce" fill="#d8b4fe" />
         </div>
         
         {/* Particles */}
         <div className="absolute -top-4 -right-4 animate-bounce delay-100">
            <Sparkles size={16} className="text-pink-400" />
         </div>
         <div className="absolute -bottom-2 -left-4 animate-bounce delay-300">
            <Sparkles size={12} className="text-blue-400" />
         </div>
      </div>
      
      <p className="text-purple-600 text-sm font-bold tracking-widest uppercase animate-pulse text-center min-w-[200px]">
        {MESSAGES[msgIndex]}
      </p>
    </div>
  );
};

export default CustomLoader;
