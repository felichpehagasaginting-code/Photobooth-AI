'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Languages, Zap, Sparkles } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { Button } from '@/components/ui/button';

const showcaseImages = [
  { src: '/filters/anime-ghibli.png', name: 'Anime Ghibli', color: '#FF6B9D', style: 'label-en' as const },
  { src: '/filters/cyberpunk.png', name: 'Cyberpunk Neon', color: '#A855F7', style: 'label-en' as const },
  { src: '/filters/watercolor.png', name: 'Watercolor', color: '#4ECDC4', style: 'label-en' as const },
  { src: '/filters/comic.png', name: 'Comic Book', color: '#60A5FA', style: 'label-en' as const },
];

// Floating orbs for hero
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { size: 300, color: '#FF6B9D', top: '-10%', left: '-15%', delay: 0 },
        { size: 200, color: '#A855F7', top: '60%', left: '80%', delay: 2 },
        { size: 250, color: '#06D6A0', top: '40%', left: '-5%', delay: 4 },
        { size: 150, color: '#FF8A65', top: '10%', left: '70%', delay: 1 },
      ].map((orb, i) => (
        <motion.div
          key={i}
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
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6 + orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function IdleScreen() {
  const { setStep, language, setLanguage } = usePhotoboothStore();
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  const handleAdminClick = useCallback(() => {
    setStep('admin-login');
  }, [setStep]);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  // Auto-rotate showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#06060A]">
      {/* Premium gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0F] via-[#0C0718] to-[#0A0A0F]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,107,157,0.03)_0%,transparent_70%)]" />
      </div>

      <FloatingOrbs />

      {/* Subtle grid pattern for texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center">
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center gap-5"
        >
          {/* Logo ring */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,107,157,0.2), 0 0 40px rgba(255,107,157,0.05)',
                '0 0 30px rgba(255,107,157,0.3), 0 0 60px rgba(255,107,157,0.1)',
                '0 0 20px rgba(255,107,157,0.2), 0 0 40px rgba(255,107,157,0.05)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full"
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border border-[#FF6B9D]/20" />
            <div className="absolute inset-1 rounded-full border border-[#FF6B9D]/10" />
            {/* Logo image */}
            <div className="absolute inset-2 rounded-full overflow-hidden bg-[#0A0A0F] shadow-ios-lg">
              <img
                src="/photobooth-logo.png"
                alt="AI Photobooth"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(135deg, transparent 30%, rgba(255,107,157,0.1) 50%, transparent 70%)',
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-white">AI </span>
              <span className="text-gradient-pink">Photo</span>
              <span className="text-white">booth</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base md:text-lg text-muted-foreground max-w-sm leading-relaxed"
            >
              {t(
                'Abadikan momen dengan sentuhan magis AI, langsung cetak digital',
                'Capture moments with AI magic, instant digital prints'
              )}
            </motion.p>
          </div>
        </motion.div>

        {/* Showcase carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative w-80 md:w-[420px]"
        >
          {/* Main image */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#15151F] shadow-ios-lg border border-[#FFFFFF08]">
            <AnimatePresence mode="wait">
              <motion.div
                key={showcaseIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute inset-0"
              >
                <img
                  src={showcaseImages[showcaseIndex]?.src}
                  alt={showcaseImages[showcaseIndex]?.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: showcaseImages[showcaseIndex]?.color }}
              />
              <span className="text-white text-sm font-semibold tracking-wide">
                {showcaseImages[showcaseIndex]?.name}
              </span>
              <span className="text-white/30 text-xs ml-auto tracking-widest uppercase">
                AI Filter
              </span>
            </div>

            {/* Top glass bar */}
            <div className="absolute top-0 left-0 right-0 h-12 glass flex items-center px-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400/80" />
                <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
                <div className="w-2 h-2 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 text-center text-[10px] text-white/40 font-medium tracking-wider uppercase">
                AI Preview
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
            {showcaseImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setShowcaseIndex(i)}
                className={`rounded-full transition-all duration-500 ease-out ${
                  i === showcaseIndex
                    ? 'bg-[#FF6B9D] w-8 h-2'
                    : 'bg-white/10 w-2 h-2 hover:bg-white/25'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2.5 max-w-sm"
        >
          {[
            { label: t('8 AI Filter', '8 AI Filters'), color: '#FF6B9D' },
            { label: t('Proses AI Real', 'Real AI Process'), color: '#06D6A0' },
            { label: t('QRIS Payment', 'QRIS Payment'), color: '#A855F7' },
            { label: t('Unduh Digital', 'Digital Download'), color: '#FF8A65' },
          ].map((pill) => (
            <span
              key={pill.label}
              className="px-3.5 py-2 rounded-full text-xs font-semibold border tracking-wide"
              style={{
                background: pill.color + '12',
                color: pill.color,
                borderColor: pill.color + '25',
              }}
            >
              {pill.label}
            </span>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Button
            onClick={() => setStep('take-select')}
            className="relative h-16 px-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:from-[#FF7BAE] hover:to-[#FF9B75] text-white shadow-glow-pink transition-all duration-300 scale-press overflow-hidden group"
          >
            {/* Shimmer on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Sparkles className="w-5 h-5 mr-2.5 relative z-10" />
            <span className="relative z-10 tracking-wider">
              {t('MULAI', 'START')}
            </span>
          </Button>
        </motion.div>

        {/* Subtitle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-white/25 tracking-widest uppercase"
        >
          {t('Sentuh untuk memulai', 'Tap to begin')}
        </motion.p>
      </div>

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
          className="glass rounded-full px-4 py-2.5 flex items-center gap-2 text-white/70 hover:text-white transition-colors tap-none"
        >
          <Languages className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{language}</span>
        </button>

        {/* Admin */}
        <button
          onClick={handleAdminClick}
          className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/40 hover:text-white transition-colors tap-none"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-[10px] text-white/15 tracking-[0.3em] uppercase">
          Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}