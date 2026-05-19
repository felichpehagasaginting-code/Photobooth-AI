'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, BarChart3, Package, Palette,
  History, Camera as CameraIcon, RefreshCw,
} from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import {
  formatPrice, type PackageInfo, type FilterInfo,
  type TransactionInfo, type AdminStats,
  FILTER_CATEGORIES, FILTER_STYLES,
} from '@/types';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

/* ── Stat tile — editorial data card ─────────────────────────────────── */
function StatTile({ label, value, accent, index }: { label: string; value: string; accent: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: '#151210',
        border: '1px solid #2c2822',
        padding: '16px 18px',
        /* Each tile gets unique clip per index */
        clipPath: index % 2 === 0
          ? 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
          : 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)',
      }}
    >
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase font-body mb-2" style={{ color: '#7a7168' }}>
        {label}
      </p>
      <p className="font-display font-black leading-none" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: accent }}>
        {value}
      </p>
    </motion.div>
  );
}

/* ── Section header ── */
function SectionHeader({ title, onRefresh }: { title: string; onRefresh?: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px w-4 bg-[#c87941]" />
      <span className="text-[9px] font-bold tracking-[0.35em] text-[#c87941] uppercase font-body">{title}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(44,40,34,0.6)' }} />
      {onRefresh && (
        <button onClick={onRefresh} className="text-[#7a7168] hover:text-[#c87941] tap-none press" style={{ transition: 'color 180ms cubic-bezier(0.33, 1, 0.68, 1)' }}>
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/* ── Nav tab items ── */
const NAV_ITEMS = [
  { id: 'dashboard', Icon: BarChart3, label: 'Overview' },
  { id: 'packages',  Icon: Package,   label: 'Paket' },
  { id: 'filters',   Icon: Palette,   label: 'Filter' },
  { id: 'history',   Icon: History,   label: 'Riwayat' },
  { id: 'camera',    Icon: CameraIcon, label: 'Kamera' },
  { id: 'settings',  Icon: LogOut,    label: 'Pengaturan' }, // using LogOut icon temporarily or maybe find Settings
] as const;

type TabId = (typeof NAV_ITEMS)[number]['id'];

/* ── Main ───────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { setStep, setAdminLoggedIn, language, eventBranding, setEventBranding } = usePhotoboothStore();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const [stats, setStats] = useState<AdminStats>({
    totalSessions: 0, totalRevenue: 0,
    todaySessions: 0, todayRevenue: 0,
    activeFilters: 0, recentTransactions: [],
  });
  const [packages, setPackages]         = useState<PackageInfo[]>([]);
  const [filters, setFilters]           = useState<FilterInfo[]>([]);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  const fetchAllData = useCallback(async () => {
    try {
      const [sR, pR, fR, tR] = await Promise.allSettled([
        fetch('/api/admin/stats'),
        fetch('/api/packages'),
        fetch('/api/filters'),
        fetch('/api/admin/transactions'),
      ]);
      if (sR.status === 'fulfilled' && sR.value.ok) setStats(await sR.value.json());
      if (pR.status === 'fulfilled' && pR.value.ok) { const d = await pR.value.json(); setPackages(d.packages || []); }
      if (fR.status === 'fulfilled' && fR.value.ok) { const d = await fR.value.json(); setFilters(d.filters || []); }
      if (tR.status === 'fulfilled' && tR.value.ok) { const d = await tR.value.json(); setTransactions(d.transactions || []); }
    } catch { /* use defaults */ }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch { /* Camera unavailable */ }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const toggleFilter = async (filterId: string, active: boolean) => {
    try {
      await fetch(`/api/filters/${filterId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
    } catch { /* still update locally */ }
    setFilters(prev => prev.map(f => f.id === filterId ? { ...f, active: !active } : f));
  };

  const handleLogout = () => { setAdminLoggedIn(false); setStep('idle'); };

  const getStyleColor = (style: string) =>
    FILTER_STYLES[style as keyof typeof FILTER_STYLES]?.color || '#c87941';
  const getCategoryLabel = (cat: string) =>
    FILTER_CATEGORIES[cat as keyof typeof FILTER_CATEGORIES]?.label || cat;

  /* Status color mapping */
  const statusColor: Record<string, string> = {
    paid: '#4ecb9e', pending: '#e8a02a', expired: '#d94040',
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#0c0a09' }}>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", opacity: 0.4 }}
      />

      {/* ── Top bar ── */}
      <div className="relative z-20 flex items-center px-5 py-3 gap-4"
        style={{ background: 'rgba(12,10,9,0.9)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(200,121,65,0.1)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div style={{ width: 24, height: 24, background: '#c87941', clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }} />
          <span className="font-display font-black text-xs tracking-[0.15em] text-[#f0ebe3] uppercase">
            Admin<span className="text-[#c87941]">.</span>Panel
          </span>
        </div>

        {/* Tab nav — horizontal, compact */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {NAV_ITEMS.map(({ id, Icon, label }) => (
            <button
              key={id}
              id={`admin-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 tap-none press whitespace-nowrap font-body text-[11px] font-semibold"
              style={{
                color: activeTab === id ? '#c87941' : '#7a7168',
                background: activeTab === id ? 'rgba(200,121,65,0.08)' : 'transparent',
                borderBottom: activeTab === id ? '2px solid #c87941' : '2px solid transparent',
                transition: 'color 180ms cubic-bezier(0.33, 1, 0.68, 1), background 180ms cubic-bezier(0.33, 1, 0.68, 1)',
              }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[11px] font-body font-semibold text-[#7a7168] hover:text-[#d94040] tap-none press"
          style={{ transition: 'color 180ms cubic-bezier(0.33, 1, 0.68, 1)' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('Keluar', 'Logout')}</span>
        </button>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 p-5 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-px w-4 bg-[#c87941]" />
                    <span className="text-[9px] font-bold tracking-[0.35em] text-[#c87941] uppercase font-body">Overview</span>
                  </div>
                  <h2 className="font-display font-black text-[#f0ebe3]" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>
                    Admin <span className="italic text-[#c87941]">Dashboard</span>
                  </h2>
                </div>

                {/* Stats grid — 2×2 with alternating clip-paths */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <StatTile label={t('Total Sesi', 'Total Sessions')} value={stats.totalSessions.toString()} accent="#c87941" index={0} />
                  <StatTile label={t('Total Pendapatan', 'Total Revenue')} value={formatPrice(stats.totalRevenue)} accent="#e8a02a" index={1} />
                  <StatTile label={t('Sesi Hari Ini', "Today's Sessions")} value={stats.todaySessions.toString()} accent="#4ecb9e" index={2} />
                  <StatTile label={t('Pendapatan Hari Ini', "Today's Revenue")} value={formatPrice(stats.todayRevenue)} accent="#f0ebe3" index={3} />
                </div>

                {/* Active filters — full-width accent bar */}
                <div style={{ background: '#151210', border: '1px solid rgba(200,121,65,0.2)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase font-body font-bold mb-1" style={{ color: '#7a7168' }}>{t('Filter Aktif', 'Active Filters')}</p>
                    <p className="font-display font-black" style={{ fontSize: '2rem', color: '#4ecb9e' }}>
                      {stats.activeFilters || filters.filter(f => f.active).length}
                    </p>
                  </div>
                  {/* Visual bar */}
                  <div className="flex gap-1 items-end h-10">
                    {[40,65,50,80,55,70,45].map((h, i) => (
                      <div key={i} style={{ width: 4, height: `${h}%`, background: i === 5 ? '#4ecb9e' : 'rgba(78,203,158,0.2)' }} />
                    ))}
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="mt-5 mb-5 p-5" style={{ background: '#151210', border: '1px solid #2c2822' }}>
                  <p className="text-[10px] tracking-[0.25em] uppercase font-body font-bold mb-4" style={{ color: '#7a7168' }}>Tren Pendapatan (7 Hari Terakhir)</p>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Sen', revenue: 450000 },
                        { name: 'Sel', revenue: 320000 },
                        { name: 'Rab', revenue: 500000 },
                        { name: 'Kam', revenue: 410000 },
                        { name: 'Jum', revenue: 650000 },
                        { name: 'Sab', revenue: 1200000 },
                        { name: 'Min', revenue: 950000 }
                      ]}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c87941" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#c87941" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#7a7168" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0c0a09', border: '1px solid #2c2822', borderRadius: 0 }}
                          itemStyle={{ color: '#c87941', fontWeight: 'bold' }}
                          formatter={(value: number) => formatPrice(value)}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#c87941" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent transactions — last 3 */}
                {stats.recentTransactions?.length > 0 && (
                  <div className="mt-5">
                    <SectionHeader title="Transaksi Terakhir" />
                    <div className="space-y-2">
                      {stats.recentTransactions.slice(0, 3).map((txn: TransactionInfo) => (
                        <div key={txn.id} className="flex items-center justify-between px-3 py-2.5"
                          style={{ background: '#151210', border: '1px solid #2c2822' }}
                        >
                          <span className="font-mono text-[11px] text-[#7a7168] font-body">{txn.orderId?.slice(0, 12)}…</span>
                          <span className="text-[11px] font-bold font-body text-[#f0ebe3]">{formatPrice(txn.amount)}</span>
                          <span className="text-[9px] font-bold tracking-[0.15em] uppercase font-body px-2 py-0.5"
                            style={{ color: statusColor[txn.status] || '#7a7168', border: `1px solid ${statusColor[txn.status] || '#2c2822'}30` }}
                          >
                            {txn.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PACKAGES TAB ── */}
            {activeTab === 'packages' && (
              <div>
                <SectionHeader title={t('Daftar Paket', 'Package List')} onRefresh={async () => {
                  const res = await fetch('/api/packages');
                  if (res.ok) { const d = await res.json(); setPackages(d.packages || []); }
                }} />
                <div className="space-y-3">
                  {packages.length === 0 && (
                    <p className="text-[#7a7168] text-sm font-body text-center py-10">{t('Tidak ada paket', 'No packages found')}</p>
                  )}
                  {packages.map((pkg, i) => (
                    <motion.div key={pkg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: '#151210', border: '1px solid #2c2822', padding: '16px',
                        clipPath: i % 2 === 0 ? 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-display font-bold text-[#f0ebe3] text-base">{pkg.name}</h3>
                        <span
                          className="text-[9px] font-bold tracking-[0.2em] uppercase font-body px-2 py-0.5"
                          style={{
                            color: pkg.active ? '#4ecb9e' : '#d94040',
                            border: `1px solid ${pkg.active ? 'rgba(78,203,158,0.3)' : 'rgba(217,64,64,0.3)'}`,
                          }}
                        >
                          {pkg.active ? t('AKTIF', 'ACTIVE') : t('NONAKTIF', 'INACTIVE')}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#7a7168] font-body mb-3 leading-relaxed">{pkg.description}</p>
                      <div className="flex items-end justify-between">
                        <span className="font-display font-black" style={{ fontSize: '1.3rem', color: '#c87941' }}>
                          {formatPrice(pkg.price)}
                        </span>
                        <span className="text-[10px] tracking-[0.15em] text-[#7a7168] font-body uppercase">
                          {pkg.filterCount >= 99 ? t('Semua filter', 'All filters') : `${pkg.filterCount} ${t('filter', 'filters')}`}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FILTERS TAB ── */}
            {activeTab === 'filters' && (
              <div>
                <SectionHeader title={t('Daftar Filter', 'Filter List')} onRefresh={async () => {
                  const res = await fetch('/api/filters');
                  if (res.ok) { const d = await res.json(); setFilters(d.filters || []); }
                }} />
                <div className="space-y-2">
                  {filters.map((filter, i) => {
                    const accent = getStyleColor(filter.style);
                    return (
                      <motion.div key={filter.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between px-3 py-3"
                        style={{ background: '#151210', border: '1px solid #2c2822', borderLeft: `3px solid ${accent}` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {filter.thumbnail ? (
                            <div className="w-9 h-9 overflow-hidden shrink-0" style={{ border: `1px solid ${accent}30` }}>
                              <img src={filter.thumbnail} alt={filter.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: `${accent}14`, border: `1px solid ${accent}20` }}>
                              <Palette className="w-4 h-4" style={{ color: accent }} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#f0ebe3] font-body truncate">{filter.name}</p>
                            <p className="text-[10px] tracking-[0.15em] uppercase font-body" style={{ color: accent }}>
                              {getCategoryLabel(filter.category)}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={filter.active}
                          onCheckedChange={() => toggleFilter(filter.id, filter.active)}
                        />
                      </motion.div>
                    );
                  })}
                  {filters.length === 0 && (
                    <p className="text-[#7a7168] text-sm font-body text-center py-10">{t('Tidak ada filter', 'No filters found')}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── HISTORY TAB ── */}
            {activeTab === 'history' && (
              <div>
                <SectionHeader title={t('Riwayat Transaksi', 'Transaction History')} onRefresh={async () => {
                  const res = await fetch('/api/admin/transactions');
                  if (res.ok) { const d = await res.json(); setTransactions(d.transactions || []); }
                }} />
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-10 h-10" style={{ border: '1px solid #2c2822', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <History className="w-5 h-5 text-[#2c2822]" />
                    </div>
                    <p className="text-[11px] tracking-[0.25em] text-[#7a7168] uppercase font-body">{t('Belum ada transaksi', 'No transactions yet')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Column header */}
                    <div className="grid grid-cols-3 gap-2 px-3 pb-2" style={{ borderBottom: '1px solid rgba(44,40,34,0.6)' }}>
                      {[t('Order ID', 'Order ID'), t('Jumlah', 'Amount'), t('Status', 'Status')].map(h => (
                        <span key={h} className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7a7168] font-body">{h}</span>
                      ))}
                    </div>
                    {transactions.map((txn, i) => (
                      <motion.div key={txn.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="grid grid-cols-3 gap-2 items-center px-3 py-2.5"
                        style={{ background: i % 2 === 0 ? '#151210' : 'transparent', border: '1px solid rgba(44,40,34,0.4)' }}
                      >
                        <span className="font-mono text-[11px] text-[#7a7168] font-body truncate">{txn.orderId?.slice(0, 10)}…</span>
                        <span className="text-[12px] font-bold text-[#f0ebe3] font-body">{formatPrice(txn.amount)}</span>
                        <span className="text-[9px] font-bold tracking-[0.15em] uppercase font-body"
                          style={{ color: statusColor[txn.status] || '#7a7168' }}
                        >
                          {txn.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CAMERA TAB ── */}
            {activeTab === 'camera' && (
              <div>
                <SectionHeader title={t('Uji Kamera', 'Camera Test')} />
                <div className="flex flex-col gap-4">
                  {/* Viewfinder — no generic rounded white card */}
                  <div
                    className="w-full max-w-md relative overflow-hidden"
                    style={{
                      aspectRatio: '4/3',
                      background: '#0c0a09',
                      border: '1px solid rgba(200,121,65,0.2)',
                      clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
                    }}
                  >
                    {cameraActive ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        {/* Crosshair viewfinder icon */}
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="rgba(200,121,65,0.3)" strokeWidth="1.5">
                          <rect x="2" y="2" width="12" height="12" /><rect x="26" y="2" width="12" height="12" />
                          <rect x="2" y="26" width="12" height="12" /><rect x="26" y="26" width="12" height="12" />
                        </svg>
                        <span className="text-[10px] tracking-[0.3em] text-[#2c2822] uppercase font-body">{t('Kamera tidak aktif', 'Camera inactive')}</span>
                      </div>
                    )}

                    {/* Corner brackets — copper */}
                    {cameraActive && (
                      <>
                        <div className="absolute top-3 left-3 w-5 h-5" style={{ borderTop: '2px solid #c87941', borderLeft: '2px solid #c87941' }} />
                        <div className="absolute top-3 right-3 w-5 h-5" style={{ borderTop: '2px solid #c87941', borderRight: '2px solid #c87941' }} />
                        <div className="absolute bottom-3 left-3 w-5 h-5" style={{ borderBottom: '2px solid #c87941', borderLeft: '2px solid #c87941' }} />
                        <div className="absolute bottom-3 right-3 w-5 h-5" style={{ borderBottom: '2px solid #c87941', borderRight: '2px solid #c87941' }} />
                      </>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2">
                    <button
                      onClick={startCamera}
                      disabled={cameraActive}
                      className="btn-solid h-11 px-6 text-xs font-body press tap-none disabled:opacity-30 flex items-center gap-2"
                    >
                      <CameraIcon className="w-3.5 h-3.5" />
                      {t('Mulai', 'Start')}
                    </button>
                    <button
                      onClick={stopCamera}
                      disabled={!cameraActive}
                      className="h-11 px-6 text-xs font-body font-bold press tap-none disabled:opacity-30 flex items-center gap-2"
                      style={{
                        border: '1px solid rgba(44,40,34,0.8)',
                        color: '#7a7168',
                        transition: 'color 180ms cubic-bezier(0.33, 1, 0.68, 1)',
                      }}
                    >
                      {t('Stop', 'Stop')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'settings' && (
              <div>
                <SectionHeader title={t('Pengaturan Acara', 'Event Settings')} />
                <div className="space-y-4 max-w-sm">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-[#7a7168] font-bold uppercase mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={eventBranding.title}
                      onChange={(e) => setEventBranding({ ...eventBranding, title: e.target.value })}
                      className="w-full bg-[#151210] border border-[#2c2822] text-[#f0ebe3] text-sm px-4 py-3 focus:outline-none focus:border-[#c87941] font-body"
                      placeholder="AI.PHOTOBOOTH"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-[#7a7168] font-bold uppercase mb-2">
                      Event Subtitle
                    </label>
                    <input
                      type="text"
                      value={eventBranding.subtitle}
                      onChange={(e) => setEventBranding({ ...eventBranding, subtitle: e.target.value })}
                      className="w-full bg-[#151210] border border-[#2c2822] text-[#f0ebe3] text-sm px-4 py-3 focus:outline-none focus:border-[#c87941] font-body"
                      placeholder="Premium AI Edition"
                    />
                  </div>
                  <p className="text-[10px] text-[#7a7168] italic font-body">
                    * Perubahan ini akan langsung muncul di hasil cetak foto grid.
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom edge accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(200,121,65,0.25), transparent)' }} />
    </div>
  );
}
