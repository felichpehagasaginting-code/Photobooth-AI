'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Palette } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { Button } from '@/components/ui/button';

export default function CapturedPreview() {
  const { capturedPhoto, setStep, goBack, clearFilters, language } = usePhotoboothStore();

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const handleRetake = () => {
    clearFilters();
    goBack();
  };

  const handleChooseFilter = () => {
    setStep('filter-select');
  };

  if (!capturedPhoto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <p className="text-muted-foreground">{t('Tidak ada foto', 'No photo captured')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      {/* Header */}
      <div className="flex items-center gap-4 p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRetake}
          className="w-12 h-12 rounded-full bg-[#15151F] border border-[#2A2A3A] hover:bg-[#2A2A3A] text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold text-white">
          {t('Pratinjau Foto', 'Photo Preview')}
        </h2>
      </div>

      {/* Photo preview */}
      <div className="flex-1 flex items-center justify-center px-6 pb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          {/* Frame effect */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#2A2A3A] shadow-2xl">
            <img
              src={capturedPhoto.original}
              alt="Captured photo"
              className="w-full h-auto object-contain"
            />
            {/* Subtle frame overlay */}
            <div className="absolute inset-0 border-4 border-white/5 rounded-2xl pointer-events-none" />
          </div>

          {/* Corner decorations */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#FF6B9D] rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#FF6B9D] rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#06D6A0] rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#06D6A0] rounded-br-lg" />
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="p-6 mt-auto flex flex-col gap-3">
        <Button
          onClick={handleChooseFilter}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:opacity-90 text-white transition-all"
        >
          <Palette className="w-5 h-5 mr-2" />
          {t('Pilih Filter', 'Choose Filter')}
        </Button>
        <Button
          onClick={handleRetake}
          variant="outline"
          className="w-full h-14 text-lg font-bold rounded-2xl border-[#2A2A3A] bg-[#15151F] hover:bg-[#2A2A3A] text-white transition-all"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {t('Ulangi', 'Retake')}
        </Button>
      </div>
    </div>
  );
}
