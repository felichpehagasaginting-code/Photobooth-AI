'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Sparkles } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { FILTER_CATEGORIES, FILTER_STYLES, type FilterInfo } from '@/types';
import { Button } from '@/components/ui/button';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 24 },
  },
};

export default function FilterSelect() {
  const {
    setStep,
    goBack,
    filtersPerTake,
    selectedFilters,
    addFilter,
    removeFilter,
    clearFilteredPhotos,
    language,
  } = usePhotoboothStore();

  const [filters, setFilters] = useState<FilterInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch('/api/filters');
        if (res.ok) {
          const data = await res.json();
          if (data.filters && data.filters.length > 0) {
            setFilters(data.filters.filter((f: FilterInfo) => f.active));
          } else {
            const { DEFAULT_FILTERS } = await import('@/types');
            setFilters(DEFAULT_FILTERS.map((f, i) => ({ ...f, id: `filter-${i}` })));
          }
        } else {
          const { DEFAULT_FILTERS } = await import('@/types');
          setFilters(DEFAULT_FILTERS.map((f, i) => ({ ...f, id: `filter-${i}` })));
        }
      } catch {
        const { DEFAULT_FILTERS } = await import('@/types');
        setFilters(DEFAULT_FILTERS.map((f, i) => ({ ...f, id: `filter-${i}` })));
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  const maxFilters = filtersPerTake;
  const isSelected = (filterId: string) => selectedFilters.some((f) => f.id === filterId);

  const handleToggleFilter = (filter: FilterInfo) => {
    if (isSelected(filter.id)) {
      removeFilter(filter.id);
    } else if (selectedFilters.length < maxFilters) {
      addFilter(filter);
    }
  };

  const handleContinue = () => {
    if (selectedFilters.length > 0) {
      clearFilteredPhotos();
      setStep('processing');
    }
  };

  const getStyleInfo = (style: string) => FILTER_STYLES[style as keyof typeof FILTER_STYLES];
  const getCategoryLabel = (category: string) => {
    const cat = FILTER_CATEGORIES[category as keyof typeof FILTER_CATEGORIES];
    return cat?.label || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
        <div className="sticky top-0 z-10 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5 h-[73px]" />
        <div className="flex-1 px-3 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="rounded-2xl bg-[#0E0E15] border border-white/5"
                style={{ height: 130 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedCount = selectedFilters.length;
  const progressPct = (selectedCount / maxFilters) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0F]/85 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={goBack}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:text-[#FF6B9D] transition-colors tap-none"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-white tracking-tight truncate" style={{ fontFamily: 'var(--font-outfit)' }}>
              {t('Pilih Filter AI', 'Choose AI Filters')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {maxFilters >= 99
                ? t('Pilih semua filter yang kamu suka', 'Pick any filters you like')
                : t(`Pilih hingga ${maxFilters} filter`, `Select up to ${maxFilters} filters`)}
            </p>
          </div>

          {/* Circular progress counter */}
          <div className="shrink-0 relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
              <motion.circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#FF6B9D"
                strokeWidth="2.5"
                strokeDasharray="100"
                animate={{ strokeDashoffset: 100 - progressPct }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black text-white">
                {selectedCount}<span className="text-white/30">/{maxFilters >= 99 ? '∞' : maxFilters}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selection progress bar */}
        {maxFilters < 99 && (
          <div className="h-0.5 bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65]"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>

      {/* Filter grid */}
      <div className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-2xl mx-auto"
        >
          <AnimatePresence>
            {filters
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((filter) => {
                const sel = isSelected(filter.id);
                const styleInfo = getStyleInfo(filter.style);
                const canSelect = sel || selectedFilters.length < maxFilters;
                const accentColor = styleInfo?.color || '#FF6B9D';

                return (
                  <motion.button
                    key={filter.id}
                    variants={cardItem}
                    layout
                    onClick={() => canSelect && handleToggleFilter(filter)}
                    disabled={!canSelect && !sel}
                    className={`relative rounded-2xl p-3.5 text-left transition-all duration-250 tap-none border ${
                      sel
                        ? 'bg-[#15151F] scale-[1.03] z-10'
                        : canSelect
                          ? 'bg-[#0E0E15] border-white/5 hover:border-white/12 hover:bg-[#121218] hover:scale-[1.01]'
                          : 'bg-[#0E0E15] border-white/5 opacity-35 cursor-not-allowed'
                    }`}
                    style={
                      sel
                        ? {
                            borderColor: `${accentColor}50`,
                            boxShadow: `0 4px 24px ${accentColor}20, inset 0 0 0 1px ${accentColor}20`,
                          }
                        : {}
                    }
                  >
                    {/* Selected checkmark */}
                    <AnimatePresence>
                      {sel && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-10"
                          style={{ background: `linear-gradient(135deg, ${accentColor}, #FF8A65)` }}
                        >
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Color/thumbnail preview */}
                    <div className="mb-3 flex items-center gap-2">
                      {filter.thumbnail ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                          <img src={filter.thumbnail} alt={filter.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}08)`,
                            border: `1px solid ${accentColor}20`,
                          }}
                        >
                          <Sparkles className="w-4.5 h-4.5" style={{ color: accentColor }} />
                        </div>
                      )}
                      {/* Style color dot */}
                      <div
                        className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                        style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}60` }}
                      />
                    </div>

                    {/* Name */}
                    <h3 className="text-xs font-black text-white mb-0.5 line-clamp-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                      {filter.name}
                    </h3>

                    {/* Description */}
                    {filter.description && (
                      <p className="text-[10px] text-muted-foreground/65 line-clamp-2 mb-2 leading-relaxed">
                        {filter.description}
                      </p>
                    )}

                    {/* Category tag */}
                    <span
                      className="inline-block text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide"
                      style={{
                        background: `${accentColor}14`,
                        color: accentColor,
                      }}
                    >
                      {getCategoryLabel(filter.category)}
                    </span>
                  </motion.button>
                );
              })}
          </AnimatePresence>
        </motion.div>

        {/* Empty hint */}
        {selectedFilters.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            {t('✨ Ketuk filter untuk menambahkannya', '✨ Tap a filter to add it')}
          </motion.p>
        )}
      </div>

      {/* Selected filter chips */}
      <AnimatePresence>
        {selectedFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3 border-t border-white/5 bg-[#0A0A0F]/90 backdrop-blur"
          >
            <div className="flex flex-wrap gap-1.5">
              {selectedFilters.map((filter) => {
                const styleInfo = getStyleInfo(filter.style);
                const color = styleInfo?.color || '#FF6B9D';
                return (
                  <motion.span
                    key={filter.id}
                    layout
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                    style={{
                      background: `${color}18`,
                      color,
                      border: `1px solid ${color}25`,
                    }}
                  >
                    {filter.name}
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="hover:opacity-70 tap-none rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer CTA */}
      <div className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent">
        <Button
          onClick={handleContinue}
          disabled={selectedFilters.length === 0}
          className="w-full h-14 text-base font-black rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:from-[#FF7BAE] hover:to-[#FF9B75] text-white disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-300 shadow-glow-pink scale-press"
          style={{ fontFamily: 'var(--font-outfit)' }}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {t('Proses dengan AI', 'Process with AI')}
          {selectedFilters.length > 0 && ` (${selectedFilters.length})`}
        </Button>
      </div>
    </div>
  );
}