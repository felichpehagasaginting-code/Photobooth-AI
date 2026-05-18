// Premium animation configurations for iOS/macOS style feel

export const pageTransitions = {
  default: {
    type: 'tween' as const,
    ease: 'easeInOut' as const,
    duration: 0.35,
  },
  fast: {
    type: 'tween' as const,
    ease: 'easeOut' as const,
    duration: 0.25,
  },
  smooth: {
    type: 'tween' as const,
    ease: 'easeInOut' as const,
    duration: 0.5,
  },
};

export const springPhysics = {
  gentle: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 1,
  },
  snappy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 20,
    mass: 0.8,
  },
};

export const slideUpVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -20, filter: 'blur(4px)' },
};

export const slideDownVariants = {
  initial: { opacity: 0, y: -20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: 20, filter: 'blur(4px)' },
};

export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleInVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const scaleDownVariants = {
  initial: { opacity: 0, scale: 1.05 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
};

export const rotateInVariants = {
  initial: { opacity: 0, rotate: -10, scale: 0.95 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 10, scale: 0.95 },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springPhysics.gentle,
  },
};

export const hoverScaleVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export const buttonVariants = {
  initial: { scale: 1, opacity: 1 },
  hover: { scale: 1.05, opacity: 1 },
  tap: { scale: 0.95 },
};

export const glowPulseVariants = {
  initial: { opacity: 1, scale: 1 },
  animate: {
    opacity: [1, 0.7, 1],
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export const rotatingVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  },
};

export const gradientShiftVariants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% 0%', '-200% 0%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  },
};

export const loadingSpinVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  },
};

export const bounceVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContentVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
};

export const toastVariants = {
  initial: { x: 384, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 384, opacity: 0 },
};

// Stagger delays for list items
export const getStaggerDelay = (index: number, baseDelay: number = 0.05) => {
  return index * baseDelay;
};

// Combined animations for common patterns
export const cardHoverAnimation = {
  whileHover: { 
    y: -4, 
    boxShadow: '0 20px 40px rgba(255, 107, 157, 0.1)',
  },
  transition: pageTransitions.default,
};

export const buttonPressAnimation = {
  whileTap: { scale: 0.95 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
};

export const iconRotateAnimation = {
  whileHover: { rotate: 10 },
  whileTap: { rotate: -10 },
  transition: pageTransitions.fast,
};
