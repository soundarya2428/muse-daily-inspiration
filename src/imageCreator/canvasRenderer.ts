import type { Quote } from '@/quotes/data';

export type TemplateId = 'minimal' | 'editorial' | 'nature' | 'midnight';

export interface PaletteColor {
  id: string;
  label: string;
  bg: string;
  text: string;
  accent: string;
  border?: string;
  secondaryText?: string;
}

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  description: string;
  palettes: PaletteColor[];
}

export const TEMPLATES: readonly TemplateConfig[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean typography, serene whitespace, subtle hairline accent.',
    palettes: [
      {
        id: 'ivory',
        label: 'Warm Ivory',
        bg: '#FDFBF7',
        text: '#29262D',
        accent: '#B0924F',
        secondaryText: '#7A7482',
      },
      {
        id: 'linen',
        label: 'Oat Linen',
        bg: '#F0E9DB',
        text: '#2A1C31',
        accent: '#96793B',
        secondaryText: '#6E6775',
      },
      {
        id: 'charcoal',
        label: 'Soft Charcoal',
        bg: '#201D24',
        text: '#F8F4EC',
        accent: '#DCC494',
        secondaryText: '#A398AE',
      },
    ],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Classic literary magazine layout with quotation watermark and double frame.',
    palettes: [
      {
        id: 'parchment',
        label: 'Parchment',
        bg: '#F5EFE6',
        text: '#35243D',
        accent: '#AB6C6C',
        border: '#D9C9B4',
        secondaryText: '#685A70',
      },
      {
        id: 'deep-plum',
        label: 'Deep Plum',
        bg: '#2A1C31',
        text: '#F8F4EC',
        accent: '#DCC494',
        border: '#533B5F',
        secondaryText: '#C9BBD8',
      },
      {
        id: 'dusty-rose',
        label: 'Dusty Rose',
        bg: '#EBDAD7',
        text: '#2D1B28',
        accent: '#964848',
        border: '#CBB2AE',
        secondaryText: '#5E4957',
      },
    ],
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Earthy botanical sage and organic botanical elements.',
    palettes: [
      {
        id: 'sage',
        label: 'Soft Sage',
        bg: '#E2E8E0',
        text: '#223026',
        accent: '#5E7865',
        border: '#C1CFC0',
        secondaryText: '#546A5B',
      },
      {
        id: 'spruce',
        label: 'Deep Forest',
        bg: '#1C2922',
        text: '#EAF0E9',
        accent: '#9DBBA7',
        border: '#32473C',
        secondaryText: '#B1C7B9',
      },
      {
        id: 'sandstone',
        label: 'Sandstone',
        bg: '#EDE4DC',
        text: '#3A2E27',
        accent: '#967055',
        border: '#D4C5BA',
        secondaryText: '#6D5C52',
      },
    ],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Luminous champagne gold on deep obsidian night.',
    palettes: [
      {
        id: 'obsidian',
        label: 'Obsidian Night',
        bg: '#130E19',
        text: '#F5EEDB',
        accent: '#DCC494',
        border: '#3C2F48',
        secondaryText: '#BDB1CB',
      },
      {
        id: 'cosmic-navy',
        label: 'Cosmic Blue',
        bg: '#0E1422',
        text: '#F0F4FC',
        accent: '#8EB4E6',
        border: '#23324E',
        secondaryText: '#9EB3D4',
      },
      {
        id: 'plum-shadow',
        label: 'Plum Noir',
        bg: '#1A0E22',
        text: '#FCEEF5',
        accent: '#E6A8C2',
        border: '#462758',
        secondaryText: '#D5A8BF',
      },
    ],
  },
] as const;

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1350;

/**
 * Wraps text into lines that do not exceed maxWidth.
 */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export interface RenderOptions {
  quote: Quote;
  templateId: TemplateId;
  palette: PaletteColor;
}

/**
 * Draws the high-res quote image onto the given canvas.
 */
export async function renderQuoteToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Ensure fonts are fully loaded
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Best-effort
    }
  }

  const { quote, templateId, palette } = options;
  const W = CANVAS_WIDTH;
  const H = CANVAS_HEIGHT;

  canvas.width = W;
  canvas.height = H;

  // 1. Draw Background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);

  // 2. Render Template-Specific Frames and Decorations
  switch (templateId) {
    case 'minimal':
      renderMinimalAccents(ctx, W, H, palette);
      break;
    case 'editorial':
      renderEditorialAccents(ctx, W, H, palette, quote.category);
      break;
    case 'nature':
      renderNatureAccents(ctx, W, H, palette, quote.category);
      break;
    case 'midnight':
      renderMidnightAccents(ctx, W, H, palette, quote.category);
      break;
  }

  // 3. Render Quote Text with Dynamic Auto-Fitting
  const maxTextWidth = W - 280; // 140px padding on each side
  const maxAvailableHeight = H * 0.48; // Max 48% of image height for text

  let fontSize = 60;
  let lineHeight = fontSize * 1.45;
  let lines: string[] = [];

  // Dynamically step down font size if quote is long
  while (fontSize >= 32) {
    ctx.font = `italic 400 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
    lines = wrapLines(ctx, `“${quote.text}”`, maxTextWidth);
    if (lines.length * lineHeight <= maxAvailableHeight) {
      break;
    }
    fontSize -= 3;
    lineHeight = fontSize * 1.45;
  }

  ctx.fillStyle = palette.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `italic 400 ${fontSize}px "Cormorant Garamond", Georgia, serif`;

  // Vertically center the quote block around 46% of canvas height
  const totalBlockHeight = lines.length * lineHeight;
  const startY = H * 0.46 - totalBlockHeight / 2 + lineHeight / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, W / 2, startY + index * lineHeight);
  });

  // 4. Render Author Citation
  const authorY = startY + totalBlockHeight + 40;
  ctx.font = '500 22px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = palette.secondaryText || palette.accent;
  // letterSpacing is a relatively new Canvas API (Chrome 99+, Safari 17.2+).
  // Apply it only when supported; on older browsers the text renders without
  // extra letter-spacing, which is still perfectly legible.
  const supportsLetterSpacing = 'letterSpacing' in ctx;
  if (supportsLetterSpacing) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '4px';
  ctx.fillText(`— ${quote.author.toUpperCase()}`, W / 2, authorY);
  if (supportsLetterSpacing) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';

  // 5. Render Discreet Branding at Bottom
  ctx.font = '400 15px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = palette.secondaryText || palette.accent;
  ctx.globalAlpha = 0.65;
  if (supportsLetterSpacing) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '6px';
  ctx.fillText('M U S E', W / 2, H - 90);
  ctx.globalAlpha = 1.0;
  if (supportsLetterSpacing) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
}

function renderMinimalAccents(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  palette: PaletteColor
) {
  // Delicate hairline rule above center
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, H * 0.22);
  ctx.lineTo(W / 2 + 40, H * 0.22);
  ctx.stroke();
  ctx.globalAlpha = 1.0;
}

function renderEditorialAccents(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  palette: PaletteColor,
  category: string
) {
  // Double outer border
  const margin = 64;
  ctx.strokeStyle = palette.border || palette.accent;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);

  ctx.lineWidth = 0.75;
  ctx.strokeRect(margin + 12, margin + 12, W - (margin + 12) * 2, H - (margin + 12) * 2);

  // Large background watermark quotation mark
  ctx.save();
  ctx.font = 'italic 700 340px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = palette.accent;
  ctx.globalAlpha = 0.08;
  ctx.textAlign = 'center';
  ctx.fillText('“', W / 2, H * 0.42);
  ctx.restore();

  // Category Tag at Top
  ctx.font = '500 16px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = palette.accent;
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '5px';
  ctx.textAlign = 'center';
  ctx.fillText(`✦  ${category.toUpperCase()}  ✦`, W / 2, margin + 50);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
}

function renderNatureAccents(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  palette: PaletteColor,
  category: string
) {
  // Soft rounded border
  const pad = 72;
  const r = 28;
  ctx.strokeStyle = palette.border || palette.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pad, pad, W - pad * 2, H - pad * 2, r);
  ctx.stroke();

  // Subtle Botanical leaf motif symbol at top
  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌿', W / 2, pad + 52);

  // Category Pill
  ctx.font = '500 15px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = palette.accent;
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '4px';
  ctx.fillText(category.toUpperCase(), W / 2, pad + 95);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
}

function renderMidnightAccents(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  palette: PaletteColor,
  category: string
) {
  // Luminous inner golden border
  const pad = 70;
  ctx.strokeStyle = palette.border || palette.accent;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.75;
  ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

  // Corner decorative marks
  const cornerLen = 24;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2.5;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad - 8, pad + cornerLen);
  ctx.lineTo(pad - 8, pad - 8);
  ctx.lineTo(pad + cornerLen, pad - 8);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(W - pad + 8 - cornerLen, pad - 8);
  ctx.lineTo(W - pad + 8, pad - 8);
  ctx.lineTo(W - pad + 8, pad + cornerLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad - 8, H - pad - cornerLen);
  ctx.lineTo(pad - 8, H - pad + 8);
  ctx.lineTo(pad + cornerLen, H - pad + 8);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(W - pad + 8 - cornerLen, H - pad + 8);
  ctx.lineTo(W - pad + 8, H - pad + 8);
  ctx.lineTo(W - pad + 8, H - pad - cornerLen);
  ctx.stroke();

  ctx.globalAlpha = 1.0;

  // Celestial Star at Top
  ctx.font = '24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦', W / 2, pad + 52);

  ctx.font = '500 15px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = palette.accent;
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '5px';
  ctx.fillText(category.toUpperCase(), W / 2, pad + 92);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
}

/**
 * Downloads the current canvas rendering as a high-quality PNG.
 */
export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve(true);
        },
        'image/png',
        1.0
      );
    } catch {
      resolve(false);
    }
  });
}
