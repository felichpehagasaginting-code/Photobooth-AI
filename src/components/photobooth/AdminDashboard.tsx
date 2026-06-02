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
        background: '#0a0e1c',
        border: '1px solid rgba(29,39,64,0.8)',
        padding: '16px 18px',
        /* Each tile gets unique clip per index */
        clipPath: index % 2 === 0
          ? 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
          : 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)',
      }}
    >
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase font-body mb-2" style={{ color: '#7687a1' }}>
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
      <div className="h-px w-4 bg-var(--copper)" />
      <span className="text-[9px] font-bold tracking-[0.35em] text-var(--copper) uppercase font-body">{title}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(29,39,64,0.6)' }} />
      {onRefresh && (
        <button onClick={onRefresh} title="Refresh" aria-label="Refresh" className="text-[#7687a1] hover:text-var(--copper) tap-none press" style={{ transition: 'color 180ms cubic-bezier(0.33, 1, 0.68, 1)' }}>
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'expired'>('all');

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

  useEffect(() => { 
    const init = async () => { await fetchAllData(); };
    init();
  }, [fetchAllData]);

  useEffect(() => {
    const eventSource = new EventSource('/api/admin/live-updates');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'photo_uploaded' || data.event === 'transaction_paid') {
          fetchAllData();
        }
      } catch {
        // Heartbeat or malformed messages
      }
    };

    return () => {
      eventSource.close();
    };
  }, [fetchAllData]);

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
    FILTER_STYLES[style as keyof typeof FILTER_STYLES]?.color || 'var(--cobalt)';
  const getCategoryLabel = (cat: string) =>
    FILTER_CATEGORIES[cat as keyof typeof FILTER_CATEGORIES]?.label || cat;

  /* Status color mapping */
  const statusColor: Record<string, string> = {
    paid: '#2dd4bf', pending: 'var(--amber)', expired: '#d94040',
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#030611' }}>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }}
      />

      {/* ── Top bar ── */}
      <div className="relative z-20 flex items-center px-5 py-3 gap-4"
        style={{ background: 'rgba(3,6,17,0.9)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(43,92,246,0.15)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div style={{ width: 24, height: 24, background: 'var(--copper)', clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }} />
          <span className="font-display font-black text-xs tracking-[0.15em] text-[#f1f4fb] uppercase">
            Admin<span className="text-var(--copper)">.</span>Panel
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
                color: activeTab === id ? 'var(--copper)' : '#7687a1',
                background: activeTab === id ? 'rgba(43,92,246,0.08)' : 'transparent',
                borderBottom: activeTab === id ? '2px solid var(--copper)' : '2px solid transparent',
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
          title={t('Keluar', 'Logout')}
          aria-label={t('Keluar', 'Logout')}
          className="flex items-center gap-1.5 text-[11px] font-body font-semibold text-[#7687a1] hover:text-[#d94040] tap-none press"
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
                    <div className="h-px w-4 bg-var(--copper)" />
                    <span className="text-[9px] font-bold tracking-[0.35em] text-var(--copper) uppercase font-body">Overview</span>
                  </div>
                  <h2 className="font-display font-black text-[#f1f4fb]" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}>
                    Admin <span className="italic text-gradient-copper">Dashboard</span>
                  </h2>
                </div>

                {/* Stats grid — 2×2 with alternating clip-paths */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <StatTile label={t('Total Sesi', 'Total Sessions')} value={stats.totalSessions.toString()} accent="var(--copper)" index={0} />
                  <StatTile label={t('Filter Aktif', 'Active Filters')} value={(stats.activeFilters || filters.filter(f => f.active).length).toString()} accent="var(--amber)" index={1} />
                  <StatTile label={t('Sesi Hari Ini', "Today's Sessions")} value={stats.todaySessions.toString()} accent="#2dd4bf" index={2} />
                  <StatTile label={t('Paket Foto', "Photo Formats")} value={packages.length.toString()} accent="#f1f4fb" index={3} />
                </div>

                {/* Active filters — full-width accent bar */}
                <div style={{ background: '#0a0e1c', border: '1px solid rgba(43,92,246,0.2)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase font-body font-bold mb-1" style={{ color: '#7687a1' }}>{t('Total Opsi Filter', 'Total Filter Options')}</p>
                    <p className="font-display font-black" style={{ fontSize: '2rem', color: '#2dd4bf' }}>
                      {filters.length}
                    </p>
                  </div>
                  {/* Visual bar */}
                  <div className="flex gap-1 items-end h-10">
                    {[40,65,50,80,55,70,45].map((h, i) => (
                      <div key={i} style={{ width: 4, height: `${h}%`, background: i === 5 ? '#2dd4bf' : 'rgba(45,212,191,0.2)' }} />
                    ))}
                  </div>
                </div>

                {/* Session Activity Chart */}
                <div className="mt-5 mb-5 p-5" style={{ background: '#0a0e1c', border: '1px solid rgba(29,39,64,0.8)' }}>
                  <p className="text-[10px] tracking-[0.25em] uppercase font-body font-bold mb-4" style={{ color: '#7687a1' }}>Tren Aktivitas Sesi (7 Hari Terakhir)</p>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.sessionHistory || [
                        { name: 'Sen', sessions: 0 },
                        { name: 'Sel', sessions: 0 },
                        { name: 'Rab', sessions: 0 },
                        { name: 'Kam', sessions: 0 },
                        { name: 'Jum', sessions: 0 },
                        { name: 'Sab', sessions: 0 },
                        { name: 'Min', sessions: 0 }
                      ]}>
                        <defs>
                          <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--copper)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--copper)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#7687a1" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#030611', border: '1px solid rgba(29,39,64,0.8)', borderRadius: 0 }}
                          itemStyle={{ color: 'var(--copper)', fontWeight: 'bold' }}
                          formatter={(value: number) => [value, t('Sesi', 'Sessions')]}
                        />
                        <Area type="monotone" dataKey="sessions" stroke="var(--copper)" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent transactions — last 3 */}
                {stats.recentTransactions?.length > 0 && (
                  <div className="mt-5">
                    <SectionHeader title={t('Sesi Terakhir', 'Recent Sessions')} />
                    <div className="space-y-2">
                      {stats.recentTransactions.slice(0, 3).map((txn: TransactionInfo) => (
                        <div key={txn.id} className="flex items-center justify-between px-3 py-2.5"
                          style={{ background: '#0a0e1c', border: '1px solid rgba(29,39,64,0.8)' }}
                        >
                          <span className="font-mono text-[11px] text-[#7687a1] font-body">{txn.orderId?.slice(0, 12)}…</span>
                          <span className="text-[11px] font-bold font-body text-[#f1f4fb]">{txn.package?.name || t('Sesi Kustom', 'Custom Session')}</span>
                          <span className="text-[9px] font-bold tracking-[0.15em] uppercase font-body px-2 py-0.5"
                            style={{ color: statusColor[txn.status] || '#7687a1', border: `1px solid ${statusColor[txn.status] || 'rgba(29,39,64,0.8)'}30` }}
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
                    <p className="text-[#7687a1] text-sm font-body text-center py-10">{t('Tidak ada paket', 'No packages found')}</p>
                  )}
                  {packages.map((pkg, i) => (
                    <motion.div key={pkg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: '#0a0e1c', border: '1px solid rgba(29,39,64,0.8)', padding: '16px',
                        clipPath: i % 2 === 0 ? 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-display font-bold text-[#f1f4fb] text-base">{pkg.name}</h3>
                        <span
                          className="text-[9px] font-bold tracking-[0.2em] uppercase font-body px-2 py-0.5"
                          style={{
                            color: pkg.active ? '#2dd4bf' : '#d94040',
                            border: `1px solid ${pkg.active ? 'rgba(45,212,191,0.3)' : 'rgba(217,64,64,0.3)'}`,
                          }}
                        >
                          {pkg.active ? t('AKTIF', 'ACTIVE') : t('NONAKTIF', 'INACTIVE')}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#7687a1] font-body mb-3 leading-relaxed">{pkg.description}</p>
                      <div className="flex items-end justify-between">
                        <span className="font-display font-black text-sm uppercase tracking-wider" style={{ color: 'var(--copper)' }}>
                          {pkg.price === 0 ? t('Gratis', 'Free') : formatPrice(pkg.price)}
                        </span>
                        <span className="text-[10px] tracking-[0.15em] text-[#7687a1] font-body uppercase">
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
                        style={{ background: '#0a0e1c', border: '1px solid rgba(29,39,64,0.8)', borderLeft: `3px solid ${accent}` }}
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
                            <p className="text-sm font-bold text-[#f1f4fb] font-body truncate">{filter.name}</p>
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
                    <p className="text-[#7687a1] text-sm font-body text-center py-10">{t('Tidak ada filter', 'No filters found')}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── HISTORY TAB ── */}
            {activeTab === 'history' && (() => {
              const filteredTxns = transactions.filter(txn => statusFilter === 'all' || txn.status === statusFilter);
              return (
                <div>
                  <SectionHeader title={t('Riwayat Transaksi', 'Transaction History')} onRefresh={async () => {
                    const res = await fetch('/api/admin/transactions');
                    if (res.ok) { const d = await res.json(); setTransactions(d.transactions || []); }
                  }} />

                  {/* Filter tabs */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['all', 'paid', 'pending', 'expired'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className="tap-none press font-body"
                        style={{
                          padding: '4px 10px',
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.25em',
                          textTransform: 'uppercase',
                          color: statusFilter === status ? '#030611' : '#7687a1',
                          background: statusFilter === status ? (status === 'all' ? 'var(--copper)' : statusColor[status] || 'var(--copper)') : 'transparent',
                          border: `1px solid ${statusFilter === status ? (status === 'all' ? 'var(--copper)' : statusColor[status] || 'var(--copper)') : 'rgba(29,39,64,0.6)'}`,
                          transition: 'all 200ms cubic-bezier(0.33, 1, 0.68, 1)',
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {filteredTxns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-10 h-10" style={{ border: '1px solid rgba(29,39,64,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <History className="w-5 h-5 text-[#7687a1]" />
                      </div>
                      <p className="text-[11px] tracking-[0.25em] text-[#7687a1] uppercase font-body">{t('Belum ada transaksi', 'No transactions yet')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Column header */}
                      <div className="grid grid-cols-3 gap-2 px-3 pb-2" style={{ borderBottom: '1px solid rgba(29,39,64,0.6)' }}>
                        {[t('Order ID', 'Order ID'), t('Format', 'Format'), t('Status', 'Status')].map(h => (
                          <span key={h} className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#7687a1] font-body">{h}</span>
                        ))}
                      </div>
                      {filteredTxns.map((txn, i) => (
                        <motion.div key={txn.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="grid grid-cols-3 gap-2 items-center px-3 py-2.5"
                          style={{ background: i % 2 === 0 ? '#0a0e1c' : 'transparent', border: '1px solid rgba(29,39,64,0.4)' }}
                        >
                          <span className="font-mono text-[11px] text-[#7687a1] font-body truncate">{txn.orderId?.slice(0, 10)}…</span>
                          <span className="text-[11px] font-bold text-[#f1f4fb] font-body">{txn.package?.name || t('Sesi Kustom', 'Custom Session')}</span>
                          <span className="text-[9px] font-bold tracking-[0.15em] uppercase font-body"
                            style={{ color: statusColor[txn.status] || '#7687a1' }}
                          >
                            {txn.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

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
                      background: '#030611',
                      border: '1px solid rgba(43,92,246,0.2)',
                      clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
                    }}
                  >
                    {cameraActive ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        {/* Crosshair viewfinder icon */}
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="rgba(43,92,246,0.3)" strokeWidth="1.5">
                          <rect x="2" y="2" width="12" height="12" /><rect x="26" y="2" width="12" height="12" />
                          <rect x="2" y="26" width="12" height="12" /><rect x="26" y="26" width="12" height="12" />
                        </svg>
                        <span className="text-[10px] tracking-[0.3em] text-[#7687a1] uppercase font-body">{t('Kamera tidak aktif', 'Camera inactive')}</span>
                      </div>
                    )}

                    {/* Corner brackets */}
                    {cameraActive && (
                      <>
                        <div className="absolute top-3 left-3 w-5 h-5" style={{ borderTop: '2px solid var(--copper)', borderLeft: '2px solid var(--copper)' }} />
                        <div className="absolute top-3 right-3 w-5 h-5" style={{ borderTop: '2px solid var(--copper)', borderRight: '2px solid var(--copper)' }} />
                        <div className="absolute bottom-3 left-3 w-5 h-5" style={{ borderBottom: '2px solid var(--copper)', borderLeft: '2px solid var(--copper)' }} />
                        <div className="absolute bottom-3 right-3 w-5 h-5" style={{ borderBottom: '2px solid var(--copper)', borderRight: '2px solid var(--copper)' }} />
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
                        border: '1px solid rgba(29,39,64,0.8)',
                        color: '#7687a1',
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
                    <label htmlFor="event-title-input" className="block text-[10px] tracking-[0.2em] text-[#7687a1] font-bold uppercase mb-2">
                      Event Title
                    </label>
                    <input
                      id="event-title-input"
                      type="text"
                      value={eventBranding.title}
                      onChange={(e) => setEventBranding({ ...eventBranding, title: e.target.value })}
                      className="w-full bg-[#0a0e1c] border border-[rgba(29,39,64,0.8)] text-[#f1f4fb] text-sm px-4 py-3 focus:outline-none focus:border-var(--copper) font-body"
                      placeholder="AI.PHOTOBOOTH"
                      title="Event Title"
                      aria-label="Event Title"
                    />
                  </div>
                  <div>
                    <label htmlFor="event-subtitle-input" className="block text-[10px] tracking-[0.2em] text-[#7687a1] font-bold uppercase mb-2">
                      Event Subtitle
                    </label>
                    <input
                      id="event-subtitle-input"
                      type="text"
                      value={eventBranding.subtitle}
                      onChange={(e) => setEventBranding({ ...eventBranding, subtitle: e.target.value })}
                      className="w-full bg-[#0a0e1c] border border-[rgba(29,39,64,0.8)] text-[#f1f4fb] text-sm px-4 py-3 focus:outline-none focus:border-var(--copper) font-body"
                      placeholder="Premium AI Edition"
                      title="Event Subtitle"
                      aria-label="Event Subtitle"
                    />
                  </div>
                  <div>
                    <label htmlFor="event-countdown-input" className="block text-[10px] tracking-[0.2em] text-[#7687a1] font-bold uppercase mb-2">
                      Countdown (Detik)
                    </label>
                    <select
                      id="event-countdown-input"
                      value={eventBranding.countdownSec || 3}
                      onChange={(e) => setEventBranding({ ...eventBranding, countdownSec: parseInt(e.target.value) })}
                      className="w-full bg-[#0a0e1c] border border-[rgba(29,39,64,0.8)] text-[#f1f4fb] text-sm px-4 py-3 focus:outline-none focus:border-var(--copper) font-body"
                      title="Countdown"
                      aria-label="Countdown"
                    >
                      <option value="3">3 Detik</option>
                      <option value="5">5 Detik</option>
                      <option value="8">8 Detik</option>
                      <option value="10">10 Detik</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-[#7687a1] italic font-body">
                    * Perubahan ini akan langsung disimpan dan disesuaikan pada sistem.
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom edge accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(43,92,246,0.25), transparent)' }} />
    </div>
  );
}
