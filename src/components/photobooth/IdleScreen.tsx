'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Settings, Camera } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';

/* ── Floating particle — premium cool tones ─────────────────────────── */
function FloatingOrb({ delay, x, size, duration, color }: { delay: number; x: string; size: number; duration: number; color: string }) {
  return (
    <motion.div
      className="absolute bottom-0 rounded-full pointer-events-none"
      style={{
        left: x, width: size, height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(2px)',
      }}
      animate={{ y: [0, -600], opacity: [0, 0.65, 0], scale: [0.3, 1.1, 0.6] }}
      transition={{ duration, delay, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

/* ── Live ticker tape ── */
function TickerTape({ reversed, rowIndex }: { reversed?: boolean; rowIndex: number }) {
  const items = [
    'AI PHOTOBOOTH', '✦ CAPTURE', '✦ TRANSFORM', '✦ PRINT',
    '✦ GHIBLI', '✦ CYBERPUNK', '✦ WATERCOLOR', '✦ COMIC'
  ];
  const text = items.join('  ');
  return (
    <div className="whitespace-nowrap overflow-hidden opacity-[0.035]" style={{ transform: `skewY(-${rowIndex % 2 === 0 ? 0 : 0}deg)` }}>
      <motion.span
        className="font-display font-black tracking-[0.2em] uppercase inline-block"
        style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--copper)', lineHeight: 1 }}
        animate={{ x: reversed ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ duration: 22 + rowIndex * 4, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
      >
        {text.repeat(6)}
      </motion.span>
    </div>
  );
}

/* ── Magnetic CTA button ── */
function MagneticButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-30, 30], [6, -6]);
  const rotateY = useTransform(x, [-60, 60], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.button
      ref={ref}
      id="start-button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      whileTap={{ scale: 0.94 }}
      className="relative group btn-solid h-16 px-12 text-sm font-body tap-none overflow-hidden"
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.18) 50%, transparent 80%)' }}
        animate={{ x: ['-200%', '200%'] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.8 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

/* ── Filter showcase card ── */
interface ShowcaseFilter { name: string; src: string; accentHex: string; tag: string; filterCSS: string; }

const showcaseFilters: ShowcaseFilter[] = [
  { name: 'Anime Ghibli',   src: '/filters/anime-ghibli.png', accentHex: '#2b5cf6', tag: 'FANTASY',  filterCSS: 'saturate(120%) brightness(105%)' },
  { name: 'Cyberpunk Neon', src: '/filters/cyberpunk.png',    accentHex: '#8a6ff0', tag: 'SCI-FI',   filterCSS: 'hue-rotate(270deg) saturate(180%) contrast(110%)' },
  { name: 'Watercolor Art', src: '/filters/watercolor.png',   accentHex: '#2dd4bf', tag: 'ART',      filterCSS: 'saturate(130%) brightness(108%) contrast(95%)' },
  { name: 'Comic Book',     src: '/filters/comic.png',        accentHex: '#9cb6f9', tag: 'POP ART',  filterCSS: 'saturate(160%) contrast(130%)' },
];

const ORBS = [
  { delay: 0.0,  x: '5%',  size: 6,  duration: 11, color: 'rgba(43,92,246,0.5)'  }, // cobalt
  { delay: 1.5,  x: '18%', size: 10, duration: 14, color: 'rgba(156,182,249,0.4)' }, // ice sapphire
  { delay: 2.8,  x: '33%', size: 5,  duration: 9,  color: 'rgba(43,92,246,0.4)'  }, 
  { delay: 4.2,  x: '52%', size: 12, duration: 13, color: 'rgba(45,212,191,0.3)' }, // turquoise
  { delay: 5.0,  x: '68%', size: 7,  duration: 11, color: 'rgba(43,92,246,0.4)'  }, 
  { delay: 6.5,  x: '82%', size: 9,  duration: 15, color: 'rgba(156,182,249,0.35)' }, 
  { delay: 8.0,  x: '12%', size: 4,  duration: 8,  color: 'rgba(45,212,191,0.4)'  }, 
  { delay: 9.3,  x: '44%', size: 11, duration: 12, color: 'rgba(43,92,246,0.3)'  }, 
  { delay: 10.5, x: '76%', size: 6,  duration: 10, color: 'rgba(156,182,249,0.4)' }, 
];

const FEATURES = [
  { label: '15+ Frame Layouts', sub: 'Photogrid',  glyph: '◈' },
  { label: 'QRIS Payment',       sub: 'Instant',   glyph: '◉' },
  { label: 'HD Digital Print',   sub: 'Download',  glyph: '◎' },
  { label: 'Gemini AI Engine',   sub: 'Realtime',  glyph: '◇' },
];

export default function IdleScreen() {
  const { setStep, language, setLanguage } = usePhotoboothStore();
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [filterHovered, setFilterHovered] = useState(false);
  const handleAdminClick = useCallback(() => setStep('admin-login'), [setStep]);
  const t = (id: string, en: string) => (language === 'id' ? id : en);

  useEffect(() => {
    const iv = setInterval(() => setShowcaseIndex(p => (p + 1) % showcaseFilters.length), 4200);
    return () => clearInterval(iv);
  }, []);

  const current = showcaseFilters[showcaseIndex]!;

  return (
    <div className="relative min-h-screen overflow-hidden select-none flex flex-col" style={{ background: '#030611' }}>

      {/* ── Animated film grain ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.45, animation: 'grain-shift 0.5s steps(1) infinite',
        }}
      />

      {/* ── Depth gradients ── */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 65% 40%, rgba(43,92,246,0.07) 0%, transparent 65%)' }} />
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 50% 50% at 15% 85%, rgba(45,212,191,0.05) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 40% 30% at 90% 5%, rgba(156,182,249,0.04) 0%, transparent 60%)' }} />

      {/* ── Floating orbs ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {ORBS.map((o, i) => <FloatingOrb key={i} {...o} />)}
      </div>

      {/* ── Ticker tape rows ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex flex-col justify-around py-4">
        {[0,1,2,3,4,5,6,7].map((_, i) => (
          <TickerTape key={i} reversed={i % 2 === 1} rowIndex={i} />
        ))}
      </div>

      {/* ── Diagonal accent line ── */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          top: 0, left: '55%', width: 1, height: '100%',
          background: 'linear-gradient(to bottom, transparent, rgba(43,92,246,0.08) 30%, rgba(43,92,246,0.12) 60%, transparent)',
          transform: 'skewX(-12deg)',
        }}
      />

      {/* ── Top bar ── */}
      <div
        className="relative z-20 flex items-center px-6 lg:px-12 py-4 gap-4"
        style={{ background: 'rgba(3,6,17,0.85)', backdropFilter: 'blur(20px) saturate(160%)', borderBottom: '1px solid rgba(43,92,246,0.1)' }}
      >
        {/* Brand wordmark — geometric */}
        <motion.div
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div style={{ width: 32, height: 32, background: 'var(--copper)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-black text-base tracking-wider text-[#f1f4fb] uppercase leading-none" style={{ letterSpacing: '0.14em' }}>
              AI<span className="text-var(--copper)">.</span>Booth
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2dd4bf' }} />
              <span className="text-[8px] tracking-[0.3em] text-[#2dd4bf] uppercase font-body">Live</span>
            </div>
          </div>
        </motion.div>

        <div className="flex-1" />

        {/* Nav actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="text-[9px] font-bold tracking-[0.25em] text-[#7687a1] hover:text-var(--copper) uppercase tap-none px-2.5 py-1 border border-transparent hover:border-[#2b5cf6]/30 transition-all font-body"
          >
            {language === 'id' ? 'EN' : 'ID'}
          </button>
          <button
            onClick={handleAdminClick}
            title="Admin Settings"
            aria-label="Admin Settings"
            className="w-8 h-8 flex items-center justify-center text-[#7687a1] hover:text-var(--copper) tap-none"
          >
            <Settings className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* ── ASYMMETRIC main layout ── */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-stretch px-6 md:px-12 lg:px-16 py-8 gap-10 md:gap-20">

        {/* LEFT — editorial text column */}
        <div className="flex flex-col justify-center md:w-[52%]">

          {/* Issue-style label with animated dash */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="flex items-center gap-3 mb-5">
            <motion.div
              className="h-px bg-var(--copper)"
              initial={{ width: 0 }} animate={{ width: 32 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            />
            <span className="text-[9px] font-bold tracking-[0.4em] text-var(--copper) uppercase">
              {t('Powered by Gemini AI', 'Powered by Gemini AI')}
            </span>
          </motion.div>

          {/* Massive stacked headline */}
          <div className="overflow-hidden mb-1">
            <motion.h1
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
              className="font-display font-black leading-[0.88] text-[#f1f4fb]"
              style={{ fontSize: 'clamp(2.8rem, 9vw, 5.5rem)' }}
            >
              Capture
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-1">
            <motion.h1
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
              className="font-display font-black italic leading-[0.88] text-gradient-copper"
              style={{ fontSize: 'clamp(2.8rem, 9vw, 5.5rem)' }}
            >
              {t('Momen', 'Moments')}
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
              className="font-display font-black leading-[0.88] text-[#f1f4fb]"
              style={{ fontSize: 'clamp(2.8rem, 9vw, 5.5rem)' }}
            >
              With AI
            </motion.h1>
          </div>

          {/* Sub copy */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-[#7687a1] text-sm leading-relaxed max-w-[32ch] font-body mb-7"
          >
            {t(
              'Abadikan momen dengan 8+ filter AI eksklusif — hasilkan foto grid premium berkualitas tinggi.',
              '8+ exclusive AI filters. Premium photo-grid output. Print-ready resolution.'
            )}
          </motion.p>

          {/* Feature grid — compact, tabular, editorial */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="grid grid-cols-2 gap-x-6 gap-y-3 mb-8"
          >
            {FEATURES.map(({ label, sub, glyph }) => (
              <div key={label} className="flex items-start gap-2.5">
                <span className="text-var(--copper) text-base mt-0.5 font-mono">{glyph}</span>
                <div>
                  <p className="text-[11px] font-bold text-[#f1f4fb] tracking-wide uppercase font-body">{label}</p>
                  <p className="text-[9px] text-[#7687a1] tracking-wider uppercase font-body">{sub}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA group */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex items-center gap-5"
          >
            <MagneticButton onClick={() => setStep('take-select')}>
              {t('✦ Mulai Sesi', '✦ Start Session')}
            </MagneticButton>

            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-[9px] tracking-[0.35em] text-[#7687a1] uppercase font-body leading-none">
                {t('Ketuk', 'Tap to')}<br />
                {t('untuk mulai', 'begin')}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT — filter showcase panel */}
        <div className="flex flex-col items-center justify-center md:w-[48%]">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="relative w-full max-w-[300px] md:max-w-[340px]"
          >
            {/* Left edge accent */}
            <div className="absolute left-0 top-6 bottom-6 w-0.5" style={{ background: 'linear-gradient(to bottom, transparent, var(--copper) 30%, var(--copper) 70%, transparent)' }} />

            {/* Main frame — sharp geometric, not a card */}
            <div
              className="relative overflow-hidden ml-4 cursor-pointer"
              onMouseEnter={() => setFilterHovered(true)}
              onMouseLeave={() => setFilterHovered(false)}
              style={{
                aspectRatio: '3/4',
                background: '#0a0e1c',
                border: '1px solid rgba(43,92,246,0.18)',
                clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={showcaseIndex}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: filterHovered ? 1.04 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0"
                >
                  <img
                    src={current.src} alt={current.name}
                    className="w-full h-full object-cover"
                    style={{ filter: filterHovered ? current.filterCSS : 'none', transition: 'filter 0.6s ease' }}
                  />
                  {/* Directional gradient ── Obsidian Ink base */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,6,17,0.92) 0%, rgba(3,6,17,0.2) 50%, transparent 70%)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(3,6,17,0.3) 0%, transparent 40%)' }} />
                </motion.div>
              </AnimatePresence>

              {/* HUD overlay — top */}
              <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2dd4bf' }} />
                  <span className="text-[8px] font-bold tracking-[0.25em] text-[#7687a1] uppercase font-body">AI Preview</span>
                </div>
                <span className="text-[8px] font-mono text-var(--edge)">{String(showcaseIndex + 1).padStart(2, '0')}/{String(showcaseFilters.length).padStart(2, '0')}</span>
              </div>

              {/* Bottom info — left aligned */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <AnimatePresence mode="wait">
                  <motion.div key={showcaseIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                    <span className="text-[9px] font-bold tracking-[0.35em] uppercase mb-2 block" style={{ color: current.accentHex }}>
                      {current.tag}
                    </span>
                    <p className="font-display font-bold text-2xl text-[#f1f4fb] leading-tight">
                      {current.name}
                    </p>
                    <p className="text-[9px] text-[#7687a1] mt-1 font-body tracking-wider">
                      {filterHovered ? t('Filter aktif', 'Filter active') : t('Hover untuk preview', 'Hover to preview')}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Angled corner cut */}
              <div className="absolute top-0 right-0 w-0 h-0" style={{ borderLeft: '22px solid transparent', borderTop: '22px solid var(--copper)' }} />

              {/* Scan line effect */}
              <motion.div
                className="absolute left-0 right-0 h-px pointer-events-none"
                style={{ background: 'rgba(43,92,246,0.15)' }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Progress — line segments */}
            <div className="flex gap-1.5 mt-4 ml-4">
              {showcaseFilters.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setShowcaseIndex(i)}
                  title={`View showcase filter ${f.name}`}
                  aria-label={`View showcase filter ${f.name}`}
                  className="tap-none"
                  style={{
                    height: 2,
                    width: i === showcaseIndex ? 28 : 8,
                    background: i === showcaseIndex ? current.accentHex : 'rgba(43,92,246,0.18)',
                    transition: 'width 320ms cubic-bezier(0.33, 1, 0.68, 1), background 320ms',
                  }}
                />
              ))}
            </div>

            {/* Filter name row */}
            <div className="flex gap-2 mt-3 ml-4 overflow-x-auto scrollbar-thin">
              {showcaseFilters.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setShowcaseIndex(i)}
                  className="shrink-0 tap-none press"
                  style={{
                    padding: '3px 8px',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: i === showcaseIndex ? '#030611' : '#7687a1',
                    background: i === showcaseIndex ? current.accentHex : 'transparent',
                    border: `1px solid ${i === showcaseIndex ? current.accentHex : 'rgba(29,39,64,0.6)'}`,
                    transition: 'all 280ms cubic-bezier(0.33, 1, 0.68, 1)',
                  }}
                >
                  {f.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="relative z-10 px-6 lg:px-12 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-px w-6" style={{ background: 'rgba(43,92,246,0.3)' }} />
          <span className="text-[8px] tracking-[0.4em] text-[#1d2740] uppercase font-body">Booth Canvas Studio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#2dd4bf' }} />
          <span className="text-[8px] tracking-[0.3em] text-[#1d2740] uppercase font-body">System Online</span>
        </div>
      </div>

      {/* Bottom edge gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(43,92,246,0.3), transparent)' }} />
    </div>
  );
}