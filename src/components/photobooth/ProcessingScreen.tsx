'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Cpu } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { Progress } from '@/components/ui/progress';

const LOADING_MESSAGES_ID = [
  'AI sedang bekerja...',
  'Menambahkan sentuhan magis...',
  'Mengolah piksel dengan cinta...',
  'Sedikit lagi, sabar ya...',
  'AI sedang melukis fotomu...',
  'Membuat karya seni digital...',
  'Hampir selesai...',
];

const LOADING_MESSAGES_EN = [
  'AI is working...',
  'Adding a magical touch...',
  'Processing pixels with love...',
  'Just a moment more...',
  'AI is painting your photo...',
  'Creating digital art...',
  'Almost done...',
];

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

  const t = (id: string, en: string) => (language === 'id' ? id : en);
  const loadingMessages = language === 'id' ? LOADING_MESSAGES_ID : LOADING_MESSAGES_EN;

  useEffect(() => {
    if (isProcessingRef.current || capturedPhotos.length === 0) return;
    isProcessingRef.current = true;

    const processAll = async () => {
      const totalPhotos = capturedPhotos.length;
      const totalFilters = selectedFilters.length;
      const totalTasks = totalPhotos * totalFilters;
      let completedTasks = 0;

      for (let p = 0; p < totalPhotos; p++) {
        const photo = capturedPhotos[p];
        for (let i = 0; i < totalFilters; i++) {
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
              setProviderLog((prev) => [...prev, `${filter.name} (T${p + 1}): ${data.provider || 'unknown'}`]);
            } else {
              addFilteredPhoto({
                original: photo.original,
                filtered: photo.original,
                filterName: filter.name,
                filterId: filter.id,
              });
              setProviderLog((prev) => [...prev, `${filter.name} (T${p + 1}): fallback`]);
            }
          } catch {
            addFilteredPhoto({
              original: photo.original,
              filtered: photo.original,
              filterName: filter.name,
              filterId: filter.id,
            });
            setProviderLog((prev) => [...prev, `${filter.name} (T${p + 1}): error`]);
          }
          completedTasks++;
        }
      }

      setProcessingProgress(100);

      // All takes and filters processed, go to download
      setTimeout(() => {
        setStep('download');
      }, 1000);
    };

    processAll();
  }, [capturedPhotos, selectedFilters, filteredPhotos.length, addFilteredPhoto, setCurrentProcessingFilter, setProcessingProgress, setStep, clearFilters]);

  const currentFilterIndex = selectedFilters.findIndex(
    (f) => f.name === currentProcessingFilter
  );
  const messageIndex = currentFilterIndex % loadingMessages.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Animated icon */}
        <motion.div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="w-28 h-28 rounded-full border border-[#FF6B9D]/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-[#06D6A0]/10"
          />
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 20px rgba(255,107,157,0.2)',
                '0 0 40px rgba(255,107,157,0.4)',
                '0 0 20px rgba(255,107,157,0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-4 rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#FF8A65] flex items-center justify-center"
          >
            <Wand2 className="w-8 h-8 text-white" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t('Memproses Foto', 'Processing Photo')}
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm text-muted-foreground"
            >
              {loadingMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Current filter */}
        <AnimatePresence mode="wait">
          {currentProcessingFilter && (
            <motion.div
              key={currentProcessingFilter}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass"
            >
              <Cpu className="w-4 h-4 text-[#FF6B9D]" />
              <span className="text-sm font-semibold text-white">
                {currentProcessingFilter}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="relative">
            <Progress
              value={processingProgress}
              className="h-2 bg-[#15151F] rounded-full overflow-hidden"
            />
            <motion.div
              className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] opacity-50 blur"
              animate={{ width: `${processingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40 font-medium">
              {selectedFilters.length > 0
                ? `${Math.min(filteredPhotos.length, capturedPhotos.length * selectedFilters.length)}/${capturedPhotos.length * selectedFilters.length}`
                : '0/0'}{' '}
              {t('proses', 'processes')}
            </span>
            <span className="text-[#FF6B9D] font-mono font-bold tabular-nums">
              {processingProgress}%
            </span>
          </div>
        </div>

        {/* Provider log */}
        {providerLog.length > 0 && (
          <div className="w-full space-y-1">
            {providerLog.map((log, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-white/20 font-mono"
              >
                ✓ {log}
              </motion.p>
            ))}
          </div>
        )}

        {/* Completed thumbnails */}
        {filteredPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-thin"
          >
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-white/5 shadow-ios"
              >
                <img
                  src={photo.filtered}
                  alt={photo.filterName}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}