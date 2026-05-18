'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Sparkles, ChevronRight } from 'lucide-react';
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
    removeLastCapturedPhoto,
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

  const isLastTake = currentTake >= takeCount;

  if (!currentPhoto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <p className="text-muted-foreground">{t('Tidak ada foto', 'No photo captured')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #FF6B9D 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #06D6A0 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 sticky top-0 bg-[#0A0A0F]/85 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={handleRetake}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:text-[#FF6B9D] transition-colors tap-none"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
              {t(`Foto ${currentTake} dari ${takeCount}`, `Photo ${currentTake} of ${takeCount}`)}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('Puaskah dengan hasilnya?', 'Happy with the result?')}
            </p>
          </div>
          {/* Take progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: takeCount }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentTake - 1 ? 20 : 7,
                  height: 7,
                  background: i < currentTake - 1
                    ? '#06D6A0'
                    : i === currentTake - 1
                      ? '#FF6B9D'
                      : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Photo preview */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Photo frame */}
          <div className="relative rounded-3xl overflow-hidden bg-[#111118] shadow-ios-xl border border-white/6">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-10 glass flex items-center px-3 z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] text-white/30 font-semibold tracking-widest uppercase">
                  {t('Foto Asli', 'Original')} · AI Photobooth
                </span>
              </div>
            </div>

            {/* Image */}
            <img
              src={currentPhoto.original}
              alt="Captured photo"
              className="w-full h-auto object-contain pt-10"
            />

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 glass">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#06D6A0]" />
                <span className="text-white/60 text-xs font-medium">
                  {new Date(currentPhoto.timestamp).toLocaleTimeString(
                    language === 'id' ? 'id-ID' : 'en-US',
                    { hour: '2-digit', minute: '2-digit', second: '2-digit' }
                  )}
                </span>
                {isLastTake && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold text-[#FF6B9D] bg-[#FF6B9D]/10">
                    {t('Foto Terakhir', 'Last Photo')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Corner accent brackets */}
          <div className="absolute -top-2 -left-2 w-6 h-6">
            <div className="absolute top-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#FF6B9D] to-transparent rounded-full" />
            <div className="absolute top-0 left-0 h-full w-[2.5px] bg-gradient-to-b from-[#FF6B9D] to-transparent rounded-full" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6">
            <div className="absolute top-0 right-0 w-full h-[2.5px] bg-gradient-to-l from-[#FF6B9D] to-transparent rounded-full" />
            <div className="absolute top-0 right-0 h-full w-[2.5px] bg-gradient-to-b from-[#FF6B9D] to-transparent rounded-full" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6">
            <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-[#06D6A0] to-transparent rounded-full" />
            <div className="absolute bottom-0 left-0 h-full w-[2.5px] bg-gradient-to-t from-[#06D6A0] to-transparent rounded-full" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6">
            <div className="absolute bottom-0 right-0 w-full h-[2.5px] bg-gradient-to-l from-[#06D6A0] to-transparent rounded-full" />
            <div className="absolute bottom-0 right-0 h-full w-[2.5px] bg-gradient-to-t from-[#06D6A0] to-transparent rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="relative z-10 sticky bottom-0 p-4 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent space-y-3">
        <Button
          onClick={handleNext}
          className="relative w-full h-14 text-base font-black rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:from-[#FF7BAE] hover:to-[#FF9B75] text-white shadow-glow-pink transition-all duration-300 scale-press overflow-hidden"
          style={{ fontFamily: 'var(--font-outfit)' }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLastTake
              ? <><Sparkles className="w-5 h-5" />{t('Pilih Filter AI', 'Choose AI Filters')}</>
              : <>{t(`Lanjut ke Foto ${currentTake + 1}`, `Continue to Photo ${currentTake + 1}`)}<ChevronRight className="w-5 h-5" /></>
            }
          </span>
        </Button>

        <button
          onClick={handleRetake}
          className="w-full h-12 text-sm font-semibold rounded-2xl glass-light text-white/65 hover:text-white hover:bg-white/5 transition-all scale-press tap-none flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {t('Ulangi Foto Ini', 'Retake This Photo')}
        </button>
      </div>
    </div>
  );
}