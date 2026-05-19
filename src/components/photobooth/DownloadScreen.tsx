'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RotateCcw, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { usePhotoboothStore } from '@/store/photobooth';
import { ConfettiParticles } from '@/components/common/ConfettiParticles';

export default function DownloadScreen() {
  const { currentTransaction, filteredPhotos, resetAll, language } = usePhotoboothStore();
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
    const url = `${window.location.origin}/?txn=${currentTransaction.id}&token=${currentTransaction.downloadToken || ''}`;
    QRCode.toString(url, { type: 'svg', margin: 2, color: { dark: '#f0ebe3', light: '#151210' } })
      .then((svg: string) => setDownloadQr(`data:image/svg+xml;base64,${btoa(svg)}`))
      .catch(() => {});
  }, [currentTransaction]);

  const handleDownload = (i: number) => {
    const photo = filteredPhotos[i];
    if (!photo) return;
    const a = document.createElement('a');
    a.href = photo.filtered;
    a.download = `photobooth-${photo.filterName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
    a.click();
  };

  const handleDownloadAll = () => {
    filteredPhotos.forEach((photo, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = photo.filtered;
        a.download = `photobooth-${photo.filterName.replace(/\s+/g, '-').toLowerCase()}-${i + 1}.jpg`;
        a.click();
      }, i * 200);
    });
  };

  return (
    <>
      {showCheck && <ConfettiParticles count={55} size="md" duration={4.5} />}

      <div className="min-h-screen flex flex-col overflow-hidden relative" style={{ background: '#0c0a09' }}>
        {/* Film grain */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", opacity: 0.4 }}
        />
        {/* Warm success radial */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(78,203,158,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex-1 flex flex-col items-center p-5 pt-8 gap-5 max-w-md mx-auto w-full">

          {/* ── Success mark — geometric, not rounded icon ── */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: showCheck ? 1 : 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 72, height: 72,
                background: '#4ecb9e',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0c0a09" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute"
              style={{ width: 72, height: 72, border: '1px solid rgba(78,203,158,0.4)', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
            />
          </motion.div>

          {/* ── Heading ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px w-5 bg-[#4ecb9e]" />
              <span className="text-[9px] font-bold tracking-[0.35em] text-[#4ecb9e] uppercase font-body">Complete</span>
              <div className="h-px w-5 bg-[#4ecb9e]" />
            </div>
            <h2 className="font-display font-black text-[#f0ebe3] leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>
              {t('Foto', 'Photos')}<br />
              <span className="italic text-[#4ecb9e]">{t('Siap!', 'Ready!')}</span>
            </h2>
            <p className="mt-1.5 text-[12px] text-[#7a7168] font-body">
              {t('Fotomu sudah selesai diproses AI', 'Your photos have been processed by AI')}
            </p>
          </motion.div>

          {/* ── Transaction info ── */}
          {currentTransaction && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="w-full px-4 py-3 space-y-1.5"
              style={{ background: '#151210', border: '1px solid rgba(78,203,158,0.15)', borderLeft: '3px solid #4ecb9e' }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] tracking-[0.15em] text-[#7a7168] uppercase font-body">Order ID</span>
                <span className="text-[11px] font-mono font-bold text-[#c87941]">{currentTransaction.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] tracking-[0.15em] text-[#7a7168] uppercase font-body">Status</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#4ecb9e] uppercase font-body flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot inline-block" style={{ background: '#4ecb9e' }} />
                  {t('Lunas', 'Paid')}
                </span>
              </div>
            </motion.div>
          )}

          {/* ── Photo gallery ── */}
          {filteredPhotos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full">
              {/* Main preview — clipped */}
              <div
                className="relative overflow-hidden mb-3"
                style={{
                  aspectRatio: '4/3',
                  border: '1px solid rgba(200,121,65,0.15)',
                  clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activePhoto}
                    src={filteredPhotos[activePhoto]?.filtered}
                    alt={filteredPhotos[activePhoto]?.filterName}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.38 }}
                  />
                </AnimatePresence>

                {/* Bottom info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3"
                  style={{ background: 'linear-gradient(to top, rgba(12,10,9,0.9), transparent)' }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-bold text-[#f0ebe3] font-body">{filteredPhotos[activePhoto]?.filterName}</p>
                    <button
                      onClick={() => handleDownload(activePhoto)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase font-body press tap-none"
                      style={{ background: '#c87941', color: '#0c0a09', clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)', transition: 'filter 180ms' }}
                    >
                      <Download className="w-3 h-3" />
                      {t('Unduh', 'Save')}
                    </button>
                  </div>
                </div>

                {/* Corner cut indicator */}
                <div className="absolute top-0 right-0 w-0 h-0" style={{ borderLeft: '14px solid transparent', borderTop: '14px solid rgba(200,121,65,0.5)' }} />
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {filteredPhotos.map((photo, i) => (
                  <motion.button key={photo.id}
                    onClick={() => setActivePhoto(i)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 + i * 0.07 }}
                    className="shrink-0 overflow-hidden tap-none press"
                    style={{
                      width: 52, height: 52,
                      border: i === activePhoto ? '2px solid #c87941' : '1px solid rgba(44,40,34,0.6)',
                      opacity: i === activePhoto ? 1 : 0.6,
                      transition: 'border-color 200ms, opacity 200ms',
                    }}
                  >
                    <img src={photo.filtered} alt={photo.filterName} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── QR code ── */}
          {downloadQr && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              className="flex items-center gap-4 w-full px-3 py-3"
              style={{ background: '#151210', border: '1px solid rgba(44,40,34,0.8)' }}
            >
              <div className="w-20 h-20 shrink-0 p-1.5" style={{ background: '#151210', border: '1px solid rgba(200,121,65,0.2)' }}>
                <img src={downloadQr} alt="QR Code" className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <QrCode className="w-3 h-3 text-[#c87941]" />
                  <span className="text-[9px] font-bold tracking-[0.25em] text-[#c87941] uppercase font-body">Scan to Download</span>
                </div>
                <p className="text-[11px] text-[#7a7168] font-body leading-relaxed">
                  {t('Scan untuk unduh di perangkat lain', 'Scan to download on another device')}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Actions ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="w-full space-y-3">
            {filteredPhotos.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="btn-solid w-full h-13 text-sm font-body press tap-none flex items-center justify-center gap-2"
                style={{ height: 52 }}
              >
                <Download className="w-4 h-4" />
                {t(`Unduh Semua (${filteredPhotos.length} foto)`, `Download All (${filteredPhotos.length} photos)`)}
              </button>
            )}

            <button
              onClick={() => resetAll()}
              className="btn-editorial w-full h-12 text-sm font-body press tap-none flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('Mulai Sesi Baru', 'Start New Session')}
            </button>
          </motion.div>

        </div>

        {/* Bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(200,121,65,0.2), transparent)' }} />
      </div>
    </>
  );
}