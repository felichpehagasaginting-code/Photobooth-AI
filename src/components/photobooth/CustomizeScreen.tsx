'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Palette, Frame, Wand2, Download } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { FRAME_OPTIONS, FILTER_OPTIONS, drawCustomGrid, type FrameType, type NonAIFilterType } from '@/lib/canvas-effects';

export default function CustomizeScreen() {
  const { filteredPhotos, setStep, language, addFilteredPhoto, clearFilteredPhotos } = usePhotoboothStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [activeFrame, setActiveFrame] = useState<FrameType>('classic_strip');
  const [activeFilter, setActiveFilter] = useState<NonAIFilterType>('normal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'frame' | 'filter' | 'sticker'>('frame');

  interface StickerData {
    id: string;
    emoji: string;
    x: number;
    y: number;
  }
  const [stickers, setStickers] = useState<StickerData[]>([]);

  const STICKER_OPTIONS = ['✨', '💋', '🎀', '🩹', '🌸', '🕶️', '🔥', '💿', '🖤', '🍒'];

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  // Re-generate preview when frame or filter changes
  useEffect(() => {
    const generatePreview = async () => {
      const canvas = canvasRef.current;
      if (!canvas || filteredPhotos.length === 0) return;
      setIsProcessing(true);

      // Create an array of image elements from the filteredPhotos
      const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((res) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = () => { const errImg = new Image(); res(errImg); };
        img.src = src;
      });

      const images = await Promise.all(filteredPhotos.map(p => loadImg(p.original)));
      
      // Use the first filter name as the label for now
      const filterName = filteredPhotos[0]?.filterName || 'Original';

      await drawCustomGrid(canvas, images, activeFrame, activeFilter, filterName);
      setIsProcessing(false);
    };

    // Debounce preview generation
    const timer = setTimeout(generatePreview, 150);
    return () => clearTimeout(timer);
  }, [activeFrame, activeFilter, filteredPhotos]);

  const handleFinish = async () => {
    setIsProcessing(true);
    // Generate final high-res image
    const canvas = document.createElement('canvas');
    const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((res) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.src = src;
    });

    // We will group the generated grids. Since we want them to edit everything as ONE grid for simplicity here,
    // wait, does filteredPhotos contain ALL photos from ALL filters?
    // In our flow, if they chose 2 filters and took 2 photos, filteredPhotos has 4 images.
    // That means the customize screen will currently stitch ALL 4 images into one grid!
    // To fix this perfectly, we should group by filter. But for now, let's stitch them all or slice.
    const images = await Promise.all(filteredPhotos.map(p => loadImg(p.original)));
    await drawCustomGrid(canvas, images, activeFrame, activeFilter, 'Photobooth Session');
    
    // Draw stickers onto the final canvas
    const displayCanvas = canvasRef.current;
    if (displayCanvas && stickers.length > 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = displayCanvas.getBoundingClientRect();
        // Since object-contain scales the canvas, we need to find the actual rendered size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const scale = Math.max(scaleX, scaleY); // Because object-contain matches the longest side

        const actualDisplayWidth = canvas.width / scale;
        const actualDisplayHeight = canvas.height / scale;
        
        const offsetX = (rect.width - actualDisplayWidth) / 2;
        const offsetY = (rect.height - actualDisplayHeight) / 2;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        stickers.forEach(s => {
          // Map DOM coordinates back to canvas coordinates
          const canvasX = (s.x - offsetX) * scale;
          const canvasY = (s.y - offsetY) * scale;
          // Scale font size
          ctx.font = `${50 * scale}px sans-serif`;
          ctx.fillText(s.emoji, canvasX + (25 * scale), canvasY + (25 * scale));
        });
      }
    }
    
    const finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    // Replace all individual photos with the ONE final collated frame
    clearFilteredPhotos();
    addFilteredPhoto({ original: finalDataUrl, filtered: finalDataUrl, filterName: 'Custom Grid', filterId: 'custom' });
    
    setStep('download');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden" style={{ background: '#0c0a09' }}>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", opacity: 0.4 }}
      />

      {/* ── Left: Preview Area ── */}
      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-8 overflow-hidden h-[60vh] md:h-screen" style={{ background: 'radial-gradient(ellipse at center, rgba(200,121,65,0.08) 0%, transparent 70%)' }}>
        <button onClick={() => setStep('processing')} className="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center text-[#7a7168] hover:text-[#c87941] bg-[#151210] border border-[#2c2822] tap-none transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 w-full h-full flex items-center justify-center p-4 md:p-8 relative">
          <div className="relative max-w-full max-h-full flex items-center justify-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,121,65,0.2)' }}>
            <canvas 
              ref={canvasRef} 
              className="max-w-full max-h-full object-contain"
              style={{ opacity: isProcessing ? 0.6 : 1, transition: 'opacity 0.2s' }}
            />
            {/* Draggable Stickers Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {stickers.map((s) => (
                <motion.div
                  key={s.id}
                  drag
                  dragMomentum={false}
                  onDragEnd={(e, info) => {
                    setStickers(prev => prev.map(st => st.id === s.id ? { ...st, x: st.x + info.offset.x, y: st.y + info.offset.y } : st));
                  }}
                  className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
                  style={{ x: s.x, y: s.y, fontSize: 50, width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
                >
                  {s.emoji}
                </motion.div>
              ))}
            </div>
          </div>
          
          {isProcessing && (
            <div className="absolute flex flex-col items-center gap-2 text-[#c87941] pointer-events-none bg-[#0c0a09]/80 p-4 rounded-lg">
              <Wand2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold tracking-widest uppercase font-body">Memproses...</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Customization Panel ── */}
      <div className="relative z-20 w-full md:w-[400px] h-[40vh] md:h-screen flex flex-col border-t md:border-t-0 md:border-l border-[rgba(200,121,65,0.2)]" style={{ background: '#110e0c' }}>
        
        {/* Tabs */}
        <div className="flex w-full border-b border-[rgba(200,121,65,0.2)]">
          <button 
            onClick={() => setActiveTab('frame')}
            className="flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase font-body transition-colors"
            style={{ color: activeTab === 'frame' ? '#c87941' : '#7a7168', borderBottom: activeTab === 'frame' ? '2px solid #c87941' : '2px solid transparent' }}
          >
            <Frame className="w-4 h-4" /> Layout
          </button>
          <button 
            onClick={() => setActiveTab('filter')}
            className="flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase font-body transition-colors"
            style={{ color: activeTab === 'filter' ? '#c87941' : '#7a7168', borderBottom: activeTab === 'filter' ? '2px solid #c87941' : '2px solid transparent' }}
          >
            <Palette className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={() => setActiveTab('sticker')}
            className="flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase font-body transition-colors"
            style={{ color: activeTab === 'sticker' ? '#c87941' : '#7a7168', borderBottom: activeTab === 'sticker' ? '2px solid #c87941' : '2px solid transparent' }}
          >
            <span className="text-sm">✨</span> Stiker
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {activeTab === 'frame' && (
            <div className="grid grid-cols-2 gap-3">
              {FRAME_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setActiveFrame(opt.id)}
                  className="flex flex-col items-center justify-center gap-2 p-4 border transition-all text-left group hover:scale-[1.02] active:scale-[0.98]"
                  style={{ 
                    borderColor: activeFrame === opt.id ? '#c87941' : 'rgba(44,40,34,0.8)', 
                    background: activeFrame === opt.id ? 'rgba(200,121,65,0.05)' : '#151210' 
                  }}
                >
                  <span className="text-[11px] font-bold text-[#f0ebe3] font-body tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
          
          {activeTab === 'filter' && (
            <div className="grid grid-cols-2 gap-3">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setActiveFilter(opt.id)}
                  className="flex flex-col items-center justify-center gap-2 p-4 border transition-all text-left group hover:scale-[1.02] active:scale-[0.98]"
                  style={{ 
                    borderColor: activeFilter === opt.id ? '#c87941' : 'rgba(44,40,34,0.8)', 
                    background: activeFilter === opt.id ? 'rgba(200,121,65,0.05)' : '#151210' 
                  }}
                >
                  <span className="text-[11px] font-bold text-[#f0ebe3] font-body tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
          
          {activeTab === 'sticker' && (
            <div>
              <p className="text-[10px] text-[#7a7168] mb-4 text-center font-body uppercase tracking-[0.2em]">Ketuk untuk tambah & geser ke foto</p>
              <div className="grid grid-cols-4 gap-3">
                {STICKER_OPTIONS.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStickers(prev => [...prev, { id: `sticker-${Date.now()}-${idx}`, emoji, x: 100, y: 100 }])}
                    className="flex flex-col items-center justify-center p-3 border border-[rgba(44,40,34,0.8)] bg-[#151210] hover:bg-[rgba(200,121,65,0.05)] hover:border-[#c87941] hover:scale-[1.1] active:scale-[0.9] transition-all text-2xl tap-none"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <button onClick={() => setStickers([])} className="text-[10px] text-[#d94040] font-body uppercase tracking-[0.2em] border border-[#d94040]/30 px-4 py-2 hover:bg-[#d94040]/10">
                  Hapus Semua Stiker
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-[rgba(200,121,65,0.1)]" style={{ background: '#0c0a09' }}>
          <button
            onClick={handleFinish}
            disabled={isProcessing}
            className="w-full btn-solid h-14 flex items-center justify-center gap-2 font-body text-sm tap-none"
          >
            {isProcessing ? <Wand2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isProcessing ? 'MENYIMPAN...' : 'SELESAI & UNDUH'}
          </button>
        </div>
      </div>
    </div>
  );
}
