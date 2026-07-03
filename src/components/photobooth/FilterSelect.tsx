'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Sparkles, Brain } from 'lucide-react';
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
    capturedPhotos,
  } = usePhotoboothStore();

  const [filters, setFilters] = useState<FilterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

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

    setIsOnline(navigator.onLine); // eslint-disable-line react-hooks/set-state-in-effect
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  const handleSkipAI = () => {
    clearFilteredPhotos();
    const { capturedPhotos, addFilteredPhoto } = usePhotoboothStore.getState();
    capturedPhotos.forEach((photo) => {
      addFilteredPhoto({
        original: photo.original,
        filtered: photo.original,
        filterName: 'Original',
        filterId: 'original'
      });
    });
    setStep('customize');
  };

  const handleAISuggest = async () => {
    if (suggesting) return;
    setSuggesting(true);
    setSuggestionError('');

    try {
      const res = await fetch('/api/nvidia/filter-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: capturedPhotos.slice(0, 2).map(p => p.original),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to get suggestions');
      }

      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        clearFilteredPhotos();
        data.suggestions.forEach((s: { filterName: string }) => {
          const match = filters.find(f => f.name.toLowerCase() === s.filterName.toLowerCase());
          if (match && !selectedFilters.some(f => f.id === match.id) && selectedFilters.length < maxFilters) {
            addFilter(match);
          }
        });
      }
    } catch (err: any) {
      setSuggestionError(err.message || 'AI suggestion failed');
      console.error('[FilterSelect] AI suggest error:', err);
    } finally {
      setSuggesting(false);
    }
  };

  const getStyleInfo = (style: string) => FILTER_STYLES[style as keyof typeof FILTER_STYLES];
  const getCategoryLabel = (category: string) => {
    const cat = FILTER_CATEGORIES[category as keyof typeof FILTER_CATEGORIES];
    return cat?.label || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030611]">
        <div className="sticky top-0 z-10 bg-[#030611]/80 backdrop-blur-xl border-b border-white/5 h-[73px]" />
        <div className="flex-1 px-3 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="rounded-xl bg-[#0a0e1c] border border-white/5"
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
    <div className="min-h-screen flex flex-col bg-[#030611]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#030611]/85 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={goBack}
            title="Back"
            aria-label="Back"
            className="w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:text-var(--copper) transition-colors tap-none"
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

          {/* NVIDIA AI Suggest Button */}
          <button
            onClick={handleAISuggest}
            disabled={suggesting}
            title={t('Saran AI', 'AI Suggest')}
            aria-label={t('Saran AI dengan NVIDIA', 'AI Suggest with NVIDIA')}
            className="relative w-11 h-11 rounded-full flex items-center justify-center transition-all tap-none disabled:opacity-40"
            style={{
              background: suggesting
                ? 'linear-gradient(135deg, #76b90020, #76b90010)'
                : 'linear-gradient(135deg, #76b90030, #76b90015)',
              border: '1px solid #76b90040',
            }}
          >
            {suggesting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-transparent border-t-[#76b900]"
              />
            ) : (
              <Brain className="w-4.5 h-4.5" style={{ color: '#76b900' }} />
            )}
          </button>

          {/* Circular progress counter */}
          <div className="shrink-0 relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
              <motion.circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="var(--copper)"
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
              className="h-full bg-gradient-to-r from-var(--copper) to-var(--amber)"
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
                const accentColor = styleInfo?.color || 'var(--cobalt)';

                return (
                  <motion.button
                    key={filter.id}
                    variants={cardItem}
                    layout
                    onClick={() => canSelect && handleToggleFilter(filter)}
                    disabled={!canSelect && !sel}
                    className={`relative rounded-xl p-3.5 text-left transition-all duration-250 tap-none border ${
                      sel
                        ? 'bg-[#0a0e1c] scale-[1.03] z-10'
                        : canSelect
                          ? 'bg-[#0a0e1c]/55 border-white/5 hover:border-white/12 hover:bg-[#0a0e1c]/80 hover:scale-[1.01]'
                          : 'bg-[#0a0e1c]/30 border-white/5 opacity-35 cursor-not-allowed'
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
                          style={{ background: `linear-gradient(135deg, ${accentColor}, var(--cobalt))` }}
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
            className="px-4 py-3 border-t border-white/5 bg-[#030611]/90 backdrop-blur"
          >
            <div className="flex flex-wrap gap-1.5">
              {selectedFilters.map((filter) => {
                const styleInfo = getStyleInfo(filter.style);
                const color = styleInfo?.color || 'var(--copper)';
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
                      title={`Remove ${filter.name}`}
                      aria-label={`Remove ${filter.name}`}
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
      <div className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-[#030611] via-[#030611]/95 to-transparent flex flex-col gap-2">
        {!isOnline && (
          <div className="w-full p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center text-center mb-1">
            <span className="text-orange-400 text-[10px] font-bold tracking-widest uppercase">Offline Mode</span>
            <span className="text-orange-400/80 text-[10px] max-w-[200px]">Koneksi terputus. AI mungkin tidak bekerja.</span>
          </div>
        )}
        <Button
          onClick={handleContinue}
          disabled={selectedFilters.length === 0}
          className="btn-solid w-full h-14 text-sm font-body press tap-none flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-depth"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {t('Proses dengan AI', 'Process with AI')}
          {selectedFilters.length > 0 && ` (${selectedFilters.length})`}
        </Button>
        <button
          onClick={handleSkipAI}
          className="w-full h-10 mt-1 flex items-center justify-center text-[11px] font-bold tracking-[0.1em] text-[#7687a1] hover:text-var(--copper) uppercase font-body transition-colors"
        >
          {t('Atau Lewati & Cetak Original', 'Or Skip & Print Original')}
        </button>
      </div>
    </div>
  );
}