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
      size: 350, 
      color: '#2b5cf6', // Premium Cobalt
      top: '-5%', 
      left: '-10%', 
      delay: 0,
      duration: 9,
    },
    { 
      size: 250, 
      color: '#1e3a8a', // Midnight Blue
      top: '60%', 
      left: '75%', 
      delay: 2,
      duration: 11,
    },
    { 
      size: 280, 
      color: '#2dd4bf', // Turquoise
      top: '35%', 
      left: '-5%', 
      delay: 4,
      duration: 10,
    },
    { 
      size: 180, 
      color: '#9cb6f9', // Metallic Ice Sapphire
      top: '15%', 
      left: '65%', 
      delay: 1,
      duration: 8,
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
    hero: 'bg-gradient-to-br from-[#030611] via-[#0a0e1c] to-[#030611]',
    default: 'bg-gradient-to-br from-[#030611] via-[#0d152c] to-[#030611]',
    dark: 'bg-[#030611]',
    light: 'bg-gradient-to-br from-[#0a0e1c] to-[#030611]',
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
