'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Sparkles, Zap } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { TAKE_OPTIONS, formatPrice, type TakeCount } from '@/types';
import { Button } from '@/components/ui/button';

const takeIcons = [Camera, Sparkles, Zap];
const takeColors = ['#06D6A0', '#FF6B9D', '#A855F7'];
const takeGradients = [
  'from-[#06D6A0] to-[#34D399]',
  'from-[#FF6B9D] to-[#FF8A65]',
  'from-[#A855F7] to-[#C084FC]',
];

export default function TakeSelect() {
  const { setStep, goBack, setTakeConfig, takeCount, language } = usePhotoboothStore();
  const [selected, setSelected] = useState<TakeCount>(takeCount);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const handleContinue = () => {
    const option = TAKE_OPTIONS.find((o) => o.count === selected);
    if (option) {
      setTakeConfig(option.count, option.filtersPerTake);
      setStep('camera');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      {/* Header */}
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
              {t('Jumlah Take', 'Take Count')}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('Berapa kali kamu mau foto?', 'How many times do you want?')}
            </p>
          </div>
        </div>
      </div>

      {/* Take Cards */}
      <div className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          {TAKE_OPTIONS.map((option, index) => {
            const isSelected = selected === option.count;
            const Icon = takeIcons[index % takeIcons.length];
            const color = takeColors[index % takeColors.length];
            const gradient = takeGradients[index % takeGradients.length];

            return (
              <motion.button
                key={option.count}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setSelected(option.count)}
                className={`relative w-full text-left rounded-2xl p-5 transition-all duration-500 tap-none border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#1A1A2A] to-[#15151F] border-[#FF6B9D]/40 shadow-glow-pink'
                    : 'bg-[#111118] border-white/5 hover:border-white/10 hover:bg-[#15151F]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                      border: `1px solid ${color}20`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white">
                        {option.label}
                      </h3>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: color + '15', color }}
                      >
                        {option.filtersPerTake} filter/take
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {option.count}x foto dengan{' '}
                      {option.filtersPerTake} filter AI per foto. Total{' '}
                      {option.count * option.filtersPerTake} hasil filter.
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold tracking-tight" style={{ color }}>
                        {formatPrice(option.totalPrice)}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        ({formatPrice(option.pricePerTake)}/take)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected indicator line */}
                {isSelected && (
                  <motion.div
                    layoutId="takeLine"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-gradient-to-b from-[#FF6B9D] to-[#FF8A65]"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:from-[#FF7BAE] hover:to-[#FF9B75] text-white transition-all duration-300 shadow-glow-pink scale-press"
          >
            {t('Lanjut →', 'Continue →')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}