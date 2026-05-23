'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FlipHorizontal, Zap } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';

export default function CameraCapture() {
  const {
    currentStep, setStep,
    addCapturedPhoto, language,
    takeCount, currentTake,
    retakeIndex, setRetakeIndex, replaceCapturedPhoto,
  } = usePhotoboothStore();

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [countdown,   setCountdown]   = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode,  setFacingMode]  = useState<'user' | 'environment'>('user');
  const [isFlash,     setIsFlash]     = useState(false);
  const [isReady,     setIsReady]     = useState(false);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  /* ── Audio SFX ───────────────────────────────────────────────────── */
  const playBeep = useCallback((freq = 880, type: OscillatorType = 'sine', duration = 0.1) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch { /* ignore audio error */ }
  }, []);

  const playShutter = useCallback(() => {
    playBeep(400, 'square', 0.05);
    setTimeout(() => playBeep(200, 'sawtooth', 0.1), 50);
  }, [playBeep]);

  /* ── Capture ─────────────────────────────────────────────────────── */
  const capturePhoto = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsFlash(true);
    playShutter();
    setTimeout(() => setIsFlash(false), 250);

    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    setTimeout(() => {
      if (retakeIndex !== null) {
        replaceCapturedPhoto(retakeIndex, { original: dataUrl, timestamp: Date.now() });
        setRetakeIndex(null);
      } else {
        addCapturedPhoto({ original: dataUrl, timestamp: Date.now() });
      }
      setStep('captured');
    }, 420);
  }, [facingMode, addCapturedPhoto, replaceCapturedPhoto, retakeIndex, setRetakeIndex, setStep]);

  /* ── Start camera — fixed: explicit .play() + canplay fallback ─── */
  const startCamera = useCallback(async () => {
    setIsReady(false);
    setCameraError(null);

    /* Stop any existing stream first */
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;

      /* Use both events for maximum compatibility */
      const onReady = async () => {
        try {
          await video.play();
          setIsReady(true);
        } catch {
          /* Autoplay policy — still mark ready, video may self-play */
          setIsReady(true);
        }
        video.removeEventListener('canplay', onReady);
        video.removeEventListener('loadedmetadata', onReady);
      };

      video.addEventListener('canplay', onReady, { once: true });
      video.addEventListener('loadedmetadata', onReady, { once: true });

      /* Kick play immediately — some browsers need it before canplay */
      video.play().catch(() => { /* Will retry in onReady */ });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        msg.includes('Permission') || msg.includes('NotAllowed')
          ? t('Izin kamera ditolak. Aktifkan di pengaturan browser.', 'Camera permission denied. Enable it in browser settings.')
          : t('Gagal mengakses kamera.', 'Failed to access camera.')
      );
    }
  }, [facingMode, t]);

  /* ── Lifecycle ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (currentStep === 'camera' || currentStep === 'countdown') {
      startCamera();
    }
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [currentStep, facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentStep === 'countdown' && countdown === null && !isFlash) {
      setCountdown(3);
    }
  }, [currentStep, countdown, isFlash]);

  useEffect(() => {
    if (!countdown || countdown <= 0) return;
    playBeep(880, 'sine', 0.1); // Beep on every countdown tick
    const timer = setTimeout(() => {
      if (countdown === 1) { capturePhoto(); setCountdown(null); }
      else setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, capturePhoto, playBeep]);

  /* ── Handlers ────────────────────────────────────────────────────── */
  const handleTakePhoto  = () => setStep('countdown');
  const handleFlipCamera = () => setFacingMode(p => p === 'user' ? 'environment' : 'user');
  const handleCancel     = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStep('take-select');
  };

  const progress = ((currentTake - 1) / takeCount) * 100;

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden select-none" style={{ background: '#030611' }}>
      <canvas ref={canvasRef} className="hidden" />

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", opacity: 0.45, animation: 'grain-shift 0.5s steps(1) infinite' }}
      />

      {/* Subtle warm accent — top right */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at top right, rgba(200,121,65,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative flex-1 flex flex-col gap-3 p-4 md:p-5 z-10 w-full max-w-7xl mx-auto">
        {/* ── Top bar ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="shrink-0 w-9 h-9 flex items-center justify-center text-[#7a7168] hover:text-[#f0ebe3] tap-none press"
            style={{ border: '1px solid rgba(44,40,34,0.7)', transition: 'color 180ms cubic-bezier(0.33, 1, 0.68, 1)' }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold tracking-[0.35em] text-[#7a7168] uppercase font-body">
                {retakeIndex !== null 
                  ? t(`Mengulang Foto ${retakeIndex + 1}`, `Retaking Photo ${retakeIndex + 1}`)
                  : t(`Foto ${currentTake} dari ${takeCount}`, `Photo ${currentTake} of ${takeCount}`)
                }
              </span>
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: isReady ? '#d94040' : '#2c2822' }}
                />
                <span className="text-[9px] font-bold tracking-[0.3em] font-body"
                  style={{ color: isReady ? '#d94040' : '#2c2822' }}>
                  LIVE
                </span>
              </div>
            </div>
            {/* Progress — line style */}
            <div className="w-full h-px" style={{ background: 'rgba(29,39,64,0.8)' }}>
              <motion.div
                className="h-full"
                style={{ background: 'var(--copper)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
              />
            </div>
          </div>

          <button
            onClick={handleFlipCamera}
            className="shrink-0 w-9 h-9 flex items-center justify-center text-[#7687a1] hover:text-var(--copper) tap-none press"
            style={{ border: '1px solid rgba(29,39,64,0.7)', transition: 'color 180ms cubic-bezier(0.33, 1, 0.68, 1)' }}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* ── Camera viewfinder ── */}
        <div
          className="relative flex-1 overflow-hidden"
          style={{
            background: '#030611',
            border: '1px solid rgba(43,92,246,0.18)',
            clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)',
            minHeight: 260,
          }}
        >
          {/* Video feed */}
          <motion.video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            initial={{ opacity: 0 }}
            animate={{ opacity: isReady ? 1 : 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />

          {/* Rule-of-thirds grid ── cobalt */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {[33, 66].map(pct => (
              <div key={`h${pct}`} className="absolute w-full" style={{ top: `${pct}%`, height: 1, background: 'rgba(43,92,246,0.06)' }} />
            ))}
            {[33, 66].map(pct => (
              <div key={`v${pct}`} className="absolute h-full" style={{ left: `${pct}%`, width: 1, background: 'rgba(43,92,246,0.06)' }} />
            ))}
          </div>

          {/* Corner brackets ── cobalt, square */}
          {isReady && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* TL */}
              <div className="absolute top-4 left-4 w-7 h-7">
                <div style={{ position:'absolute', top:0, left:0, width:'100%', height: 2, background:'var(--copper)' }} />
                <div style={{ position:'absolute', top:0, left:0, height:'100%', width: 2, background:'var(--copper)' }} />
              </div>
              {/* TR */}
              <div className="absolute top-4 right-4 w-7 h-7">
                <div style={{ position:'absolute', top:0, right:0, width:'100%', height: 2, background:'var(--copper)' }} />
                <div style={{ position:'absolute', top:0, right:0, height:'100%', width: 2, background:'var(--copper)' }} />
              </div>
              {/* BL */}
              <div className="absolute bottom-4 left-4 w-7 h-7">
                <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height: 2, background:'var(--copper)' }} />
                <div style={{ position:'absolute', bottom:0, left:0, height:'100%', width: 2, background:'var(--copper)' }} />
              </div>
              {/* BR */}
              <div className="absolute bottom-4 right-4 w-7 h-7">
                <div style={{ position:'absolute', bottom:0, right:0, width:'100%', height: 2, background:'var(--copper)' }} />
                <div style={{ position:'absolute', bottom:0, right:0, height:'100%', width: 2, background:'var(--copper)' }} />
              </div>
            </div>
          )}

          {/* Loading state */}
          <AnimatePresence>
            {!isReady && !cameraError && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20"
                style={{ background: '#0c0a09' }}
              >
                {/* Crosshair loader */}
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <motion.rect
                    x="2" y="2" width="14" height="14"
                    stroke="rgba(200,121,65,0.4)" strokeWidth="1.5"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
                  />
                  <motion.rect
                    x="32" y="2" width="14" height="14"
                    stroke="rgba(200,121,65,0.4)" strokeWidth="1.5"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0.35 }}
                  />
                  <motion.rect
                    x="2" y="32" width="14" height="14"
                    stroke="rgba(200,121,65,0.4)" strokeWidth="1.5"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0.7 }}
                  />
                  <motion.rect
                    x="32" y="32" width="14" height="14"
                    stroke="rgba(200,121,65,0.4)" strokeWidth="1.5"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: 1.05 }}
                  />
                </svg>
                <p className="text-[10px] tracking-[0.35em] text-[#7a7168] uppercase font-body">
                  {t('Memulai kamera…', 'Starting camera…')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 z-20" style={{ background: 'rgba(12,10,9,0.92)' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#d94040" strokeWidth="1.5">
                <rect x="1" y="1" width="34" height="34" />
                <line x1="12" y1="12" x2="24" y2="24" />
                <line x1="24" y1="12" x2="12" y2="24" />
              </svg>
              <p className="text-sm text-[#f0ebe3] font-body text-center leading-relaxed max-w-[240px]">
                {cameraError}
              </p>
              <button
                onClick={startCamera}
                className="btn-solid h-10 px-6 text-xs font-body press tap-none"
              >
                {t('Coba Lagi', 'Try Again')}
              </button>
            </div>
          )}

          {/* Countdown overlay */}
          <AnimatePresence>
            {currentStep === 'countdown' && countdown !== null && countdown > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30"
                style={{ background: 'rgba(12,10,9,0.6)', backdropFilter: 'blur(4px)' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 1.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="flex flex-col items-center gap-3"
                  >
                    <span
                      className="font-display font-black text-gradient-copper"
                      style={{
                        fontSize: 'clamp(100px, 25vw, 160px)',
                        lineHeight: 1,
                        textShadow: '0 0 60px rgba(43,92,246,0.3)',
                      }}
                    >
                      {countdown}
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1.5"
                      style={{ border: '1px solid rgba(43,92,246,0.3)', background: 'rgba(3,6,17,0.85)' }}
                    >
                      <Zap className="w-3.5 h-3.5 text-var(--copper)" />
                      <span className="text-[11px] font-bold tracking-[0.2em] text-[#f1f4fb] font-body uppercase">
                        {t('Bersiap!', 'Get Ready!')}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flash */}
          <AnimatePresence>
            {isFlash && (
              <motion.div
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white z-40 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Angled corner cut marker — top right */}
          <div className="absolute top-0 right-0 w-0 h-0 pointer-events-none"
            style={{ borderLeft: '16px solid transparent', borderTop: '16px solid rgba(200,121,65,0.6)' }}
          />
        </div>

        {/* ── Shutter controls ── */}
        <div className="flex items-center justify-center gap-8 py-1">
          {/* Spacer */}
          <div className="w-12 h-12" />

          {/* Shutter — geometric */}
          <motion.button
            whileTap={!isReady ? {} : { scale: 0.92 }}
            onClick={currentStep === 'camera' ? handleTakePhoto : undefined}
            disabled={currentStep !== 'camera' || !isReady}
            className="relative w-[70px] h-[70px] tap-none"
            style={{ cursor: isReady ? 'pointer' : 'not-allowed', opacity: isReady ? 1 : 0.4 }}
          >
            {/* Outer rotating cobalt ring */}
            <motion.div
              animate={{ rotate: isReady ? [0, 360] : 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(from 0deg, var(--copper), var(--amber), var(--mint), var(--copper))',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                padding: 2,
              }}
            />
            {/* Inner dark fill */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                inset: 3,
                background: '#030611',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
              }}
            >
              {/* Camera icon — custom SVG */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--copper)" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
                <rect x="2" y="6" width="20" height="15" />
                <circle cx="12" cy="13.5" r="4" />
                <path d="M8 6l2-3h4l2 3" />
              </svg>
            </div>
          </motion.button>

          {/* Take progress dots — vertical stack */}
          <div className="w-12 h-12 flex items-center justify-center">
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: takeCount }).map((_, i) => (
                <div key={i} style={{
                  width: 6,
                  height: i === currentTake - 1 ? 14 : 6,
                  background: i < currentTake - 1 ? '#2dd4bf' : i === currentTake - 1 ? 'var(--copper)' : 'rgba(29,39,64,0.8)',
                  transition: 'height 280ms cubic-bezier(0.33, 1, 0.68, 1), background 280ms',
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-[9px] tracking-[0.35em] text-[#2c2822] uppercase font-body pb-1">
          {t('Ketuk untuk mengambil foto', 'Tap to capture')}
        </p>
      </div>
    </div>
  );
}
