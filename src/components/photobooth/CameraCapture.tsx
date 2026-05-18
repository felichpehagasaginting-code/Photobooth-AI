'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, X, FlipHorizontal, Zap } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { Button } from '@/components/ui/button';

export default function CameraCapture() {
  const {
    currentStep,
    setStep,
    addCapturedPhoto,
    language,
    takeCount,
    currentTake,
  } = usePhotoboothStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isFlash, setIsFlash] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsFlash(true);
    setTimeout(() => setIsFlash(false), 250);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setTimeout(() => {
      addCapturedPhoto({ original: dataUrl, timestamp: Date.now() });
      setStep('captured');
    }, 450);
  }, [facingMode, addCapturedPhoto, setStep]);

  const startCamera = useCallback(async () => {
    setIsReady(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsReady(true);
      }
      setCameraError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
        t(
          'Gagal mengakses kamera. Pastikan izin kamera diaktifkan.',
          'Failed to access camera. Please enable camera permissions.'
        )
      );
    }
  }, [facingMode, t]);

  useEffect(() => {
    if (currentStep === 'camera' || currentStep === 'countdown') {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentStep, facingMode, startCamera]);

  useEffect(() => {
    if (currentStep === 'countdown' && countdown === null && !isFlash) {
      setCountdown(3);
    }
  }, [currentStep, countdown, isFlash]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setTimeout(() => {
      if (countdown === 1) {
        capturePhoto();
        setCountdown(null);
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, capturePhoto]);

  const handleTakePhoto = () => setStep('countdown');
  const handleFlipCamera = () => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStep('take-select');
  };

  // Progress bar for takes
  const progress = ((currentTake - 1) / takeCount) * 100;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0F] overflow-hidden select-none">
      <canvas ref={canvasRef} className="hidden" />

      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-96 h-96 rounded-full bg-[#FF6B9D] blur-[140px] opacity-[0.12]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-96 h-96 rounded-full bg-[#A855F7] blur-[140px] opacity-[0.12]" />
      </div>

      {/* Camera Area */}
      <div className="relative flex-1 p-4 md:p-6 flex flex-col gap-4">

        {/* Take progress bar */}
        <div className="flex items-center gap-3 z-20">
          <button
            onClick={handleCancel}
            className="shrink-0 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-[#FF6B9D] transition-colors tap-none"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/50 text-[10px] font-bold tracking-widest uppercase">
                {t('Foto', 'Photo')} {currentTake} / {takeCount}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot" />
                <span className="text-white/60 text-[10px] font-bold tracking-widest">LIVE</span>
              </div>
            </div>
            <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <button
            onClick={handleFlipCamera}
            className="shrink-0 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-[#A855F7] transition-colors tap-none"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Camera frame */}
        <div
          className="relative flex-1 rounded-[28px] overflow-hidden border shadow-2xl"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {/* Camera video */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isReady ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-black"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
          </motion.div>

          {/* Loading skeleton while camera starts */}
          <AnimatePresence>
            {!isReady && !cameraError && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#111118] flex items-center justify-center"
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <CameraIcon className="w-8 h-8 text-white/30" />
                  </div>
                  <p className="text-white/30 text-xs font-medium">
                    {t('Memulai kamera...', 'Starting camera...')}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera error */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F]/90 backdrop-blur-md p-6 z-20">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-5">
                  <CameraIcon className="w-9 h-9 text-white/40" />
                </div>
                <p className="text-white text-base mb-6 font-medium leading-relaxed max-w-[240px] mx-auto">
                  {cameraError}
                </p>
                <Button
                  onClick={startCamera}
                  className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] text-white font-bold h-12 px-8 rounded-2xl shadow-glow-pink"
                >
                  {t('Coba Lagi', 'Try Again')}
                </Button>
              </div>
            </div>
          )}

          {/* Rule-of-thirds grid overlay */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {[33, 66].map((pct) => (
              <div key={pct} className="absolute w-full" style={{ top: `${pct}%`, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            ))}
            {[33, 66].map((pct) => (
              <div key={pct} className="absolute h-full" style={{ left: `${pct}%`, width: 1, background: 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>

          {/* Corner brackets */}
          {isReady && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Top-left */}
              <div className="absolute top-5 left-5 w-10 h-10">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-white/50 rounded-full" />
                <div className="absolute top-0 left-0 h-full w-[3px] bg-white/50 rounded-full" />
              </div>
              {/* Top-right */}
              <div className="absolute top-5 right-5 w-10 h-10">
                <div className="absolute top-0 right-0 w-full h-[3px] bg-white/50 rounded-full" />
                <div className="absolute top-0 right-0 h-full w-[3px] bg-white/50 rounded-full" />
              </div>
              {/* Bottom-left */}
              <div className="absolute bottom-5 left-5 w-10 h-10">
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white/50 rounded-full" />
                <div className="absolute bottom-0 left-0 h-full w-[3px] bg-white/50 rounded-full" />
              </div>
              {/* Bottom-right */}
              <div className="absolute bottom-5 right-5 w-10 h-10">
                <div className="absolute bottom-0 right-0 w-full h-[3px] bg-white/50 rounded-full" />
                <div className="absolute bottom-0 right-0 h-full w-[3px] bg-white/50 rounded-full" />
              </div>
            </div>
          )}

          {/* Countdown overlay */}
          <AnimatePresence>
            {currentStep === 'countdown' && countdown !== null && countdown > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 1.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="flex flex-col items-center gap-4"
                  >
                    <span
                      className="text-[140px] md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FF6B9D] to-[#FF8A65]"
                      style={{ lineHeight: 1, filter: 'drop-shadow(0 0 50px rgba(255,107,157,0.6))' }}
                    >
                      {countdown}
                    </span>
                    <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                      <Zap className="w-4 h-4 text-[#FF6B9D]" />
                      <span className="text-white text-sm font-bold">
                        {t('Bersiap!', 'Get ready!')}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flash effect */}
          <AnimatePresence>
            {isFlash && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 bg-white z-40"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Bottom shutter controls */}
        <div className="flex items-center justify-center gap-8 py-2">
          {/* Dummy spacer */}
          <div className="w-14 h-14" />

          {/* Shutter button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={currentStep === 'camera' ? handleTakePhoto : undefined}
            disabled={currentStep !== 'camera' || !isReady}
            className="relative w-20 h-20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed tap-none"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B9D] to-[#FF8A65] opacity-40 blur-xl" />
            {/* Rotating gradient ring */}
            <motion.div
              animate={{ rotate: currentStep === 'camera' ? [0, 360] : 0 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #FF6B9D, #FF8A65, #A855F7, #FF6B9D)',
                padding: 2,
              }}
            />
            {/* Inner button */}
            <div className="absolute inset-[3px] rounded-full bg-[#0A0A0F] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <CameraIcon className="w-6 h-6 text-black" />
              </div>
            </div>
          </motion.button>

          {/* Take dots indicator */}
          <div className="w-14 h-14 flex items-center justify-center">
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: takeCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    background: i < currentTake - 1
                      ? '#06D6A0'
                      : i === currentTake - 1
                        ? '#FF6B9D'
                        : 'rgba(255,255,255,0.2)',
                    transform: i === currentTake - 1 ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hint */}
        <p className="text-white/30 text-[10px] text-center font-medium uppercase tracking-widest pb-2">
          {t('Ketuk untuk mengambil foto', 'Tap to capture photo')}
        </p>
      </div>
    </div>
  );
}
