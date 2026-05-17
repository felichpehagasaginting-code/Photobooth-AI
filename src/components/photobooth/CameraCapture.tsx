'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, X, FlipHorizontal } from 'lucide-react';
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

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Set flash effect
    setIsFlash(true);
    setTimeout(() => setIsFlash(false), 200);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the image for front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Small delay to let the flash effect show before changing step
    setTimeout(() => {
      addCapturedPhoto({
        original: dataUrl,
        timestamp: Date.now(),
      });
      setStep('captured');
    }, 400);

  }, [facingMode, addCapturedPhoto, setStep]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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

  // Countdown logic
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

  const handleTakePhoto = () => {
    setStep('countdown');
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStep('take-select');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0F] overflow-hidden select-none">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Background decoration ── */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-[#FF6B9D] blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#A855F7] blur-[120px]" />
      </div>

      {/* ── Camera Area ── */}
      <div className="relative flex-1 p-4 md:p-8 flex flex-col">
        {/* Frame around camera */}
        <div 
          className="relative flex-1 rounded-[32px] overflow-hidden shadow-2xl border-4"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-black"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />

          {/* Camera error overlay */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F]/90 backdrop-blur-md p-6 z-20">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <CameraIcon className="w-10 h-10 text-white/50" />
                </div>
                <p className="text-white text-lg mb-6 font-medium">{cameraError}</p>
                <Button
                  onClick={startCamera}
                  className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] text-white font-bold h-12 px-8 rounded-full shadow-glow-pink"
                >
                  {t('Coba Lagi', 'Try Again')}
                </Button>
              </div>
            </div>
          )}

          {/* Grid lines overlay (optional aesthetic) */}
          <div className="absolute inset-0 pointer-events-none opacity-30 flex flex-col justify-evenly z-10">
            <div className="w-full h-[1px] bg-white/20" />
            <div className="w-full h-[1px] bg-white/20" />
          </div>
          <div className="absolute inset-0 pointer-events-none opacity-30 flex justify-evenly z-10">
            <div className="w-[1px] h-full bg-white/20" />
            <div className="w-[1px] h-full bg-white/20" />
          </div>

          {/* Top controls (inside frame) */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
            <button
              onClick={handleCancel}
              className="w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors tap-none"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Live indicator & Take info */}
            <div className="flex flex-col items-center gap-2">
              <div className="px-4 py-1.5 glass rounded-full flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-bold tracking-widest uppercase">LIVE</span>
              </div>
              <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                <span className="text-white/80 text-[10px] font-bold tracking-wider">
                  TAKE {currentTake} / {takeCount}
                </span>
              </div>
            </div>

            <button
              onClick={handleFlipCamera}
              className="w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors tap-none"
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Countdown overlay */}
          <AnimatePresence>
            {currentStep === 'countdown' && countdown !== null && countdown > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30"
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FF6B9D] to-[#FF8A65] drop-shadow-[0_0_40px_rgba(255,107,157,0.5)]"
                >
                  {countdown}
                </motion.div>
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
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-white z-40"
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom Controls ── */}
        <div className="mt-6 md:mt-8 flex flex-col items-center justify-center z-10 pb-4">
          <p className="text-white/50 text-xs font-medium mb-4 uppercase tracking-widest">
            {t('Bersiaplah untuk foto', 'Get ready for the photo')}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={currentStep === 'camera' ? handleTakePhoto : undefined}
            disabled={currentStep !== 'camera'}
            className="relative w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B9D] to-[#FF8A65] opacity-50 blur-md" />
            
            {/* Main gradient button */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B9D] to-[#FF8A65] p-1 shadow-lg">
              {/* Inner dark circle */}
              <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">
                {/* Center dot */}
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center transition-transform active:scale-90">
                  <CameraIcon className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
