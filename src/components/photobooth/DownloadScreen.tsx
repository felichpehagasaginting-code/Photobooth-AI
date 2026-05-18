'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Download, RotateCcw, QrCode, Sparkles, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { usePhotoboothStore } from '@/store/photobooth';
import { Button } from '@/components/ui/button';
import { ConfettiParticles } from '@/components/common/ConfettiParticles';

export default function DownloadScreen() {
  const {
    currentTransaction,
    filteredPhotos,
    resetAll,
    language,
  } = usePhotoboothStore();

  const [showCheck, setShowCheck] = useState(false);
  const [downloadQr, setDownloadQr] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!currentTransaction) return;
    const downloadUrl = `${window.location.origin}/?txn=${currentTransaction.id}&token=${currentTransaction.downloadToken || ''}`;
    QRCode.toString(downloadUrl, {
      type: 'svg',
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then((svgString: string) => {
        setDownloadQr(`data:image/svg+xml;base64,${btoa(svgString)}`);
      })
      .catch(() => {});
  }, [currentTransaction]);

  const handleDownload = (photoIndex: number) => {
    const photo = filteredPhotos[photoIndex];
    if (!photo) return;
    const link = document.createElement('a');
    link.href = photo.filtered;
    link.download = `photobooth-${photo.filterName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
    link.click();
  };

  const handleDownloadAll = () => {
    filteredPhotos.forEach((photo, i) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.filtered;
        link.download = `photobooth-${photo.filterName.replace(/\s+/g, '-').toLowerCase()}-${i + 1}.jpg`;
        link.click();
      }, i * 200);
    });
  };

  return (
    <>
      {showCheck && <ConfettiParticles count={60} size="md" duration={4.5} />}

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0A0A0F] via-[#10101A] to-[#0A0A0F] overflow-hidden relative">
        {/* Background ambient */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #06D6A0 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, #FF6B9D 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center p-6 pt-10 gap-6 max-w-md mx-auto w-full">

          {/* Success checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: showCheck ? 1 : 0, rotate: showCheck ? 0 : -180 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          >
            <div className="relative">
              <CheckCircle2 className="w-20 h-20 text-[#06D6A0]" style={{ filter: 'drop-shadow(0 0 20px rgba(6,214,160,0.4))' }} />
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-[#06D6A0]"
              />
            </div>
          </motion.div>

          {/* Success text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1.5" style={{ fontFamily: 'var(--font-outfit)' }}>
              {t('Foto Siap! 🎉', 'Photos Ready! 🎉')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('Fotomu sudah selesai diproses AI', 'Your photos have been processed by AI')}
            </p>
          </motion.div>

          {/* Transaction info */}
          {currentTransaction && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="w-full p-4 rounded-2xl bg-[#0E0E18] border border-white/5"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Order ID</span>
                <span className="text-xs font-mono text-[#FF6B9D] font-semibold">
                  {currentTransaction.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="text-xs font-semibold text-[#06D6A0] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] inline-block" />
                  {t('Lunas', 'Paid')}
                </span>
              </div>
            </motion.div>
          )}

          {/* Photo gallery preview */}
          {filteredPhotos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="w-full"
            >
              {/* Large active preview */}
              <div className="relative rounded-2xl overflow-hidden mb-3 border border-white/8 shadow-ios-lg" style={{ aspectRatio: '4/3' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activePhoto}
                    src={filteredPhotos[activePhoto]?.filtered}
                    alt={filteredPhotos[activePhoto]?.filterName}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </AnimatePresence>
                {/* Filter name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-bold">
                      {filteredPhotos[activePhoto]?.filterName}
                    </p>
                    <button
                      onClick={() => handleDownload(activePhoto)}
                      className="w-9 h-9 rounded-full glass flex items-center justify-center tap-none hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                {/* Gloss */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Thumbnails strip */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {filteredPhotos.map((photo, i) => (
                  <motion.button
                    key={photo.id}
                    onClick={() => setActivePhoto(i)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                    className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 tap-none ${
                      i === activePhoto
                        ? 'border-[#FF6B9D] shadow-glow-pink scale-105'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.filtered} alt={photo.filterName} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* QR code for sharing */}
          {downloadQr && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-32 h-32 bg-white rounded-xl p-2 shadow-ios">
                <img src={downloadQr} alt="Download QR Code" className="w-full h-full" />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <QrCode className="w-3 h-3" />
                {t('Scan untuk unduh di perangkat lain', 'Scan to download on another device')}
              </p>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full space-y-3"
          >
            {/* Download all */}
            {filteredPhotos.length > 1 && (
              <Button
                onClick={handleDownloadAll}
                className="w-full h-13 text-sm font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:opacity-90 text-white shadow-glow-pink transition-all scale-press"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t(`Unduh Semua (${filteredPhotos.length} foto)`, `Download All (${filteredPhotos.length} photos)`)}
              </Button>
            )}

            {/* Done */}
            <Button
              onClick={() => resetAll()}
              className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#06D6A0] to-[#34D399] hover:opacity-90 text-white transition-all scale-press"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {t('Mulai Sesi Baru', 'Start New Session')}
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
}