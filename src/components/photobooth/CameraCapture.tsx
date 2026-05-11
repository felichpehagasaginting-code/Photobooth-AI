'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, X } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { Button } from '@/components/ui/button';

export default function CameraCapture() {
  const {
    currentStep,
    setStep,
    setCapturedPhoto,
    language,
  } = usePhotoboothStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

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

    setCapturedPhoto({
      original: dataUrl,
      timestamp: Date.now(),
    });

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setStep('captured');
  }, [facingMode, setCapturedPhoto, setStep]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
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
    if (currentStep === 'camera') {
      // Camera initialization - setState in async callback from getUserMedia
      startCamera(); // eslint-disable-line react-hooks/set-state-in-effect
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentStep, facingMode, startCamera]);

  // Countdown logic
  useEffect(() => {
    if (currentStep === 'countdown' && countdown === null) {
      // Initializing countdown when entering countdown step
      setCountdown(3); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [currentStep, countdown]);

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
    setStep('package-select');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-black">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera preview */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Camera error overlay */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F] p-6">
            <div className="text-center">
              <CameraIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-white text-lg mb-4">{cameraError}</p>
              <Button
                onClick={startCamera}
                className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] text-white font-bold"
              >
                {t('Coba Lagi', 'Try Again')}
              </Button>
            </div>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFlipCamera}
            className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <CameraIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Countdown overlay */}
        <AnimatePresence>
          {currentStep === 'countdown' && countdown !== null && countdown > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 z-20"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[120px] md:text-[180px] font-bold text-white text-glow-pink"
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flash effect */}
        <AnimatePresence>
          {currentStep === 'countdown' && countdown === null && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white z-30"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Capture button */}
      {currentStep === 'camera' && !cameraError && (
        <div className="p-8 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={handleTakePhoto}
              className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all active:scale-95"
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
          </motion.div>
        </div>
      )}

      {/* Instruction text */}
      {currentStep === 'camera' && !cameraError && (
        <div className="absolute bottom-28 left-0 right-0 text-center">
          <p className="text-white/80 text-sm">
            {t('Tekan tombol untuk mengambil foto', 'Tap the button to take a photo')}
          </p>
        </div>
      )}
    </div>
  );
}
