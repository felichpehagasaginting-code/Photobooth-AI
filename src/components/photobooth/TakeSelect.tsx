'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { TAKE_OPTIONS, type TakeCount } from '@/types';

/* ── Grid preview renderer ───────────────────────────────────────────── */
function GridPreview({ count }: { count: TakeCount }) {
  if (count === 2) {
    return (
      <div className="w-full h-full grid grid-cols-1 gap-2 p-3">
        <div className="rounded-xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm" />
        <div className="rounded-xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm" />
      </div>
    );
  }
  if (count === 4) {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-2 p-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm" />
        ))}
      </div>
    );
  }
  return (
    <div className="w-full h-full grid grid-cols-2 gap-1.5 p-2.5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm" />
      ))}
    </div>
  );
}

/* ── Repeating watermark text ────────────────────────────────────────── */
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

/* ── Floating polaroid decoration ────────────────────────────────────── */
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
      className="absolute shadow-2xl"
      style={{ top, left, right, width, transform: `rotate(${rotation}deg)` }}
    >
      <div className="rounded-sm overflow-hidden relative" style={{ height: width * 0.85 }}>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #FFB3D1 0%, #E879A8 50%, #C2185B 100%)' }}
        />
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
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

const FRAME_META: Record<TakeCount, { subtitle: string; tag: string; color: string; emoji: string }> = {
  2: { subtitle: 'Photostrip', tag: 'POPULER', color: '#FF6B9D', emoji: '🎞️' },
  4: { subtitle: 'Classic Grid', tag: 'TERBAIK', color: '#A855F7', emoji: '📸' },
  6: { subtitle: 'Story Teller', tag: 'LENGKAP', color: '#06D6A0', emoji: '✨' },
};

/* ── Main Component ──────────────────────────────────────────────────── */
export default function TakeSelect() {
  const { setStep, setTakeConfig, takeCount } = usePhotoboothStore();
  const [selected, setSelected] = useState<TakeCount>(takeCount);
  const [hovered, setHovered] = useState<TakeCount | null>(null);

  const handleSelect = (count: TakeCount) => {
    setSelected(count);
    const option = TAKE_OPTIONS.find((o) => o.count === count);
    if (option) {
      setTakeConfig(option.count, option.filtersPerTake);
      setTimeout(() => setStep('camera'), 320);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden select-none flex flex-col"
      style={{ background: 'linear-gradient(160deg, #D94F8A 0%, #B03EA0 28%, #8B35B0 58%, #6B28C8 80%, #5A21DA 100%)' }}
    >
      {/* ── Ambient glow ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 right-1/3 w-80 h-80 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #FFD6E8 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Watermark background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex flex-col justify-around py-4 gap-2">
        {[0, -80, -40, -120, -20, -100, -60].map((_, i) => (
          <motion.div
            key={i}
            animate={{ x: [0, -80, 0] }}
            transition={{ duration: 22 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 1.2 }}
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
            initial={{ opacity: 0, scale: 0.75, rotate: p.rotation - 8 }}
            animate={{ opacity: 1, scale: 1, rotate: p.rotation }}
            transition={{ delay: i * 0.1, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
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
        <button
          onClick={() => setStep('idle')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 tap-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-white font-black text-base tracking-wider" style={{ fontFamily: 'var(--font-outfit)' }}>
          AI Photobooth
        </span>

        <div
          className="px-3 py-1 rounded-full text-xs font-black text-white tracking-wider"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          PRO
        </div>
      </div>

      {/* ── Center content ── */}
      <div className="relative z-10 flex flex-col items-center pt-5 pb-10 px-4 flex-1">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-2"
        >
          <h1
            className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg text-balance"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            <span className="italic">Pilih Format</span>{' '}
            Grid Photobooth
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="text-white/65 text-xs text-center max-w-[260px] mb-8 leading-relaxed"
        >
          Berapa momen yang ingin kamu abadikan hari ini?
        </motion.p>

        {/* Frame cards */}
        <div className="flex items-end gap-4 justify-center w-full max-w-sm">
          {TAKE_OPTIONS.map((option, index) => {
            const count = option.count as TakeCount;
            const isSelected = selected === count;
            const isHovered = hovered === count;
            const isCenter = index === 1;
            const meta = FRAME_META[count];

            return (
              <motion.button
                key={count}
                id={`frame-card-${count}`}
                initial={{ opacity: 0, y: 32, scale: 0.82 }}
                animate={{
                  opacity: 1,
                  y: isCenter ? -14 : 0,
                  scale: isSelected || isHovered
                    ? (isCenter ? 1.06 : 1.04)
                    : (isCenter ? 1.01 : 0.94),
                }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                onHoverStart={() => setHovered(count)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => handleSelect(count)}
                className="relative flex flex-col items-center cursor-pointer tap-none"
                style={{ width: isCenter ? 132 : 112 }}
              >
                {/* Badge tag */}
                {isCenter && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-2 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest"
                    style={{ background: meta.color, color: '#000' }}
                  >
                    {meta.tag}
                  </motion.div>
                )}

                {/* Card */}
                <motion.div
                  animate={{
                    boxShadow: isSelected
                      ? `0 8px 40px ${meta.color}55, 0 2px 8px rgba(0,0,0,0.4)`
                      : '0 4px 24px rgba(0,0,0,0.35)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-full rounded-2xl overflow-hidden"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(255,210,240,0.96), rgba(255,180,230,0.92))'
                      : 'rgba(255,255,255,0.88)',
                    border: isSelected
                      ? `2.5px solid ${meta.color}CC`
                      : '2px solid rgba(255,255,255,0.6)',
                    height: isCenter ? 195 : 170,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <GridPreview count={count} />
                </motion.div>

                {/* Label */}
                <div className="mt-2.5 text-center">
                  <p className="text-white font-black text-sm drop-shadow-md flex items-center justify-center gap-1.5">
                    <span>{meta.emoji}</span>
                    <span>{count} Frame</span>
                  </p>
                  <p className="text-white/55 text-[10px] font-medium mt-0.5">
                    {meta.subtitle}
                  </p>
                </div>

                {/* Selected indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${meta.color}, #FF8A65)` }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Hint text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-white/35 text-[11px] text-center tracking-wider"
        >
          Ketuk format untuk memulai sesi foto ✨
        </motion.p>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)' }}
      />
    </div>
  );
}