'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Cpu, Sparkles, Zap } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { Progress } from '@/components/ui/progress';

const LOADING_MESSAGES_ID = [
  'AI sedang bekerja...',
  'Menambahkan sentuhan magis...',
  'Mengolah piksel dengan cinta...',
  'Sedikit lagi, sabar ya...',
  'AI sedang melukis fotomu...',
  'Membuat karya seni digital...',
  'Hampir selesai!',
];

const LOADING_MESSAGES_EN = [
  'AI is working its magic...',
  'Adding artistic touches...',
  'Processing pixels with care...',
  'Just a moment more...',
  'AI is painting your photo...',
  'Creating digital masterpiece...',
  'Almost done!',
];

/* ── Orbiting dot ────────────────────────────────────────────────────── */
function OrbitDot({ angle, radius, color, duration }: {
  angle: number; radius: number; color: string; duration: number;
}) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ background: color, width: 8, height: 8 }}
      animate={{
        x: [
          Math.cos((angle * Math.PI) / 180) * radius,
          Math.cos(((angle + 360) * Math.PI) / 180) * radius,
        ],
        y: [
          Math.sin((angle * Math.PI) / 180) * radius,
          Math.sin(((angle + 360) * Math.PI) / 180) * radius,
        ],
      }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export default function ProcessingScreen() {
  const {
    capturedPhotos,
    selectedFilters,
    filteredPhotos,
    addFilteredPhoto,
    processingProgress,
    setProcessingProgress,
    currentProcessingFilter,
    setCurrentProcessingFilter,
    setStep,
    clearFilters,
    language,
  } = usePhotoboothStore();

  const isProcessingRef = useRef(false);
  const [providerLog, setProviderLog] = useState<string[]>([]);
  const [msgIndex, setMsgIndex] = useState(0);

  const t = (id: string, en: string) => (language === 'id' ? id : en);
  const loadingMessages = language === 'id' ? LOADING_MESSAGES_ID : LOADING_MESSAGES_EN;

  // Cycle messages on timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [loadingMessages.length]);

  useEffect(() => {
    if (isProcessingRef.current || capturedPhotos.length === 0) return;
    isProcessingRef.current = true;

    const processAll = async () => {
      const totalTasks = capturedPhotos.length * selectedFilters.length;
      let completedTasks = 0;

      for (let p = 0; p < capturedPhotos.length; p++) {
        const photo = capturedPhotos[p];
        for (let i = 0; i < selectedFilters.length; i++) {
          const filter = selectedFilters[i];
          setCurrentProcessingFilter(`${filter.name} (Take ${p + 1})`);
          setProcessingProgress(Math.round((completedTasks / totalTasks) * 100));

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
              addFilteredPhoto({
                original: photo.original,
                filtered: data.filteredImage || photo.original,
                filterName: filter.name,
                filterId: filter.id,
              });
              setProviderLog((prev) => [...prev, `${filter.name} (T${p + 1}): ✓ ${data.provider || 'ok'}`]);
            } else {
              addFilteredPhoto({ original: photo.original, filtered: photo.original, filterName: filter.name, filterId: filter.id });
              setProviderLog((prev) => [...prev, `${filter.name} (T${p + 1}): fallback`]);
            }
          } catch {
            addFilteredPhoto({ original: photo.original, filtered: photo.original, filterName: filter.name, filterId: filter.id });
            setProviderLog((prev) => [...prev, `${filter.name} (T${p + 1}): error`]);
          }
          completedTasks++;
        }
      }

      setProcessingProgress(100);
      setTimeout(() => setStep('download'), 900);
    };

    processAll();
  }, [capturedPhotos, selectedFilters, filteredPhotos.length, addFilteredPhoto, setCurrentProcessingFilter, setProcessingProgress, setStep, clearFilters]);

  const totalTasks = capturedPhotos.length * selectedFilters.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-6 overflow-hidden relative">
      {/* Background ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,107,157,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10">

        {/* Animated icon cluster */}
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
          {/* Orbit rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-[#FF6B9D]/15"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            className="absolute rounded-full border border-[#A855F7]/15"
            style={{ inset: 8 }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            className="absolute rounded-full border border-[#06D6A0]/10"
            style={{ inset: 18 }}
          />

          {/* Orbiting dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <OrbitDot angle={0}   radius={62} color="#FF6B9D" duration={5} />
            <OrbitDot angle={120} radius={62} color="#A855F7" duration={5} />
            <OrbitDot angle={240} radius={62} color="#06D6A0" duration={5} />
          </div>

          {/* Center icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 30px rgba(255,107,157,0.25)',
                '0 0 55px rgba(255,107,157,0.5)',
                '0 0 30px rgba(255,107,157,0.25)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#FF8A65] flex items-center justify-center z-10"
          >
            <Wand2 className="w-9 h-9 text-white" />
            {/* Corner sparkle */}
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
          </motion.div>
        </div>

        {/* Title + cycling message */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
            {t('Memproses Foto', 'Processing Photo')}
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="text-sm text-muted-foreground min-h-[20px]"
            >
              {loadingMessages[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Current filter indicator */}
        <AnimatePresence mode="wait">
          {currentProcessingFilter && (
            <motion.div
              key={currentProcessingFilter}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass border border-[#FF6B9D]/15"
            >
              <Cpu className="w-4 h-4 text-[#FF6B9D] shrink-0" />
              <span className="text-sm font-semibold text-white truncate">
                {currentProcessingFilter}
              </span>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="ml-auto shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-[#FBBF24]" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full space-y-2.5">
          <div className="relative h-2.5 rounded-full bg-[#15151F] overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#FF6B9D] via-[#A855F7] to-[#FF8A65]"
              animate={{ width: `${processingProgress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
            {/* Animated shimmer on progress bar */}
            <motion.div
              className="absolute top-0 h-full w-16 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
              animate={{ x: ['-100%', '600%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
            />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/40 font-medium">
              {filteredPhotos.length}/{totalTasks} {t('proses', 'processes')}
            </span>
            <span className="text-[#FF6B9D] font-black font-mono-nums tabular-nums text-sm">
              {processingProgress}%
            </span>
          </div>
        </div>

        {/* Completed thumbnails */}
        {filteredPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <p className="text-xs text-white/30 font-medium mb-2 text-center">
              {t('Selesai diproses', 'Completed')}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin justify-center flex-wrap">
              {filteredPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-ios relative"
                >
                  <img
                    src={photo.filtered}
                    alt={photo.filterName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-[#06D6A0] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Provider debug log */}
        {providerLog.length > 0 && (
          <div className="w-full space-y-1 max-h-20 overflow-y-auto scrollbar-thin">
            {providerLog.map((log, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-white/20 font-mono"
              >
                {log}
              </motion.p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}