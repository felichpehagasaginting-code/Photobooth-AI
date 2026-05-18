'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedBackgroundProps {
  children?: ReactNode;
  variant?: 'hero' | 'default' | 'dark' | 'light';
  showOrbs?: boolean;
  showParticles?: boolean;
  className?: string;
}

export default function AnimatedBackground({
  children,
  variant = 'default',
  showOrbs = true,
  showParticles = false,
  className = '',
}: AnimatedBackgroundProps) {
  const orbConfigs = [
    { 
      size: 300, 
      color: '#FF6B9D', 
      top: '-10%', 
      left: '-15%', 
      delay: 0,
      duration: 8,
    },
    { 
      size: 200, 
      color: '#A855F7', 
      top: '60%', 
      left: '80%', 
      delay: 2,
      duration: 10,
    },
    { 
      size: 250, 
      color: '#06D6A0', 
      top: '40%', 
      left: '-5%', 
      delay: 4,
      duration: 9,
    },
    { 
      size: 150, 
      color: '#FF8A65', 
      top: '10%', 
      left: '70%', 
      delay: 1,
      duration: 7,
    },
  ];

  const particleConfigs = [
    { x: '10%', y: '20%', delay: 0 },
    { x: '80%', y: '30%', delay: 0.5 },
    { x: '20%', y: '70%', delay: 1 },
    { x: '90%', y: '60%', delay: 1.5 },
    { x: '50%', y: '80%', delay: 2 },
    { x: '15%', y: '50%', delay: 2.5 },
  ];

  const backgroundVariants = {
    hero: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
    default: 'bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2A] to-[#0A0A0F]',
    dark: 'bg-[#0A0A0F]',
    light: 'bg-gradient-to-br from-[#15151F] to-[#0A0A0F]',
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${backgroundVariants[variant]} ${className}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 animate-gradient" />
      </div>

      {/* Floating orbs */}
      {showOrbs && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {orbConfigs.map((orb, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full"
              style={{
                width: orb.size,
                height: orb.size,
                top: orb.top,
                left: orb.left,
                background: `radial-gradient(circle at 30% 30%, ${orb.color}15, transparent 70%)`,
                filter: 'blur(40px)',
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: orb.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: orb.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating particles */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particleConfigs.map((particle, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                opacity: 0.5,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + (i * 0.5),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
