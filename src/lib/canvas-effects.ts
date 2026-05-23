import { usePhotoboothStore } from '@/store/photobooth';

export type FrameType = 
  | 'classic_strip'
  | 'classic_grid'
  | 'polaroid_scatter'
  | 'film_reel'
  | 'brutalist'
  | 'newspaper'
  | 'y2k'
  | 'minimal'
  | 'scrapbook'
  | 'cyber_hud'
  | 'vintage_postcard'
  | 'duotone_cobalt'
  | 'editorial_magazine'
  | 'vintage_vhs'
  | 'kodak_gold'
  | 'neon_matrix'
  | 'cyberpunk_glitch'
  | 'sci_fi_blueprint'
  | 'vaporwave_dream';

export type NonAIFilterType = 
  | 'normal'
  | 'grayscale'
  | 'sepia'
  | 'high_contrast'
  | 'faded'
  | 'warm'
  | 'cool'
  | 'noise'
  | 'vhs'
  | 'invert'
  | 'cyberpunk'
  | 'noir_cinema'
  | 'lofi_dream'
  | 'ethereal'
  | 'matrix_code'
  | 'glitch_rgb'
  | 'vaporwave_gradient'
  | 'cyber_amber'
  | 'infrared'
  | 'retro_gameboy'
  | 'solarized';

export const FRAME_OPTIONS: { id: FrameType; label: string }[] = [
  { id: 'classic_strip', label: 'Classic Strip' },
  { id: 'classic_grid', label: 'Classic Grid' },
  { id: 'polaroid_scatter', label: 'Polaroid Collage' },
  { id: 'film_reel', label: 'Film Reel' },
  { id: 'brutalist', label: 'Brutalist' },
  { id: 'newspaper', label: 'Newspaper' },
  { id: 'y2k', label: 'Y2K Sparkle' },
  { id: 'minimal', label: 'Minimalist' },
  { id: 'scrapbook', label: 'Scrapbook' },
  { id: 'cyber_hud', label: 'Cyber HUD' },
  { id: 'vintage_postcard', label: 'Vintage Postcard' },
  { id: 'duotone_cobalt', label: 'Cobalt Duotone' },
  { id: 'editorial_magazine', label: 'Vogue Editorial' },
  { id: 'vintage_vhs', label: 'Retro VHS Cam' },
  { id: 'kodak_gold', label: 'Kodak Gold 200' },
  { id: 'neon_matrix', label: 'Neon Matrix' },
  { id: 'cyberpunk_glitch', label: 'Cyberpunk Glitch' },
  { id: 'sci_fi_blueprint', label: 'Technical Blueprint' },
  { id: 'vaporwave_dream', label: 'Vaporwave Dream' },
];

export const FILTER_OPTIONS: { id: NonAIFilterType; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'grayscale', label: 'B&W' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'high_contrast', label: 'Vivid' },
  { id: 'faded', label: 'Faded Film' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'noise', label: 'Grain' },
  { id: 'vhs', label: 'VHS Glitch' },
  { id: 'invert', label: 'Negative' },
  { id: 'cyberpunk', label: 'Cyberpunk 2077' },
  { id: 'noir_cinema', label: 'Noir Cinema' },
  { id: 'lofi_dream', label: 'Lo-Fi Dream' },
  { id: 'ethereal', label: 'Ethereal Glow' },
  { id: 'matrix_code', label: 'Matrix Code' },
  { id: 'glitch_rgb', label: 'RGB Glitch' },
  { id: 'vaporwave_gradient', label: 'Vaporwave Tint' },
  { id: 'cyber_amber', label: 'Cyber Amber' },
  { id: 'infrared', label: 'Infrared Thermal' },
  { id: 'retro_gameboy', label: 'Gameboy 8-Bit' },
  { id: 'solarized', label: 'Solarized' },
];

export async function drawCustomGrid(
  canvas: HTMLCanvasElement,
  images: HTMLImageElement[],
  frameType: FrameType,
  filterType: NonAIFilterType,
  filterName: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx || images.length === 0) return;

  const count = images.length;
  const imgW = images[0]?.width || 1280;
  const imgH = images[0]?.height || 720;

  // Determine standard cols/rows
  let cols = 1; let rows = 2;
  if (count === 4) { cols = 2; rows = 2; }
  else if (count === 6) { cols = 2; rows = 3; }
  else if (count > 6) { cols = 2; rows = Math.ceil(count / 2); }
  else { cols = 1; rows = count; }

  // 1. Layout logic based on frameType
  let padding = 60, innerPadding = 30, headerH = 180, footerH = 240;
  
  if (frameType === 'minimal') {
    padding = 150; innerPadding = 50; headerH = 100; footerH = 100;
  } else if (frameType === 'polaroid_scatter') {
    padding = 100; innerPadding = 80; headerH = 150; footerH = 150;
  } else if (frameType === 'film_reel' || frameType === 'vintage_vhs') {
    padding = 100; innerPadding = 20; headerH = 100; footerH = 100;
    cols = 1; rows = count; // Force vertical strip
  } else if (frameType === 'newspaper' || frameType === 'editorial_magazine') {
    padding = 80; innerPadding = 40; headerH = 250; footerH = 150;
  } else if (frameType === 'kodak_gold') {
    padding = 100; innerPadding = 40; headerH = 180; footerH = 180;
  }

  const contentW = cols * imgW + (cols - 1) * innerPadding;
  const contentH = rows * imgH + (rows - 1) * innerPadding;
  canvas.width = contentW + padding * 2;
  canvas.height = contentH + padding * 2 + headerH + footerH;

  // Pre-filter processing
  let filterString = '';
  switch (filterType) {
    case 'grayscale': filterString = 'grayscale(100%) contrast(110%)'; break;
    case 'sepia': filterString = 'sepia(80%) contrast(110%)'; break;
    case 'high_contrast': filterString = 'contrast(150%) saturate(130%)'; break;
    case 'faded': filterString = 'contrast(80%) brightness(110%) saturate(80%)'; break;
    case 'warm': filterString = 'sepia(30%) saturate(120%) brightness(105%)'; break;
    case 'cool': filterString = 'hue-rotate(180deg) saturate(110%) sepia(20%)'; break;
    case 'invert': filterString = 'invert(100%)'; break;
    case 'cyberpunk': filterString = 'saturate(200%) contrast(120%) hue-rotate(290deg)'; break;
    case 'noir_cinema': filterString = 'grayscale(100%) contrast(150%) brightness(85%)'; break;
    case 'lofi_dream': filterString = 'sepia(50%) saturate(150%) contrast(80%) brightness(110%) hue-rotate(-20deg)'; break;
    case 'ethereal': filterString = 'brightness(120%) saturate(80%) contrast(90%) blur(1px)'; break;
    case 'matrix_code': filterString = 'hue-rotate(90deg) contrast(140%) brightness(90%) saturate(150%) grayscale(50%)'; break;
    case 'glitch_rgb': filterString = 'contrast(130%) brightness(105%) hue-rotate(15deg) saturate(120%)'; break;
    case 'vaporwave_gradient': filterString = 'hue-rotate(320deg) saturate(160%) brightness(110%)'; break;
    case 'cyber_amber': filterString = 'sepia(100%) hue-rotate(5deg) saturate(200%) brightness(90%) contrast(150%)'; break;
    case 'infrared': filterString = 'invert(100%) hue-rotate(180deg) saturate(200%) contrast(150%)'; break;
    case 'retro_gameboy': filterString = 'grayscale(100%) brightness(120%) contrast(180%) sepia(80%) hue-rotate(60deg) saturate(150%)'; break;
    case 'solarized': filterString = 'invert(30%) contrast(160%) brightness(110%) saturate(140%)'; break;
    default: filterString = 'none'; break;
  }

  ctx.filter = 'none';

  // Draw Background
  if (frameType === 'brutalist') {
    ctx.fillStyle = '#ebfa05'; // Neon yellow
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Grid lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  } else if (frameType === 'film_reel' || frameType === 'vintage_vhs') {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (frameType === 'film_reel') {
      ctx.fillStyle = '#fff';
      for (let y = 50; y < canvas.height; y += 120) {
        ctx.fillRect(30, y, 40, 60);
        ctx.fillRect(canvas.width - 70, y, 40, 60);
      }
    }
  } else if (frameType === 'newspaper' || frameType === 'editorial_magazine') {
    ctx.fillStyle = frameType === 'editorial_magazine' ? '#faf9f6' : '#f4f1ea';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (frameType === 'minimal') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (frameType === 'y2k') {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#ff9a9e');
    grad.addColorStop(1, '#fecfef');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (frameType === 'polaroid_scatter') {
    ctx.fillStyle = '#8b5a2b'; // Wood-like
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (frameType === 'kodak_gold') {
    ctx.fillStyle = '#fdb913'; // Kodak yellow
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (frameType === 'neon_matrix') {
    ctx.fillStyle = '#010502';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  } else if (frameType === 'cyberpunk_glitch') {
    ctx.fillStyle = '#0a0512';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (frameType === 'sci_fi_blueprint') {
    ctx.fillStyle = '#001a33';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.18)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  } else if (frameType === 'vaporwave_dream') {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#ff71ce');
    grad.addColorStop(0.5, '#01cdfe');
    grad.addColorStop(1, '#b967ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Default editorial dark
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw Header / Footer based on frameType
  if (frameType === 'brutalist') {
    ctx.fillStyle = '#000';
    ctx.font = '900 120px "DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('RAW CAPTURE', padding, padding + 100);
  } else if (frameType === 'newspaper') {
    ctx.fillStyle = '#111';
    ctx.font = '900 140px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE DAILY SNAP', canvas.width / 2, padding + 140);
    ctx.fillRect(padding, padding + 180, canvas.width - padding * 2, 4);
    ctx.fillRect(padding, padding + 190, canvas.width - padding * 2, 1);
  } else if (frameType === 'minimal') {
    ctx.fillStyle = '#333';
    ctx.font = '400 32px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '10px';
    ctx.fillText('COLLECTION 01', canvas.width / 2, padding / 2 + 30);
  } else if (frameType === 'y2k') {
    ctx.fillStyle = '#fff';
    ctx.font = 'italic 900 100px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 20;
    ctx.fillText('★ CYBER STAR ★', canvas.width / 2, padding + 100);
    ctx.shadowBlur = 0;
  } else if (frameType === 'editorial_magazine') {
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '400 160px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText('VOGUE', canvas.width / 2, padding + 150);
  } else if (frameType === 'vintage_vhs') {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 60px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PLAY ►', padding, padding + 80);
    ctx.textAlign = 'right';
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    ctx.fillText(time, canvas.width - padding, padding + 80);
  } else if (frameType === 'kodak_gold') {
    ctx.fillStyle = '#d32027'; // Kodak red
    ctx.font = '900 80px "DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('KODAK GOLD 200', padding, padding + 80);
  } else if (frameType === 'neon_matrix') {
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 60px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SYSTEM_OVERLOAD_STATUS: ACTIVE', canvas.width / 2, padding + 80);
  } else if (frameType === 'cyberpunk_glitch') {
    ctx.fillStyle = '#fcee0a';
    ctx.font = '900 80px "DM Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CYBER_GLITCH_2077 //', padding, padding + 80);
  } else if (frameType === 'sci_fi_blueprint') {
    ctx.fillStyle = '#00d5ff';
    ctx.font = 'bold 50px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TECHNICAL SCHEMATIC // AP-400', padding, padding + 70);
  } else if (frameType === 'vaporwave_dream') {
    ctx.fillStyle = '#fff';
    ctx.font = 'italic 900 100px "DM Sans", sans-serif';
    ctx.shadowColor = '#01cdfe'; ctx.shadowBlur = 15;
    ctx.textAlign = 'center';
    ctx.fillText('VAPORWAVE // 1999', canvas.width / 2, padding + 100);
    ctx.shadowBlur = 0;
  } else if (frameType !== 'polaroid_scatter' && frameType !== 'film_reel') {
    const { eventBranding } = usePhotoboothStore.getState();

    // Header Text
    ctx.fillStyle = '#2b5cf6';
    ctx.font = 'bold 54px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '14px';
    ctx.fillText(eventBranding.title.toUpperCase(), canvas.width / 2, padding + 80);
    
    // Sub-header
    ctx.fillStyle = '#7687a1';
    ctx.font = 'italic 28px "Playfair Display", serif';
    ctx.letterSpacing = '4px';
    ctx.fillText(eventBranding.subtitle, canvas.width / 2, padding + 130);
  }

  // Draw images
  images.forEach((img, idx) => {
    ctx.save();
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    let x = padding + col * (imgW + innerPadding);
    let y = padding + headerH + row * (imgH + innerPadding);
    
    ctx.filter = filterString;

    if (frameType === 'polaroid_scatter') {
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.translate(x + imgW/2, y + imgH/2);
      ctx.rotate(angle);
      ctx.translate(-(x + imgW/2), -(y + imgH/2));
      
      // Polaroid frame
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      const pw = imgW + 60;
      const ph = imgH + 200;
      const px = x - 30;
      const py = y - 30;
      ctx.fillRect(px, py, pw, ph);
      ctx.shadowBlur = 0;
      
      ctx.drawImage(img, x, y, imgW, imgH);
    } else if (frameType === 'brutalist') {
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 20, y + 20, imgW, imgH); // offset shadow
      ctx.drawImage(img, x, y, imgW, imgH);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 10;
      ctx.strokeRect(x, y, imgW, imgH);
    } else if (frameType === 'cyber_hud') {
      ctx.drawImage(img, x, y, imgW, imgH);
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, imgW, imgH);
      // HUD elements
      ctx.beginPath(); ctx.moveTo(x-20, y+20); ctx.lineTo(x+20, y+20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+20, y-20); ctx.lineTo(x+20, y+20); ctx.stroke();
    } else {
      ctx.drawImage(img, x, y, imgW, imgH);
      if (frameType === 'classic_grid' || frameType === 'classic_strip' || frameType === 'duotone_cobalt') {
        ctx.strokeStyle = '#2b5cf6';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, imgW, imgH);
      } else if (frameType === 'newspaper' || frameType === 'editorial_magazine') {
        ctx.strokeStyle = '#111';
        ctx.lineWidth = frameType === 'editorial_magazine' ? 2 : 6;
        ctx.strokeRect(x, y, imgW, imgH);
      } else if (frameType === 'vintage_vhs') {
        // scanlines over image
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for(let sy = y; sy < y + imgH; sy += 10) {
          ctx.fillRect(x, sy, imgW, 4);
        }
      } else if (frameType === 'kodak_gold') {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 20;
        ctx.strokeRect(x, y, imgW, imgH);
      } else if (frameType === 'neon_matrix') {
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, imgW, imgH);
      } else if (frameType === 'cyberpunk_glitch') {
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 6;
        ctx.strokeRect(x, y, imgW, imgH);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(x - 10, y + 40, 6, 80);
        ctx.fillRect(x + imgW + 4, y + imgH - 120, 6, 80);
      } else if (frameType === 'sci_fi_blueprint') {
        ctx.strokeStyle = '#00d5ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, imgW, imgH);
        ctx.fillStyle = '#00d5ff';
        ctx.fillRect(x - 5, y - 5, 15, 2);
        ctx.fillRect(x - 5, y - 5, 2, 15);
      } else if (frameType === 'vaporwave_dream') {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 10;
        ctx.strokeRect(x, y, imgW, imgH);
      }
    }

    ctx.restore();
  });

  // Post-processing overlays
  if (filterType === 'noise') {
    // Simple noise simulation: draw semi-transparent random dots
    // For performance, we use a tile or simple fill with noise pattern
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for(let i=0; i<3000; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 4, 4);
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';
    }
  }

  if (filterType === 'vaporwave_gradient') {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#ff71ce');
    grad.addColorStop(1, '#01cdfe');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  
  if (filterType === 'matrix_code') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 255, 65, 0.08)';
    for (let x = 10; x < canvas.width; x += 40) {
      for (let y = 10; y < canvas.height; y += 80) {
        ctx.font = '10px monospace';
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y);
      }
    }
    ctx.restore();
  }

  if (frameType === 'duotone_cobalt') {
    // Simple duotone hack: multiply with cobalt
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = '#2b5cf6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#2b5cf6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Footer (if applicable)
  if (frameType === 'brutalist') {
    ctx.fillStyle = '#000';
    ctx.font = '900 60px "DM Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('NO RULES. JUST RAW.', canvas.width - padding, canvas.height - padding);
  } else if (frameType === 'y2k') {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('<3 FOREVER <3', canvas.width / 2, canvas.height - padding);
  } else if (frameType === 'neon_matrix') {
    ctx.fillStyle = '#00ff41';
    ctx.font = '30px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ DATA_STREAM_SECURED ⚡', canvas.width / 2, canvas.height - padding);
  } else if (frameType === 'sci_fi_blueprint') {
    ctx.fillStyle = '#00d5ff';
    ctx.font = '24px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SCALE: 1:1.24 // SENSOR ID: 94002-C', padding, canvas.height - padding);
  } else if (frameType === 'vaporwave_dream') {
    ctx.fillStyle = '#fff';
    ctx.font = 'italic bold 48px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✿ PHYSICAL EDUCATION ✿', canvas.width / 2, canvas.height - padding);
  } else if (frameType !== 'polaroid_scatter' && frameType !== 'film_reel' && frameType !== 'minimal' && frameType !== 'newspaper') {
    const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = '#7687a1';
    ctx.font = '32px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText(`CAPTURED ON ${dateStr.toUpperCase()}`, canvas.width / 2, canvas.height - padding - 40);
  }
}
