'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Camera } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';

/* ── Floating particle — warm tones ─────────────────────────────────── */
function FloatingParticle({ delay, x, size, duration }: { delay: number; x: string; size: number; duration: number }) {
  return (
    <motion.div
      className="absolute bottom-0 rounded-full pointer-events-none"
      style={{
        left: x,
        width: size,
        height: size,
        background: 'radial-gradient(circle, rgba(200,121,65,0.5) 0%, transparent 70%)',
      }}
      animate={{ y: [0, -580], opacity: [0, 0.55, 0], scale: [0.4, 1, 0.7] }}
      transition={{ duration, delay, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

/* ── Scrolling editorial marquee ────────────────────────────────────── */
function MarqueeRow() {
  const text = 'AI PHOTOBOOTH ✦ CAPTURE ✦ TRANSFORM ✦ PRINT ✦ ';
  return (
    <div
      className="whitespace-nowrap font-display font-black tracking-[0.25em] select-none uppercase"
      style={{ fontSize: '1.8rem', color: 'rgba(200,121,65,0.07)', lineHeight: 1 }}
    >
      {text.repeat(8)}
    </div>
  );
}

/* ── Polaroid — now with warm editorial palette ──────────────────────── */
interface PolaroidProps {
  src: string; rotation: number; top: string; left?: string; right?: string; width?: number;
}
function Polaroid({ src, rotation, top, left, right, width = 110 }: PolaroidProps) {
  return (
    <div className="absolute pointer-events-none" style={{ top, left, right, width, transform: `rotate(${rotation}deg)` }}>
      {/* Frame — warm cream, not stark white */}
      <div className="overflow-hidden" style={{ background: '#f5ede0', padding: '6px 6px 0 6px', boxShadow: '2px 4px 18px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.7)' }}>
        <div className="relative overflow-hidden" style={{ height: width * 0.85 }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #c87941 0%, #8b4a1e 100%)' }} />
          <img
            src={src} alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Warm duotone overlay */}
          <div className="absolute inset-0" style={{ background: 'rgba(200,121,65,0.12)', mixBlendMode: 'multiply' }} />
        </div>
        <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 28, height: 3, background: '#e8d5c0', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

const POLAROIDS: PolaroidProps[] = [
  { src: '/filters/anime-ghibli.png', rotation: -14, top: '8%',  left: '4%',   width: 135 },
  { src: '/filters/cyberpunk.png',    rotation: 11,  top: '6%',  left: '22%',  width: 115 },
  { src: '/filters/watercolor.png',   rotation: -9,  top: '52%', left: '3%',   width: 125 },
  { src: '/filters/comic.png',        rotation: 17,  top: '73%', left: '18%',  width: 118 },
  { src: '/filters/anime-ghibli.png', rotation: 9,   top: '10%', right: '4%',  width: 140 },
  { src: '/filters/cyberpunk.png',    rotation: -13, top: '42%', right: '3%',  width: 125 },
  { src: '/filters/watercolor.png',   rotation: 14,  top: '70%', right: '16%', width: 112 },
  { src: '/filters/comic.png',        rotation: -18, top: '28%', left: '12%',  width: 105 },
  { src: '/filters/anime-ghibli.png', rotation: 22,  top: '22%', right: '22%', width: 95  },
];

const showcaseFilters = [
  { name: 'Anime Ghibli',  src: '/filters/anime-ghibli.png', accentHex: '#c87941', tag: 'FANTASY' },
  { name: 'Cyberpunk Neon',src: '/filters/cyberpunk.png',    accentHex: '#8a6ff0', tag: 'SCI-FI' },
  { name: 'Watercolor',    src: '/filters/watercolor.png',   accentHex: '#4ecb9e', tag: 'ART' },
  { name: 'Comic Book',    src: '/filters/comic.png',        accentHex: '#e8a02a', tag: 'POP' },
];

const PARTICLES = [
  { delay: 0.0, x: '8%',  size: 5,  duration: 11 },
  { delay: 1.2, x: '22%', size: 8,  duration: 13 },
  { delay: 2.1, x: '38%', size: 4,  duration: 9  },
  { delay: 3.0, x: '54%', size: 9,  duration: 12 },
  { delay: 3.8, x: '70%', size: 6,  duration: 10 },
  { delay: 5.0, x: '84%', size: 8,  duration: 14 },
  { delay: 6.2, x: '16%', size: 3,  duration: 8  },
  { delay: 7.0, x: '46%', size: 10, duration: 13 },
  { delay: 8.1, x: '62%', size: 5,  duration: 11 },
];

const FEATURES = [
  { label: '8 AI Filters',      sub: 'Styles',  glyph: '◈' },
  { label: 'QRIS Payment',      sub: 'Instant', glyph: '◉' },
  { label: 'Digital Download',  sub: 'HD File', glyph: '◎' },
  { label: 'Real-time AI',      sub: 'Process', glyph: '◇' },
];

/* ── Main ───────────────────────────────────────────────────────────── */
export default function IdleScreen() {
  const { setStep, language, setLanguage } = usePhotoboothStore();
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const handleAdminClick = useCallback(() => setStep('admin-login'), [setStep]);
  const t = (id: string, en: string) => (language === 'id' ? id : en);

  useEffect(() => {
    const iv = setInterval(() => setShowcaseIndex(p => (p + 1) % showcaseFilters.length), 3800);
    return () => clearInterval(iv);
  }, []);

  const current = showcaseFilters[showcaseIndex]!;

  return (
    <div
      className="relative min-h-screen overflow-hidden select-none flex flex-col"
      style={{ background: '#0c0a09' }}
    >
      {/* ── Film-grain noise texture ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", opacity: 0.45, animation: 'grain-shift 0.5s steps(1) infinite' }}
      />

      {/* ── Radial warm vignette — not a purple gradient fest ── */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 75% 60% at 62% 42%, rgba(200,121,65,0.09) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 50% 40% at 20% 80%, rgba(78,203,158,0.05) 0%, transparent 65%)' }} />

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {PARTICLES.map((p, i) => <FloatingParticle key={i} {...p} />)}
      </div>

      {/* ── Marquee watermark — scrolling editorial ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex flex-col justify-around py-2 gap-0">
        {[0,1,2,3,4,5,6,7].map((_, i) => (
          <motion.div key={i} animate={{ x: [0, i % 2 === 0 ? -160 : 160, 0] }} transition={{ duration: 28 + i * 3.5, repeat: Infinity, ease: 'linear', delay: i * 1.6 }}>
            <MarqueeRow />
          </motion.div>
        ))}
      </div>

      {/* ── Polaroids ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {POLAROIDS.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.72, rotate: p.rotation - 12 }}
            animate={{ opacity: 1, scale: 1, rotate: p.rotation }}
            transition={{ delay: i * 0.11, duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Polaroid {...p} />
          </motion.div>
        ))}
      </div>

      {/* ── Top bar — left-aligned, not centered ── */}
      <div
        className="relative z-20 flex items-center px-5 py-3 gap-4"
        style={{ background: 'rgba(12,10,9,0.72)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(200,121,65,0.1)' }}
      >
        {/* Brand mark — geometric, not a generic pill */}
        <div className="flex items-center gap-3">
          <div
            style={{ width: 30, height: 30, background: '#c87941', clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Camera className="w-3.5 h-3.5 text-[#0c0a09]" />
          </div>
          <span className="font-display font-black text-sm tracking-wider text-[#f0ebe3] uppercase" style={{ letterSpacing: '0.15em' }}>
            AI<span className="text-[#c87941]">.</span>Photobooth
          </span>
        </div>

        <div className="flex-1" />

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
          className="text-[10px] font-bold tracking-[0.2em] text-[#7a7168] hover:text-[#c87941] uppercase tap-none"
          style={{ transition: 'color 200ms cubic-bezier(0.33, 1, 0.68, 1)' }}
        >
          {language === 'id' ? 'EN' : 'ID'}
        </button>
        <button
          onClick={handleAdminClick}
          className="w-8 h-8 flex items-center justify-center text-[#7a7168] hover:text-[#c87941] tap-none"
          style={{ transition: 'color 200ms cubic-bezier(0.33, 1, 0.68, 1)' }}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* ── ASYMMETRIC main layout — left text / right visual ── */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center md:items-stretch px-5 md:px-8 py-6 gap-6">

        {/* LEFT — editorial text column */}
        <div className="flex flex-col justify-center md:w-[45%] md:pr-6">

          {/* Issue-style label */}
          <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="h-px w-8 bg-[#c87941]" />
            <span className="text-[9px] font-bold tracking-[0.35em] text-[#c87941] uppercase">
              {t('Powered by Gemini AI', 'Powered by Gemini AI')}
            </span>
          </motion.div>

          {/* Massive display headline — not centered, not gradient */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <h1 className="font-display font-black text-[#f0ebe3] leading-[0.92] text-balance mb-1" style={{ fontSize: 'clamp(2.6rem, 8vw, 4.4rem)' }}>
              Capture
            </h1>
            <h1 className="font-display font-black italic leading-[0.92] text-balance mb-1" style={{ fontSize: 'clamp(2.6rem, 8vw, 4.4rem)', color: '#c87941' }}>
              {t('Momen', 'Moments')}
            </h1>
            <h1 className="font-display font-black text-[#f0ebe3] leading-[0.92] text-balance" style={{ fontSize: 'clamp(2.6rem, 8vw, 4.4rem)' }}>
              With AI
            </h1>
          </motion.div>

          {/* Sub — small, precise */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            className="mt-4 text-[#7a7168] text-sm leading-relaxed max-w-[28ch] font-body"
          >
            {t('Abadikan momen dengan 8 filter AI eksklusif — langsung cetak digital berkualitas tinggi.', 'Eight AI-exclusive filters. Instant high-resolution digital prints.')}
          </motion.p>

          {/* Feature row — horizontal, tabular, not pills */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3"
          >
            {FEATURES.map(({ label, sub, glyph }) => (
              <div key={label} className="flex items-start gap-2">
                <span className="text-[#c87941] text-sm mt-0.5" style={{ fontVariant: 'normal' }}>{glyph}</span>
                <div>
                  <p className="text-[11px] font-bold text-[#f0ebe3] tracking-wide uppercase">{label}</p>
                  <p className="text-[10px] text-[#7a7168]">{sub}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA — geometric angled button, not pill gradient */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-7 flex items-center gap-4"
          >
            <motion.button
              id="start-button"
              onClick={() => setStep('take-select')}
              whileTap={{ scale: 0.963 }}
              className="btn-solid h-14 px-10 text-sm font-body press tap-none"
            >
              {t('✦ Mulai Sesi', '✦ Start Session')}
            </motion.button>

            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[10px] tracking-[0.3em] text-[#7a7168] uppercase font-body"
            >
              {t('Tap untuk mulai', 'Tap to begin')}
            </motion.p>
          </motion.div>
        </div>

        {/* RIGHT — visual panel, offset asymmetric */}
        <div className="flex flex-col items-center justify-center md:w-[55%] md:pl-4">

          {/* Filter showcase — not a rounded card on white */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative w-full max-w-[320px]"
          >
            {/* Accent edge — decorative vertical stripe */}
            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-[#c87941] to-transparent" />

            {/* Main showcase frame */}
            <div
              className="relative overflow-hidden ml-3"
              style={{
                aspectRatio: '3/4',
                background: '#151210',
                border: '1px solid rgba(200,121,65,0.18)',
                clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={showcaseIndex}
                  initial={{ opacity: 0, scale: 1.06, filter: 'brightness(0.6)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0"
                >
                  <img src={current.src} alt={current.name} className="w-full h-full object-cover" />
                  {/* Warm overlay — not a generic linear-gradient black */}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(12,10,9,0.85) 0%, rgba(12,10,9,0.1) 45%, transparent 65%)` }} />
                </motion.div>
              </AnimatePresence>

              {/* Bottom info — left-aligned, not centered */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <motion.span
                  key={`tag-${showcaseIndex}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[9px] font-bold tracking-[0.3em] uppercase mb-1.5 block"
                  style={{ color: current.accentHex }}
                >
                  {current.tag}
                </motion.span>
                <motion.p
                  key={`name-${showcaseIndex}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display font-bold text-xl text-[#f0ebe3] leading-tight"
                >
                  {current.name}
                </motion.p>
              </div>

              {/* Angled corner cut indicator */}
              <div className="absolute top-0 right-0 w-0 h-0" style={{ borderLeft: '18px solid transparent', borderTop: `18px solid #c87941` }} />
            </div>

            {/* Progress indicator — dots replaced by line segments */}
            <div className="flex gap-1.5 mt-4 ml-3">
              {showcaseFilters.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setShowcaseIndex(i)}
                  className="tap-none press"
                  style={{
                    height: 2,
                    width: i === showcaseIndex ? 24 : 10,
                    background: i === showcaseIndex ? '#c87941' : 'rgba(200,121,65,0.2)',
                    transition: 'width 280ms cubic-bezier(0.33, 1, 0.68, 1), background 280ms',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom stamp — not a centered footer ── */}
      <div className="relative z-10 px-5 pb-4 flex items-end justify-between">
        <span className="text-[9px] tracking-[0.4em] text-[#2c2822] uppercase font-body">BOOTH CANVMIN</span>
        <span className="text-[9px] tracking-[0.4em] text-[#2c2822] uppercase font-body">© 2025</span>
      </div>
    </div>
  );
}