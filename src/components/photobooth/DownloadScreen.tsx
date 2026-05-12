'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, RotateCcw, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { usePhotoboothStore } from '@/store/photobooth';
import { Button } from '@/components/ui/button';

export default function DownloadScreen() {
  const {
    currentTransaction,
    filteredPhotos,
    resetAll,
    language,
  } = usePhotoboothStore();

  const [showCheck, setShowCheck] = useState(false);
  const [downloadQr, setDownloadQr] = useState<string | null>(null);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  useEffect(() => {
    const timer = setTimeout(() => setShowCheck(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Generate real QR code as SVG (no canvas dependency)
  useEffect(() => {
    const generateDownloadQR = () => {
      if (!currentTransaction) return;

      const downloadUrl = `${window.location.origin}/?txn=${currentTransaction.id}&token=${currentTransaction.downloadToken || ''}`;

      QRCode.toString(downloadUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((svgString: string) => {
          const dataUri = `data:image/svg+xml;base64,${btoa(svgString)}`;
          setDownloadQr(dataUri);
        })
        .catch((err: unknown) => {
          console.error('Download QR generation error:', err);
        });
    };

    generateDownloadQR();
  }, [currentTransaction]);

  const handleDone = () => {
    resetAll();
  };

  const handleDownload = (photoIndex: number) => {
    const photo = filteredPhotos[photoIndex];
    if (!photo) return;

    const link = document.createElement('a');
    link.href = photo.filtered;
    link.download = `photobooth-${photo.filterName}-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Success checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: showCheck ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 className="w-24 h-24 text-[#06D6A0]" />
        </motion.div>

        {/* Success text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            {t('Pembayaran Berhasil!', 'Payment Successful!')}
          </h2>
          <p className="text-muted-foreground">
            {t(
              'Foto kamu sudah siap diunduh',
              'Your photos are ready to download'
            )}
          </p>
        </motion.div>

        {/* Order info */}
        {currentTransaction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full p-4 rounded-xl bg-[#15151F] border border-[#2A2A3A]"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">{t('Order ID', 'Order ID')}</span>
              <span className="text-sm font-mono text-[#FF6B9D]">
                {currentTransaction.orderId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('Status', 'Status')}</span>
              <span className="text-sm font-medium text-[#06D6A0]">
                {t('Lunas', 'Paid')}
              </span>
            </div>
          </motion.div>
        )}

        {/* Filtered photos preview */}
        {filteredPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {t('Foto Hasil Filter', 'Filtered Photos')}
            </h3>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto scrollbar-thin">
              {filteredPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="relative rounded-xl overflow-hidden border border-[#2A2A3A] group"
                >
                  <img
                    src={photo.filtered}
                    alt={photo.filterName}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(i)}
                      className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {t('Unduh', 'Download')}
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs text-white font-medium truncate">
                      {photo.filterName}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Real Download QR */}
        {downloadQr && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-40 h-40 bg-white rounded-xl p-2 mx-auto">
              <img src={downloadQr} alt="Download QR Code" className="w-full h-full" />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <QrCode className="w-3 h-3" />
              {t('Scan untuk mengunduh di perangkat lain', 'Scan to download on another device')}
            </p>
          </motion.div>
        )}

        {/* Done button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full"
        >
          <Button
            onClick={handleDone}
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#06D6A0] to-[#34D399] hover:opacity-90 text-white transition-all"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {t('Selesai', 'Done')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}