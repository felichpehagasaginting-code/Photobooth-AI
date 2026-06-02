'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { TAKE_OPTIONS, type TakeCount } from '@/types';

interface OptionMeta { subtitle: string; tag: string; accent: string; desc: string; icon: string; }

const FRAME_META: Record<TakeCount, OptionMeta> = {
  2: { subtitle: 'Photostrip',   tag: 'MINIMAL',  accent: '#2dd4bf', desc: 'Foto vertikal klasik — cepat dan elegan.', icon: '▬' }, // turquoise
  4: { subtitle: 'Classic Grid', tag: '★ POPULER', accent: '#2b5cf6', desc: 'Format 2×2 ikonik, paling banyak dipilih.', icon: '▪' }, // cobalt
  6: { subtitle: 'Story Pack',   tag: 'LENGKAP',  accent: '#9cb6f9', desc: 'Enam foto untuk cerita yang lebih kaya.', icon: '▤' }, // sapphire
};

/* ── Animated grid sketch preview ── */
function GridSketch({ count, accent, isActive }: { count: TakeCount; accent: string; isActive: boolean }) {
  const cells = Array.from({ length: count });
  const isStrip = count === 2;
  const cols = isStrip ? 1 : 2;

  return (
    <div
      className={`w-full h-full p-4 grid gap-1.5`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {cells.map((_, i) => (
        <motion.div
          key={i}
          style={{
            background: isActive ? `${accent}25` : 'rgba(43,92,246,0.06)',
            border: `1px solid ${isActive ? `${accent}50` : 'rgba(43,92,246,0.12)'}`,
          }}
          animate={{ opacity: isActive ? [0.7, 1, 0.7] : 1 }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </div>
  );
}

export default function TakeSelect() {
  const { setStep, setTakeConfig, takeCount, setSelectedPackage } = usePhotoboothStore();
  const [selected, setSelected] = useState<TakeCount>(takeCount);
  const [hovered, setHovered] = useState<TakeCount | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (count: TakeCount) => {
    setSelected(count);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    const option = TAKE_OPTIONS.find(o => o.count === selected);
    if (option) {
      setTakeConfig(option.count, option.filtersPerTake);
      setSelectedPackage({
        id: `pkg-${option.count}`,
        name: option.label,
        description: `Sesi foto ${option.count}x dengan ${option.filtersPerTake} filter AI`,
        price: option.totalPrice,
        filterCount: option.filtersPerTake,
        active: true,
        sortOrder: option.count === 2 ? 1 : option.count === 4 ? 2 : 3
      });
      setTimeout(() => setStep('camera'), 600);
    }
  };

  const selectedMeta = FRAME_META[selected];

  return (
    <div className="relative min-h-screen overflow-hidden select-none flex flex-col" style={{ background: '#030611' }}>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }}
      />

      {/* Cool radial accent */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ background: `radial-gradient(ellipse 50% 60% at 50% 80%, ${selectedMeta.accent}12 0%, transparent 70%)`, transition: 'background 500ms' }}
      />

      {/* ── Navbar ── */}
      <div className="relative z-20 flex items-center gap-3 px-6 lg:px-12 py-4"
        style={{ background: 'rgba(3,6,17,0.85)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(43,92,246,0.1)' }}
      >
        <button
          onClick={() => setStep('idle')}
          title="Back"
          aria-label="Back"
          className="w-9 h-9 flex items-center justify-center text-[#7687a1] hover:text-var(--copper) tap-none press"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="h-4 w-px" style={{ background: 'rgba(29,39,64,0.8)' }} />

        <div className="flex items-center gap-2">
          <div className="h-px w-4 bg-var(--copper)" />
          <span className="text-[9px] font-bold tracking-[0.35em] text-var(--copper) uppercase font-body">Format Foto</span>
        </div>

        <div className="flex-1" />

        <div className="text-[8px] font-bold tracking-[0.35em] text-var(--copper) uppercase border border-[#2b5cf6]/30 px-2 py-0.5 font-body">
          STEP 1 / 4
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-5xl mx-auto px-6 md:px-12 pt-8 pb-8 gap-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <h1 className="font-display font-black leading-[0.9] text-[#f1f4fb]" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)' }}>
            Pilih <span className="italic text-gradient-copper">Format</span>
          </h1>
          <p className="mt-2 text-[#7687a1] text-sm font-body leading-relaxed">
            Berapa momen yang ingin kamu abadikan hari ini?
          </p>
        </motion.div>

        {/* Cards + Detail — split layout */}
        <div className="flex flex-col md:flex-row gap-6 flex-1">

          {/* Cards column */}
          <div className="flex gap-3 md:gap-5 items-end md:items-center md:flex-col md:w-auto">
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
                  initial={{ opacity: 0, y: 24, scale: 0.88 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isSelected ? 1.03 : isHovered ? 1.01 : 0.96,
                  }}
                  transition={{ delay: index * 0.08 + 0.15, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                  onHoverStart={() => setHovered(count)}
                  onHoverEnd={() => setHovered(null)}
                  onClick={() => handleSelect(count)}
                  className="relative flex flex-col items-center cursor-pointer tap-none group"
                  style={{ width: 110 }}
                >
                  {/* Best value badge */}
                  {isCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      className="mb-2 px-2 py-0.5 text-[8px] font-bold tracking-[0.3em] uppercase font-body"
                      style={{ background: meta.accent, color: '#030611' }}
                    >
                      {meta.tag}
                    </motion.div>
                  )}

                  {/* Card */}
                  <motion.div
                    animate={{
                      borderColor: isSelected ? `${meta.accent}90` : isHovered ? `${meta.accent}35` : 'rgba(29,39,64,0.7)',
                      boxShadow: isSelected
                        ? `0 0 0 1px ${meta.accent}40, 0 8px 40px ${meta.accent}25, inset 0 0 24px ${meta.accent}08`
                        : '0 4px 16px rgba(0,0,0,0.5)',
                      background: isSelected ? `rgba(43,92,246,0.03)` : '#0a0e1c',
                    }}
                    transition={{ duration: 0.28 }}
                    className="w-full overflow-hidden"
                    style={{ height: isCenter ? 196 : 168, border: '1.5px solid' }}
                  >
                    <GridSketch count={count} accent={meta.accent} isActive={isActive} />
                  </motion.div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <p className="text-[#f1f4fb] font-body font-bold text-sm">{count}× Foto</p>
                    <p className="text-[#7687a1] text-[9px] mt-0.5 font-body tracking-wider uppercase">{meta.subtitle}</p>
                  </div>

                  {/* Selected indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center"
                        style={{ background: meta.accent, clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }}
                      >
                        <Check className="w-3 h-3 text-[#030611]" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          {/* Detail panel — right side */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center gap-5"
              style={{ borderLeft: `3px solid ${selectedMeta.accent}40`, paddingLeft: 24 }}
            >
              {/* Selected format info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px w-4" style={{ background: selectedMeta.accent }} />
                  <span className="text-[9px] font-bold tracking-[0.35em] uppercase font-body" style={{ color: selectedMeta.accent }}>
                    {selectedMeta.tag}
                  </span>
                </div>
                <h2 className="font-display font-black text-[#f1f4fb] leading-tight" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
                  {selected}× <span style={{ color: selectedMeta.accent }}>Frame</span>
                </h2>
                <p className="text-[13px] text-[#7687a1] font-body leading-relaxed mt-2 max-w-[28ch]">
                  {selectedMeta.desc}
                </p>
              </div>

              {/* Specs */}
              <div className="space-y-2">
                {[
                  { label: 'Jumlah Foto', value: `${selected}× capture` },
                  { label: 'Filter AI per Foto', value: `${TAKE_OPTIONS.find(o => o.count === selected)?.filtersPerTake || 2}× pilihan` },
                  { label: 'Format Output', value: 'Photo Grid HD' },
                ].map(spec => (
                  <div key={spec.label} className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid rgba(29,39,64,0.6)' }}
                  >
                    <span className="text-[10px] tracking-[0.15em] text-[#7687a1] uppercase font-body">{spec.label}</span>
                    <span className="text-[11px] font-bold text-[#f1f4fb] font-body">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleConfirm}
                disabled={confirmed}
                whileTap={{ scale: 0.96 }}
                className="btn-solid h-14 px-8 text-sm font-body press tap-none flex items-center justify-center gap-3 disabled:opacity-60"
                style={{
                  background: selectedMeta.accent,
                  color: '#030611',
                }}
              >
                {confirmed ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#030611]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>MEMPROSES...</span>
                  </>
                ) : (
                  <>
                    <span>MULAI STUDIO</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="text-center text-[9px] tracking-[0.3em] text-[#2c2822] uppercase font-body"
        >
          Pilih format → Ambil foto → Pilih filter AI → Unduh
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(200,121,65,0.3), transparent)' }} />
    </div>
  );
}