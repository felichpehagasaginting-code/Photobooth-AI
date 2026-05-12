'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Zap, Crown, Gift } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { DEFAULT_PACKAGES, formatPrice, type PackageInfo } from '@/types';
import { Button } from '@/components/ui/button';

const packageConfig = [
  { Icon: Zap, color: '#06D6A0', gradient: 'from-[#06D6A0] to-[#34D399]' },
  { Icon: Sparkles, color: '#FF6B9D', gradient: 'from-[#FF6B9D] to-[#FF8A65]' },
  { Icon: Crown, color: '#A855F7', gradient: 'from-[#A855F7] to-[#C084FC]' },
];

import type { Variants } from 'framer-motion';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

export default function PackageSelect() {
  const { setStep, goBack, selectedPackage, setSelectedPackage, language } =
    usePhotoboothStore();
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages.filter((p: PackageInfo) => p.active));
        } else {
          setPackages(DEFAULT_PACKAGES.map((p, i) => ({ ...p, id: `pkg-${i}` })));
        }
      } else {
        setPackages(DEFAULT_PACKAGES.map((p, i) => ({ ...p, id: `pkg-${i}` })));
      }
    } catch {
      setPackages(DEFAULT_PACKAGES.map((p, i) => ({ ...p, id: `pkg-${i}` })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const handleSelect = (pkg: PackageInfo) => {
    setSelectedPackage(pkg);
  };

  const handleContinue = () => {
    if (selectedPackage) {
      setStep('camera');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#FF6B9D] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      {/* Header - glass style */}
      <div className="sticky top-0 z-10 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={goBack}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:text-[#FF6B9D] transition-colors tap-none"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {t('Pilih Paketmu', 'Choose Your Package')}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('Pilih paket yang sesuai dengan gayamu', 'Pick the package that fits your style')}
            </p>
          </div>
        </div>
      </div>

      {/* Package Cards */}
      <div className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4 max-w-lg mx-auto"
        >
          {packages
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((pkg, index) => {
              const config = packageConfig[index % packageConfig.length];
              const isSelected = selectedPackage?.id === pkg.id;

              return (
                <motion.button
                  key={pkg.id}
                  variants={item}
                  onClick={() => handleSelect(pkg)}
                  layout
                  className={`relative w-full text-left rounded-2xl p-5 transition-all duration-500 tap-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#1A1A2A] to-[#15151F] border-[#FF6B9D]/40 shadow-glow-pink scale-[1.02]'
                      : 'bg-[#111118] border-white/5 hover:border-white/10 hover:bg-[#15151F]'
                  } border`}
                >
                  {/* Selected badge */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${config.color}15, ${config.color}05)`,
                        border: `1px solid ${config.color}20`,
                      }}
                    >
                      <config.Icon className="w-6 h-6" style={{ color: config.color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white">
                          {pkg.name}
                        </h3>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: config.color + '15',
                            color: config.color,
                          }}
                        >
                          {pkg.filterCount >= 99
                            ? t('Semua', 'All')
                            : `${pkg.filterCount} ${t('Filter', 'Filters')}`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {pkg.description}
                      </p>
                      <p
                        className="text-xl font-bold tracking-tight"
                        style={{ color: config.color }}
                      >
                        {formatPrice(pkg.price)}
                      </p>
                    </div>
                  </div>

                  {/* Selected indicator line */}
                  {isSelected && (
                    <motion.div
                      layoutId="selectedLine"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-gradient-to-b from-[#FF6B9D] to-[#FF8A65]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedPackage}
            className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:from-[#FF7BAE] hover:to-[#FF9B75] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-glow-pink scale-press"
          >
            {selectedPackage
              ? t('Lanjut →', 'Continue →')
              : t('Pilih paket terlebih dahulu', 'Select a package first')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}