'use client';

import { useEffect } from 'react';
import { usePhotoboothStore } from '@/store/photobooth';
import { AnimatePresence, motion } from 'framer-motion';

import IdleScreen from '@/components/photobooth/IdleScreen';
import TakeSelect from '@/components/photobooth/TakeSelect';
import CameraCapture from '@/components/photobooth/CameraCapture';
import CapturedPreview from '@/components/photobooth/CapturedPreview';
import FilterSelect from '@/components/photobooth/FilterSelect';
import ProcessingScreen from '@/components/photobooth/ProcessingScreen';
import DownloadScreen from '@/components/photobooth/DownloadScreen';
import AdminLogin from '@/components/photobooth/AdminLogin';
import AdminDashboard from '@/components/photobooth/AdminDashboard';

const slideUpVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -20, filter: 'blur(4px)' },
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.35,
};

export default function Home() {
  const { currentStep } = usePhotoboothStore();

  // Seed the database on mount
  useEffect(() => {
    fetch('/api/seed')
      .then((r) => r.json())
      .catch(() => {
        // Seed API might not exist yet - that's fine
      });
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 'idle':
        return <IdleScreen />;
      case 'take-select':
        return <TakeSelect />;
      case 'camera':
        return <CameraCapture />;
      case 'countdown':
        return <CameraCapture />;
      case 'captured':
        return <CapturedPreview />;
      case 'filter-select':
        return <FilterSelect />;
      case 'processing':
        return <ProcessingScreen />;
      case 'download':
        return <DownloadScreen />;
      case 'admin-login':
        return <AdminLogin />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return <IdleScreen />;
    }
  };

  // Determine which animation to use based on step
  const getVariants = (step: string) => {
    switch (step) {
      case 'camera':
      case 'countdown':
      case 'processing':
        return fadeVariants;
      default:
        return slideUpVariants;
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={getVariants(currentStep)}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="min-h-screen"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}