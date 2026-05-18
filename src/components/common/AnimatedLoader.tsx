'use client';

import { motion } from 'framer-motion';

interface AnimatedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'scale';
  color?: 'pink' | 'cyan' | 'gold' | 'white';
  label?: string;
}

export default function AnimatedLoader({
  size = 'md',
  variant = 'spinner',
  color = 'pink',
  label,
}: AnimatedLoaderProps) {
  const sizeMap = {
    sm: 24,
    md: 48,
    lg: 64,
  };

  const colorMap = {
    pink: 'bg-pink-500',
    cyan: 'bg-cyan-500',
    gold: 'bg-yellow-500',
    white: 'bg-white',
  };

  const diameterMap = {
    sm: sizeMap.sm,
    md: sizeMap.md,
    lg: sizeMap.lg,
  };

  const spinnerSize = diameterMap[size];

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          style={{
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: '50%',
            borderWidth: 3,
            borderColor: `rgba(255, 107, 157, 0.2)`,
            borderTopColor: 'rgb(255, 107, 157)',
            borderRightColor: 'rgb(6, 214, 160)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {label && (
          <motion.p
            className="text-sm text-muted-foreground"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {label}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 rounded-full ${colorMap[color]}`}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
        {label && (
          <motion.p
            className="text-sm text-muted-foreground ml-2"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {label}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          style={{
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: '50%',
          }}
          className={`${colorMap[color]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {label && (
          <motion.p
            className="text-sm text-muted-foreground"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {label}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === 'scale') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          style={{
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: '50%',
          }}
          className={`${colorMap[color]}`}
          animate={{
            scale: [1, 0.8, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {label && (
          <motion.p
            className="text-sm text-muted-foreground"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {label}
          </motion.p>
        )}
      </div>
    );
  }

  return null;
}
