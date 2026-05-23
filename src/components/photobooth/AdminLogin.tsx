'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';

const ADMIN_PIN = '123456';

/* ── Digit key button ────────────────────────────────────────────────── */
function PadKey({
  label,
  sub,
  onClick,
  variant = 'digit',
  disabled = false,
}: {
  label: React.ReactNode;
  sub?: string;
  onClick: () => void;
  variant?: 'digit' | 'action' | 'confirm';
  disabled?: boolean;
}) {
  const base =
    'relative h-[68px] flex flex-col items-center justify-center gap-0.5 press tap-none font-body font-bold select-none';

  const styles: Record<string, React.CSSProperties> = {
    digit: {
      background: '#0a0e1c',
      border: '1px solid rgba(29,39,64,0.8)',
      color: '#f1f4fb',
      fontSize: '1.35rem',
    },
    action: {
      background: 'transparent',
      border: '1px solid rgba(29,39,64,0.6)',
      color: '#7687a1',
      fontSize: '0.9rem',
    },
    confirm: {
      background: disabled ? '#0a0e1c' : 'var(--copper)',
      border: disabled ? '1px solid rgba(29,39,64,0.5)' : '1px solid var(--copper)',
      color: disabled ? '#1d2740' : '#030611',
      fontSize: '1rem',
      cursor: disabled ? 'not-allowed' : 'pointer',
    },
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.93 }}
      onClick={onClick}
      disabled={disabled}
      className={base}
      style={{
        ...styles[variant],
        /* Angled corner — top-right cut for digit keys */
        clipPath: variant === 'confirm'
          ? 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
          : undefined,
        transition: 'background-color 180ms cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      <span>{label}</span>
      {sub && <span style={{ fontSize: '0.6rem', letterSpacing: '0.12em', opacity: 0.45 }}>{sub}</span>}
    </motion.button>
  );
}

/* ── Main ───────────────────────────────────────────────────────────── */
export default function AdminLogin() {
  const { setStep, setAdminLoggedIn, goBack, language } = usePhotoboothStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const handleNumber = useCallback((num: string) => {
    setPin(prev => { if (prev.length >= 6) return prev; return prev + num; });
    setError(false);
  }, []);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  }, []);

  const handleEnter = useCallback(() => {
    if (pin === ADMIN_PIN) {
      setAdminLoggedIn(true);
      setStep('admin-dashboard');
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => { setShake(false); setPin(''); }, 540);
    }
  }, [pin, setAdminLoggedIn, setStep]);

  const rows = [
    [{ n: '1', s: '' }, { n: '2', s: 'ABC' }, { n: '3', s: 'DEF' }],
    [{ n: '4', s: 'GHI' }, { n: '5', s: 'JKL' }, { n: '6', s: 'MNO' }],
    [{ n: '7', s: 'PQRS' }, { n: '8', s: 'TUV' }, { n: '9', s: 'WXYZ' }],
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#030611' }}
    >
      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.5 }} />

      {/* Cool radial */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 40%, rgba(43,92,246,0.06) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-[320px] flex flex-col"
      >
        {/* Header — left-aligned editorial */}
        <div className="mb-6 px-1">
          <div className="flex items-center gap-2 mb-3">
            <div style={{ width: 26, height: 26, background: 'var(--copper)', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#030611" strokeWidth="2.5" strokeLinecap="square">
                <rect x="3" y="11" width="18" height="11" rx="0" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="text-[9px] font-bold tracking-[0.35em] text-var(--copper) uppercase font-body">Admin Access</span>
          </div>
          <h1 className="font-display font-black text-[#f1f4fb] leading-tight" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)' }}>
            Enter<br /><span className="italic text-gradient-copper">PIN</span>
          </h1>
          <p className="mt-1.5 text-[11px] text-[#7687a1] font-body tracking-wide">
            {t('Masukkan PIN 6 digit', 'Enter your 6-digit PIN')}
          </p>
        </div>

        {/* PIN display — underline style, not boxes */}
        <motion.div
          animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="flex gap-2 mb-5 px-1"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <AnimatePresence>
                {i < pin.length && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: error ? '#d94040' : 'var(--copper)' }}
                  />
                )}
              </AnimatePresence>
              {i >= pin.length && <div className="w-2 h-2" />}
              {/* Underline indicator */}
              <div style={{
                height: 2,
                width: '100%',
                background: i < pin.length
                  ? (error ? '#d94040' : 'var(--copper)')
                  : 'rgba(29,39,64,0.8)',
                transition: 'background 200ms cubic-bezier(0.33, 1, 0.68, 1)',
              }} />
            </div>
          ))}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-3 px-1 text-[11px] font-body text-[#d94040] tracking-wide"
            >
              {t('✕ PIN salah, coba lagi', '✕ Wrong PIN, try again')}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2">
          {rows.map((row, ri) =>
            row.map(({ n, s }) => (
              <PadKey key={`${ri}-${n}`} label={n} sub={s} onClick={() => handleNumber(n)} />
            ))
          )}

          {/* Bottom row: backspace | 0 | confirm */}
          <PadKey
            label={<Delete className="w-4 h-4" />}
            onClick={handleBackspace}
            variant="action"
          />
          <PadKey label="0" onClick={() => handleNumber('0')} />
          <PadKey
            label={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
            onClick={handleEnter}
            variant="confirm"
            disabled={pin.length !== 6}
          />
        </div>

        {/* Cancel — minimal underline link */}
        <button
          onClick={goBack}
          className="mt-5 text-center text-[11px] font-body text-[#7687a1] hover:text-[#f1f4fb] tap-none tracking-[0.15em] uppercase press"
          style={{ transition: 'color 180ms cubic-bezier(0.33, 1, 0.68, 1)' }}
        >
          {t('Batal', 'Cancel')}
        </button>
      </motion.div>
    </div>
  );
}
