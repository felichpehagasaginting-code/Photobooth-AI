'use client';

import { useEffect } from 'react';
import { usePhotoboothStore } from '@/store/photobooth';
import { AnimatePresence, motion } from 'framer-motion';

import IdleScreen from '@/components/photobooth/IdleScreen';
import PackageSelect from '@/components/photobooth/PackageSelect';
import CameraCapture from '@/components/photobooth/CameraCapture';
import CapturedPreview from '@/components/photobooth/CapturedPreview';
import FilterSelect from '@/components/photobooth/FilterSelect';
import ProcessingScreen from '@/components/photobooth/ProcessingScreen';
import PaymentScreen from '@/components/photobooth/PaymentScreen';
import DownloadScreen from '@/components/photobooth/DownloadScreen';
import AdminLogin from '@/components/photobooth/AdminLogin';
import AdminDashboard from '@/components/photobooth/AdminDashboard';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
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
      case 'package-select':
        return <PackageSelect />;
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
      case 'payment':
        return <PaymentScreen />;
      case 'success':
        return <DownloadScreen />;
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

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={pageVariants}
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
