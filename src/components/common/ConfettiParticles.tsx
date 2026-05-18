'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ConfettiParticleProps {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  colors?: string[];
  duration?: number;
}

export function ConfettiParticles({
  count = 30,
  size = 'md',
  colors = ['#FF6B9D', '#06D6A0', '#FBBF24', '#A855F7', '#FF8A65'],
  duration = 3,
}: ConfettiParticleProps) {
  const sizeMap = {
    sm: { min: 2, max: 4 },
    md: { min: 4, max: 8 },
    lg: { min: 8, max: 12 },
  };

  const currentSize = sizeMap[size];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const randomSize = Math.random() * (currentSize.max - currentSize.min) + currentSize.min;
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.5;
        const randomRotation = Math.random() * 360;
        const randomDuration = duration * (0.7 + Math.random() * 0.6);

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${randomX}%`,
              top: '-20px',
              width: randomSize,
              height: randomSize,
              backgroundColor: randomColor,
              opacity: 0.8,
            }}
            animate={{
              y: window.innerHeight + 40,
              x: (Math.random() - 0.5) * 200,
              rotate: randomRotation + 360,
              opacity: [0.8, 0.4, 0],
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              ease: 'easeIn',
            }}
          />
        );
      })}
    </div>
  );
}

interface SuccessAnimationProps {
  children?: ReactNode;
  showConfetti?: boolean;
  duration?: number;
  className?: string;
}

export function SuccessAnimation({
  children,
  showConfetti = true,
  duration = 3,
  className = '',
}: SuccessAnimationProps) {
  return (
    <div className={className}>
      {showConfetti && <ConfettiParticles count={40} duration={duration} />}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
