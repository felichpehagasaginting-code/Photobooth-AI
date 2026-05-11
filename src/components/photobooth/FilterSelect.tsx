'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Sparkles } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { FILTER_CATEGORIES, FILTER_STYLES, type FilterInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FilterSelect() {
  const {
    setStep,
    goBack,
    selectedPackage,
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
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const res = await fetch('/api/filters');
      if (res.ok) {
        const data = await res.json();
        if (data.filters && data.filters.length > 0) {
          setFilters(data.filters.filter((f: FilterInfo) => f.active));
        } else {
          // Fallback: generate from types defaults
          const { DEFAULT_FILTERS } = await import('@/types');
          setFilters(
            DEFAULT_FILTERS.map((f, i) => ({ ...f, id: `filter-${i}` }))
          );
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

  const maxFilters = selectedPackage?.filterCount ?? 1;
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
      <div className="flex items-center gap-4 p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="w-12 h-12 rounded-full bg-[#15151F] border border-[#2A2A3A] hover:bg-[#2A2A3A] text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">
            {t('Pilih Filter', 'Choose Filters')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(
              `Pilih hingga ${maxFilters >= 99 ? 'semua' : maxFilters} filter`,
              `Select up to ${maxFilters >= 99 ? 'all' : maxFilters} filters`
            )}{' '}
            ({selectedFilters.length}/{maxFilters >= 99 ? '∞' : maxFilters})
          </p>
        </div>
      </div>

      {/* Filter grid */}
      <div className="flex-1 px-6 pb-4 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {filters
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((filter, index) => {
              const selected = isSelected(filter.id);
              const styleInfo = getStyleInfo(filter.style);
              const canSelect = selected || selectedFilters.length < maxFilters;

              return (
                <motion.button
                  key={filter.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => canSelect && handleToggleFilter(filter)}
                  disabled={!canSelect && !selected}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    selected
                      ? 'bg-[#15151F] border-[#FF6B9D] glow-pink'
                      : canSelect
                      ? 'bg-[#15151F] border-[#2A2A3A] hover:border-[#3A3A4A]'
                      : 'bg-[#15151F] border-[#2A2A3A] opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Check overlay */}
                  <AnimatePresence>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF6B9D] flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Style color indicator or thumbnail */}
                  {filter.thumbnail ? (
                    <div className="w-10 h-10 rounded-lg mb-3 overflow-hidden border border-[#2A2A3A]">
                      <img
                        src={filter.thumbnail}
                        alt={filter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                      style={{
                        background: (styleInfo?.color || '#FF6B9D') + '20',
                      }}
                    >
                      <Sparkles
                        className="w-5 h-5"
                        style={{ color: styleInfo?.color || '#FF6B9D' }}
                      />
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">
                    {filter.name}
                  </h3>
                  {filter.description && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1">
                      {filter.description}
                    </p>
                  )}
                  <Badge
                    className="text-[9px] px-1.5 py-0"
                    style={{
                      background: (styleInfo?.color || '#FF6B9D') + '20',
                      color: styleInfo?.color || '#FF6B9D',
                      borderColor: 'transparent',
                    }}
                  >
                    {getCategoryLabel(filter.category)}
                  </Badge>
                </motion.button>
              );
            })}
        </div>
      </div>

      {/* Selected filters chips */}
      {selectedFilters.length > 0 && (
        <div className="px-6 py-3 border-t border-[#2A2A3A]">
          <div className="flex flex-wrap gap-2">
            {selectedFilters.map((filter) => {
              const styleInfo = getStyleInfo(filter.style);
              return (
                <motion.div
                  key={filter.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    background: (styleInfo?.color || '#FF6B9D') + '20',
                    color: styleInfo?.color || '#FF6B9D',
                  }}
                >
                  {filter.name}
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer with Process button */}
      <div className="p-6 mt-auto">
        <Button
          onClick={handleContinue}
          disabled={selectedFilters.length === 0}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] hover:opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {t('Proses Filter', 'Process Filters')} ({selectedFilters.length})
        </Button>
      </div>
    </div>
  );
}
