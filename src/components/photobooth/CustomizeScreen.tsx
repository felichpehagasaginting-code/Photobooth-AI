'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Frame, Wand2, Download } from 'lucide-react';
import { usePhotoboothStore } from '@/store/photobooth';
import { type TransactionInfo } from '@/types';
import { FRAME_OPTIONS, FILTER_OPTIONS, drawCustomGrid, type FrameType, type NonAIFilterType } from '@/lib/canvas-effects';

export default function CustomizeScreen() {
  const { 
    filteredPhotos, 
    setStep, 
    language, 
    addFilteredPhoto, 
    clearFilteredPhotos,
    selectedPackage,
    setCurrentTransaction,
    takeCount 
  } = usePhotoboothStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [activeFrame, setActiveFrame] = useState<FrameType>('classic_strip');
  const [activeFilter, setActiveFilter] = useState<NonAIFilterType>('normal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'frame' | 'filter' | 'sticker'>('frame');
  const [activeStickerCategory, setActiveStickerCategory] = useState<string>('tech_stack');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  interface StickerData {
    id: string;
    emoji: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }
  const [stickers, setStickers] = useState<StickerData[]>([]);

  // Detailed Brand mapping matching the user's uploaded reference image
  const getBrandDetails = (emoji: string) => {
    const text = emoji;
    let brandBg = '#0e1220'; 
    let brandBorder = 'rgba(43, 92, 246, 0.4)'; 
    let brandText = '#f1f4fb';
    let brandColor = '38bdf8'; 
    let slug = 'codecademy'; // default logo fallback
    
    const brand = text.slice(1, -1).toLowerCase();
    
    if (brand === 'html' || brand === 'html5') {
      brandBg = '#160d0a'; brandBorder = 'rgba(227, 79, 38, 0.5)'; brandText = '#f1f4fb'; brandColor = 'e34f26'; slug = 'html5';
    } else if (brand === 'css' || brand === 'css3') {
      brandBg = '#0a1424'; brandBorder = 'rgba(21, 114, 182, 0.5)'; brandText = '#f1f4fb'; brandColor = '1572b6'; slug = 'css3';
    } else if (brand === 'javascript' || brand === 'js') {
      brandBg = '#1a1805'; brandBorder = 'rgba(247, 223, 30, 0.5)'; brandText = '#f1f4fb'; brandColor = 'f7df1e'; slug = 'javascript';
    } else if (brand === 'typescript' || brand === 'ts') {
      brandBg = '#071529'; brandBorder = 'rgba(49, 120, 198, 0.5)'; brandText = '#f1f4fb'; brandColor = '3178c6'; slug = 'typescript';
    } else if (brand === 'react' || brand === 'react.js') {
      brandBg = '#061724'; brandBorder = 'rgba(0, 216, 255, 0.5)'; brandText = '#f1f4fb'; brandColor = '00d8ff'; slug = 'react';
    } else if (brand === 'next.js') {
      brandBg = '#000000'; brandBorder = 'rgba(255, 255, 255, 0.4)'; brandText = '#ffffff'; brandColor = 'ffffff'; slug = 'nextdotjs';
    } else if (brand === 'tailwindcss' || brand === 'tailwind') {
      brandBg = '#041620'; brandBorder = 'rgba(56, 189, 248, 0.5)'; brandText = '#f1f4fb'; brandColor = '38bdf8'; slug = 'tailwindcss';
    } else if (brand === 'bootstrap') {
      brandBg = '#140b24'; brandBorder = 'rgba(121, 82, 179, 0.5)'; brandText = '#f1f4fb'; brandColor = '7952b3'; slug = 'bootstrap';
    } else if (brand === 'framer motion') {
      brandBg = '#180720'; brandBorder = 'rgba(240, 4, 127, 0.5)'; brandText = '#f1f4fb'; brandColor = 'f0047f'; slug = 'framer';
    } else if (brand === 'vite') {
      brandBg = '#150c24'; brandBorder = 'rgba(100, 108, 255, 0.5)'; brandText = '#f1f4fb'; brandColor = '646cff'; slug = 'vite';
    } else if (brand === 'redux') {
      brandBg = '#110720'; brandBorder = 'rgba(118, 74, 188, 0.5)'; brandText = '#f1f4fb'; brandColor = '764abc'; slug = 'redux';
    } else if (brand === 'shadcn ui') {
      brandBg = '#000000'; brandBorder = 'rgba(255, 255, 255, 0.4)'; brandText = '#ffffff'; brandColor = 'ffffff'; slug = 'shadcnui';
    } else if (brand === 'gsap') {
      brandBg = '#0a1a05'; brandBorder = 'rgba(136, 206, 2, 0.5)'; brandText = '#f1f4fb'; brandColor = '88ce02'; slug = 'greensock';
    } else if (brand === 'node.js' || brand === 'node') {
      brandBg = '#06180b'; brandBorder = 'rgba(51, 153, 51, 0.5)'; brandText = '#f1f4fb'; brandColor = '339933'; slug = 'nodedotjs';
    } else if (brand === 'express' || brand === 'express.js') {
      brandBg = '#0c0f16'; brandBorder = 'rgba(130, 130, 130, 0.4)'; brandText = '#ffffff'; brandColor = 'ffffff'; slug = 'express';
    } else if (brand === 'python') {
      brandBg = '#051420'; brandBorder = 'rgba(55, 118, 171, 0.5)'; brandText = '#ffd343'; brandColor = '3776ab'; slug = 'python';
    } else if (brand === 'go' || brand === 'golang') {
      brandBg = '#03141d'; brandBorder = 'rgba(0, 172, 215, 0.5)'; brandText = '#f1f4fb'; brandColor = '00acd7'; slug = 'go';
    } else if (brand === 'php') {
      brandBg = '#0e0b1c'; brandBorder = 'rgba(119, 123, 180, 0.5)'; brandText = '#f1f4fb'; brandColor = '777bb4'; slug = 'php';
    } else if (brand === 'laravel') {
      brandBg = '#1d0707'; brandBorder = 'rgba(255, 45, 32, 0.5)'; brandText = '#f1f4fb'; brandColor = 'ff2d20'; slug = 'laravel';
    } else if (brand === 'prisma') {
      brandBg = '#0a121e'; brandBorder = 'rgba(90, 105, 144, 0.4)'; brandText = '#f1f4fb'; brandColor = '5a6990'; slug = 'prisma';
    } else if (brand === 'postgresql' || brand === 'postgres') {
      brandBg = '#05111d'; brandBorder = 'rgba(65, 105, 225, 0.5)'; brandText = '#f1f4fb'; brandColor = '4169e1'; slug = 'postgresql';
    } else if (brand === 'mysql') {
      brandBg = '#03111e'; brandBorder = 'rgba(0, 117, 143, 0.5)'; brandText = '#f1f4fb'; brandColor = '00758f'; slug = 'mysql';
    } else if (brand === 'mongodb') {
      brandBg = '#03140a'; brandBorder = 'rgba(71, 162, 72, 0.5)'; brandText = '#f1f4fb'; brandColor = '47a248'; slug = 'mongodb';
    } else if (brand === 'firebase') {
      brandBg = '#180e03'; brandBorder = 'rgba(255, 202, 40, 0.5)'; brandText = '#f1f4fb'; brandColor = 'ffca28'; slug = 'firebase';
    } else if (brand === 'supabase') {
      brandBg = '#02150d'; brandBorder = 'rgba(62, 207, 142, 0.5)'; brandText = '#f1f4fb'; brandColor = '3ecf8e'; slug = 'supabase';
    } else if (brand === 'git') {
      brandBg = '#180703'; brandBorder = 'rgba(240, 80, 50, 0.5)'; brandText = '#f1f4fb'; brandColor = 'f05032'; slug = 'git';
    } else if (brand === 'github') {
      brandBg = '#000000'; brandBorder = 'rgba(255, 255, 255, 0.4)'; brandText = '#ffffff'; brandColor = 'ffffff'; slug = 'github';
    } else if (brand === 'docker') {
      brandBg = '#03121f'; brandBorder = 'rgba(36, 150, 237, 0.5)'; brandText = '#f1f4fb'; brandColor = '2496ed'; slug = 'docker';
    } else if (brand === 'vercel') {
      brandBg = '#000000'; brandBorder = 'rgba(255, 255, 255, 0.4)'; brandText = '#ffffff'; brandColor = 'ffffff'; slug = 'vercel';
    } else if (brand === 'gemini ai' || brand === 'gemini') {
      brandBg = '#051124'; brandBorder = 'rgba(26, 115, 232, 0.5)'; brandText = '#f1f4fb'; brandColor = '1a73e8'; slug = 'google';
    } else if (brand === 'rust') {
      brandBg = '#150a04'; brandBorder = 'rgba(226, 71, 21, 0.5)'; brandText = '#f1f4fb'; brandColor = 'e24715'; slug = 'rust';
    } else if (brand === 'svelte') {
      brandBg = '#180603'; brandBorder = 'rgba(255, 62, 0, 0.5)'; brandText = '#f1f4fb'; brandColor = 'ff3e00'; slug = 'svelte';
    } else if (brand === 'claude') {
      brandBg = '#180c03'; brandBorder = 'rgba(217, 119, 6, 0.5)'; brandText = '#f1f4fb'; brandColor = 'f9f9f9'; slug = 'anthropic';
    } else if (brand === 'redis') {
      brandBg = '#180303'; brandBorder = 'rgba(220, 56, 45, 0.5)'; brandText = '#f1f4fb'; brandColor = 'dc382d'; slug = 'redis';
    } else if (brand === 'linux') {
      brandBg = '#0a0a0a'; brandBorder = 'rgba(252, 198, 36, 0.5)'; brandText = '#f1f4fb'; brandColor = 'fcc624'; slug = 'linux';
    } else if (brand === 'cloudflare') {
      brandBg = '#1a1003'; brandBorder = 'rgba(243, 128, 32, 0.5)'; brandText = '#f1f4fb'; brandColor = 'f38020'; slug = 'cloudflare';
    }
    
    return {
      background: brandBg,
      borderColor: brandBorder,
      color: brandText,
      brandColor,
      slug,
      label: text.slice(1, -1)
    };
  };

  // Expanded Rich Technical & Creative Sticker Categories
  const STICKER_CATEGORIES = [
    {
      id: 'tech_stack',
      name: '💻 TECH & CODING',
      stickers: [
        '[HTML]', '[CSS]', '[JavaScript]', '[TypeScript]', '[React.js]', '[Next.js]', '[TailwindCSS]',
        '[Bootstrap]', '[Framer Motion]', '[Vite]', '[Redux]', '[Shadcn UI]', '[GSAP]', '[Node.js]', 
        '[Express.js]', '[Python]', '[Go]', '[PHP]', '[Laravel]', '[Prisma]', '[PostgreSQL]', '[MySQL]', 
        '[MongoDB]', '[Firebase]', '[Supabase]', '[Git]', '[GitHub]', '[Docker]', '[Vercel]', '[Gemini AI]', 
        '[Rust]', '[Svelte]', '[Claude]', '[Redis]', '[Linux]', '[Cloudflare]'
      ]
    },
    {
      id: 'cyber_tech',
      name: '🤖 CYBER HUD',
      stickers: [
        '👾', '🤖', '💻', '💾', '📡', '🛰️', '🚀', '🛸', '🔋', '🔌', '⚙️', '⚡', '🌌', '🧬', '🦾', '🪐',
        '🌀', '🌐', '🕹️', '🛡️', '🔑', '🎯', '📟', '📠', '💿', '🎛️', '🎙️', '🖥️', '📻', '📼', '📽️',
        '🖲️', '🧲', '🧪', '🔬', '🔮', '🧿', '🔭', '🧬', '🔬', '💈', '🛎️', '⏰', '⏳', '⌚', '☣️'
      ]
    },
    {
      id: 'terminal_labels',
      name: '📟 HUD LABELS',
      stickers: [
        '[SYS_OK]', '[ERROR]', '[LIVE_HUD]', '[AI_SYNC]', '[RAW_DATA]', '[REC🔴]', '[PLAY▶]', '[TEST_OK]',
        '[OFFLINE]', '[ONLINE]', '[ALERT⚠️]', '[KERNEL]', '[ROOT_SU]', '[BOOT]', '[SYS_UP]', '[REBOOT]',
        '[SYNC_IN]', '[CPU_100]', '[FPS_60]', '[PING_0]', '[USER_01]', '[HOST_L]', '[NODE_4]', '[PORT_3]',
        '[GLITCH]', '[NULL_B]', '[VOID_O]', '[ZERO_D]', '[EXEC_1]', '[CRITICAL]', '[SAFE_M]', '[DEBUG_O]',
        '[CORE_L]', '[RAM_99]', '[GPU_OC]', '[TEMP_H]', '[LINK_S]', '[BEAM_O]', '[WAVE_F]', '[SCAN_X]'
      ]
    },
    {
      id: 'neon_glyphs',
      name: '✦ TECH GLYPHS',
      stickers: [
        '✦', '✧', '▲', '▼', '◀', '▶', '◆', '◇', '◈', '◎', '◉', '☉', '☠', '☣', '☢', '☯', '☾', '★', 
        '☆', '☄', '☇', '☈', '☊', '☋', '☌', '☍', '♻️', '🔱', '🔰', '⚜️', '⚡', '🔥', '💧', '❄️', '🌈',
        '🌪️', '🌟', '🌙', '🌌', '🪐', '☄️', '🛰️', '🛸', '👽'
      ]
    },
    {
      id: 'y2k_sparkles',
      name: '✨ Y2K SPARKLES',
      stickers: [
        '✨', '💋', '🎀', '🩹', '🌸', '🕶️', '🔥', '💿', '🖤', '🍒', '🦋', '🎈', '🧸', '🍭', '🍓', '🧁',
        '💘', '💖', '💗', '💓', '💞', '💕', '💎', '👑', '💄', '💍', '💅', '👛', '👜', '👓', '🎧', '🌟',
        '⭐', '🎉', '🎀', '🎁', '🎂', '🍬', '🍩', '🍪', '🍫', '🥤', '🍦', '🍨'
      ]
    }
  ];

  const t = (id: string, en: string) => (language === 'id' ? id : en);

  // Re-generate preview when frame or filter changes
  useEffect(() => {
    const generatePreview = async () => {
      const canvas = canvasRef.current;
      if (!canvas || filteredPhotos.length === 0) return;
      setIsProcessing(true);

      const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((res) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = () => { const errImg = new Image(); res(errImg); };
        img.src = src;
      });

      const images = await Promise.all(filteredPhotos.map(p => loadImg(p.original)));
      const filterName = filteredPhotos[0]?.filterName || 'Original';

      await drawCustomGrid(canvas, images, activeFrame, activeFilter, filterName);
      setIsProcessing(false);
    };

    const timer = setTimeout(generatePreview, 150);
    return () => clearTimeout(timer);
  }, [activeFrame, activeFilter, filteredPhotos]);

  const handleFinish = async () => {
    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((res) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.src = src;
    });

    const images = await Promise.all(filteredPhotos.map(p => loadImg(p.original)));
    await drawCustomGrid(canvas, images, activeFrame, activeFilter, 'Photobooth Session');
    
    // Pre-load SVG images for tech stack logos to prevent blank drawing on canvas
    const logoMap: Record<string, HTMLImageElement> = {};
    const techStickers = stickers.filter(s => s.emoji.startsWith('[') && s.emoji.endsWith(']'));
    
    await Promise.all(techStickers.map(async (s) => {
      const details = getBrandDetails(s.emoji);
      const cleanColor = details.brandColor.replace('#', '');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res) => {
        img.onload = () => {
          logoMap[s.id] = img;
          res(true);
        };
        img.onerror = () => res(false);
        img.src = `https://cdn.simpleicons.org/${details.slug}/${cleanColor}`;
      });
    }));

    // Draw stickers onto the final canvas
    const displayCanvas = canvasRef.current;
    if (displayCanvas && stickers.length > 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = displayCanvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const scale = Math.max(scaleX, scaleY);

        const actualDisplayWidth = canvas.width / scale;
        const actualDisplayHeight = canvas.height / scale;
        
        const offsetX = (rect.width - actualDisplayWidth) / 2;
        const offsetY = (rect.height - actualDisplayHeight) / 2;

        stickers.forEach(s => {
          const canvasX = (s.x - offsetX) * scale;
          const canvasY = (s.y - offsetY) * scale;
          
          ctx.save();
          // Translate to center of sticker
          ctx.translate(canvasX, canvasY);
          ctx.rotate((s.rotation || 0) * Math.PI / 180);
          
          const sScale = s.scale || 1;
          
          if (s.emoji.startsWith('[') && s.emoji.endsWith(']')) {
            // Render beautiful pill tech badge with official brand logo!
            const details = getBrandDetails(s.emoji);
            const size = 18 * scale * sScale;
            ctx.font = `bold ${size}px "DM Sans", "Helvetica Neue", sans-serif`;
            
            const labelText = details.label;
            const labelW = ctx.measureText(labelText).width;
            
            const iconSize = 20 * scale * sScale;
            const spacing = 10 * scale * sScale;
            const padX = 18 * scale * sScale;
            const padY = 10 * scale * sScale;
            
            const contentW = iconSize + spacing + labelW;
            const badgeW = contentW + padX * 2;
            const badgeH = iconSize + padY * 2;
            
            // Draw dark background pill
            ctx.fillStyle = details.background;
            ctx.beginPath();
            ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, badgeH / 2);
            ctx.fill();
            
            // Draw thin colored border
            ctx.strokeStyle = details.borderColor;
            ctx.lineWidth = 2 * scale;
            ctx.stroke();
            
            // Draw pre-loaded brand logo SVG image!
            const logoImg = logoMap[s.id];
            if (logoImg && logoImg.width > 0) {
              ctx.drawImage(
                logoImg,
                -badgeW / 2 + padX,
                -iconSize / 2,
                iconSize,
                iconSize
              );
            }
            
            // Draw text label
            ctx.fillStyle = details.color;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${size}px "DM Sans", "Helvetica Neue", sans-serif`;
            ctx.fillText(labelText, -badgeW / 2 + padX + iconSize + spacing, 0);
          } else {
            // Regular Emoji sticker
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${50 * scale * sScale}px sans-serif`;
            ctx.fillText(s.emoji, 0, 0);
          }
          ctx.restore();
        });
      }
    }
    
    const finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    clearFilteredPhotos();
    addFilteredPhoto({ original: finalDataUrl, filtered: finalDataUrl, filterName: 'Custom Grid', filterId: 'custom' });
    
    // Create free transaction in the background
    setIsProcessing(true);
    const createAndUploadTransaction = async () => {
      try {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: selectedPackage?.id || `pkg-${takeCount}`,
            amount: 0,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const txnId = data.transaction.id;
          
          // Mark transaction as paid
          const payRes = await fetch(`/api/transactions/${txnId}/pay`, {
            method: 'POST',
          });
          const payData = await payRes.json();
          
          // Helper to convert base64 to File
          const dataURLtoFile = (dataurl: string, filename: string): File => {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
          };
          
          // Upload photo
          const file = dataURLtoFile(finalDataUrl, `filtered_Custom_Grid_${Date.now()}.jpg`);
          const formData = new FormData();
          formData.append('transactionId', txnId);
          formData.append('original', file);
          formData.append('filtered', file);
          formData.append('filterName', 'Custom Grid');
          
          await fetch('/api/photos/upload', {
            method: 'POST',
            body: formData,
          });

          const transaction: TransactionInfo = {
            id: payData.transaction.id,
            orderId: payData.transaction.orderId,
            packageId: selectedPackage?.id || `pkg-${takeCount}`,
            amount: 0,
            status: 'paid',
            paymentMethod: 'FREE',
            paymentTime: new Date().toISOString(),
            filterNames: 'Custom Grid',
            createdAt: payData.transaction.createdAt,
            downloadToken: payData.transaction.downloadToken,
            tokenExpiresAt: payData.transaction.tokenExpiresAt,
          };
          setCurrentTransaction(transaction);
        }
      } catch (err) {
        console.error('Error creating transaction:', err);
      } finally {
        setIsProcessing(false);
        setStep('download');
      }
    };
    
    createAndUploadTransaction();
  };

  const selectedSticker = stickers.find(s => s.id === selectedStickerId);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden" style={{ background: '#030611' }}>

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4 }}
      />

      {/* ── Left: Preview Area ── */}
      <div 
        className="relative z-10 flex-1 flex flex-col p-4 md:p-8 overflow-hidden h-[60vh] md:h-screen" 
        style={{ background: 'radial-gradient(ellipse at center, rgba(43,92,246,0.08) 0%, transparent 70%)' }}
        onClick={() => setSelectedStickerId(null)}
      >
        <button onClick={() => setStep('processing')} title="Back" aria-label="Back" className="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center text-[#7687a1] hover:text-var(--copper) bg-[#0a0e1c] border border-[#1d2740] tap-none transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 w-full h-full flex items-center justify-center p-4 md:p-8 relative">
          <div className="relative max-w-full max-h-full flex items-center justify-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(43,92,246,0.2)' }}>
            <canvas 
              ref={canvasRef} 
              className="max-w-full max-h-full object-contain"
              style={{ opacity: isProcessing ? 0.6 : 1, transition: 'opacity 0.2s' }}
            />
            {/* Draggable Stickers Overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {stickers.map((s) => {
                const isSelected = selectedStickerId === s.id;
                return (
                  <motion.div
                    key={s.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(e, info) => {
                      setStickers(prev => prev.map(st => st.id === s.id ? { ...st, x: st.x + info.offset.x, y: st.y + info.offset.y } : st));
                    }}
                    className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none"
                    style={{ 
                      x: s.x, 
                      y: s.y, 
                      rotate: s.rotation || 0,
                      scale: s.scale || 1,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
                      zIndex: stickers.findIndex(st => st.id === s.id) + 10
                    }}
                  >
                    {/* Bounding box wrapper when selected */}
                    <div 
                      className={`p-2 transition-all relative ${isSelected ? 'ring-2 ring-var(--copper) ring-offset-2 ring-offset-[#030611] rounded-full' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStickerId(s.id);
                      }}
                    >
                      {s.emoji.startsWith('[') && s.emoji.endsWith(']') ? (
                        (() => {
                          const details = getBrandDetails(s.emoji);
                          const cleanColor = details.brandColor.replace('#', '');
                          return (
                            <div 
                              className="flex items-center gap-2 font-body text-[11px] font-bold px-4 py-2 whitespace-nowrap select-none border rounded-full shadow-[0_0_15px_rgba(0,0,0,0.4)]"
                              style={{
                                background: details.background,
                                borderColor: details.borderColor,
                                color: details.color,
                                boxShadow: `0 0 10px ${details.borderColor}33`
                              }}
                            >
                              <img 
                                src={`https://cdn.simpleicons.org/${details.slug}/${cleanColor}`} 
                                className="w-4 h-4 object-contain shrink-0" 
                                alt=""
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <span>{details.label}</span>
                            </div>
                          );
                        })()
                      ) : (
                        <span style={{ fontSize: 50 }} className="select-none">{s.emoji}</span>
                      )}

                      {/* Small Quick-Delete Button on the Corner */}
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStickers(prev => prev.filter(st => st.id !== s.id));
                            setSelectedStickerId(null);
                          }}
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 border border-white text-white flex items-center justify-center font-bold text-xs hover:bg-red-700 shadow-md pointer-events-auto cursor-pointer z-50"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {isProcessing && (
            <div className="absolute flex flex-col items-center gap-2 text-var(--copper) pointer-events-none bg-[#030611]/85 p-4 rounded-lg">
              <Wand2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold tracking-widest uppercase font-body">Memproses...</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Customization Panel ── */}
      <div className="relative z-20 w-full md:w-[400px] h-[40vh] md:h-screen flex flex-col border-t md:border-t-0 md:border-l border-[rgba(43,92,246,0.2)]" style={{ background: '#080b18' }}>
        
        {/* Tabs */}
        <div className="flex w-full border-b border-[rgba(43,92,246,0.2)]">
          <button 
            onClick={() => setActiveTab('frame')}
            className="flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase font-body transition-colors"
            style={{ color: activeTab === 'frame' ? 'var(--copper)' : '#7687a1', borderBottom: activeTab === 'frame' ? '2px solid var(--copper)' : '2px solid transparent' }}
          >
            <Frame className="w-4 h-4" /> Layout
          </button>
          <button 
            onClick={() => setActiveTab('filter')}
            className="flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase font-body transition-colors"
            style={{ color: activeTab === 'filter' ? 'var(--copper)' : '#7687a1', borderBottom: activeTab === 'filter' ? '2px solid var(--copper)' : '2px solid transparent' }}
          >
            <Palette className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={() => setActiveTab('sticker')}
            className="flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase font-body transition-colors"
            style={{ color: activeTab === 'sticker' ? 'var(--copper)' : '#7687a1', borderBottom: activeTab === 'sticker' ? '2px solid var(--copper)' : '2px solid transparent' }}
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
                    borderColor: activeFrame === opt.id ? 'var(--copper)' : 'rgba(29,39,64,0.8)', 
                    background: activeFrame === opt.id ? 'rgba(43,92,246,0.05)' : '#0a0e1c' 
                  }}
                >
                  <span className="text-[11px] font-bold text-[#f1f4fb] font-body tracking-wider">{opt.label}</span>
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
                    borderColor: activeFilter === opt.id ? 'var(--copper)' : 'rgba(29,39,64,0.8)', 
                    background: activeFilter === opt.id ? 'rgba(43,92,246,0.05)' : '#0a0e1c' 
                  }}
                >
                  <span className="text-[11px] font-bold text-[#f1f4fb] font-body tracking-wider">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
          
          {activeTab === 'sticker' && (
            <div>
              {/* Sticker Customizer Panel */}
              {selectedSticker && (
                <div className="mb-6 p-4 border border-[rgba(43,92,246,0.3)] bg-[#030611] rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-var(--copper) font-bold uppercase tracking-wider truncate max-w-[200px]">
                      Stiker Aktif: {selectedSticker.emoji}
                    </span>
                    <button 
                      onClick={() => setSelectedStickerId(null)}
                      className="text-[9px] text-[#7687a1] uppercase border border-[#7687a1]/25 px-2 py-0.5 hover:bg-white/5"
                    >
                      Batal Pilih
                    </button>
                  </div>
                  
                  {/* Scale Control */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-[#7687a1]">Ukuran (Resize)</span>
                      <span className="text-[#f1f4fb] font-mono">{Math.round((selectedSticker.scale || 1) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.4" 
                      max="3.0" 
                      step="0.05"
                      value={selectedSticker.scale || 1}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, scale: val } : s));
                      }}
                      className="w-full accent-var(--copper)"
                      title="Sticker Scale"
                      aria-label="Sticker Scale"
                    />
                  </div>

                  {/* Rotation Control */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-[#7687a1]">Putar (Rotation)</span>
                      <span className="text-[#f1f4fb] font-mono">{selectedSticker.rotation || 0}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      step="5"
                      value={selectedSticker.rotation || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, rotation: val } : s));
                      }}
                      className="w-full accent-var(--copper)"
                      title="Sticker Rotation"
                      aria-label="Sticker Rotation"
                    />
                  </div>

                  {/* Ordering and Deletion */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setStickers(prev => {
                          const item = prev.find(s => s.id === selectedStickerId);
                          if (!item) return prev;
                          return [...prev.filter(s => s.id !== selectedStickerId), item];
                        });
                      }}
                      className="flex-1 text-[9px] text-[#f1f4fb] border border-[#1d2740] bg-[#0a0e1c] py-2 hover:bg-[rgba(43,92,246,0.1)] transition-colors"
                    >
                      Bawa Ke Depan
                    </button>
                    <button
                      onClick={() => {
                        setStickers(prev => {
                          const item = prev.find(s => s.id === selectedStickerId);
                          if (!item) return prev;
                          return [item, ...prev.filter(s => s.id !== selectedStickerId)];
                        });
                      }}
                      className="flex-1 text-[9px] text-[#f1f4fb] border border-[#1d2740] bg-[#0a0e1c] py-2 hover:bg-[rgba(43,92,246,0.1)] transition-colors"
                    >
                      Kirim Ke Belakang
                    </button>
                    <button
                      onClick={() => {
                        setStickers(prev => prev.filter(s => s.id !== selectedStickerId));
                        setSelectedStickerId(null);
                      }}
                      className="flex-1 text-[9px] text-[#d94040] border border-[#d94040]/30 bg-[#d94040]/10 py-2 hover:bg-[#d94040]/25 transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-[#7687a1] mb-3 text-center font-body uppercase tracking-[0.2em]">Ketuk untuk tambah & geser ke foto</p>
              
              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
                {STICKER_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveStickerCategory(cat.id)}
                    className="shrink-0 text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 border transition-all"
                    style={{
                      borderColor: activeStickerCategory === cat.id ? 'var(--copper)' : 'rgba(29,39,64,0.6)',
                      background: activeStickerCategory === cat.id ? 'rgba(43,92,246,0.1)' : 'transparent',
                      color: activeStickerCategory === cat.id ? '#f1f4fb' : '#7687a1',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Grid of stickers in active category */}
              <div className="grid grid-cols-3 gap-2.5 max-h-[35vh] overflow-y-auto pr-1 scrollbar-thin">
                {STICKER_CATEGORIES.find(c => c.id === activeStickerCategory)?.stickers.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const newId = `sticker-${Date.now()}-${idx}`;
                      setStickers(prev => [
                        ...prev,
                        { id: newId, emoji, x: 100, y: 100, scale: 1.0, rotation: 0 }
                      ]);
                      setSelectedStickerId(newId);
                    }}
                    className="flex flex-col items-center justify-center p-2.5 border border-[rgba(29,39,64,0.8)] bg-[#0a0e1c] hover:bg-[rgba(43,92,246,0.05)] hover:border-var(--copper) hover:scale-[1.05] active:scale-[0.95] transition-all tap-none rounded-md"
                  >
                    {emoji.startsWith('[') && emoji.endsWith(']') ? (
                      (() => {
                        const details = getBrandDetails(emoji);
                        const cleanColor = details.brandColor.replace('#', '');
                        return (
                          <div className="flex items-center gap-1.5 font-body text-[9px] font-bold select-none text-left w-full truncate">
                            <img 
                              src={`https://cdn.simpleicons.org/${details.slug}/${cleanColor}`} 
                              className="w-3.5 h-3.5 object-contain shrink-0" 
                              alt=""
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span style={{ color: details.color }} className="truncate">{details.label}</span>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-xl">{emoji}</span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <button onClick={() => { setStickers([]); setSelectedStickerId(null); }} className="text-[10px] text-[#d94040] font-body uppercase tracking-[0.2em] border border-[#d94040]/30 px-4 py-2 hover:bg-[#d94040]/10">
                  Hapus Semua Stiker
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-[rgba(43,92,246,0.15)]" style={{ background: '#030611' }}>
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
