// AI Photobooth - Core Types

export type AppStep =
  | 'idle'
  | 'take-select'
  | 'camera'
  | 'countdown'
  | 'captured'
  | 'filter-select'
  | 'processing'
  | 'download'
  | 'admin-login'
  | 'admin-dashboard';

export type TakeCount = 2 | 4 | 6;

export interface TakeOption {
  count: TakeCount;
  label: string;
  totalPrice: number;
  pricePerTake: number;
  filtersPerTake: number;
}

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

export const TAKE_OPTIONS: TakeOption[] = [
  {
    count: 2,
    label: '2x Take',
    totalPrice: 5000,
    pricePerTake: 2500,
    filtersPerTake: 2,
  },
  {
    count: 4,
    label: '4x Take',
    totalPrice: 8000,
    pricePerTake: 2000,
    filtersPerTake: 3,
  },
  {
    count: 6,
    label: '6x Take',
    totalPrice: 10000,
    pricePerTake: 1667,
    filtersPerTake: 3,
  },
];

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
    prompt: 'Transform this portrait into Studio Ghibli anime style. Soft watercolor-like coloring, dreamy atmosphere, detailed whimsical backgrounds, warm golden lighting, Miyazaki\'s gentle artistic touch. Keep the person\'s likeness and pose. Beautiful hand-painted aesthetic with soft edges and magical feeling.',
    active: true,
    sortOrder: 0,
  },
  {
    name: 'Anime Shonen',
    description: 'Gaya anime action dengan garis tegas dan warna bold',
    category: 'artistic',
    style: 'anime',
    prompt: 'Transform this portrait into Shonen manga anime style. Bold clean outlines, vibrant saturated colors, dynamic energy, dramatic lighting with speed lines, sharp angular features, action-ready pose. High contrast, comic book intensity, youthful heroic look.',
    active: true,
    sortOrder: 1,
  },
  {
    name: 'Watercolor',
    description: 'Lukisan cat air yang lembut dan artistik',
    category: 'artistic',
    style: 'watercolor',
    prompt: 'Transform this portrait into a fine art watercolor painting. Soft blended pigments bleeding on textured cold-press paper, visible brush strokes, delicate color transitions, translucent layers, artistic hand-painted feel. Gentle luminosity, painterly aesthetic, museum quality artwork.',
    active: true,
    sortOrder: 2,
  },
  {
    name: 'Cyberpunk Neon',
    description: 'Masa depan neon dengan efek cahaya dramatis',
    category: 'artistic',
    style: 'cyberpunk',
    prompt: 'Transform this portrait into cyberpunk futuristic style. Glowing neon lights in purple and cyan, dark rain-soaked city background, holographic UI elements, high-tech implants aesthetic, dramatic rim lighting, dystopian sci-fi atmosphere. Cinematic, moody, futuristic.',
    active: true,
    sortOrder: 3,
  },
  {
    name: 'Vintage Film',
    description: 'Efek film retro dengan grain dan warna klasik',
    category: 'artistic',
    style: 'vintage',
    prompt: 'Transform this portrait into vintage 1970s film photography. Warm sepia-brown color shift, visible film grain texture, subtle light leaks, slightly faded and washed tones, analog camera lens softness, nostalgic retro aesthetic. Classic Hollywood portrait mood.',
    active: true,
    sortOrder: 4,
  },
  {
    name: 'AI Beauty',
    description: 'Enhance wajah dengan AI beauty filter',
    category: 'beauty',
    style: 'beauty',
    prompt: 'Transform this portrait with professional beauty retouching. Smooth flawless skin, enhanced natural features, professional portrait studio lighting, soft focus dreamy background, magazine cover quality, subtle makeup enhancement, radiant glowing skin, high fashion editorial look.',
    active: true,
    sortOrder: 5,
  },
  {
    name: 'Fantasy Background',
    description: 'Ganti background dengan dunia fantasi',
    category: 'background',
    style: 'virtual_bg',
    prompt: 'Transform this portrait by replacing the background with a magical fantasy realm. Enchanted forest with glowing fireflies and mystical particles, ethereal soft lighting, dreamlike atmosphere. Keep the person exactly as is, only change surroundings to fantasy world. Cinematic fantasy art.',
    active: true,
    sortOrder: 6,
  },
  {
    name: 'Comic Book',
    description: 'Gaya komik pop art yang seru dan colorful',
    category: 'morphing',
    style: 'comic',
    prompt: 'Transform this portrait into pop art comic book style. Bold black ink outlines, bright saturated flat colors, Ben-Day halftone dot patterns, dynamic comic panel framing, action hero aesthetic, Roy Lichtenstein inspired, graphic novel illustration style.',
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
