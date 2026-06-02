'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, AlertTriangle, Image as ImageIcon, Sparkles, Send } from 'lucide-react';

interface PhotoInfo {
  id: string;
  filteredUrl: string;
  filterName: string;
}

interface TransactionDetails {
  id: string;
  orderId: string;
  photos: PhotoInfo[];
}

export default function RemoteDownloadView({ txnId }: { txnId: string; token?: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<TransactionDetails | null>(null);

  // GDrive state
  const [email, setEmail] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [shareStep, setShareStep] = useState('');
  const [shareError, setShareError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await fetch(`/api/transactions/${txnId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.photos && data.photos.length > 0) {
            setDetails(data);
          } else {
            setError('Photo not processed yet or missing.');
          }
        } else {
          setError('Transaction record not found.');
        }
      } catch {
        setError('Connection failed. Please retry.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [txnId]);

  const handleDownload = () => {
    if (!details || details.photos.length === 0) return;
    const photo = details.photos[0];
    const a = document.createElement('a');
    a.href = photo.filteredUrl;
    a.download = `aibooth-${details.orderId || 'photo'}.jpg`;
    a.click();
  };

  const handleShareDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setShareStatus('processing');
    setShareStep('Menghubungkan ke API Google Drive...');

    // Stagger steps for visually outstanding microinteractions (Awwwards design aesthetic)
    setTimeout(() => {
      setShareStep('Mengunggah file foto asli...');
    }, 600);

    setTimeout(() => {
      setShareStep('Membagikan akses dengan email Anda...');
    }, 1200);

    try {
      // Execute the request to route handler after 1800ms to allow visual steps to complete
      await new Promise(resolve => setTimeout(resolve, 1800));

      const res = await fetch('/api/share/gdrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txnId, email }),
      });

      if (res.ok) {
        setShareStatus('success');
      } else {
        const errData = await res.json();
        setShareError(errData.error || 'Failed to share to Drive.');
        setShareStatus('error');
      }
    } catch {
      setShareError('Koneksi terputus. Silakan coba kembali.');
      setShareStatus('error');
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden flex flex-col items-center justify-center p-6 select-none" style={{ background: '#030611' }}>
      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }}
      />

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at center, rgba(43,92,246,0.12) 0%, transparent 65%)' }} />

      <div className="relative z-10 max-w-sm w-full flex flex-col items-center gap-6">
        
        {/* Logo / Brand Header */}
        <div className="flex flex-col items-center text-center gap-1.5 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-px w-3 bg-[#2dd4bf]" />
            <span className="text-[8px] font-bold tracking-[0.35em] text-[#2dd4bf] uppercase font-body">Download Center</span>
            <div className="h-px w-3 bg-[#2dd4bf]" />
          </div>
          <h1 className="font-display font-black text-2xl text-[#f1f4fb]">
            AI.PHOTO<span className="italic text-gradient-copper">BOOTH</span>
          </h1>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-4 bg-[#0a0e1c]" style={{ border: '1px solid rgba(43,92,246,0.15)', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
            <Loader2 className="w-8 h-8 animate-spin text-var(--copper)" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#7687a1] font-body">Mengambil Foto...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="w-full p-6 flex flex-col items-center gap-4 text-center bg-[#0a0e1c]" style={{ border: '1px solid rgba(255,74,74,0.3)', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
            <AlertTriangle className="w-8 h-8 text-[#ff4a4a]" />
            <div>
              <p className="text-xs font-bold text-[#f1f4fb] uppercase font-body mb-1">Gagal Memuat Foto</p>
              <p className="text-[10px] text-[#7687a1] font-body leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-[9px] font-bold tracking-widest uppercase text-var(--amber) border border-[#9cb6f9]/30 px-3 py-1.5 press hover:bg-[#9cb6f9]/5"
            >
              Refresh Halaman
            </button>
          </div>
        )}

        {/* Loaded Photo Display */}
        {!loading && details && details.photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col gap-6"
          >
            {/* The Photo Container */}
            <div 
              className="relative w-full overflow-hidden p-3 bg-[#0a0e1c] shadow-depth"
              style={{
                border: '1px solid rgba(43,92,246,0.18)',
                clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)'
              }}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden border border-[#1d2740]">
                <img 
                  src={details.photos[0].filteredUrl} 
                  alt="AI Photobooth" 
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
                
                {/* Visual scanning grid motif overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" style={{ backgroundSize: '100% 4px, 6px 100%' }} />
              </div>
              
              <div className="mt-3 flex items-center justify-between px-1">
                <span className="text-[8px] font-mono text-[#7687a1]">ID: {details.orderId}</span>
                <span className="text-[8px] font-bold tracking-wider text-var(--amber) uppercase flex items-center gap-1 font-body">
                  <Sparkles className="w-2.5 h-2.5" /> AI Grid
                </span>
              </div>
            </div>

            {/* Google Drive Option */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full p-5 bg-[#0a0e1c] flex flex-col gap-4 shadow-depth"
              style={{
                border: '1px solid rgba(43,92,246,0.12)',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)'
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#f1f4fb] uppercase font-body">Google Drive Delivery</span>
              </div>
              
              {shareStatus === 'idle' && (
                <form onSubmit={handleShareDrive} className="flex flex-col gap-3">
                  <p className="text-[10px] text-[#7687a1] font-body leading-relaxed">
                    Masukkan email Anda untuk menyimpan file foto asli beresolusi tinggi langsung ke Google Drive.
                  </p>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full bg-[#030611] text-[#f1f4fb] text-xs px-3.5 py-3 font-body focus:outline-none"
                      style={{
                        border: '1px solid rgba(29,39,64,0.8)',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full text-[9px] font-bold tracking-widest uppercase py-3 border border-[#9cb6f9]/30 text-gradient-copper press hover:bg-[#9cb6f9]/5 cursor-pointer"
                  >
                    KIRIM KE GOOGLE DRIVE
                  </button>
                </form>
              )}

              {shareStatus === 'processing' && (
                <div className="py-4 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-var(--copper)" />
                  <p className="text-[9px] tracking-[0.15em] uppercase text-[#7687a1] font-body animate-pulse text-center">
                    {shareStep}
                  </p>
                </div>
              )}

              {shareStatus === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2.5 text-center items-center py-2">
                  <div className="w-8 h-8 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center border border-[#2dd4bf]/25">
                    <svg className="w-4 h-4 text-[#2dd4bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#2dd4bf] uppercase font-body tracking-wider">Berhasil Dikirim!</p>
                    <p className="text-[9px] text-[#7687a1] font-body leading-relaxed mt-1">
                      Silakan periksa kotak masuk email Anda (<span className="text-[#f1f4fb]">{email}</span>) atau folder "Dibagikan dengan saya" di Google Drive.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShareStatus('idle')}
                    className="text-[8px] font-bold uppercase tracking-wider text-[#7687a1] hover:text-[#f1f4fb] mt-2 transition-colors cursor-pointer"
                  >
                    Kirim ke email lain
                  </button>
                </motion.div>
              )}

              {shareStatus === 'error' && (
                <div className="flex flex-col gap-2.5 text-center items-center py-2">
                  <p className="text-[10px] font-bold text-[#ff4a4a] uppercase font-body tracking-wider">Gagal Mengirim</p>
                  <p className="text-[9px] text-[#7687a1] font-body leading-relaxed">{shareError}</p>
                  <button 
                    onClick={() => setShareStatus('idle')}
                    className="text-[9px] font-bold uppercase tracking-widest text-var(--copper) border border-[#9cb6f9]/20 px-3 py-1.5 press mt-2 cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </motion.div>

            {/* Direct Local Download Button */}
            <button
              onClick={handleDownload}
              className="w-full btn-solid h-12 text-[11px] font-bold tracking-widest press flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#030611]" />
              UNDUH FOTO LOKAL / DOWNLOAD
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
