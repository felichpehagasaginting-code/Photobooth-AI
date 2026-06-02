'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, QrCode, Loader2, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { usePhotoboothStore } from '@/store/photobooth';
import { formatPrice, type TransactionInfo } from '@/types';

export default function PaymentScreen() {
  const {
    selectedPackage,
    selectedFilters,
    setStep,
    setCurrentTransaction,
    language,
  } = usePhotoboothStore();

  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isPaying, setIsPaying] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'created' | 'paid' | 'expired' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  // Generate QR code as SVG
  const generateQR = useCallback((data: string) => {
    QRCode.toString(data, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#030611',
        light: '#FFFFFF',
      },
    })
      .then((svgString: string) => {
        const dataUri = `data:image/svg+xml;base64,${btoa(svgString)}`;
        setQrDataUrl(dataUri);
      })
      .catch((err: unknown) => {
        console.error('QR generation error:', err);
      });
  }, []);

  // Create transaction and generate QR on mount
  useEffect(() => {
    const createTransaction = async () => {
      try {
        setIsPaying(true);
        setPaymentStatus('idle');

        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: selectedPackage?.id,
            amount: selectedPackage?.price,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const txn = data.transaction;
          setTransactionId(txn.id);
          setOrderId(txn.orderId);

          const qrPayload = `PHOTOBOOTH|${txn.orderId}|${txn.amount}|${txn.id}`;
          await generateQR(qrPayload);
          setPaymentStatus('created');
        } else {
          setPaymentStatus('error');
          setErrorMessage(t('Gagal membuat transaksi', 'Failed to create transaction'));
        }
      } catch {
        setPaymentStatus('error');
        setErrorMessage(t('Gagal terhubung ke server', 'Failed to connect to server'));
      } finally {
        setIsPaying(false);
      }
    };

    if (selectedPackage && paymentStatus === 'idle') {
      createTransaction();
    }
  }, [selectedPackage, paymentStatus, generateQR, t]);

  // Poll transaction status
  useEffect(() => {
    if (!transactionId || paymentStatus !== 'created') return;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/transactions/${transactionId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'paid') {
            setPaymentStatus('paid');

            const filterNames = selectedFilters.map((f) => f.name).join(', ');
            const transaction: TransactionInfo = {
              id: data.id,
              orderId: data.orderId,
              packageId: selectedPackage?.id || '',
              amount: data.amount,
              status: 'paid',
              paymentMethod: data.paymentMethod || 'QRIS',
              paymentTime: data.paymentTime || new Date().toISOString(),
              downloadToken: data.downloadToken,
              tokenExpiresAt: data.tokenExpiresAt,
              filterNames,
              createdAt: data.createdAt,
            };

            setCurrentTransaction(transaction);
            setTimeout(() => {
              setStep('download');
            }, 600);
          } else if (data.status === 'expired' || data.status === 'cancelled') {
            setPaymentStatus('expired');
          }
        }
      } catch {
        // Silently retry on next poll
      }
    };

    pollingRef.current = setInterval(pollStatus, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [transactionId, paymentStatus, selectedPackage, selectedFilters, setCurrentTransaction, setStep]);

  // Auto-expire timer
  useEffect(() => {
    if (paymentStatus !== 'created') return;

    timeoutRef.current = setTimeout(() => {
      if (paymentStatus === 'created') {
        setPaymentStatus('expired');
      }
    }, 15 * 60 * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [paymentStatus]);

  // Countdown timer display
  useEffect(() => {
    if (paymentStatus !== 'created') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentStatus]);

  // Manual pay handler
  const handleManualPay = useCallback(async () => {
    if (!transactionId || isPaying) return;
    setIsPaying(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/transactions/${transactionId}/pay`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        const filterNames = selectedFilters.map((f) => f.name).join(', ');

        const transaction: TransactionInfo = {
          id: data.transaction.id,
          orderId: data.transaction.orderId,
          packageId: selectedPackage?.id || '',
          amount: data.transaction.amount,
          status: 'paid',
          paymentMethod: 'QRIS',
          paymentTime: data.transaction.paymentTime || new Date().toISOString(),
          downloadToken: data.transaction.downloadToken,
          tokenExpiresAt: data.transaction.tokenExpiresAt,
          filterNames,
          createdAt: data.transaction.createdAt,
        };

        setCurrentTransaction(transaction);
        setPaymentStatus('paid');
        setTimeout(() => {
          setStep('download');
        }, 600);
      } else {
        setErrorMessage(t('Pembayaran gagal', 'Payment failed'));
      }
    } catch {
      setErrorMessage(t('Gagal terhubung ke server', 'Connection failed'));
    } finally {
      setIsPaying(false);
    }
  }, [transactionId, isPaying, selectedPackage, selectedFilters, setCurrentTransaction, setStep, t]);

  const handleCancel = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStep('customize');
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setTransactionId(null);
    setOrderId(null);
    setQrDataUrl(null);
    setErrorMessage(null);
  };

  const handleBackToIdle = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    usePhotoboothStore.getState().resetAll();
  };

  // Skip payment and go directly to download
  const handleSkipPayment = async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const filterNames = selectedFilters.map((f) => f.name).join(', ');
    const fallbackOrderId = `PB-FREE-${Date.now().toString(36).toUpperCase()}`;

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage?.id,
          amount: 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetch(`/api/transactions/${data.transaction.id}/pay`, {
          method: 'POST',
        });

        const transaction: TransactionInfo = {
          id: data.transaction.id,
          orderId: data.transaction.orderId,
          packageId: selectedPackage?.id || '',
          amount: 0,
          status: 'paid',
          paymentMethod: 'FREE',
          paymentTime: new Date().toISOString(),
          filterNames,
          createdAt: data.transaction.createdAt,
        };

        setCurrentTransaction(transaction);
        setStep('download');
        return;
      }
    } catch {
      // Fallback
    }

    const transaction: TransactionInfo = {
      id: `txn-free-${Date.now()}`,
      orderId: fallbackOrderId,
      packageId: selectedPackage?.id || '',
      amount: 0,
      status: 'paid',
      paymentMethod: 'FREE',
      paymentTime: new Date().toISOString(),
      filterNames,
      createdAt: new Date().toISOString(),
    };
    setCurrentTransaction(transaction);
    setStep('download');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="relative min-h-screen overflow-hidden select-none flex flex-col" style={{ background: '#030611' }}>
      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }}
      />

      {/* Radial ambient glow */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 80%, rgba(43,92,246,0.08) 0%, transparent 70%)' }} />

      {/* ── Navbar ── */}
      <div className="relative z-20 flex items-center gap-3 px-6 lg:px-12 py-4"
        style={{ background: 'rgba(3,6,17,0.85)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(43,92,246,0.1)' }}
      >
        <button
          onClick={handleCancel}
          disabled={isPaying}
          title="Back"
          aria-label="Back"
          className="w-9 h-9 flex items-center justify-center text-[#7687a1] hover:text-var(--copper) tap-none press disabled:opacity-30"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="h-4 w-px" style={{ background: 'rgba(29,39,64,0.8)' }} />

        <div className="flex items-center gap-2">
          <div className="h-px w-4 bg-var(--copper)" />
          <span className="text-[9px] font-bold tracking-[0.35em] text-var(--copper) uppercase font-body">Pembayaran QRIS</span>
        </div>

        <div className="flex-1" />

        <div className="text-[8px] font-bold tracking-[0.35em] text-var(--copper) uppercase border border-[#2b5cf6]/30 px-2 py-0.5 font-body">
          STEP 3 / 4
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row gap-8 items-center justify-center">
        
        {/* Left Card: Invoice */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-[48%] flex flex-col gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-3 bg-[#2dd4bf]" />
              <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-[#2dd4bf] font-body">Invoice Details</span>
            </div>
            <h1 className="font-display font-black text-3xl text-[#f1f4fb]">
              Total <span className="italic text-gradient-copper">Pembayaran</span>
            </h1>
            <p className="font-display font-black text-4xl text-[#f1f4fb] mt-2 font-mono-nums tracking-tight">
              {formatPrice(selectedPackage?.price || 0)}
            </p>
          </div>

          {/* Details breakdown */}
          <div className="p-5 space-y-3" style={{ background: '#0a0e1c', border: '1px solid rgba(29,39,64,0.8)', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
            <div className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid rgba(29,39,64,0.4)' }}>
              <span className="text-[10px] tracking-wider text-[#7687a1] uppercase font-body">{t('Layanan', 'Service')}</span>
              <span className="text-xs font-bold text-[#f1f4fb] font-body">AI Photobooth</span>
            </div>
            <div className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid rgba(29,39,64,0.4)' }}>
              <span className="text-[10px] tracking-wider text-[#7687a1] uppercase font-body">{t('Paket / Format', 'Package / Format')}</span>
              <span className="text-xs font-bold text-[#f1f4fb] font-body">{selectedPackage?.name}</span>
            </div>
            <div className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid rgba(29,39,64,0.4)' }}>
              <span className="text-[10px] tracking-wider text-[#7687a1] uppercase font-body">{t('Filter AI', 'AI Filters')}</span>
              <span className="text-xs font-bold text-[#f1f4fb] font-body max-w-[20ch] truncate text-right">
                {selectedFilters.map((f) => f.name).join(', ')}
              </span>
            </div>
            {orderId && (
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-[10px] tracking-wider text-[#7687a1] uppercase font-body">{t('Order ID', 'Order ID')}</span>
                <span className="text-xs font-mono text-var(--amber) select-text">{orderId}</span>
              </div>
            )}
          </div>

          {/* Secure disclaimer */}
          <div className="flex items-start gap-2.5 px-1 opacity-70">
            <Check className="w-4 h-4 text-[#2dd4bf] mt-0.5 shrink-0" />
            <p className="text-[10px] text-[#7687a1] font-body leading-relaxed">
              {t('Pembayaran diamankan secara otomatis. Status transaksi diperbarui secara real-time.', 'Payments are secured automatically. Transaction status updates in real-time.')}
            </p>
          </div>
        </motion.div>

        {/* Right Card: QRIS Terminal */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-[48%] flex flex-col items-center gap-5 p-6"
          style={{ background: '#0a0e1c', border: '1px solid rgba(43,92,246,0.18)', clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)' }}
        >
          {/* Heartbeat Status Indicator */}
          <div className="flex items-center justify-between w-full pb-3" style={{ borderBottom: '1px solid rgba(29,39,64,0.6)' }}>
            <div className="flex items-center gap-2">
              {paymentStatus === 'created' && (
                <div className="w-2 h-2 rounded-full bg-[#2dd4bf] relative pulse-dot" />
              )}
              {paymentStatus === 'paid' && (
                <div className="w-2 h-2 rounded-full bg-[#2dd4bf]" />
              )}
              {paymentStatus === 'idle' && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-var(--copper)" />
              )}
              {paymentStatus === 'error' && (
                <AlertCircle className="w-3.5 h-3.5 text-[#ff4a4a]" />
              )}
              <span className="text-[9px] font-bold tracking-[0.25em] text-[#7687a1] uppercase font-body">
                {paymentStatus === 'idle' && t('Memproses...', 'Processing...')}
                {paymentStatus === 'created' && t('Menunggu Scan', 'Awaiting Scan')}
                {paymentStatus === 'paid' && t('Lunas', 'Paid')}
                {paymentStatus === 'expired' && t('Kedaluwarsa', 'Expired')}
                {paymentStatus === 'error' && t('Galat', 'Error')}
              </span>
            </div>

            {/* Countdown Limit */}
            {paymentStatus === 'created' && (
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-var(--amber)">
                <Clock className="w-3 h-3" />
                <span>{formattedTime}</span>
              </div>
            )}
          </div>

          <div className="relative w-full aspect-square max-w-[210px] bg-white rounded-lg p-3 flex items-center justify-center overflow-hidden border border-slate-200">
            {/* Real QRIS Code */}
            {paymentStatus === 'created' && qrDataUrl ? (
              <>
                <img src={qrDataUrl} alt="Payment QR Code" className="w-full h-full object-contain" />
                {/* Scanner effect line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-[#2b5cf6]/40 pointer-events-none"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
                />
              </>
            ) : paymentStatus === 'paid' ? (
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 flex items-center justify-center text-[#2dd4bf]">
                  <Check className="w-6 h-6" strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-slate-800">{t('DIBAYAR', 'PAID')}</span>
              </motion.div>
            ) : paymentStatus === 'idle' ? (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-600">
                <Loader2 className="w-8 h-8 animate-spin text-var(--copper)" />
                <span className="text-[9px] tracking-widest font-bold uppercase">{t('Membuat QR', 'Generating QR')}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-[#ff4a4a]">
                <AlertCircle className="w-8 h-8" />
                <span className="text-[9px] tracking-widest font-bold uppercase text-center">{errorMessage || t('Transaksi Batal', 'Tx Cancelled')}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="w-full space-y-2 mt-2">
            <AnimatePresence mode="wait">
              {paymentStatus === 'created' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                  <button
                    onClick={handleManualPay}
                    disabled={isPaying}
                    className="w-full btn-solid h-12 text-[11px] font-body font-bold tracking-wider press flex items-center justify-center gap-2"
                  >
                    {isPaying ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#030611]" />
                    ) : (
                      <QrCode className="w-4 h-4" />
                    )}
                    {t('KONFIRMASI BAYAR', 'CONFIRM PAYMENT')}
                  </button>

                  <button
                    onClick={handleSkipPayment}
                    className="w-full h-11 text-[10px] tracking-widest font-bold uppercase press text-var(--amber) border border-dashed border-[#9cb6f9]/30 hover:border-[#9cb6f9]/60 hover:bg-[#9cb6f9]/5 transition-all"
                  >
                    {t('Sesi Gratis (Tanpa Bayar) ✦', 'Free Session (Skip Payment) ✦')}
                  </button>
                </motion.div>
              )}

              {(paymentStatus === 'error' || paymentStatus === 'expired') && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <button
                    onClick={handleRetry}
                    className="w-full btn-solid h-12 text-[11px] font-body font-bold tracking-wider press"
                  >
                    {t('COBA LAGI', 'RETRY TRANSACTION')}
                  </button>
                  <button
                    onClick={handleBackToIdle}
                    className="w-full h-11 text-[10px] tracking-widest font-bold uppercase press text-[#7687a1] border border-[rgba(29,39,64,0.8)] hover:text-[#f1f4fb]"
                  >
                    {t('KEMBALI KE BERANDA', 'BACK TO START')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom details ── */}
      <div className="relative z-10 px-6 lg:px-12 pb-5 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <div className="h-px w-6" style={{ background: 'rgba(43,92,246,0.3)' }} />
          <span className="text-[8px] tracking-[0.4em] text-[#1d2740] uppercase font-body">Booth Secure Gateway</span>
        </div>
        {paymentStatus === 'created' && (
          <button
            onClick={handleCancel}
            className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#7687a1] hover:text-[#ff4a4a] tap-none press"
          >
            {t('Batalkan Sesi', 'Cancel Session')}
          </button>
        )}
      </div>
    </div>
  );
}