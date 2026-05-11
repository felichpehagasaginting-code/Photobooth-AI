'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Sparkles } from 'lucide-react';
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
    capturedPhoto,
    selectedFilters,
    filteredPhotos,
    addFilteredPhoto,
    processingProgress,
    setProcessingProgress,
    currentProcessingFilter,
    setCurrentProcessingFilter,
    setStep,
    language,
  } = usePhotoboothStore();

  const isProcessingRef = useRef(false);
  const t = (id: string, en: string) => (language === 'id' ? id : en);
  const loadingMessages = language === 'id' ? LOADING_MESSAGES_ID : LOADING_MESSAGES_EN;

  useEffect(() => {
    if (isProcessingRef.current || !capturedPhoto) return;
    isProcessingRef.current = true;

    const processAll = async () => {
      const totalFilters = selectedFilters.length;
      const alreadyProcessed = filteredPhotos.length;

      for (let i = alreadyProcessed; i < totalFilters; i++) {
        const filter = selectedFilters[i];
        setCurrentProcessingFilter(filter.name);
        setProcessingProgress(Math.round((i / totalFilters) * 100));

        try {
          const res = await fetch('/api/generate-filter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: capturedPhoto.original,
              filterPrompt: filter.prompt || filter.name,
              style: filter.style,
              filterId: filter.id,
              filterName: filter.name,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            addFilteredPhoto({
              original: capturedPhoto.original,
              filtered: data.filteredImage || capturedPhoto.original,
              filterName: filter.name,
              filterId: filter.id,
            });
          } else {
            addFilteredPhoto({
              original: capturedPhoto.original,
              filtered: capturedPhoto.original,
              filterName: filter.name,
              filterId: filter.id,
            });
          }
        } catch {
          addFilteredPhoto({
            original: capturedPhoto.original,
            filtered: capturedPhoto.original,
            filterName: filter.name,
            filterId: filter.id,
          });
        }
      }

      setProcessingProgress(100);
      setTimeout(() => {
        setStep('payment');
      }, 800);
    };

    processAll();
  }, [capturedPhoto, selectedFilters, filteredPhotos.length, addFilteredPhoto, setCurrentProcessingFilter, setProcessingProgress, setStep]);

  const currentFilterIndex = selectedFilters.findIndex(
    (f) => f.name === currentProcessingFilter
  );
  const messageIndex = currentFilterIndex % loadingMessages.length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Animated icon */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#FF8A65] flex items-center justify-center"
        >
          <Wand2 className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('Memproses Foto', 'Processing Photo')}
          </h2>
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground"
          >
            {loadingMessages[messageIndex]}
          </motion.p>
        </div>

        {/* Current filter */}
        {currentProcessingFilter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#15151F] border border-[#2A2A3A]"
          >
            <Sparkles className="w-4 h-4 text-[#FF6B9D]" />
            <span className="text-sm font-medium text-white">
              {currentProcessingFilter}
            </span>
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <Progress
            value={processingProgress}
            className="h-3 bg-[#15151F] rounded-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {Math.min(filteredPhotos.length + 1, selectedFilters.length)}/
              {selectedFilters.length} {t('filter', 'filters')}
            </span>
            <span className="font-mono">{processingProgress}%</span>
          </div>
        </div>

        {/* Preview thumbnails of completed filters */}
        {filteredPhotos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-thin">
            {filteredPhotos.map((photo, i) => (
              <motion.div
                key={photo.filterId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-[#2A2A3A]"
              >
                <img
                  src={photo.filtered}
                  alt={photo.filterName}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
