// AI Photobooth - Core Types

export type AppStep =
  | 'idle'
  | 'package-select'
  | 'camera'
  | 'countdown'
  | 'captured'
  | 'filter-select'
  | 'processing'
  | 'payment'
  | 'success'
  | 'download'
  | 'admin-login'
  | 'admin-dashboard';

export interface PackageInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  filterCount: number;
  active: boolean;
  sortOrder: number;
}

export interface FilterInfo {
  id: string;
  name: string;
  description?: string;
  category: string;
  style: string;
  thumbnail?: string;
  prompt?: string;
  active: boolean;
  sortOrder: number;
}

export interface TransactionInfo {
  id: string;
  orderId: string;
  packageId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  paymentMethod?: string;
  paymentTime?: string;
  downloadToken?: string;
  tokenExpiresAt?: string;
  filterNames?: string;
  createdAt: string;
}

export interface PhotoInfo {
  id: string;
  transactionId: string;
  originalUrl?: string;
  filteredUrl?: string;
  filterName?: string;
  fileName?: string;
  createdAt: string;
}

export interface AdminStats {
  totalSessions: number;
  totalRevenue: number;
  todaySessions: number;
  todayRevenue: number;
  activeFilters: number;
  recentTransactions: TransactionInfo[];
}

export const FILTER_CATEGORIES = {
  artistic: { label: 'Artistic', icon: 'Palette' },
  beauty: { label: 'Beauty', icon: 'Sparkles' },
  background: { label: 'Background', icon: 'Image' },
  morphing: { label: 'Fun', icon: 'Smile' },
} as const;

export const FILTER_STYLES = {
  anime: { label: 'Anime', color: '#FF6B9D' },
  watercolor: { label: 'Watercolor', color: '#4ECDC4' },
  cyberpunk: { label: 'Cyberpunk', color: '#A855F7' },
  vintage: { label: 'Vintage', color: '#D4A574' },
  beauty: { label: 'Beauty', color: '#F472B6' },
  virtual_bg: { label: 'Virtual BG', color: '#34D399' },
  morphing: { label: 'Morphing', color: '#FBBF24' },
  comic: { label: 'Comic', color: '#60A5FA' },
} as const;

export const DEFAULT_PACKAGES: Omit<PackageInfo, 'id'>[] = [
  {
    name: 'Basic',
    description: '1 AI filter pilihanmu',
    price: 15000,
    filterCount: 1,
    active: true,
    sortOrder: 0,
  },
  {
    name: 'Standard',
    description: '3 AI filter berbeda',
    price: 30000,
    filterCount: 3,
    active: true,
    sortOrder: 1,
  },
  {
    name: 'Premium',
    description: 'Akses semua AI filter',
    price: 50000,
    filterCount: 99,
    active: true,
    sortOrder: 2,
  },
];

export const DEFAULT_FILTERS: Omit<FilterInfo, 'id'>[] = [
  {
    name: 'Anime Ghibli',
    description: 'Ubah foto jadi gaya Studio Ghibli yang indah dan lembut',
    category: 'artistic',
    style: 'anime',
    prompt: 'Convert this photo into Studio Ghibli anime art style, soft watercolor-like coloring, dreamy atmosphere, detailed backgrounds, warm lighting, Miyazaki style',
    active: true,
    sortOrder: 0,
  },
  {
    name: 'Anime Shonen',
    description: 'Gaya anime action dengan garis tegas dan warna bold',
    category: 'artistic',
    style: 'anime',
    prompt: 'Convert this photo into Shonen anime art style, bold outlines, vibrant colors, dynamic action manga style, dramatic lighting, sharp edges',
    active: true,
    sortOrder: 1,
  },
  {
    name: 'Watercolor',
    description: 'Lukisan cat air yang lembut dan artistik',
    category: 'artistic',
    style: 'watercolor',
    prompt: 'Convert this photo into a beautiful watercolor painting, soft blended colors, paper texture visible, artistic brush strokes, gentle color bleeding',
    active: true,
    sortOrder: 2,
  },
  {
    name: 'Cyberpunk Neon',
    description: 'Masa depan neon dengan efek cahaya dramatis',
    category: 'artistic',
    style: 'cyberpunk',
    prompt: 'Convert this photo into cyberpunk neon art style, glowing neon lights, dark futuristic atmosphere, holographic effects, purple and cyan color scheme, rain',
    active: true,
    sortOrder: 3,
  },
  {
    name: 'Vintage Film',
    description: 'Efek film retro dengan grain dan warna klasik',
    category: 'artistic',
    style: 'vintage',
    prompt: 'Convert this photo into vintage film photography style, film grain, warm color shift, light leaks, slightly faded, retro 1970s aesthetic, analog camera look',
    active: true,
    sortOrder: 4,
  },
  {
    name: 'AI Beauty',
    description: 'Enhance wajah dengan AI beauty filter',
    category: 'beauty',
    style: 'beauty',
    prompt: 'Apply beauty enhancement to this photo, smooth skin, enhance features naturally, professional portrait lighting, soft focus background, magazine cover quality',
    active: true,
    sortOrder: 5,
  },
  {
    name: 'Fantasy Background',
    description: 'Ganti background dengan dunia fantasi',
    category: 'background',
    style: 'virtual_bg',
    prompt: 'Replace the background with a magical fantasy landscape, enchanted forest with glowing particles, mystical atmosphere, keep the person unchanged, dreamy lighting',
    active: true,
    sortOrder: 6,
  },
  {
    name: 'Comic Book',
    description: 'Gaya komik pop art yang seru dan colorful',
    category: 'morphing',
    style: 'comic',
    prompt: 'Convert this photo into comic book pop art style, halftone dots, bold black outlines, bright saturated colors, action comic panel look, Ben-Day dots effect',
    active: true,
    sortOrder: 7,
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PB-${timestamp}-${random}`;
}
