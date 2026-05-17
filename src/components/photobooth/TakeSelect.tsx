'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotoboothStore } from '@/store/photobooth';
import { TAKE_OPTIONS, type TakeCount } from '@/types';

/* ── Grid preview renderer ───────────────────────────────────────────── */
function GridPreview({ count }: { count: TakeCount }) {
  if (count === 2) {
    return (
      <div className="w-full h-full grid grid-cols-1 gap-1.5 p-2">
        <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
        <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
      </div>
    );
  }
  if (count === 4) {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-1.5 p-2">
        <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
        <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
        <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
        <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
      </div>
    );
  }
  return (
    <div className="w-full h-full grid grid-cols-2 gap-1.5 p-2">
      <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
      <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
      <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
      <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
      <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
      <div className="rounded-lg bg-white/30 backdrop-blur-sm" />
    </div>
  );
}

/* ── Repeating watermark text ────────────────────────────────────────── */
function WatermarkRow({ offset = 0 }: { offset?: number }) {
  const text = 'BOOTH CANVMIN ';
  const repeated = text.repeat(8);
  return (
    <div
      className="whitespace-nowrap text-white/[0.07] font-black tracking-widest"
      style={{
        fontSize: '2.8rem',
        lineHeight: '1',
        transform: `translateX(${offset}px)`,
      }}
    >
      {repeated}
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
  zIndex?: number;
}

function Polaroid({ src, rotation, top, left, right, width = 110, zIndex = 1 }: PolaroidProps) {
  return (
    <div
      className="absolute shadow-2xl"
      style={{
        top,
        left,
        right,
        width,
        transform: `rotate(${rotation}deg)`,
        zIndex,
      }}
    >
      {/* Photo area */}
      <div
        className="rounded-sm overflow-hidden"
        style={{ height: width * 0.85, background: '#ddd' }}
      >
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* fallback gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #FFB3D1 0%, #E879A8 50%, #C2185B 100%)',
          }}
        />
      </div>
      {/* White bottom strip */}
      <div className="bg-white pt-1 pb-2 px-1" style={{ borderRadius: '0 0 3px 3px' }} />
    </div>
  );
}

const POLAROIDS: PolaroidProps[] = [
  { src: '/filters/anime-ghibli.png', rotation: -18, top: '8%', left: '-2%', width: 120, zIndex: 2 },
  { src: '/filters/cyberpunk.png',    rotation: 12,  top: '2%',  left: '18%', width: 105, zIndex: 1 },
  { src: '/filters/watercolor.png',   rotation: -8,  top: '55%', left: '-3%', width: 115, zIndex: 2 },
  { src: '/filters/comic.png',        rotation: 15,  top: '70%', left: '10%', width: 100, zIndex: 1 },
  { src: '/filters/anime-ghibli.png', rotation: -12, top: '5%',  right: '0%', width: 120, zIndex: 2 },
  { src: '/filters/cyberpunk.png',    rotation: 10,  top: '35%', right: '-2%',width: 110, zIndex: 1 },
  { src: '/filters/watercolor.png',   rotation: -15, top: '65%', right: '5%', width: 105, zIndex: 2 },
];

const FRAME_SUBTITLES: Record<TakeCount, string> = {
  2: 'Photostrip / Bookmark',
  4: 'Classic Grid',
  6: 'Story Teller',
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
      // Short delay for visual feedback then navigate
      setTimeout(() => setStep('camera'), 300);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden select-none" style={{ background: 'linear-gradient(135deg, #E8629A 0%, #C9479D 25%, #A83BA8 50%, #8B35B0 75%, #7B2FBE 100%)' }}>

      {/* ── Animated watermark background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex flex-col justify-around py-4 gap-2">
        {[0, -80, -40, -120, -20, -100, -60].map((offset, i) => (
          <motion.div
            key={i}
            animate={{ x: [offset, offset - 60, offset] }}
            transition={{ duration: 20 + i * 3, repeat: Infinity, ease: 'linear' }}
          >
            <WatermarkRow offset={0} />
          </motion.div>
        ))}
      </div>

      {/* ── Polaroid decorations ── */}
      <div className="absolute inset-0 pointer-events-none">
        {POLAROIDS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, rotate: p.rotation - 5 }}
            animate={{ opacity: 1, scale: 1, rotate: p.rotation }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Polaroid {...p} />
          </motion.div>
        ))}
      </div>

      {/* ── Top navbar ── */}
      <div className="relative z-20 flex items-center justify-between px-5 py-3" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)' }}>
        <span className="text-white font-bold text-base tracking-wide">Gemini</span>
        <div className="flex items-center gap-2">
          {/* Gemini logo placeholder */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="rgba(255,255,255,0.9)" />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="rgba(255,255,255,0.4)" />
            </svg>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>PRO</div>
      </div>

      {/* ── Center content ── */}
      <div className="relative z-10 flex flex-col items-center pt-6 pb-10 px-4">

        {/* Power of badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-5"
        >
          <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">POWER OF :</span>
          {/* Gemini icon */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-[10px] font-black">G</span>
          </div>
          <span className="text-white/50 text-sm font-bold">×</span>
          {/* Canvas icon */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-[10px] font-black">C</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-2"
        >
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg">
            <span className="italic">Pilih Format Grid</span>{' '}
            <br />
            Photobooth
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/70 text-xs text-center max-w-xs mb-8 leading-relaxed"
        >
          Berapa momen yang ingin kamu abadikan hari ini? Pilih salah satu grid-mu untuk memulai keajaiban AI
        </motion.p>

        {/* Frame cards */}
        <div className="flex items-end gap-4 justify-center w-full max-w-sm">
          {TAKE_OPTIONS.map((option, index) => {
            const count = option.count as TakeCount;
            const isSelected = selected === count;
            const isHovered = hovered === count;
            const isCenter = index === 1;

            return (
              <motion.button
                key={count}
                id={`frame-card-${count}`}
                initial={{ opacity: 0, y: 30, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  y: isCenter ? -12 : 0,
                  scale: isSelected || isHovered ? (isCenter ? 1.05 : 1.03) : (isCenter ? 1.0 : 0.95),
                }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                onHoverStart={() => setHovered(count)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => handleSelect(count)}
                className="relative flex flex-col items-center cursor-pointer tap-none"
                style={{ width: isCenter ? 130 : 110 }}
              >
                {/* Card */}
                <motion.div
                  animate={{
                    boxShadow: isSelected
                      ? '0 8px 32px rgba(255,107,200,0.5), 0 2px 8px rgba(0,0,0,0.3)'
                      : '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                  className="w-full rounded-2xl overflow-hidden"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(255,200,230,0.95), rgba(255,170,220,0.9))'
                      : 'rgba(255,255,255,0.85)',
                    border: isSelected ? '2.5px solid rgba(255,100,180,0.8)' : '2px solid rgba(255,255,255,0.6)',
                    height: isCenter ? 190 : 165,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <GridPreview count={count} />
                </motion.div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p className="text-white font-bold text-sm drop-shadow-md">
                    {count} Frame
                  </p>
                  <p className="text-white/60 text-[10px] font-medium">
                    {FRAME_SUBTITLES[count]}
                  </p>
                </div>

                {/* Selected indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #FF6B9D, #FF8A65)' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
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
          transition={{ delay: 0.6 }}
          className="mt-8 text-white/40 text-[11px] text-center tracking-wide"
        >
          Ketuk format untuk memulai sesi foto
        </motion.p>
      </div>

      {/* Bottom decorative gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }}
      />
    </div>
  );
}