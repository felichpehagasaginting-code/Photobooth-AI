'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { TAKE_OPTIONS, type TakeCount } from '@/types';

/* ── Grid sketch preview — warm tones ────────────────────────────────── */
function GridSketch({ count }: { count: TakeCount }) {
  if (count === 2) return (
    <div className="w-full h-full flex flex-col gap-1.5 p-3">
      {[0,1].map(i => <div key={i} className="flex-1 rounded-sm" style={{ background: 'rgba(200,121,65,0.22)', border: '1px solid rgba(200,121,65,0.15)' }} />)}
    </div>
  );
  if (count === 4) return (
    <div className="w-full h-full grid grid-cols-2 gap-1.5 p-3">
      {[0,1,2,3].map(i => <div key={i} className="rounded-sm" style={{ background: 'rgba(200,121,65,0.22)', border: '1px solid rgba(200,121,65,0.15)' }} />)}
    </div>
  );
  return (
    <div className="w-full h-full grid grid-cols-2 gap-1 p-2.5">
      {[0,1,2,3,4,5].map(i => <div key={i} className="rounded-sm" style={{ background: 'rgba(200,121,65,0.22)', border: '1px solid rgba(200,121,65,0.15)' }} />)}
    </div>
  );
}

const FRAME_META: Record<TakeCount, { subtitle: string; tag: string; accent: string; index: number }> = {
  2: { subtitle: 'Photostrip',   tag: 'MINIMAL', accent: '#4ecb9e', index: 0 },
  4: { subtitle: 'Classic Grid', tag: 'POPULER', accent: '#c87941', index: 1 },
  6: { subtitle: 'Story Pack',   tag: 'LENGKAP', accent: '#e8a02a', index: 2 },
};

const POLAROID_SRCS = ['/filters/anime-ghibli.png','/filters/cyberpunk.png','/filters/watercolor.png','/filters/comic.png'];

function ScatteredPolaroid({ src, rotation, top, left, right, width = 100 }: { src: string; rotation: number; top: string; left?: string; right?: string; width?: number }) {
  return (
    <div className="absolute pointer-events-none" style={{ top, left, right, width, transform: `rotate(${rotation}deg)` }}>
      <div style={{ background: '#f5ede0', padding: '5px 5px 0 5px', boxShadow: '2px 4px 16px rgba(0,0,0,0.6)' }}>
        <div className="relative overflow-hidden" style={{ height: width * 0.82 }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #c87941 0%, #8b4a1e 100%)' }} />
          <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="absolute inset-0" style={{ background: 'rgba(200,121,65,0.1)', mixBlendMode: 'multiply' }} />
        </div>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

const BG_POLAROIDS = [
  { src: POLAROID_SRCS[0]!, rotation: -13, top: '6%',  left: '2%',   width: 120 },
  { src: POLAROID_SRCS[1]!, rotation: 10,  top: '5%',  right: '4%',  width: 108 },
  { src: POLAROID_SRCS[2]!, rotation: -9,  top: '60%', left: '2%',   width: 115 },
  { src: POLAROID_SRCS[3]!, rotation: 16,  top: '72%', right: '5%',  width: 105 },
  { src: POLAROID_SRCS[0]!, rotation: 20,  top: '28%', left: '8%',   width: 88  },
  { src: POLAROID_SRCS[1]!, rotation: -17, top: '35%', right: '6%',  width: 95  },
];

/* ── Main ───────────────────────────────────────────────────────────── */
export default function TakeSelect() {
  const { setStep, setTakeConfig, takeCount } = usePhotoboothStore();
  const [selected, setSelected] = useState<TakeCount>(takeCount);
  const [hovered, setHovered] = useState<TakeCount | null>(null);

  const handleSelect = (count: TakeCount) => {
    setSelected(count);
    const option = TAKE_OPTIONS.find(o => o.count === count);
    if (option) {
      setTakeConfig(option.count, option.filtersPerTake);
      setTimeout(() => setStep('camera'), 300);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden select-none flex flex-col" style={{ background: '#0c0a09' }}>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", opacity: 0.4, animation: 'grain-shift 0.5s steps(1) infinite' }}
      />

      {/* Warm radial accent */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(200,121,65,0.07) 0%, transparent 70%)' }} />

      {/* Scattered polaroids */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {BG_POLAROIDS.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.75, rotate: p.rotation - 10 }}
            animate={{ opacity: 1, scale: 1, rotate: p.rotation }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <ScatteredPolaroid {...p} />
          </motion.div>
        ))}
      </div>

      {/* ── Navbar ── */}
      <div className="relative z-20 flex items-center gap-3 px-5 py-3"
        style={{ background: 'rgba(12,10,9,0.72)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(200,121,65,0.1)' }}
      >
        <button
          onClick={() => setStep('idle')}
          className="w-9 h-9 flex items-center justify-center text-[#7a7168] hover:text-[#c87941] tap-none"
          style={{ transition: 'color 200ms cubic-bezier(0.33, 1, 0.68, 1)' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-black text-sm tracking-[0.15em] text-[#f0ebe3] uppercase">
          AI<span className="text-[#c87941]">.</span>Photobooth
        </span>
        <div className="flex-1" />
        <div className="text-[9px] font-bold tracking-[0.3em] text-[#c87941] uppercase border border-[#c87941]/30 px-2 py-0.5">
          PRO
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1 px-5 pt-6 pb-8">

        {/* Left-aligned heading — not centered */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-5 bg-[#c87941]" />
            <span className="text-[9px] font-bold tracking-[0.35em] text-[#c87941] uppercase">Format</span>
          </div>
          <h1 className="font-display font-black leading-[0.9] text-[#f0ebe3]" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>
            Pilih Grid
          </h1>
          <h1 className="font-display font-black italic leading-[0.9] text-[#c87941]" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>
            Photobooth
          </h1>
          <p className="mt-3 text-[#7a7168] text-sm font-body leading-relaxed max-w-[30ch]">
            Berapa momen yang ingin kamu abadikan?
          </p>
        </motion.div>

        {/* Frame cards — staggered, not rigid 3-column */}
        <div className="mt-8 flex items-end justify-center gap-4 flex-1 max-h-[320px]">
          {TAKE_OPTIONS.map((option, index) => {
            const count = option.count as TakeCount;
            const isSelected = selected === count;
            const isHovered = hovered === count;
            const isCenter = index === 1;
            const meta = FRAME_META[count];
            const isActive = isSelected || isHovered;

            return (
              <motion.button
                key={count}
                id={`frame-card-${count}`}
                initial={{ opacity: 0, y: 28, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  y: isCenter ? -16 : 0,
                  scale: isActive ? (isCenter ? 1.05 : 1.03) : (isCenter ? 1 : 0.93),
                }}
                transition={{ delay: index * 0.09 + 0.18, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                onHoverStart={() => setHovered(count)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => handleSelect(count)}
                className="relative flex flex-col items-center cursor-pointer tap-none"
                style={{ width: isCenter ? 126 : 108 }}
              >
                {/* Rank tag — sharp edged, not pill */}
                {isCenter && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
                    className="mb-2 px-2 py-0.5 text-[8px] font-bold tracking-[0.3em] uppercase"
                    style={{ background: meta.accent, color: '#0c0a09' }}
                  >
                    {meta.tag}
                  </motion.div>
                )}

                {/* Card — dark surface, copper border when selected */}
                <motion.div
                  animate={{
                    borderColor: isSelected ? `${meta.accent}80` : isHovered ? `${meta.accent}30` : 'rgba(44,40,34,0.8)',
                    boxShadow: isSelected ? `0 6px 32px ${meta.accent}30, 0 2px 6px rgba(0,0,0,0.6)` : '0 2px 12px rgba(0,0,0,0.5)',
                  }}
                  transition={{ duration: 0.28 }}
                  className="w-full overflow-hidden"
                  style={{
                    height: isCenter ? 188 : 162,
                    background: isSelected ? `rgba(200,121,65,0.06)` : '#151210',
                    border: '1.5px solid',
                  }}
                >
                  <GridSketch count={count} />
                </motion.div>

                {/* Label */}
                <div className="mt-2.5 text-center">
                  <p className="text-[#f0ebe3] font-body font-bold text-sm">{count} Frame</p>
                  <p className="text-[#7a7168] text-[10px] mt-0.5 font-body">{meta.subtitle}</p>
                </div>

                {/* Selected check — sharp corner cut, not rounded pill */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                      className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center"
                      style={{ background: meta.accent, clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }}
                    >
                      <Check className="w-3 h-3 text-[#0c0a09]" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Bottom hint */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="mt-6 text-center text-[10px] tracking-[0.25em] text-[#2c2822] uppercase font-body"
        >
          Ketuk untuk memulai sesi foto
        </motion.p>
      </div>

      {/* Bottom edge accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(200,121,65,0.3), transparent)' }} />
    </div>
  );
}