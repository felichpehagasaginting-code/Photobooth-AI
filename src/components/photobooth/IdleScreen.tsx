'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';

/* ── Repeating watermark ─────────────────────────────────────────────── */
function WatermarkRow() {
  const text = 'BOOTH CANVMIN ';
  return (
    <div
      className="whitespace-nowrap text-white/[0.07] font-black tracking-widest"
      style={{ fontSize: '2.8rem', lineHeight: '1' }}
    >
      {text.repeat(8)}
    </div>
  );
}

/* ── Floating polaroid ───────────────────────────────────────────────── */
interface PolaroidProps {
  src: string;
  rotation: number;
  top: string;
  left?: string;
  right?: string;
  width?: number;
}

function Polaroid({ src, rotation, top, left, right, width = 110 }: PolaroidProps) {
  return (
    <div
      className="absolute shadow-2xl pointer-events-none"
      style={{ top, left, right, width, transform: `rotate(${rotation}deg)` }}
    >
      <div className="rounded-sm overflow-hidden relative" style={{ height: width * 0.85 }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #FFB3D1 0%, #E879A8 50%, #C2185B 100%)',
          }}
        />
        <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>
      <div className="bg-white pt-1 pb-2 px-1" />
    </div>
  );
}

const POLAROIDS: PolaroidProps[] = [
  { src: '/filters/anime-ghibli.png', rotation: -18, top: '8%',  left: '0%',   width: 120 },
  { src: '/filters/cyberpunk.png',    rotation: 12,  top: '2%',  left: '20%',  width: 100 },
  { src: '/filters/watercolor.png',   rotation: -8,  top: '62%', left: '-2%',  width: 115 },
  { src: '/filters/comic.png',        rotation: 15,  top: '72%', left: '12%',  width: 100 },
  { src: '/filters/anime-ghibli.png', rotation: -12, top: '5%',  right: '0%',  width: 120 },
  { src: '/filters/cyberpunk.png',    rotation: 10,  top: '38%', right: '-1%', width: 110 },
  { src: '/filters/watercolor.png',   rotation: -15, top: '68%', right: '5%',  width: 105 },
];

const showcaseFilters = [
  { name: 'Anime Ghibli', src: '/filters/anime-ghibli.png', color: '#FF6B9D' },
  { name: 'Cyberpunk Neon', src: '/filters/cyberpunk.png', color: '#A855F7' },
  { name: 'Watercolor', src: '/filters/watercolor.png', color: '#4ECDC4' },
  { name: 'Comic Book', src: '/filters/comic.png', color: '#60A5FA' },
];

/* ── Main Component ──────────────────────────────────────────────────── */
export default function IdleScreen() {
  const { setStep, language, setLanguage } = usePhotoboothStore();
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const handleAdminClick = useCallback(() => setStep('admin-login'), [setStep]);
  const t = (id: string, en: string) => (language === 'id' ? id : en);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % showcaseFilters.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden select-none flex flex-col"
      style={{ background: 'linear-gradient(135deg, #E8629A 0%, #C9479D 25%, #A83BA8 50%, #8B35B0 75%, #7B2FBE 100%)' }}
    >
      {/* ── Watermark background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex flex-col justify-around py-4 gap-2">
        {[0, -80, -40, -120, -20, -100, -60, -30].map((_, i) => (
          <motion.div
            key={i}
            animate={{ x: [0, -60, 0] }}
            transition={{ duration: 22 + i * 2.5, repeat: Infinity, ease: 'linear', delay: i * 1.2 }}
          >
            <WatermarkRow />
          </motion.div>
        ))}
      </div>

      {/* ── Polaroid decorations ── */}
      <div className="absolute inset-0 pointer-events-none">
        {POLAROIDS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Polaroid {...p} />
          </motion.div>
        ))}
      </div>

      {/* ── Top navbar ── */}
      <div
        className="relative z-20 flex items-center justify-between px-5 py-3"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)' }}
      >
        <span className="text-white font-bold text-base tracking-wide">Gemini</span>
        {/* Gemini + brand logo cluster */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-[9px] font-black">G</span>
          </div>
          <span className="text-white/40 text-xs">×</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center">
            <span className="text-white text-[9px] font-black">C</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="px-3 py-1 rounded-full text-xs font-bold text-white/80 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            {language.toUpperCase()}
          </button>
          {/* Admin */}
          <button
            onClick={handleAdminClick}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Center content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-8">

        {/* Power of */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">POWER OF :</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-black">G</span>
          </div>
          <span className="text-white/40 font-bold">×</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-black">C</span>
          </div>
        </motion.div>

        {/* Logo circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-6"
        >
          <div
            className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 shadow-2xl"
            style={{
              borderColor: 'rgba(255,255,255,0.4)',
              background: 'linear-gradient(135deg, #FFB3D1, #E879A8)',
            }}
          >
            <img
              src="/photobooth-logo.png"
              alt="AI Photobooth"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Rotating shimmer */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)' }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'rgba(255,255,255,0.3)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-3"
        >
          <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg leading-tight">
            AI{' '}
            <span style={{ fontStyle: 'italic' }}>Photo</span>booth
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-white/70 text-sm max-w-xs mb-8 leading-relaxed"
        >
          {t(
            'Abadikan momen dengan sentuhan magis AI, langsung cetak digital',
            'Capture moments with AI magic, instant digital prints'
          )}
        </motion.p>

        {/* Showcase image */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative w-64 md:w-80 mb-8"
        >
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl border"
            style={{ aspectRatio: '4/3', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showcaseIndex}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.55 }}
                className="absolute inset-0"
              >
                <img
                  src={showcaseFilters[showcaseIndex]?.src}
                  alt={showcaseFilters[showcaseIndex]?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: showcaseFilters[showcaseIndex]?.color }} />
                  <span className="text-white text-sm font-semibold">{showcaseFilters[showcaseIndex]?.name}</span>
                  <span className="text-white/40 text-xs ml-auto">AI Filter</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {showcaseFilters.map((_, i) => (
              <button
                key={i}
                onClick={() => setShowcaseIndex(i)}
                className="rounded-full transition-all duration-400"
                style={{
                  width: i === showcaseIndex ? 24 : 7,
                  height: 7,
                  background: i === showcaseIndex ? 'white' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 max-w-xs mb-8"
        >
          {[
            t('8 AI Filter', '8 AI Filters'),
            t('Proses Real-time', 'Real-time AI'),
            t('QRIS Payment', 'QRIS Payment'),
            t('Download Digital', 'Digital Download'),
          ].map((label) => (
            <span
              key={label}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white border"
              style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.25)' }}
            >
              {label}
            </span>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          id="start-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          onTapStart={() => setIsPressed(true)}
          onTap={() => { setIsPressed(false); setStep('take-select'); }}
          onTapCancel={() => setIsPressed(false)}
          onClick={() => setStep('take-select')}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          className="relative h-16 px-14 text-lg font-black text-white rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
            border: '2px solid rgba(255,255,255,0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          />
          <span className="relative z-10 tracking-widest uppercase">
            ✨ {t('Mulai Sesi', 'Start Session')}
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4 text-white/30 text-[10px] tracking-[0.3em] uppercase"
        >
          {t('Sentuh untuk memulai', 'Tap to begin')}
        </motion.p>
      </div>

      {/* ── Bottom branding ── */}
      <div className="relative z-10 pb-4 text-center">
        <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase">Powered by Gemini AI</p>
      </div>
    </div>
  );
}