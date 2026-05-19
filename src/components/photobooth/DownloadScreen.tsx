'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RotateCcw, Share2, Instagram, QrCode, Star, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { usePhotoboothStore } from '@/store/photobooth';
import { ConfettiParticles } from '@/components/common/ConfettiParticles';

/* ── Reel strip preview (horizontal scroller) ── */
function PhotoReel({ photos, activeIdx, onSelect }: {
  photos: { id: string; filtered: string; filterName: string }[];
  activeIdx: number;
  onSelect: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.children[activeIdx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIdx]);

  return (
    <div ref={ref} className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      {photos.map((photo, i) => (
        <motion.button
          key={photo.id}
          onClick={() => onSelect(i)}
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
          className="shrink-0 relative overflow-hidden tap-none"
          style={{
            width: 60, height: 60,
            border: i === activeIdx ? '2px solid #c87941' : '1px solid rgba(44,40,34,0.6)',
            transform: i === activeIdx ? 'scale(1.05)' : 'scale(1)',
            transition: 'border-color 200ms, transform 200ms',
          }}
        >
          <img src={photo.filtered} alt={photo.filterName} className="w-full h-full object-cover" />
          {i === activeIdx && (
            <div className="absolute inset-0" style={{ background: 'rgba(200,121,65,0.15)' }} />
          )}
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: i === activeIdx ? '#c87941' : 'transparent' }} />
        </motion.button>
      ))}
    </div>
  );
}

/* ── Social share action ── */
function ShareAction({ label, icon: Icon, onClick, color }: { label: string; icon: React.ElementType; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 tap-none press group"
    >
      <div
        className="w-11 h-11 flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ background: '#1d1a17', border: `1px solid ${color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-[#7a7168] font-body">{label}</span>
    </button>
  );
}

/* ── Rating widget ── */
function RatingWidget() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 justify-center">
        <Check className="w-3.5 h-3.5 text-[#4ecb9e]" />
        <span className="text-[10px] text-[#4ecb9e] font-body tracking-wider">Terima kasih!</span>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[9px] tracking-[0.25em] text-[#7a7168] uppercase font-body">Rate pengalaman kamu</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => { setRating(i); setSubmitted(true); }}
            className="tap-none"
          >
            <Star
              className="w-5 h-5 transition-all"
              style={{ color: i <= (hovered || rating) ? '#e8a02a' : '#2c2822', fill: i <= (hovered || rating) ? '#e8a02a' : 'none' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DownloadScreen() {
  const { currentTransaction, filteredPhotos, resetAll, language } = usePhotoboothStore();
  const [showCheck, setShowCheck] = useState(false);
  const [downloadQr, setDownloadQr] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [downloaded, setDownloaded] = useState<Set<number>>(new Set());

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
    a.download = `aibooth-${photo.filterName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
    a.click();
    setDownloaded(prev => new Set([...prev, i]));
  };

  const handleDownloadAll = () => {
    filteredPhotos.forEach((_, i) => setTimeout(() => handleDownload(i), i * 250));
  };

  const handleShare = () => {
    const photo = filteredPhotos[activePhoto];
    if (navigator.share && photo) {
      navigator.share({ title: 'AI Photobooth', text: 'Check out my AI photobooth creation!', url: window.location.href })
        .catch(() => {});
    }
  };

  return (
    <>
      {showCheck && <ConfettiParticles count={65} size="md" duration={5} />}

      <div className="min-h-screen flex flex-col md:flex-row overflow-hidden relative" style={{ background: '#0c0a09' }}>

        {/* Film grain */}
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", opacity: 0.4 }}
        />
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(78,203,158,0.07) 0%, transparent 70%)' }}
        />

        {/* ── Left: Large photo display ── */}
        <div className="relative z-10 flex-1 flex flex-col p-5 md:p-10 gap-4 md:h-screen">

          {/* Header bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-px w-5 bg-[#4ecb9e]" />
              <span className="text-[9px] font-bold tracking-[0.35em] text-[#4ecb9e] uppercase font-body">Sesi Selesai</span>
            </div>
            {currentTransaction && (
              <span className="text-[9px] font-mono text-[#2c2822]">{currentTransaction.orderId}</span>
            )}
          </div>

          {/* Main photo — full bleed with overlay info */}
          {filteredPhotos.length > 0 && (
            <motion.div
              className="relative flex-1 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
                border: '1px solid rgba(200,121,65,0.15)',
                minHeight: 260,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activePhoto}
                  src={filteredPhotos[activePhoto]?.filtered}
                  alt={filteredPhotos[activePhoto]?.filterName}
                  className="w-full h-full object-contain"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ background: '#151210' }}
                />
              </AnimatePresence>

              {/* Corner cut */}
              <div className="absolute top-0 right-0 w-0 h-0" style={{ borderLeft: '20px solid transparent', borderTop: '20px solid rgba(200,121,65,0.5)' }} />

              {/* Bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between"
                style={{ background: 'linear-gradient(to top, rgba(12,10,9,0.95), transparent)' }}
              >
                <div>
                  <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#7a7168] mb-0.5 font-body">Filter</p>
                  <p className="text-[#f0ebe3] font-display font-bold text-lg leading-none">
                    {filteredPhotos[activePhoto]?.filterName}
                  </p>
                </div>

                <motion.button
                  onClick={() => handleDownload(activePhoto)}
                  whileTap={{ scale: 0.93 }}
                  className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase font-body press tap-none"
                  style={{
                    background: downloaded.has(activePhoto) ? '#4ecb9e' : '#c87941',
                    color: '#0c0a09',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  }}
                >
                  {downloaded.has(activePhoto) ? <><Check className="w-3.5 h-3.5" />{t('Tersimpan', 'Saved')}</> : <><Download className="w-3.5 h-3.5" />{t('Unduh', 'Save')}</>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Thumbnail reel */}
          {filteredPhotos.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <PhotoReel photos={filteredPhotos} activeIdx={activePhoto} onSelect={setActivePhoto} />
            </motion.div>
          )}
        </div>

        {/* ── Right: Actions panel ── */}
        <div
          className="relative z-20 w-full md:w-[340px] flex flex-col p-5 gap-5 border-t md:border-t-0 md:border-l"
          style={{ borderColor: 'rgba(200,121,65,0.12)', background: '#0c0a09' }}
        >
          {/* Success mark */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div
              className="relative flex items-center justify-center shrink-0"
              style={{ width: 56, height: 56, background: '#4ecb9e', clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c0a09" strokeWidth={3} strokeLinecap="square">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <motion.div
                className="absolute"
                animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ inset: 0, border: '1px solid rgba(78,203,158,0.4)', clipPath: 'inherit' }}
              />
            </div>
            <div>
              <h2 className="font-display font-black text-[#f0ebe3] leading-tight" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)' }}>
                {t('Foto Siap!', 'Photos Ready!')}
              </h2>
              <p className="text-[11px] text-[#7a7168] font-body mt-0.5">
                {t(`${filteredPhotos.length} foto diproses AI`, `${filteredPhotos.length} AI-processed photos`)}
              </p>
            </div>
          </motion.div>

          <div style={{ height: 1, background: 'rgba(44,40,34,0.8)' }} />

          {/* Transaction block */}
          {currentTransaction && (
            <motion.div
              initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="space-y-2 p-3"
              style={{ background: '#151210', border: '1px solid rgba(78,203,158,0.12)', borderLeft: '3px solid #4ecb9e' }}
            >
              {[
                { label: 'Order ID', val: currentTransaction.orderId },
                { label: 'Status', val: 'Lunas ✓', isGreen: true },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-[9px] tracking-[0.2em] text-[#7a7168] uppercase font-body">{item.label}</span>
                  <span className={`text-[10px] font-bold font-body ${item.isGreen ? 'text-[#4ecb9e]' : 'text-[#c87941] font-mono'}`}>{item.val}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Social share */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <p className="text-[9px] tracking-[0.25em] text-[#7a7168] uppercase font-body mb-3">Bagikan</p>
            <div className="flex gap-3">
              <ShareAction label="Share" icon={Share2} onClick={handleShare} color="#c87941" />
              <ShareAction label="IG Story" icon={Instagram} onClick={handleShare} color="#e8a02a" />
            </div>
          </motion.div>

          {/* QR code */}
          {downloadQr && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex items-center gap-3 p-3"
              style={{ background: '#151210', border: '1px solid rgba(44,40,34,0.8)' }}
            >
              <div className="w-16 h-16 shrink-0 p-1.5" style={{ background: '#151210', border: '1px solid rgba(200,121,65,0.2)' }}>
                <img src={downloadQr} alt="QR" className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <QrCode className="w-3 h-3 text-[#c87941]" />
                  <span className="text-[8px] font-bold tracking-[0.25em] text-[#c87941] uppercase font-body">Scan to Download</span>
                </div>
                <p className="text-[10px] text-[#7a7168] font-body">Scan untuk unduh di HP kamu</p>
              </div>
            </motion.div>
          )}

          {/* Rating */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            className="p-3" style={{ background: '#151210', border: '1px solid rgba(44,40,34,0.6)' }}
          >
            <RatingWidget />
          </motion.div>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="space-y-3 mt-auto">
            {filteredPhotos.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="btn-solid w-full h-13 text-sm font-body press tap-none flex items-center justify-center gap-2"
                style={{ height: 52 }}
              >
                <Download className="w-4 h-4" />
                {t(`Unduh Semua (${filteredPhotos.length})`, `Download All (${filteredPhotos.length})`)}
              </button>
            )}

            <button
              onClick={() => resetAll()}
              className="btn-editorial w-full h-12 text-sm font-body press tap-none flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('Sesi Baru', 'New Session')}
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}