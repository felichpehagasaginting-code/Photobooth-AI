'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Sparkles, Info } from 'lucide-react';
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
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 25 },
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

  useEffect(() => {
    fetchFilters(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const maxFilters = filtersPerTake;
  const isSelected = (filterId: string) =>
    selectedFilters.some((f) => f.id === filterId);

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

  const getCategoryLabel = (category: string) => {
    const cat = FILTER_CATEGORIES[category as keyof typeof FILTER_CATEGORIES];
    return cat?.label || category;
  };

  const getStyleInfo = (style: string) => {
    return FILTER_STYLES[style as keyof typeof FILTER_STYLES];
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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={goBack}
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:text-[#FF6B9D] transition-colors tap-none"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white tracking-tight truncate">
              {t('Pilih Filter AI', 'Choose AI Filters')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {maxFilters >= 99
                ? t(`Pilih semua filter yang kamu suka`, `Pick all the filters you like`)
                : t(
                    `Pilih hingga ${maxFilters} filter`,
                    `Select up to ${maxFilters} filters`
                  )}
            </p>
          </div>
          {/* Counter badge */}
          <div className="shrink-0 px-3 py-1.5 rounded-full glass text-sm font-bold">
            <span className="text-[#FF6B9D]">{selectedFilters.length}</span>
            <span className="text-white/30">/{maxFilters >= 99 ? '∞' : maxFilters}</span>
          </div>
        </div>
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
                const selected = isSelected(filter.id);
                const styleInfo = getStyleInfo(filter.style);
                const canSelect = selected || selectedFilters.length < maxFilters;

                return (
                  <motion.button
                    key={filter.id}
                    variants={cardItem}
                    layout
                    onClick={() => canSelect && handleToggleFilter(filter)}
                    disabled={!canSelect && !selected}
                    className={`relative rounded-2xl p-3.5 text-left transition-all duration-300 tap-none border ${
                      selected
                        ? 'bg-[#15151F] border-[#FF6B9D]/50 shadow-glow-pink scale-[1.03] z-10'
                        : canSelect
                        ? 'bg-[#0E0E15] border-white/5 hover:border-white/10 hover:bg-[#13131A]'
                        : 'bg-[#0E0E15] border-white/5 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {/* Selected check */}
                    <AnimatePresence>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Color preview or thumbnail */}
                    <div className="mb-3 flex items-center gap-2">
                      {filter.thumbnail ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                          <img
                            src={filter.thumbnail}
                            alt={filter.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${(styleInfo?.color || '#FF6B9D')}20, ${(styleInfo?.color || '#FF6B9D')}05)`,
                            border: `1px solid ${(styleInfo?.color || '#FF6B9D')}20`,
                          }}
                        >
                          <Sparkles
                            className="w-4 h-4"
                            style={{ color: styleInfo?.color || '#FF6B9D' }}
                          />
                        </div>
                      )}
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: styleInfo?.color || '#FF6B9D' }}
                      />
                    </div>

                    {/* Name & desc */}
                    <h3 className="text-xs font-bold text-white mb-0.5 line-clamp-1">
                      {filter.name}
                    </h3>
                    {filter.description && (
                      <p className="text-[10px] text-muted-foreground/70 line-clamp-2 mb-2 leading-relaxed">
                        {filter.description}
                      </p>
                    )}

                    {/* Category tag */}
                    <span
                      className="inline-block text-[9px] px-1.5 py-0.5 rounded-full font-semibold tracking-wide"
                      style={{
                        background: (styleInfo?.color || '#FF6B9D') + '12',
                        color: styleInfo?.color || '#FF6B9D',
                      }}
                    >
                      {getCategoryLabel(filter.category)}
                    </span>
                  </motion.button>
                );
              })}
          </AnimatePresence>
        </motion.div>

        {/* Selection hint */}
        {selectedFilters.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5"
          >
            <Info className="w-3 h-3" />
            {t('Ketuk filter untuk menambahkannya', 'Tap a filter to add it')}
          </motion.p>
        )}
      </div>

      {/* Selected filters chips */}
      <AnimatePresence>
        {selectedFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3 border-t border-white/5 bg-[#0A0A0F]/90 backdrop-blur"
          >
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-thin">
              {selectedFilters.map((filter) => {
                const styleInfo = getStyleInfo(filter.style);
                return (
                  <motion.span
                    key={filter.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: (styleInfo?.color || '#FF6B9D') + '15',
                      color: styleInfo?.color || '#FF6B9D',
                    }}
                  >
                    {filter.name}
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="ml-0.5 hover:opacity-70 tap-none"
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

      {/* Footer */}
      <div className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent">
        <Button
          onClick={handleContinue}
          disabled={selectedFilters.length === 0}
          className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:from-[#FF7BAE] hover:to-[#FF9B75] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-glow-pink scale-press"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {t('Proses dengan AI', 'Process with AI')}
          {selectedFilters.length > 0 && ` (${selectedFilters.length})`}
        </Button>
      </div>
    </div>
  );
}