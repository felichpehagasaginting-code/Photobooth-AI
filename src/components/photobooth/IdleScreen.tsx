'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Languages, Zap } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { Button } from '@/components/ui/button';

const showcaseImages = [
  { src: '/filters/anime-ghibli.png', name: 'Anime Ghibli', color: '#FF6B9D' },
  { src: '/filters/cyberpunk.png', name: 'Cyberpunk Neon', color: '#A855F7' },
  { src: '/filters/watercolor.png', name: 'Watercolor', color: '#4ECDC4' },
  { src: '/filters/comic.png', name: 'Comic Book', color: '#60A5FA' },
];

export default function IdleScreen() {
  const { setStep, language, setLanguage } = usePhotoboothStore();
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  // Generate particles
  const particles = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 4,
    }))
  )[0];

  // Auto-rotate showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminClick = useCallback(() => {
    setStep('admin-login');
  }, [setStep]);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#0F0A1A] to-[#0A0A0F] animate-gradient" />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? '#FF6B9D' : p.id % 3 === 1 ? '#06D6A0' : '#A855F7',
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Background showcase image (blurred) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showcaseIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={showcaseImages[showcaseIndex]?.src}
            alt=""
            className="w-full h-full object-cover blur-2xl scale-110"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-[#FF6B9D]/30 glow-pink"
          >
            <img
              src="/photobooth-logo.png"
              alt="AI Photobooth"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-glow-pink">
            AI <span className="text-[#FF6B9D]">Photo</span>booth
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-md">
            {t(
              'Abadikan Momen dengan Sentuhan AI',
              'Capture Moments with AI Magic'
            )}
          </p>
        </motion.div>

        {/* Filter showcase cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative w-80 h-52 md:w-96 md:h-60"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={showcaseIndex}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -80, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-[#2A2A3A] bg-[#15151F] shadow-2xl">
                <div className="relative w-full h-full">
                  <img
                    src={showcaseImages[showcaseIndex]?.src}
                    alt={showcaseImages[showcaseIndex]?.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: showcaseImages[showcaseIndex]?.color }}
                      />
                      <span className="text-white font-semibold text-sm">
                        {showcaseImages[showcaseIndex]?.name}
                      </span>
                      <span className="text-muted-foreground text-xs ml-auto">
                        AI Filter Preview
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {showcaseImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setShowcaseIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === showcaseIndex
                    ? 'bg-[#FF6B9D] w-8'
                    : 'bg-[#2A2A3A] w-2 hover:bg-[#3A3A4A]'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 max-w-sm"
        >
          {[
            { label: t('8 AI Filter', '8 AI Filters'), color: '#FF6B9D' },
            { label: t('Bayar QRIS', 'QRIS Payment'), color: '#06D6A0' },
            { label: t('Unduh Digital', 'Digital Download'), color: '#A855F7' },
          ].map((pill) => (
            <span
              key={pill.label}
              className="px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{
                background: pill.color + '15',
                color: pill.color,
                borderColor: pill.color + '30',
              }}
            >
              {pill.label}
            </span>
          ))}
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            onClick={() => setStep('package-select')}
            className="h-16 px-14 text-xl font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:opacity-90 text-white animate-pulse-neon transition-all"
          >
            <Zap className="w-6 h-6 mr-2" />
            {t('MULAI', 'START')}
          </Button>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-sm text-muted-foreground"
        >
          {t('Sentuh untuk memulai', 'Touch to start')}
        </motion.p>
      </div>

      {/* Language toggle - top left */}
      <div className="absolute top-6 left-6 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
          className="w-12 h-12 rounded-full bg-[#15151F]/50 border border-[#2A2A3A] hover:bg-[#2A2A3A] text-white"
        >
          <Languages className="w-5 h-5" />
          <span className="sr-only">{t('Ganti Bahasa', 'Switch Language')}</span>
        </Button>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-bold uppercase">
          {language}
        </span>
      </div>

      {/* Admin gear - top right */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAdminClick}
          className="w-10 h-10 rounded-full text-muted-foreground hover:text-white hover:bg-[#2A2A3A]/50 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="sr-only">{t('Admin', 'Admin')}</span>
        </Button>
      </div>
    </div>
  );
}
