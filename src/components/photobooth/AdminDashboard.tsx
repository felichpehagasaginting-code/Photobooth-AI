'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  BarChart3,
  Package,
  Palette,
  History,
  Camera as CameraIcon,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { formatPrice, type PackageInfo, type FilterInfo, type TransactionInfo, type AdminStats, FILTER_CATEGORIES, FILTER_STYLES } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Stat card component
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-[#15151F] border border-[#2A2A3A] p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const { setStep, setAdminLoggedIn, language } = usePhotoboothStore();

  const [stats, setStats] = useState<AdminStats>({
    totalSessions: 0,
    totalRevenue: 0,
    todaySessions: 0,
    todayRevenue: 0,
    activeFilters: 0,
    recentTransactions: [],
  });
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [filters, setFilters] = useState<FilterInfo[]>([]);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);

  // Camera test
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch { /* use defaults */ }
  }, []);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch('/api/filters');
      if (res.ok) {
        const data = await res.json();
        setFilters(data.filters || []);
      }
    } catch { /* use defaults */ }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch { /* use defaults */ }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      const [statsRes, packagesRes, filtersRes, transactionsRes] = await Promise.allSettled([
        fetch('/api/admin/stats'),
        fetch('/api/packages'),
        fetch('/api/filters'),
        fetch('/api/admin/transactions'),
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }
      if (packagesRes.status === 'fulfilled' && packagesRes.value.ok) {
        const data = await packagesRes.value.json();
        setPackages(data.packages || []);
      }
      if (filtersRes.status === 'fulfilled' && filtersRes.value.ok) {
        const data = await filtersRes.value.json();
        setFilters(data.filters || []);
      }
      if (transactionsRes.status === 'fulfilled' && transactionsRes.value.ok) {
        const data = await transactionsRes.value.json();
        setTransactions(data.transactions || []);
      }
    } catch {
      // Use defaults
    }
  }, []);

  useEffect(() => {
    // Data fetching on mount - setState calls are in async callbacks from fetch
    fetchAllData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchAllData]);

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      // Camera not available
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const toggleFilterActive = async (filterId: string, active: boolean) => {
    try {
      await fetch(`/api/filters/${filterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      setFilters((prev) =>
        prev.map((f) => (f.id === filterId ? { ...f, active: !active } : f))
      );
    } catch {
      // Still update locally
      setFilters((prev) =>
        prev.map((f) => (f.id === filterId ? { ...f, active: !active } : f))
      );
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setStep('idle');
  };

  const getCategoryLabel = (category: string) => {
    const cat = FILTER_CATEGORIES[category as keyof typeof FILTER_CATEGORIES];
    return cat?.label || category;
  };

  const getStyleColor = (style: string) => {
    return FILTER_STYLES[style as keyof typeof FILTER_STYLES]?.color || '#FF6B9D';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2A2A3A]">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-[#FF6B9D]" />
          <h1 className="text-lg font-bold text-white">
            {t('Admin Dashboard', 'Admin Dashboard')}
          </h1>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('Keluar', 'Logout')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full bg-[#15151F] border border-[#2A2A3A] rounded-xl h-auto p-1 flex-wrap">
            <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-[#FF6B9D]/20 data-[state=active]:text-[#FF6B9D]">
              <BarChart3 className="w-4 h-4 mr-1" />
              <span className="text-xs">{t('Dashboard', 'Dashboard')}</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="rounded-lg data-[state=active]:bg-[#FF6B9D]/20 data-[state=active]:text-[#FF6B9D]">
              <Package className="w-4 h-4 mr-1" />
              <span className="text-xs">{t('Paket', 'Packages')}</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="rounded-lg data-[state=active]:bg-[#FF6B9D]/20 data-[state=active]:text-[#FF6B9D]">
              <Palette className="w-4 h-4 mr-1" />
              <span className="text-xs">{t('Filter', 'Filters')}</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-[#FF6B9D]/20 data-[state=active]:text-[#FF6B9D]">
              <History className="w-4 h-4 mr-1" />
              <span className="text-xs">{t('Riwayat', 'History')}</span>
            </TabsTrigger>
            <TabsTrigger value="camera" className="rounded-lg data-[state=active]:bg-[#FF6B9D]/20 data-[state=active]:text-[#FF6B9D]">
              <CameraIcon className="w-4 h-4 mr-1" />
              <span className="text-xs">{t('Kamera', 'Camera')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 gap-3 mt-4">
              <StatCard
                label={t('Total Sesi', 'Total Sessions')}
                value={stats.totalSessions.toString()}
                color="#FF6B9D"
              />
              <StatCard
                label={t('Total Pendapatan', 'Total Revenue')}
                value={formatPrice(stats.totalRevenue)}
                color="#06D6A0"
              />
              <StatCard
                label={t('Sesi Hari Ini', "Today's Sessions")}
                value={stats.todaySessions.toString()}
                color="#FF8A65"
              />
              <StatCard
                label={t('Pendapatan Hari Ini', "Today's Revenue")}
                value={formatPrice(stats.todayRevenue)}
                color="#FBBF24"
              />
            </div>
            <div className="mt-4">
              <Card className="bg-[#15151F] border-[#2A2A3A]">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {t('Filter Aktif', 'Active Filters')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-[#06D6A0]">
                    {stats.activeFilters || filters.filter((f) => f.active).length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <div className="flex items-center justify-between mt-4 mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('Daftar Paket', 'Package List')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchPackages}
                className="text-muted-foreground hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-xl bg-[#15151F] border border-[#2A2A3A] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white">{pkg.name}</h4>
                    <Badge
                      className={pkg.active ? 'bg-[#06D6A0]/20 text-[#06D6A0] border-transparent' : 'bg-red-500/20 text-red-400 border-transparent'}
                    >
                      {pkg.active ? t('Aktif', 'Active') : t('Nonaktif', 'Inactive')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {pkg.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#FF6B9D]">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pkg.filterCount >= 99 ? t('Semua filter', 'All filters') : `${pkg.filterCount} ${t('filter', 'filters')}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Filters Tab */}
          <TabsContent value="filters">
            <div className="flex items-center justify-between mt-4 mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('Daftar Filter', 'Filter List')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchFilters}
                className="text-muted-foreground hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {filters.map((filter) => {
                const styleColor = getStyleColor(filter.style);
                return (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between rounded-xl bg-[#15151F] border border-[#2A2A3A] p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: styleColor + '20' }}
                      >
                        <Palette className="w-4 h-4" style={{ color: styleColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {filter.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryLabel(filter.category)}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={filter.active}
                      onCheckedChange={() => toggleFilterActive(filter.id, filter.active)}
                    />
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="flex items-center justify-between mt-4 mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('Riwayat Transaksi', 'Transaction History')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTransactions}
                className="text-muted-foreground hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="rounded-xl bg-[#15151F] border border-[#2A2A3A] overflow-hidden max-h-[60vh] overflow-y-auto scrollbar-thin">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {t('Belum ada transaksi', 'No transactions yet')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#2A2A3A] hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs">{t('Order', 'Order')}</TableHead>
                      <TableHead className="text-muted-foreground text-xs">{t('Jumlah', 'Amount')}</TableHead>
                      <TableHead className="text-muted-foreground text-xs">{t('Status', 'Status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id} className="border-[#2A2A3A] hover:bg-[#1A1A2A]">
                        <TableCell className="font-mono text-xs text-white">
                          {txn.orderId?.slice(0, 12)}...
                        </TableCell>
                        <TableCell className="text-xs text-white">
                          {formatPrice(txn.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[9px] ${
                              txn.status === 'paid'
                                ? 'bg-[#06D6A0]/20 text-[#06D6A0] border-transparent'
                                : txn.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400 border-transparent'
                                : 'bg-red-500/20 text-red-400 border-transparent'
                            }`}
                          >
                            {txn.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Camera Tab */}
          <TabsContent value="camera">
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="w-full max-w-md aspect-video rounded-xl bg-[#15151F] border border-[#2A2A3A] overflow-hidden">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CameraIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={startCamera}
                  disabled={cameraActive}
                  className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8A65] text-white"
                >
                  <CameraIcon className="w-4 h-4 mr-2" />
                  {t('Mulai Kamera', 'Start Camera')}
                </Button>
                <Button
                  onClick={stopCamera}
                  disabled={!cameraActive}
                  variant="outline"
                  className="border-[#2A2A3A] bg-[#15151F] text-white hover:bg-[#2A2A3A]"
                >
                  {t('Stop', 'Stop')}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
