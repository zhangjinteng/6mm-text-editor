/** Image-only decorative effects. Geometry, filters and source are kept independently. */
export const imageEffectDefaults = {
  strokeDouble: false, strokeOuterColor: '#ff8ece', strokeOuterWidth: 4,
  shadowMode: 'box' as 'box' | 'contour',
  glow: false, glowColor: '#ff80c5', glowRadius: 16, glowOpacity: 75,
  decoration: 'none' as 'none' | 'hearts' | 'stars' | 'sparkles' | 'confetti',
  decorationColor: '#ff80c5', decorationSize: 18, decorationCount: 12, decorationSpread: 12,
  effectPreset: 'none'
};
export const imageEffectRanges = { strokeOuterWidth: [1, 20], glowRadius: [1, 60], glowOpacity: [0, 100], decorationSize: [6, 48], decorationCount: [4, 24], decorationSpread: [0, 60] } as const;
export const decorations = { none: '无装饰', hearts: '爱心环绕', stars: '星星环绕', sparkles: '闪耀光芒', confetti: '缤纷彩纸' } as const;
export type ImageEffects = typeof imageEffectDefaults;
type EffectPatch = Partial<ImageEffects & {
  stroke: boolean; strokeWidth: number; strokeColor: string; strokeStyle: 'solid' | 'dashed' | 'dotted'; strokePosition: 'inside' | 'center' | 'outside';
  shadow: boolean; shadowX: number; shadowY: number; shadowBlur: number; shadowOpacity: number; shadowColor: string;
}>;
export const effectCategories = { popular: '热门', stroke: '描边', shadow: '投影', glow: '发光', decor: '酷炫' } as const;
export type EffectCategory = keyof typeof effectCategories;
export const imageEffectPresets: { id: string; label: string; category: EffectCategory; popular?: boolean; patch: EffectPatch }[] = [
  { id: 'none', label: '无特效', category: 'popular', patch: {} },
  { id: 'sticker', label: '白边贴纸', category: 'stroke', popular: true, patch: { stroke: true, strokeWidth: 6, strokeColor: '#ffffff', strokePosition: 'outside' } },
  { id: 'pink-dash', label: '粉色虚线', category: 'stroke', popular: true, patch: { stroke: true, strokeWidth: 5, strokeColor: '#ff91ce', strokeStyle: 'dashed', strokePosition: 'outside' } },
  { id: 'white-dots', label: '白色点线', category: 'stroke', patch: { stroke: true, strokeWidth: 6, strokeColor: '#ffffff', strokeStyle: 'dotted', strokePosition: 'outside' } },
  { id: 'double-sticker', label: '双层贴纸', category: 'stroke', popular: true, patch: { stroke: true, strokeWidth: 5, strokePosition: 'outside', strokeDouble: true, strokeOuterWidth: 4, strokeOuterColor: '#ff8ece' } },
  { id: 'ink', label: '黑边贴纸', category: 'stroke', patch: { stroke: true, strokeWidth: 3, strokeColor: '#222222', strokePosition: 'outside' } },
  { id: 'soft-shadow', label: '柔和投影', category: 'shadow', popular: true, patch: { shadow: true, shadowMode: 'contour', shadowX: 4, shadowY: 10, shadowBlur: 18, shadowOpacity: 40 } },
  { id: 'offset-shadow', label: '立体偏移', category: 'shadow', patch: { shadow: true, shadowMode: 'contour', shadowX: 9, shadowY: 9, shadowBlur: 0, shadowOpacity: 65, shadowColor: '#52335d' } },
  { id: 'sticker-shadow', label: '悬浮贴纸', category: 'shadow', patch: { stroke: true, strokeWidth: 5, strokeColor: '#ffffff', strokePosition: 'outside', shadow: true, shadowMode: 'contour', shadowY: 14, shadowBlur: 16, shadowOpacity: 45 } },
  { id: 'pink-glow', label: '粉色光晕', category: 'glow', popular: true, patch: { glow: true } },
  { id: 'gold-glow', label: '金色光晕', category: 'glow', patch: { glow: true, glowColor: '#ffce45', glowRadius: 22, glowOpacity: 90 } },
  { id: 'ice-glow', label: '冰蓝光晕', category: 'glow', patch: { glow: true, glowColor: '#63ddff', glowRadius: 20, glowOpacity: 85 } },
  { id: 'neon', label: '霓虹描边', category: 'glow', patch: { stroke: true, strokeWidth: 2, strokeColor: '#ffffff', strokePosition: 'outside', glow: true, glowColor: '#bb77ff', glowRadius: 12, glowOpacity: 100 } },
  { id: 'hearts', label: '爱心环绕', category: 'decor', popular: true, patch: { decoration: 'hearts', decorationColor: '#ff80c5' } },
  { id: 'stars', label: '星星环绕', category: 'decor', popular: true, patch: { decoration: 'stars', decorationColor: '#ffc933', decorationSize: 20, decorationCount: 10 } },
  { id: 'sparkles', label: '闪耀光芒', category: 'decor', patch: { decoration: 'sparkles', decorationColor: '#ffcf55', decorationCount: 8, glow: true, glowColor: '#ffe39a', glowRadius: 8, glowOpacity: 35 } },
  { id: 'confetti', label: '缤纷彩纸', category: 'decor', patch: { decoration: 'confetti', decorationColor: '#7dc5ff', decorationCount: 20, decorationSize: 12 } }
];
export function effectPresetPatch(id: string): EffectPatch {
  return {
    ...imageEffectDefaults, stroke: false, strokeWidth: 4, strokeColor: '#ffffff', strokeStyle: 'solid', strokePosition: 'outside',
    shadow: false, shadowX: 0, shadowY: 8, shadowBlur: 16, shadowOpacity: 25, shadowColor: '#000000',
    ...imageEffectPresets.find(preset => preset.id === id)?.patch, effectPreset: id
  };
}
export function hasImageOverlay(settings: { stroke?: boolean; shadow?: boolean } & Partial<ImageEffects>) {
  return settings.stroke || (settings.shadow && settings.shadowMode === 'contour') || settings.glow || (!!settings.decoration && settings.decoration !== 'none');
}

/** Draw effects behind the subject, keeping its original pixels and transparency untouched. */
export function paintImageEffects(alpha: HTMLCanvasElement, out: CanvasRenderingContext2D, settings: Partial<ImageEffects> & {
  shadow?: boolean; shadowX?: number; shadowY?: number; shadowBlur?: number; shadowOpacity?: number; shadowColor?: string;
}, scale: number, pad: number, w: number, h: number) {
  const tint = (color: string) => {
    const c = document.createElement('canvas'); c.width = alpha.width; c.height = alpha.height;
    const ctx = c.getContext('2d')!; ctx.drawImage(alpha, 0, 0); ctx.globalCompositeOperation = 'source-in'; ctx.fillStyle = color; ctx.fillRect(0, 0, c.width, c.height); return c;
  };
  out.save();
  if (settings.shadow && settings.shadowMode === 'contour') {
    out.globalAlpha = (settings.shadowOpacity ?? 25) / 100;
    out.filter = `blur(${(settings.shadowBlur ?? 16) * scale / 2}px)`;
    out.drawImage(tint(settings.shadowColor ?? '#000000'), (settings.shadowX ?? 0) * scale, (settings.shadowY ?? 8) * scale);
  }
  if (settings.glow) {
    const colored = tint(settings.glowColor ?? '#ff80c5');
    out.globalAlpha = (settings.glowOpacity ?? 75) / 100;
    for (const radius of [1, .35]) {
      out.filter = `blur(${(settings.glowRadius ?? 16) * scale * radius}px)`; out.drawImage(colored, 0, 0);
    }
  }
  out.restore();
  // The effect layer sits after the image in the DOM; cut the subject out to avoid tinting it.
  out.save(); out.globalCompositeOperation = 'destination-out'; out.drawImage(alpha, 0, 0); out.restore();
  if (!settings.decoration || settings.decoration === 'none') return;
  const count = settings.decorationCount ?? 12, size = (settings.decorationSize ?? 18) * scale;
  const spread = (settings.decorationSpread ?? 12) * scale;
  const pixels = alpha.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, alpha.width, alpha.height).data;
  // Place ornaments along rays at the visible subject edge, not the image's transparent rectangle.
  for (let i = 0; i < count; i++) {
    const angle = 2 * Math.PI * i / count - Math.PI / 2;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const limit = Math.hypot(w, h) / 2; let edge = 0;
    for (let d = 0; d <= limit; d += 1) {
      const x = Math.round(pad + w / 2 + dx * d), y = Math.round(pad + h / 2 + dy * d);
      if (x < 0 || y < 0 || x >= alpha.width || y >= alpha.height) break;
      if (pixels[(y * alpha.width + x) * 4 + 3]! >= 128) edge = d;
    }
    if (!edge) continue;
    const radius = edge + spread + size * .65;
    out.save(); out.translate(pad + w / 2 + dx * radius, pad + h / 2 + dy * radius);
    out.rotate((i % 3 - 1) * .22); out.scale(size * (.7 + (i % 3) * .15), size * (.7 + (i % 3) * .15));
    out.fillStyle = settings.decoration === 'confetti' ? [settings.decorationColor ?? '#7dc5ff', '#ff88bd', '#ffcb54', '#9ce1cd'][i % 4]! : settings.decorationColor ?? '#ff80c5';
    out.strokeStyle = out.fillStyle; out.lineWidth = .08; out.beginPath();
    if (settings.decoration === 'hearts') {
      out.moveTo(0, .45); out.bezierCurveTo(-.85, -.05, -.45, -.8, 0, -.32); out.bezierCurveTo(.45, -.8, .85, -.05, 0, .45); out.fill();
    } else if (settings.decoration === 'stars' || settings.decoration === 'sparkles') {
      const points = settings.decoration === 'stars' ? 5 : 4;
      for (let j = 0; j < points * 2; j++) { const a = j * Math.PI / points - Math.PI / 2, r = j % 2 ? .2 : .55; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (j) out.lineTo(x, y); else out.moveTo(x, y); }
      out.closePath(); if (settings.decoration === 'stars' && i % 2) out.stroke(); else out.fill();
    } else { out.roundRect(-.15, -.45, .3, .9, .09); out.fill(); }
    out.restore();
  }
}
