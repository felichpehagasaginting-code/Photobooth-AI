import { create } from 'zustand';
import type { AppStep, TakeCount, FilterInfo, TransactionInfo, PackageInfo } from '@/types';

interface CapturedPhoto {
  original: string; // base64 data URL
  timestamp: number;
}

export interface FilteredPhoto {
  original: string; // base64 data URL
  filtered: string; // base64 data URL
  filterName: string;
  filterId: string;
  id: string; // unique id for React key
}

interface PhotoboothState {
  // Navigation
  currentStep: AppStep;
  previousStep: AppStep | null;
  setStep: (step: AppStep) => void;
  goBack: () => void;

  // Take configuration (replaces package)
  takeCount: TakeCount;
  filtersPerTake: number;
  currentTake: number;
  setTakeConfig: (count: TakeCount, filters: number) => void;
  incrementTake: () => void;
  retakeIndex: number | null;
  setRetakeIndex: (index: number | null) => void;

  // Package
  selectedPackage: PackageInfo | null;
  setSelectedPackage: (pkg: PackageInfo | null) => void;

  // Camera
  capturedPhotos: CapturedPhoto[];
  addCapturedPhoto: (photo: CapturedPhoto) => void;
  replaceCapturedPhoto: (index: number, photo: CapturedPhoto) => void;
  removeLastCapturedPhoto: () => void;
  clearCapturedPhotos: () => void;

  // Filters
  selectedFilters: FilterInfo[];
  addFilter: (filter: FilterInfo) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;

  // Processing
  filteredPhotos: FilteredPhoto[];
  addFilteredPhoto: (photo: Omit<FilteredPhoto, 'id'> & { id?: string }) => void;
  clearFilteredPhotos: () => void;
  processingProgress: number;
  setProcessingProgress: (progress: number) => void;
  currentProcessingFilter: string;
  setCurrentProcessingFilter: (name: string) => void;

  // Transaction
  currentTransaction: TransactionInfo | null;
  setCurrentTransaction: (transaction: TransactionInfo | null) => void;

  // Admin
  isAdminLoggedIn: boolean;
  setAdminLoggedIn: (loggedIn: boolean) => void;
  eventBranding: { title: string; subtitle: string; logoUrl?: string; countdownSec?: number };
  setEventBranding: (branding: { title: string; subtitle: string; logoUrl?: string; countdownSec?: number }) => void;

  // Language
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;

  // Reset
  resetAll: () => void;
}

export const usePhotoboothStore = create<PhotoboothState>((set) => ({
  // Navigation
  currentStep: 'idle',
  previousStep: null,
  setStep: (step) => set((state) => ({ previousStep: state.currentStep, currentStep: step })),
  goBack: () => set((state) => {
    if (state.previousStep) {
      return { currentStep: state.previousStep, previousStep: null };
    }
    return { currentStep: 'idle', previousStep: null };
  }),

  // Take configuration
  takeCount: 2,
  filtersPerTake: 2,
  currentTake: 1,
  setTakeConfig: (count, filters) => set({ takeCount: count, filtersPerTake: filters, currentTake: 1, retakeIndex: null }),
  incrementTake: () => set((state) => ({ currentTake: state.currentTake + 1 })),
  retakeIndex: null,
  setRetakeIndex: (index) => set({ retakeIndex: index }),

  // Package
  selectedPackage: null,
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),

  // Camera
  capturedPhotos: [],
  addCapturedPhoto: (photo) => set((state) => ({ capturedPhotos: [...state.capturedPhotos, photo] })),
  replaceCapturedPhoto: (index, photo) => set((state) => {
    const newPhotos = [...state.capturedPhotos];
    newPhotos[index] = photo;
    return { capturedPhotos: newPhotos };
  }),
  removeLastCapturedPhoto: () => set((state) => ({ capturedPhotos: state.capturedPhotos.slice(0, -1) })),
  clearCapturedPhotos: () => set({ capturedPhotos: [] }),

  // Filters
  selectedFilters: [],
  addFilter: (filter) => set((state) => {
    const maxFilters = state.filtersPerTake;
    if (state.selectedFilters.length < maxFilters) {
      return { selectedFilters: [...state.selectedFilters, filter] };
    }
    return state;
  }),
  removeFilter: (filterId) => set((state) => ({
    selectedFilters: state.selectedFilters.filter((f) => f.id !== filterId),
  })),
  clearFilters: () => set({ selectedFilters: [] }),

  // Processing
  filteredPhotos: [],
  addFilteredPhoto: (photo) => set((state) => ({
    filteredPhotos: [...state.filteredPhotos, { ...photo, id: photo.id || `${photo.filterId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }],
  })),
  clearFilteredPhotos: () => set({ filteredPhotos: [] }),
  processingProgress: 0,
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  currentProcessingFilter: '',
  setCurrentProcessingFilter: (name) => set({ currentProcessingFilter: name }),

  // Transaction
  currentTransaction: null,
  setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),

  // Admin
  isAdminLoggedIn: false,
  setAdminLoggedIn: (loggedIn) => set({ isAdminLoggedIn: loggedIn }),
  eventBranding: { title: 'AI.PHOTOBOOTH', subtitle: 'Premium AI Edition', countdownSec: 3 },
  setEventBranding: (branding) => set({ eventBranding: branding }),

  // Language
  language: 'id',
  setLanguage: (lang) => set({ language: lang }),

  // Reset
  resetAll: () => set({
    currentStep: 'idle',
    previousStep: null,
    takeCount: 2,
    filtersPerTake: 2,
    currentTake: 1,
    retakeIndex: null,
    selectedPackage: null,
    capturedPhotos: [],
    selectedFilters: [],
    filteredPhotos: [],
    processingProgress: 0,
    currentProcessingFilter: '',
    currentTransaction: null,
  }),
}));