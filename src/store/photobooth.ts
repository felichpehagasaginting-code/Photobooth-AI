import { create } from 'zustand';
import type { AppStep, PackageInfo, FilterInfo, TransactionInfo } from '@/types';

interface CapturedPhoto {
  original: string; // base64 data URL
  timestamp: number;
}

interface FilteredPhoto {
  original: string; // base64 data URL
  filtered: string; // base64 data URL
  filterName: string;
  filterId: string;
}

interface PhotoboothState {
  // Navigation
  currentStep: AppStep;
  previousStep: AppStep | null;
  setStep: (step: AppStep) => void;
  goBack: () => void;

  // Package selection
  selectedPackage: PackageInfo | null;
  setSelectedPackage: (pkg: PackageInfo | null) => void;

  // Camera
  capturedPhoto: CapturedPhoto | null;
  setCapturedPhoto: (photo: CapturedPhoto | null) => void;

  // Filters
  selectedFilters: FilterInfo[];
  addFilter: (filter: FilterInfo) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;

  // Processing
  filteredPhotos: FilteredPhoto[];
  addFilteredPhoto: (photo: FilteredPhoto) => void;
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

  // Language
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;

  // Reset
  resetAll: () => void;
}

export const usePhotoboothStore = create<PhotoboothState>((set, get) => ({
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

  // Package selection
  selectedPackage: null,
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),

  // Camera
  capturedPhoto: null,
  setCapturedPhoto: (photo) => set({ capturedPhoto: photo }),

  // Filters
  selectedFilters: [],
  addFilter: (filter) => set((state) => {
    const maxFilters = state.selectedPackage?.filterCount ?? 1;
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
    filteredPhotos: [...state.filteredPhotos, photo],
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

  // Language
  language: 'id',
  setLanguage: (lang) => set({ language: lang }),

  // Reset
  resetAll: () => set({
    currentStep: 'idle',
    previousStep: null,
    selectedPackage: null,
    capturedPhoto: null,
    selectedFilters: [],
    filteredPhotos: [],
    processingProgress: 0,
    currentProcessingFilter: '',
    currentTransaction: null,
  }),
}));
