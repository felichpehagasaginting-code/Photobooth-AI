'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Palette, Sparkles } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { Button } from '@/components/ui/button';

export default function CapturedPreview() {
  const { 
    capturedPhotos, 
    setStep, 
    language,
    currentTake,
    takeCount,
    incrementTake,
    removeLastCapturedPhoto
  } = usePhotoboothStore();

  const currentPhoto = capturedPhotos[capturedPhotos.length - 1];

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const handleRetake = () => {
    removeLastCapturedPhoto();
    setStep('camera');
  };

  const handleNext = () => {
    if (currentTake < takeCount) {
      incrementTake();
      setStep('camera');
    } else {
      setStep('filter-select');
    }
  };

  if (!currentPhoto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <p className="text-muted-foreground">{t('Tidak ada foto', 'No photo captured')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={handleRetake}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:text-[#FF6B9D] transition-colors tap-none"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t(`Pratinjau Foto ${currentTake} / ${takeCount}`, `Photo Preview ${currentTake} / ${takeCount}`)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('Puaskah dengan hasilnya?', 'Happy with the result?')}
            </p>
          </div>
        </div>
      </div>

      {/* Photo preview */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Frame */}
          <div className="relative rounded-3xl overflow-hidden bg-[#111118] shadow-ios-lg border border-white/5">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-10 glass flex items-center px-3 z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400/80" />
                <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
                <div className="w-2 h-2 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] text-white/30 font-medium tracking-wider uppercase">
                  {t('Foto Asli', 'Original')}
                </span>
              </div>
            </div>

            {/* Image */}
            <img
              src={currentPhoto.original}
              alt="Captured photo"
              className="w-full h-auto object-contain pt-10"
            />

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 glass">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#06D6A0]" />
                <span className="text-white/60 text-xs font-medium">
                  {new Date(currentPhoto.timestamp).toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-white/20 text-xs ml-auto">
                  AI Photobooth
                </span>
              </div>
            </div>
          </div>

          {/* Corner accents */}
          <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-[#FF6B9D]/40 rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-[#FF6B9D]/40 rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-[#06D6A0]/40 rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-[#06D6A0]/40 rounded-br-lg" />
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent space-y-3">
        <Button
          onClick={handleNext}
          className="relative w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:from-[#FF7BAE] hover:to-[#FF9B75] text-white shadow-glow-pink transition-all duration-300 scale-press overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Sparkles className="w-5 h-5 mr-2 relative z-10" />
          <span className="relative z-10">
            {currentTake < takeCount 
              ? t(`Lanjut ke Foto ${currentTake + 1} →`, `Continue to Photo ${currentTake + 1} →`)
              : t('Pilih Filter AI', 'Choose AI Filter')}
          </span>
        </Button>

        <button
          onClick={handleRetake}
          className="w-full h-14 text-sm font-medium rounded-2xl glass-light text-white/70 hover:text-white hover:bg-white/5 transition-all scale-press tap-none"
        >
          <RotateCcw className="w-4 h-4 mr-2 inline" />
          {t('Ulangi Foto', 'Retake Photo')}
        </button>
      </div>
    </div>
  );
}