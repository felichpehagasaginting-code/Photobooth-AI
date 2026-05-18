'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Camera, Sparkles, Zap, Download } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';

/* ── Floating particle ───────────────────────────────────────────────── */
function FloatingParticle({ delay, x, size }: { delay: number; x: string; size: number }) {
  return (
    <motion.div
      className="absolute bottom-0 rounded-full pointer-events-none"
      style={{
        left: x,
        width: size,
        height: size,
        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
      }}
      animate={{
        y: [0, -600],
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.8],
      }}
      transition={{
        duration: 8 + Math.random() * 6,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

/* ── Repeating watermark ─────────────────────────────────────────────── */
function WatermarkRow() {
  const text = 'BOOTH CANVMIN ✦ ';
  return (
    <div
      className="whitespace-nowrap text-white/[0.06] font-black tracking-widest select-none"
      style={{ fontSize: '2.6rem', lineHeight: '1' }}
    >
      {text.repeat(10)}
    </div>
  );
}

/* ── Polaroid card ───────────────────────────────────────────────────── */
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
      <div
        className="rounded-sm overflow-hidden relative"
        style={{ height: width * 0.85 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #FFB3D1 0%, #E879A8 50%, #C2185B 100%)',
          }}
        />
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {/* Subtle gloss overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
      </div>
      <div className="bg-white pt-1.5 pb-3 px-1.5">
        <div className="h-1.5 w-8 rounded-full bg-gray-100 mx-auto" />
      </div>
    </div>
  );
}

const POLAROIDS: PolaroidProps[] = [
  { src: '/filters/anime-ghibli.png', rotation: -15, top: '12%', left: '8%',   width: 140 },
  { src: '/filters/cyberpunk.png',    rotation: 12,  top: '8%',  left: '25%',  width: 120 },
  { src: '/filters/watercolor.png',   rotation: -8,  top: '55%', left: '6%',  width: 135 },
  { src: '/filters/comic.png',        rotation: 18,  top: '75%', left: '22%',  width: 125 },
  { src: '/filters/anime-ghibli.png', rotation: 10,  top: '15%', right: '8%',  width: 145 },
  { src: '/filters/cyberpunk.png',    rotation: -12, top: '45%', right: '5%', width: 130 },
  { src: '/filters/watercolor.png',   rotation: 15,  top: '72%', right: '20%',  width: 120 },
  // Tambahan biar lebih rame
  { src: '/filters/comic.png',        rotation: -20, top: '30%', left: '15%', width: 110 },
  { src: '/filters/anime-ghibli.png', rotation: 25,  top: '25%', right: '25%', width: 100 },
];

const showcaseFilters = [
  { name: 'Anime Ghibli', src: '/filters/anime-ghibli.png', color: '#FF6B9D', emoji: '🌸' },
  { name: 'Cyberpunk Neon', src: '/filters/cyberpunk.png', color: '#A855F7', emoji: '⚡' },
  { name: 'Watercolor', src: '/filters/watercolor.png', color: '#4ECDC4', emoji: '🎨' },
  { name: 'Comic Book', src: '/filters/comic.png', color: '#60A5FA', emoji: '💥' },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  delay: i * 0.8,
  x: `${Math.random() * 100}%`,
  size: 4 + Math.random() * 8,
}));

const FEATURE_ITEMS = [
  { icon: Sparkles, labelId: '8 AI Filter', labelEn: '8 AI Filters' },
  { icon: Zap, labelId: 'Real-time AI', labelEn: 'Real-time AI' },
  { icon: Camera, labelId: 'QRIS Payment', labelEn: 'QRIS Payment' },
  { icon: Download, labelId: 'Digital Download', labelEn: 'Digital Download' },
];

/* ── Main Component ──────────────────────────────────────────────────── */
export default function IdleScreen() {
  const { setStep, language, setLanguage } = usePhotoboothStore();
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  const handleAdminClick = useCallback(() => setStep('admin-login'), [setStep]);
  const t = (id: string, en: string) => (language === 'id' ? id : en);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % showcaseFilters.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden select-none flex flex-col"
      style={{ background: 'linear-gradient(160deg, #D94F8A 0%, #B03EA0 28%, #8B35B0 58%, #6B28C8 80%, #5A21DA 100%)' }}
    >
      {/* ── Ambient glow blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 left-1/4 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #FFD6E8 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], x: [-10, 10, -10] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #C4A0FF 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], x: [10, -10, 10] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}
      </div>

      {/* ── Watermark background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex flex-col justify-around py-4 gap-2">
        {[0, -80, -40, -120, -20, -100, -60, -30].map((_, i) => (
          <motion.div
            key={i}
            animate={{ x: [0, -80, 0] }}
            transition={{ duration: 24 + i * 2.5, repeat: Infinity, ease: 'linear', delay: i * 1.4 }}
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
            initial={{ opacity: 0, scale: 0.7, rotate: p.rotation - 10 }}
            animate={{ opacity: 1, scale: 1, rotate: p.rotation }}
            transition={{ delay: i * 0.12, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Polaroid {...p} />
          </motion.div>
        ))}
      </div>

      {/* ── Top navbar ── */}
      <div
        className="relative z-20 flex items-center justify-between px-5 py-3"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}
      >
        <span className="text-white font-black text-base tracking-wider" style={{ fontFamily: 'var(--font-outfit)' }}>
          AI Photobooth
        </span>

        <div className="flex items-center gap-2">
          {/* Brand logos */}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-[9px] font-black">G</span>
            </div>
            <span className="text-white/30 text-xs">×</span>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-[9px] font-black">C</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="px-3 py-1 rounded-full text-xs font-bold text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            {language.toUpperCase()}
          </button>
          {/* Admin */}
          <button
            onClick={handleAdminClick}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Center content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-6">

        {/* Power of badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-5"
        >
          <span className="text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase">Powered by</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
            <span className="text-white/80 text-[10px] font-bold">Gemini AI</span>
          </div>
        </motion.div>

        {/* Logo circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-5"
        >
          <div
            className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-[3px] shadow-2xl relative"
            style={{
              borderColor: 'rgba(255,255,255,0.45)',
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
              style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(255,255,255,0.4) 80%, transparent 90%)' }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          {/* Outer pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'rgba(255,255,255,0.25)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Inner pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-2"
        >
          <h1
            className="text-4xl md:text-5xl font-black text-white drop-shadow-lg leading-tight text-balance"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            AI{' '}
            <span className="italic">Photo</span>booth
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-white/65 text-sm max-w-[260px] mb-6 leading-relaxed"
        >
          {t(
            'Abadikan momen dengan sentuhan magis AI, langsung cetak digital',
            'Capture moments with AI magic, instant digital prints'
          )}
        </motion.p>

        {/* Showcase image */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative w-64 md:w-72 mb-7"
        >
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl border"
            style={{ aspectRatio: '4/3', borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.35)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showcaseIndex}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <img
                  src={showcaseFilters[showcaseIndex]?.src}
                  alt={showcaseFilters[showcaseIndex]?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                  <span className="text-lg">{showcaseFilters[showcaseIndex]?.emoji}</span>
                  <span className="text-white text-sm font-bold">{showcaseFilters[showcaseIndex]?.name}</span>
                  <span
                    className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: (showcaseFilters[showcaseIndex]?.color ?? '#FF6B9D') + '30',
                      color: showcaseFilters[showcaseIndex]?.color,
                    }}
                  >
                    AI Filter
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Gloss overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Dot indicators */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {showcaseFilters.map((_, i) => (
              <button
                key={i}
                onClick={() => setShowcaseIndex(i)}
                className="rounded-full transition-all duration-300 tap-none"
                style={{
                  width: i === showcaseIndex ? 22 : 6,
                  height: 6,
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
          className="flex flex-wrap justify-center gap-2 max-w-xs mb-7"
        >
          {FEATURE_ITEMS.map(({ icon: Icon, labelId, labelEn }) => (
            <span
              key={labelId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white border"
              style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <Icon className="w-3 h-3 opacity-80" />
              {t(labelId, labelEn)}
            </span>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          id="start-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={() => setStep('take-select')}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.03 }}
          className="relative h-16 px-14 text-lg font-black text-white rounded-2xl overflow-hidden shadow-2xl tap-none shine"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 100%)',
            border: '2px solid rgba(255,255,255,0.45)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
          />
          <span className="relative z-10 tracking-widest uppercase">
            ✨ {t('Mulai Sesi', 'Start Session')}
          </span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-4 text-white/25 text-[10px] tracking-[0.35em] uppercase"
        >
          {t('Sentuh untuk memulai', 'Tap to begin')}
        </motion.p>
      </div>

      {/* ── Bottom branding ── */}
      <div className="relative z-10 pb-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-12 bg-white/15" />
          <p className="text-white/20 text-[9px] tracking-[0.4em] uppercase font-semibold">
            Powered by Gemini AI
          </p>
          <div className="h-px w-12 bg-white/15" />
        </div>
      </div>
    </div>
  );
}