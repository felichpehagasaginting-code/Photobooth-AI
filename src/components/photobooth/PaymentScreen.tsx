'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, QrCode, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { usePhotoboothStore } from '@/store/photobooth';
import { formatPrice, type TransactionInfo } from '@/types';
import { Button } from '@/components/ui/button';

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

  // Generate QR code as SVG (no canvas dependency)
  const generateQR = useCallback((data: string) => {
    QRCode.toString(data, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#000000',
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

          // Generate real QR code with transaction payment data (QRIS-like format)
          // Format: "PB" + order_id + "|" + amount + "|" + transaction_id
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

            // Build transaction info and proceed
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
            // Brief delay to show success state then proceed
            setTimeout(() => {
              setStep('download');
            }, 500);
          } else if (data.status === 'expired' || data.status === 'cancelled') {
            setPaymentStatus('expired');
          }
        }
      } catch {
        // Silently retry on next poll
      }
    };

    pollingRef.current = setInterval(pollStatus, 2000); // Poll every 2 seconds

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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

  // Manual pay handler (for testing / simulates a real payment gateway callback)
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
        }, 500);
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
    setStep('filter-select');
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
    // Reset ke awal
    usePhotoboothStore.getState().setStep('idle');
  };

  // Skip payment and go directly to download
  const handleSkipPayment = async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Create a free transaction record
    const filterNames = selectedFilters.map((f) => f.name).join(', ');
    const orderId = `PB-FREE-${Date.now().toString(36).toUpperCase()}`;

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage?.id,
          amount: 0, // free
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Mark as paid directly
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
      // Fallback - create transaction locally
    }

    const transaction: TransactionInfo = {
      id: `txn-free-${Date.now()}`,
      orderId,
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Amount */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm mb-1">
            {t('Total Pembayaran', 'Total Payment')}
          </p>
          <p className="text-4xl font-bold text-white">
            {formatPrice(selectedPackage?.price || 0)}
          </p>
        </motion.div>

        {/* Loading state while creating transaction */}
        {paymentStatus === 'idle' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF6B9D]" />
            <p className="text-muted-foreground text-sm">
              {t('Membuat transaksi...', 'Creating transaction...')}
            </p>
          </div>
        )}

        {/* Error state */}
        {paymentStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <p className="text-red-400 text-sm">{errorMessage}</p>
            <Button onClick={handleRetry} variant="outline" className="text-white border-[#2A2A3A]">
              {t('Coba Lagi', 'Retry')}
            </Button>
          </motion.div>
        )}

        {/* Real QR Code */}
        {paymentStatus === 'created' && qrDataUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-48 h-48 bg-white rounded-xl p-3 mx-auto">
              <img src={qrDataUrl} alt="Payment QR Code" className="w-full h-full" />
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <QrCode className="w-4 h-4" />
              {t('Scan QRIS untuk bayar', 'Scan QRIS to pay')}
            </p>
            {orderId && (
              <p className="text-xs text-muted-foreground/60 font-mono">
                {t('ID Pesanan', 'Order ID')}: {orderId}
              </p>
            )}
          </motion.div>
        )}

        {/* Waiting indicator */}
        {paymentStatus === 'created' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-[#06D6A0]"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">
              {t('Menunggu Pembayaran...', 'Waiting for Payment...')}
            </span>
          </motion.div>
        )}

        {/* Paid indicator */}
        {paymentStatus === 'paid' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-[#06D6A0]"
          >
            <span className="text-sm font-medium">
              {t('Pembayaran Berhasil!', 'Payment Successful!')}
            </span>
          </motion.div>
        )}

        {/* Expired */}
        {paymentStatus === 'expired' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <p className="text-red-400 text-sm">
              {t('Waktu pembayaran habis', 'Payment time expired')}
            </p>
            <Button onClick={handleRetry} variant="outline" className="text-white border-[#2A2A3A]">
              {t('Buat Ulang', 'Create New')}
            </Button>
          </motion.div>
        )}

        {/* Countdown */}
        {paymentStatus === 'created' && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#15151F] border border-[#2A2A3A]">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t('Batas waktu', 'Time limit')}:
            </span>
            <span className="font-mono font-bold text-white">{formattedTime}</span>
          </div>
        )}

        {/* Package info */}
        <div className="w-full p-4 rounded-xl bg-[#15151F] border border-[#2A2A3A]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">{t('Paket', 'Package')}</span>
            <span className="text-sm font-medium text-white">
              {selectedPackage?.name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t('Filter', 'Filters')}</span>
            <span className="text-sm font-medium text-white">
              {selectedFilters.map((f) => f.name).join(', ')}
            </span>
          </div>
        </div>

        {/* Manual pay button (for testing) */}
        {paymentStatus === 'created' && (
          <Button
            onClick={handleManualPay}
            disabled={isPaying}
            className="w-full h-12 text-sm font-bold rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:opacity-90 text-white transition-all disabled:opacity-50"
          >
            {isPaying ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <QrCode className="w-4 h-4 mr-2" />
            )}
            {t('Konfirmasi Pembayaran Manual', 'Manual Payment Confirmation')}
          </Button>
        )}

        {/* Skip payment button */}
        {paymentStatus === 'created' && (
          <Button
            variant="ghost"
            onClick={handleSkipPayment}
            className="w-full h-12 text-base font-medium rounded-xl border-2 border-dashed border-[#FF6B9D]/40 text-[#FF6B9D] hover:bg-[#FF6B9D]/10 hover:border-[#FF6B9D] transition-all"
          >
            {t('Lanjutkan Tanpa Pembayaran', 'Continue Without Payment')} →
          </Button>
        )}

        {/* Cancel button */}
        {paymentStatus === 'created' && (
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-white"
          >
            {t('Batalkan', 'Cancel')}
          </Button>
        )}

        {/* Back to start for error/expired */}
        {(paymentStatus === 'error' || paymentStatus === 'expired') && (
          <Button
            variant="ghost"
            onClick={handleBackToIdle}
            className="text-muted-foreground hover:text-white"
          >
            {t('Kembali ke Awal', 'Back to Start')}
          </Button>
        )}
      </div>
    </div>
  );
}