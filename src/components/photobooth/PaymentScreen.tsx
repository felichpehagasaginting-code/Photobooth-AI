'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, QrCode, Loader2 } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { formatPrice, generateOrderId, type TransactionInfo } from '@/types';
import { Button } from '@/components/ui/button';

// Simple QR code placeholder using SVG pattern
function QRPlaceholder() {
  return (
    <div className="w-48 h-48 bg-white rounded-xl p-3 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* QR code-like pattern */}
        {Array.from({ length: 25 }).map((_, row) =>
          Array.from({ length: 25 }).map((_, col) => {
            const isBorder =
              row < 2 || row > 22 || col < 2 || col > 22;
            const isCornerBlock =
              (row < 7 && col < 7) ||
              (row < 7 && col > 17) ||
              (row > 17 && col < 7);
            const isRandom = Math.random() > 0.5;
            const shouldFill = isBorder || isCornerBlock || isRandom;
            return shouldFill ? (
              <rect
                key={`${row}-${col}`}
                x={col * 4}
                y={row * 4}
                width={4}
                height={4}
                fill="#000"
              />
            ) : null;
          })
        )}
      </svg>
    </div>
  );
}

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
  const [paymentSimulated, setPaymentSimulated] = useState(false);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  // Countdown timer
  useEffect(() => {
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
  }, []);

  // Simulate payment after 5 seconds
  const simulatePayment = useCallback(async () => {
    if (paymentSimulated || isPaying) return;
    setIsPaying(true);

    try {
      const filterNames = selectedFilters.map((f) => f.name).join(', ');

      // Step 1: Create a transaction
      const createRes = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage?.id,
          amount: selectedPackage?.price,
        }),
      });

      let transactionId = '';
      let orderId = generateOrderId();

      if (createRes.ok) {
        const createData = await createRes.json();
        transactionId = createData.transaction?.id || '';
        orderId = createData.transaction?.orderId || orderId;

        // Step 2: Simulate payment
        if (transactionId) {
          await fetch(`/api/transactions/${transactionId}/pay`, {
            method: 'POST',
          });
        }
      }

      const transaction: TransactionInfo = {
        id: transactionId || `txn-${Date.now()}`,
        orderId,
        packageId: selectedPackage?.id || '',
        amount: selectedPackage?.price || 0,
        status: 'paid' as const,
        paymentMethod: 'QRIS',
        paymentTime: new Date().toISOString(),
        filterNames,
        createdAt: new Date().toISOString(),
      };

      setCurrentTransaction(transaction);
      setStep('download');
    } catch {
      // Fallback: create transaction locally
      const transaction: TransactionInfo = {
        id: `txn-${Date.now()}`,
        orderId: generateOrderId(),
        packageId: selectedPackage?.id || '',
        amount: selectedPackage?.price || 0,
        status: 'paid',
        paymentMethod: 'QRIS',
        paymentTime: new Date().toISOString(),
        filterNames: selectedFilters.map((f) => f.name).join(', '),
        createdAt: new Date().toISOString(),
      };
      setCurrentTransaction(transaction);
      setStep('download');
    }
  }, [paymentSimulated, isPaying, selectedPackage, selectedFilters, setCurrentTransaction, setStep]);

  useEffect(() => {
    if (!paymentSimulated) {
      const timer = setTimeout(() => {
        setPaymentSimulated(true);
        simulatePayment();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentSimulated, simulatePayment]);

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

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <QRPlaceholder />
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <QrCode className="w-4 h-4" />
            {t('Scan QRIS untuk bayar', 'Scan QRIS to pay')}
          </p>
        </motion.div>

        {/* Waiting indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-[#06D6A0]"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">
            {t('Menunggu Pembayaran...', 'Waiting for Payment...')}
          </span>
        </motion.div>

        {/* Countdown */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#15151F] border border-[#2A2A3A]">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t('Batas waktu', 'Time limit')}:
          </span>
          <span className="font-mono font-bold text-white">{formattedTime}</span>
        </div>

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

        {/* Cancel button */}
        <Button
          variant="ghost"
          onClick={() => setStep('filter-select')}
          className="text-muted-foreground hover:text-white"
        >
          {t('Batalkan', 'Cancel')}
        </Button>
      </div>
    </div>
  );
}
