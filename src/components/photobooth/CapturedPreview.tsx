'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Sparkles, ChevronRight } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';

export default function CapturedPreview() {
  const {
    capturedPhotos, setStep, language,
    currentTake, takeCount, incrementTake, removeLastCapturedPhoto,
    setRetakeIndex
  } = usePhotoboothStore();

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const currentPhoto = capturedPhotos[capturedPhotos.length - 1];
  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const handleRetake = () => { 
    if (isLastTake && selectedPhotoIndex !== null) {
      setRetakeIndex(selectedPhotoIndex);
      setStep('camera');
    } else {
      removeLastCapturedPhoto(); 
      setStep('camera'); 
    }
  };
  
  const handleNext = () => {
    if (currentTake < takeCount) { incrementTake(); setStep('camera'); }
    else setStep('filter-select');
  };
  const isLastTake = currentTake >= takeCount;

  if (!currentPhoto) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0a09' }}>
      <p className="text-[#7a7168] font-body">{t('Tidak ada foto', 'No photo captured')}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#0c0a09' }}>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", opacity: 0.4 }}
      />

      {/* Warm accent blob */}
      <div className="absolute pointer-events-none z-0" style={{ top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '60%', height: 300, background: 'radial-gradient(circle, rgba(200,121,65,0.06) 0%, transparent 70%)' }} />

      {/* ── Header ── */}
      <div className="relative z-10 sticky top-0" style={{ background: 'rgba(12,10,9,0.82)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(200,121,65,0.1)' }}>
        <div className="flex items-center gap-4 p-4 w-full max-w-7xl mx-auto">
          <button onClick={handleRetake}
            className="w-10 h-10 flex items-center justify-center text-[#7a7168] hover:text-[#c87941] tap-none"
            style={{ border: '1px solid rgba(44,40,34,0.8)', transition: 'color 200ms cubic-bezier(0.33, 1, 0.68, 1)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h2 className="font-display font-black text-[#f0ebe3] tracking-tight" style={{ fontSize: '1.05rem' }}>
              {t(`Foto ${currentTake} dari ${takeCount}`, `Photo ${currentTake} of ${takeCount}`)}
            </h2>
            <p className="text-[11px] text-[#7a7168] font-body">{t('Puaskah dengan hasilnya?', 'Happy with the result?')}</p>
          </div>

          {/* Take progress — line segments, not dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: takeCount }).map((_, i) => (
              <div key={i} style={{
                width: i === currentTake - 1 ? 20 : 7,
                height: 2,
                background: i < currentTake - 1 ? '#4ecb9e' : i === currentTake - 1 ? '#c87941' : 'rgba(44,40,34,0.8)',
                transition: 'width 280ms cubic-bezier(0.33, 1, 0.68, 1), background 280ms',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Photo or Gallery ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto scrollbar-thin">
        {!isLastTake ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md"
          >
            {/* Decorative corner brackets — copper */}
            {[[-1,-1,'r','b'],[-1,1,'l','b'],[1,-1,'r','t'],[1,1,'l','t']].map(([vy,vx,bx,by],i)=>(
              <div key={i} className="absolute" style={{ top: vy === -1 ? -8 : undefined, bottom: vy === 1 ? -8 : undefined, left: vx === -1 ? -8 : undefined, right: vx === 1 ? -8 : undefined, width: 20, height: 20 }}>
                <div style={{ position:'absolute', [by === 't' ? 'top' : 'bottom']: 0, [bx === 'r' ? 'right' : 'left']: 0, width:'100%', height: 2, background:'#c87941' }} />
                <div style={{ position:'absolute', [by === 't' ? 'top' : 'bottom']: 0, [bx === 'r' ? 'right' : 'left']: 0, width: 2, height:'100%', background:'#c87941' }} />
              </div>
            ))}

            {/* Photo frame — dark, geometric cut corner */}
            <div style={{
              background: '#151210',
              border: '1px solid rgba(200,121,65,0.18)',
              overflow: 'hidden',
              clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
            }}>
              {/* Header bar */}
              <div className="flex items-center px-3 py-2" style={{ background: 'rgba(200,121,65,0.06)', borderBottom: '1px solid rgba(200,121,65,0.1)' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(200,121,65,0.4)' }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(232,160,42,0.3)' }} />
                  <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(78,203,158,0.3)' }} />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[9px] text-[#7a7168] tracking-[0.3em] uppercase font-body">
                    {t('Foto Asli', 'Original')} · AI Photobooth
                  </span>
                </div>
              </div>

              <img src={currentPhoto.original} alt="Captured" className="w-full h-auto object-contain" />

              {/* Bottom info */}
              <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(200,121,65,0.04)', borderTop: '1px solid rgba(200,121,65,0.08)' }}>
                <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#4ecb9e' }} />
                <span className="text-[11px] text-[#7a7168] font-body">
                  {new Date(currentPhoto.timestamp).toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="w-full max-w-4xl mx-auto flex flex-col h-full justify-center">
            <h3 className="text-center font-display font-black text-xl mb-4 text-[#c87941]">
              {t('Review Foto Kamu', 'Review Your Photos')}
            </h3>
            <p className="text-center text-xs text-[#7a7168] font-body mb-6">
              {t('Ketuk foto jika ada yang ingin diulang.', 'Tap a photo if you want to retake it.')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {capturedPhotos.map((photo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedPhotoIndex(i === selectedPhotoIndex ? null : i)}
                  className="relative cursor-pointer transition-transform"
                  style={{ 
                    border: selectedPhotoIndex === i ? '3px solid #c87941' : '1px solid rgba(200,121,65,0.2)',
                    transform: selectedPhotoIndex === i ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <img src={photo.original} alt={`Photo ${i + 1}`} className="w-full h-auto object-cover" />
                  <div className="absolute top-2 left-2 bg-[#0c0a09]/80 px-2 py-0.5 text-[10px] font-bold text-[#c87941]">
                    {i + 1}
                  </div>
                  {selectedPhotoIndex === i && (
                    <div className="absolute inset-0 bg-[#c87941]/20 flex items-center justify-center">
                      <div className="bg-[#0c0a09] p-2 rounded-full border border-[#c87941]">
                        <RotateCcw className="w-6 h-6 text-[#c87941]" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="relative z-10 sticky bottom-0 p-4" style={{ background: 'linear-gradient(to top, #0c0a09 60%, rgba(12,10,9,0.9) 80%, transparent)' }}>
        <div className="w-full max-w-7xl mx-auto space-y-3">
          <button
            onClick={handleNext}
            className="btn-solid w-full h-14 text-sm font-body press tap-none flex items-center justify-center gap-2"
          >
            {isLastTake
              ? <><Sparkles className="w-4 h-4" />{t('Selesai & Pilih Filter AI', 'Finish & Choose AI Filters')}</>
              : <>{t(`Lanjut ke Foto ${currentTake + 1}`, `Continue to Photo ${currentTake + 1}`)}<ChevronRight className="w-4 h-4" /></>
            }
          </button>

          {(!isLastTake || selectedPhotoIndex !== null) && (
            <button
              onClick={handleRetake}
              className="w-full h-11 text-sm font-body text-[#7a7168] hover:text-[#f0ebe3] tap-none flex items-center justify-center gap-2 press"
              style={{ border: '1px solid rgba(44,40,34,0.8)', transition: 'color 200ms cubic-bezier(0.33, 1, 0.68, 1), border-color 200ms' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isLastTake 
                ? t(`Ulangi Foto ${selectedPhotoIndex! + 1}`, `Retake Photo ${selectedPhotoIndex! + 1}`) 
                : t('Ulangi Foto Ini', 'Retake This Photo')
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}