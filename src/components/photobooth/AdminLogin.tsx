'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { Button } from '@/components/ui/button';

const ADMIN_PIN = '123456';

export default function AdminLogin() {
  const { setStep, setAdminLoggedIn, goBack, language } = usePhotoboothStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const handleNumber = useCallback((num: string) => {
    setPin((prev) => {
      if (prev.length >= 6) return prev;
      return prev + num;
    });
    setError(false);
  }, []);

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  const handleEnter = useCallback(() => {
    if (pin === ADMIN_PIN) {
      setAdminLoggedIn(true);
      setStep('admin-dashboard');
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 500);
    }
  }, [pin, setAdminLoggedIn, setStep]);

  const handleCancel = () => {
    goBack();
  };

  const numberPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['back', '0', 'enter'],
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]/95 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm flex flex-col items-center gap-6"
      >
        {/* Lock icon */}
        <div className="w-16 h-16 rounded-full bg-[#15151F] border border-[#2A2A3A] flex items-center justify-center">
          <Lock className="w-8 h-8 text-[#FF6B9D]" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">
            {t('Admin Login', 'Admin Login')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('Masukkan PIN 6 digit', 'Enter 6-digit PIN')}
          </p>
        </div>

        {/* PIN display */}
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                i < pin.length
                  ? error
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-[#FF6B9D] bg-[#FF6B9D]/10'
                  : 'border-[#2A2A3A] bg-[#15151F]'
              }`}
            >
              {i < pin.length && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-3 h-3 rounded-full bg-[#FF6B9D]"
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm"
          >
            {t('PIN salah, coba lagi', 'Wrong PIN, try again')}
          </motion.p>
        )}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {numberPad.flat().map((key) => {
            if (key === 'back') {
              return (
                <Button
                  key={key}
                  variant="ghost"
                  onClick={handleBackspace}
                  className="h-16 rounded-xl bg-[#15151F] border border-[#2A2A3A] hover:bg-[#2A2A3A] text-white"
                >
                  <Delete className="w-5 h-5" />
                </Button>
              );
            }
            if (key === 'enter') {
              return (
                <Button
                  key={key}
                  onClick={handleEnter}
                  disabled={pin.length !== 6}
                  className="h-16 rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] text-white font-bold disabled:opacity-40"
                >
                  &#10003;
                </Button>
              );
            }
            return (
              <Button
                key={key}
                variant="ghost"
                onClick={() => handleNumber(key)}
                className="h-16 rounded-xl bg-[#15151F] border border-[#2A2A3A] hover:bg-[#2A2A3A] text-white text-xl font-bold"
              >
                {key}
              </Button>
            );
          })}
        </div>

        {/* Cancel */}
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="text-muted-foreground hover:text-white"
        >
          {t('Batal', 'Cancel')}
        </Button>
      </motion.div>
    </div>
  );
}
