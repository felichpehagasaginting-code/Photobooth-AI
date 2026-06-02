'use client';

import { useEffect, useState } from 'react';
import { usePhotoboothStore } from '@/store/photobooth';
import { AnimatePresence, motion } from 'framer-motion';
import { pageTransitions, slideUpVariants, fadeVariants } from '@/lib/animations';

import IdleScreen from '@/components/photobooth/IdleScreen';
import TakeSelect from '@/components/photobooth/TakeSelect';
import CameraCapture from '@/components/photobooth/CameraCapture';
import CapturedPreview from '@/components/photobooth/CapturedPreview';
import FilterSelect from '@/components/photobooth/FilterSelect';
import ProcessingScreen from '@/components/photobooth/ProcessingScreen';
import CustomizeScreen from '@/components/photobooth/CustomizeScreen';
import DownloadScreen from '@/components/photobooth/DownloadScreen';
import AdminLogin from '@/components/photobooth/AdminLogin';
import AdminDashboard from '@/components/photobooth/AdminDashboard';
import RemoteDownloadView from '@/components/photobooth/RemoteDownloadView';



export default function Home() {
  const { currentStep } = usePhotoboothStore();
  const [txnId, setTxnId] = useState<string | null>(null);

  // Seed the database on mount
  useEffect(() => {
    fetch('/api/seed')
      .then((r) => r.json())
      .catch(() => {
        // Seed API might not exist yet - that's fine
      });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const txn = params.get('txn');
      if (txn) {
        setTxnId(txn);
      }
    }
  }, []);

  if (txnId) {
    return <RemoteDownloadView txnId={txnId} />;
  }

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
      case 'customize':
        return <CustomizeScreen />;
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
    <main className="min-h-screen bg-gradient-to-br from-[#0A0A0F] via-[#1A1A2A] to-[#0A0A0F] text-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={getVariants(currentStep)}
          initial={false}
          animate="animate"
          exit="exit"
          transition={pageTransitions.default}
          className="min-h-screen"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
