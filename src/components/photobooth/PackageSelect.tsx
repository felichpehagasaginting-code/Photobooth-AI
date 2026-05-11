'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Zap, Crown } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { DEFAULT_PACKAGES, formatPrice, type PackageInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const packageIcons = [Zap, Sparkles, Crown];
const packageColors = ['#06D6A0', '#FF6B9D', '#FF8A65'];

export default function PackageSelect() {
  const { setStep, goBack, selectedPackage, setSelectedPackage, language } = usePhotoboothStore();
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages.filter((p: PackageInfo) => p.active));
        } else {
          // Fallback to defaults
          setPackages(
            DEFAULT_PACKAGES.map((p, i) => ({ ...p, id: `pkg-${i}` }))
          );
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
      <div className="min-h-screen flex items-center justify-center">
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
      {/* Header */}
      <div className="flex items-center gap-4 p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="w-12 h-12 rounded-full bg-[#15151F] border border-[#2A2A3A] hover:bg-[#2A2A3A] text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {t('Pilih Paketmu', 'Choose Your Package')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('Pilih paket sesuai kebutuhanmu', 'Choose a package that fits your needs')}
          </p>
        </div>
      </div>

      {/* Package Cards */}
      <div className="flex-1 px-6 pb-6">
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          {packages
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((pkg, index) => {
              const Icon = packageIcons[index % packageIcons.length];
              const color = packageColors[index % packageColors.length];
              const isSelected = selectedPackage?.id === pkg.id;

              return (
                <motion.button
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelect(pkg)}
                  className={`relative w-full text-left rounded-2xl border-2 p-6 transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#15151F] border-[#FF6B9D] glow-pink'
                      : 'bg-[#15151F] border-[#2A2A3A] hover:border-[#3A3A4A]'
                  }`}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FF6B9D] flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: color + '20' }}
                    >
                      <Icon className="w-7 h-7" style={{ color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                        <Badge
                          className="text-[10px] px-2 py-0"
                          style={{
                            background: color + '20',
                            color: color,
                            borderColor: 'transparent',
                          }}
                        >
                          {pkg.filterCount >= 99
                            ? t('Semua', 'All')
                            : `${pkg.filterCount} ${t('Filter', 'Filters')}`}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {pkg.description}
                      </p>
                      <p className="text-2xl font-bold" style={{ color }}>
                        {formatPrice(pkg.price)}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
        </div>
      </div>

      {/* Footer with Continue button */}
      <div className="p-6 mt-auto">
        <Button
          onClick={handleContinue}
          disabled={!selectedPackage}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {t('Lanjut', 'Continue')}
        </Button>
      </div>
    </div>
  );
}
