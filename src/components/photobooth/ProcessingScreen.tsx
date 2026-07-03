'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';

const MSGS_ID = [
  'AI sedang bekerja…',
  'Menambahkan sentuhan artistik…',
  'Mengolah piksel dengan presisi…',
  'Sebentar lagi…',
  'AI sedang melukis fotomu…',
  'Membuat karya seni digital…',
  'Hampir selesai!',
];
const MSGS_EN = [
  'AI is working its magic…',
  'Adding artistic touches…',
  'Processing pixels with care…',
  'Just a moment more…',
  'AI is painting your photo…',
  'Creating digital masterpiece…',
  'Almost done!',
];

export default function ProcessingScreen() {
  const {
    capturedPhotos, selectedFilters, filteredPhotos,
    addFilteredPhoto, processingProgress, setProcessingProgress,
    currentProcessingFilter, setCurrentProcessingFilter,
    setStep, language,
  } = usePhotoboothStore();

  const isProcessingRef = useRef(false);
  const [providerLog, setProviderLog] = useState<string[]>([]);
  const [msgIndex, setMsgIndex]       = useState(0);
  const [nvidiaReasoning, setNvidiaReasoning] = useState<string>('');

  const t = (id: string, en: string) => (language === 'id' ? id : en);
  const msgs = language === 'id' ? MSGS_ID : MSGS_EN;

  useEffect(() => {
    const iv = setInterval(() => setMsgIndex(p => (p + 1) % msgs.length), 2800);
    return () => clearInterval(iv);
  }, [msgs.length]);

  useEffect(() => {
    if (isProcessingRef.current || capturedPhotos.length === 0) return;
    isProcessingRef.current = true;

    const processAll = async () => {
      const total = capturedPhotos.length * selectedFilters.length;
      let done = 0;

      for (let p = 0; p < capturedPhotos.length; p++) {
        const photo = capturedPhotos[p]!;
        for (let i = 0; i < selectedFilters.length; i++) {
          const filter = selectedFilters[i]!;
          setCurrentProcessingFilter(`${filter.name} (Take ${p + 1})`);
          setProcessingProgress(Math.round((done / total) * 100));

          try {
            const res = await fetch('/api/generate-filter', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image: photo.original,
                filterPrompt: filter.prompt || filter.name,
                style: filter.style,
                filterId: filter.id,
                filterName: filter.name,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              addFilteredPhoto({ original: photo.original, filtered: data.filteredImage || photo.original, filterName: filter.name, filterId: filter.id });
              setProviderLog(prev => [...prev, `${filter.name} T${p + 1}: ✓ ${data.provider || 'ok'}`]);
              if (data.nvidiaReasoning) {
                setNvidiaReasoning(prev => prev + `\n[${filter.name}] ${data.nvidiaReasoning.slice(0, 120)}...`);
              }
            } else {
              addFilteredPhoto({ original: photo.original, filtered: photo.original, filterName: filter.name, filterId: filter.id });
              setProviderLog(prev => [...prev, `${filter.name} T${p + 1}: fallback`]);
            }
          } catch {
            addFilteredPhoto({ original: photo.original, filtered: photo.original, filterName: filter.name, filterId: filter.id });
            setProviderLog(prev => [...prev, `${filter.name} T${p + 1}: error`]);
          }
          done++;
        }
      }

      setProcessingProgress(100);
      setTimeout(() => setStep('customize'), 900);
    };

    processAll();
  }, [capturedPhotos, selectedFilters, filteredPhotos.length, addFilteredPhoto, setCurrentProcessingFilter, setProcessingProgress, setStep]);

  const total = capturedPhotos.length * selectedFilters.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6"
      style={{ background: '#030611' }}
    >
      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }}
      />
      {/* Cool radial accent */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(43,92,246,0.07) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-7">

        {/* ── Processing visual — orbital rings, editorial style ── */}
        <div className="relative flex items-center justify-center" style={{ width: 148, height: 148 }}>
          {/* Square orbit ring */}
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              className="absolute"
              animate={{ rotate: i % 2 === 0 ? [0, 360] : [0, -360] }}
              transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'linear' }}
              style={{
                inset: i * 12,
                border: `1px solid rgba(43,92,246,${0.18 - i * 0.04})`,
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
              }}
            />
          ))}

          {/* Orbiting cobalt/sapphire dots */}
          {[0, 120, 240].map((deg, i) => (
            <motion.div key={deg}
              className="absolute"
              style={{ width: 6, height: 6, background: i === 0 ? 'var(--copper)' : i === 1 ? 'var(--amber)' : '#2dd4bf', left: '50%', top: '50%' }}
              animate={{
                x: [Math.cos(deg * Math.PI / 180) * 62, Math.cos((deg + 360) * Math.PI / 180) * 62],
                y: [Math.sin(deg * Math.PI / 180) * 62, Math.sin((deg + 360) * Math.PI / 180) * 62],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
          ))}

          {/* Center icon — clipped square */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 flex items-center justify-center"
            style={{
              width: 72, height: 72,
              background: 'var(--copper)',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              boxShadow: '0 0 36px rgba(43,92,246,0.35)',
            }}
          >
            {/* Custom wand SVG — square style */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#030611" strokeWidth="2" strokeLinecap="square">
              <path d="M15 4l5 5-10 10-5-5z" />
              <path d="M2 22l4-4" />
              <path d="M18 2l2 2-2-2z" strokeWidth="3" />
            </svg>
          </motion.div>
        </div>

        {/* ── Title + cycling message ── */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-6 bg-var(--copper)" />
            <span className="text-[9px] font-bold tracking-[0.35em] text-var(--copper) uppercase font-body">AI Processing</span>
            <div className="h-px w-6 bg-var(--copper)" />
          </div>
          <h2 className="font-display font-black text-[#f1f4fb] leading-tight" style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)' }}>
            {t('Memproses', 'Processing')}<br />
            <span className="italic text-gradient-copper">{t('Foto', 'Photo')}</span>
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="mt-2 text-[12px] text-[#7687a1] font-body min-h-[18px]"
            >
              {msgs[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── Current filter ── */}
        <AnimatePresence mode="wait">
          {currentProcessingFilter && (
            <motion.div
              key={currentProcessingFilter}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg"
              style={{ background: '#0a0e1c', border: '1px solid rgba(43,92,246,0.2)', borderLeft: '3px solid var(--copper)' }}
            >
              <Cpu className="w-3.5 h-3.5 text-var(--copper) shrink-0" />
              <span className="text-[12px] font-bold text-[#f1f4fb] font-body truncate">{currentProcessingFilter}</span>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.1, repeat: Infinity }} className="ml-auto shrink-0">
                <Zap className="w-3 h-3 text-var(--amber)" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Progress ── */}
        <div className="w-full space-y-2">
          {/* Progress track — flat line */}
          <div className="w-full h-1" style={{ background: '#121629' }}>
            <motion.div
              className="h-full"
              style={{ background: `linear-gradient(to right, var(--copper), var(--amber))` }}
              animate={{ width: `${processingProgress}%` }}
              transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] tracking-[0.15em] text-[#7687a1] font-body uppercase">
              {filteredPhotos.length}/{total} {t('selesai', 'done')}
            </span>
            <span className="font-display font-black tabular-nums" style={{ fontSize: '1.1rem', color: 'var(--copper)' }}>
              {processingProgress}%
            </span>
          </div>
        </div>

        {/* ── Completed thumbnails ── */}
        {filteredPhotos.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-3 bg-[#2dd4bf]" />
              <span className="text-[9px] tracking-[0.25em] text-[#2dd4bf] uppercase font-body">{t('Selesai', 'Completed')}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {filteredPhotos.map(photo => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="shrink-0 relative overflow-hidden"
                  style={{ width: 52, height: 52, border: '1px solid rgba(45,212,191,0.3)' }}
                >
                  <img src={photo.filtered} alt={photo.filterName} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 flex items-center justify-center"
                    style={{ background: '#2dd4bf' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-2 h-2">
                      <path d="M5 13l4 4L19 7" stroke="#030611" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Provider log — minimal */}
        {providerLog.length > 0 && (
          <div className="w-full max-h-16 overflow-y-auto scrollbar-thin space-y-0.5">
            {providerLog.map((log, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[9px] font-mono text-[#2c2822]">{log}</motion.p>
            ))}
          </div>
        )}

        {/* NVIDIA Reasoning — streaming thought process */}
        {nvidiaReasoning && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full px-3 py-2 rounded-lg"
            style={{
              background: 'rgba(118, 185, 0, 0.06)',
              border: '1px solid rgba(118, 185, 0, 0.15)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#76b900' }} />
              <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#76b900' }}>
                NVIDIA Nemotron Reasoning
              </span>
            </div>
            <p className="text-[10px] font-mono leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {nvidiaReasoning}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}