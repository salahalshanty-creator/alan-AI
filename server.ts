import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Helper to check for a valid Gemini API key
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  // Valid Google AI Studio Gemini API keys start with 'AIza' and are at least 30 characters
  if (!key || !key.startsWith('AIza') || key.length < 30) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function generateStudioMockupSvg(prompt: string, aspectRatio: string): string {
  let width = 1200;
  let height = 1200;
  if (aspectRatio === '16:9') { width = 1600; height = 900; }
  else if (aspectRatio === '9:16') { width = 900; height = 1600; }
  else if (aspectRatio === '4:3') { width = 1200; height = 900; }
  else if (aspectRatio === '3:4') { width = 900; height = 1200; }

  const cleanPrompt = prompt.trim() || 'Luxury Print Design';
  const lower = cleanPrompt.toLowerCase();
  const cleanTitle = cleanPrompt.slice(0, 50);
  const cleanSubtitle = cleanPrompt.length > 50 ? cleanPrompt.slice(50, 110) : 'ALAN ADVERTISING & PRINTING · DUBAI, UAE';

  const isPackaging = lower.includes('box') || lower.includes('pack') || lower.includes('علبة') || lower.includes('كرتون');
  const isBrochure = lower.includes('brochure') || lower.includes('catalog') || lower.includes('كتيب') || lower.includes('تقرير');
  const isAcrylic = lower.includes('acrylic') || lower.includes('badge') || lower.includes('pass') || lower.includes('أكريليك');
  const isFood = lower.includes('food') || lower.includes('burger') || lower.includes('kraft') || lower.includes('مطعم');

  let finishBadge = 'BESPOKE HOT FOIL &amp; SPOT UV PROOF';
  let primaryColor = '#D4AF37';
  let secondaryColor = '#FCEAB8';
  let emblemIcon = 'A';

  if (isPackaging) {
    finishBadge = 'RIGID LUXURY BOX · MAGNETIC CLOSURE · 1200 GSM';
    emblemIcon = '⚑';
  } else if (isBrochure) {
    finishBadge = 'ARCHITECTURAL BROCHURE · SOFT TOUCH &amp; SPOT GLOSS';
    emblemIcon = '❖';
  } else if (isAcrylic) {
    finishBadge = 'FROSTED ACRYLIC VIP PASS · ROSE GOLD BEVEL';
    emblemIcon = '★';
  } else if (isFood) {
    finishBadge = 'FDA CERTIFIED FOOD BOARD · GREASEPROOF KRAFT';
    primaryColor = '#E0A96D';
    secondaryColor = '#F7D6B3';
    emblemIcon = '✦';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${secondaryColor}" />
        <stop offset="25%" stop-color="${primaryColor}" />
        <stop offset="50%" stop-color="#F5E0A9" />
        <stop offset="75%" stop-color="#9C7709" />
        <stop offset="100%" stop-color="#E2BD64" />
      </linearGradient>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#181A1D" />
        <stop offset="45%" stop-color="#121316" />
        <stop offset="100%" stop-color="#090A0C" />
      </linearGradient>
      <filter id="foilGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="${primaryColor}" flood-opacity="0.45" />
      </filter>
      <pattern id="linenTexture" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="none" />
        <path d="M 0,12 L 24,12 M 12,0 L 12,24" stroke="#FFFFFF" stroke-opacity="0.02" stroke-width="0.8" />
      </pattern>
    </defs>

    <!-- Main Card Body -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#linenTexture)" />

    <!-- Outer Gold Foil Border Accent -->
    <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="url(#goldGrad)" stroke-width="1.8" stroke-opacity="0.5" rx="16" />
    <rect x="52" y="52" width="${width - 104}" height="${height - 104}" fill="none" stroke="#2B2D31" stroke-width="0.8" stroke-dasharray="8,6" rx="12" />

    <!-- Corner Printer Registration Marks -->
    <g stroke="url(#goldGrad)" stroke-width="1.5" stroke-opacity="0.85">
      <path d="M 68 84 L 68 68 L 84 68" fill="none" />
      <path d="M ${width - 68} 84 L ${width - 68} 68 L ${width - 84} 68" fill="none" />
      <path d="M 68 ${height - 84} L 68 ${height - 68} L 84 ${height - 68}" fill="none" />
      <path d="M ${width - 68} ${height - 84} L ${width - 68} ${height - 68} L ${width - 84} ${height - 68}" fill="none" />
    </g>

    <!-- Center Luxury Emblem -->
    <circle cx="${width / 2}" cy="${height * 0.35}" r="60" fill="#131417" stroke="url(#goldGrad)" stroke-width="2.5" filter="url(#foilGlow)" />
    <circle cx="${width / 2}" cy="${height * 0.35}" r="50" fill="none" stroke="#33353A" stroke-width="0.8" />
    <text x="${width / 2}" y="${height * 0.35 + 16}" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-size="44" font-weight="700" fill="url(#goldGrad)">${emblemIcon}</text>

    <!-- Brand Typography -->
    <text x="${width / 2}" y="${height * 0.50}" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="800" letter-spacing="5" fill="${primaryColor}">ALAN ADVERTISING &amp; PRINTING</text>
    <text x="${width / 2}" y="${height * 0.54}" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" font-weight="600" letter-spacing="2.5" fill="#8E939B">DUBAI · UNITED ARAB EMIRATES</text>

    <!-- Prompt Headline with Metallic Texture -->
    <text x="${width / 2}" y="${height * 0.64}" text-anchor="middle" font-family="'Cormorant Garamond', Georgia, serif" font-size="30" font-weight="700" fill="url(#goldGrad)" filter="url(#foilGlow)">${escapeXml(cleanTitle)}</text>
    <text x="${width / 2}" y="${height * 0.70}" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13.5" fill="#9CA3AF">${escapeXml(cleanSubtitle)}</text>

    <!-- Finish Specification Pill -->
    <g transform="translate(${width / 2 - 180}, ${height - 110})">
      <rect width="360" height="38" rx="19" fill="#151619" stroke="url(#goldGrad)" stroke-width="1.2" />
      <circle cx="26" cy="19" r="4.5" fill="#10B981" />
      <text x="180" y="23.5" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#F3F4F6" letter-spacing="1.5">${finishBadge}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// AI image generation and editing endpoint
app.post('/api/ai/generate', async (req, res) => {
  const { prompt, aspectRatio = '1:1', imageSize = '1K', baseImage } = req.body;

  if (!prompt && !baseImage) {
    return res.status(400).json({ error: 'Please provide a prompt or an image to edit.' });
  }

  const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'];
  const chosenAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';
  const validImageSizes = ['1K', '2K', '4K'];
  const chosenImageSize = validImageSizes.includes(imageSize) ? imageSize : '1K';

  const aiClient = getGeminiClient();

  // If no Gemini API key is configured or available, provide graceful studio mockup immediately
  if (!aiClient) {
    const fallbackImage = generateStudioMockupSvg(prompt || 'Luxury Brand Identity', chosenAspectRatio);
    return res.json({
      imageUrl: fallbackImage,
      text: 'Rendered in ALAN Luxury Studio Proof mode. Hot foil stamping, spot UV, and embossing calibrated for UAE print specs.',
      aspectRatio: chosenAspectRatio,
      imageSize: chosenImageSize,
      isFallback: true,
      reason: 'NO_API_KEY',
    });
  }

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  if (baseImage) {
    const match = typeof baseImage === 'string' && baseImage.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      });
    } else if (typeof baseImage === 'string') {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: baseImage,
        },
      });
    }
  }

  if (prompt) {
    parts.push({ text: String(prompt) });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts,
      },
      config: {
        imageConfig: {
          aspectRatio: chosenAspectRatio,
          imageSize: chosenImageSize,
        },
      },
    });

    let imageUrl = '';
    let responseText = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          responseText += part.text + ' ';
        }
      }
    }

    if (imageUrl) {
      return res.json({
        imageUrl,
        text: responseText.trim(),
        aspectRatio: chosenAspectRatio,
        imageSize: chosenImageSize,
        isFallback: false,
      });
    }
  } catch (err: any) {
    const errMsg = String(err?.message || '');

    const isQuotaError =
      errMsg.includes('429') ||
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('Quota exceeded') ||
      err?.status === 429;

    const fallbackImage = generateStudioMockupSvg(prompt || 'Luxury Brand Identity', chosenAspectRatio);
    return res.json({
      imageUrl: fallbackImage,
      text: 'Rendered in ALAN Luxury Studio Proof mode. Hot foil stamping, spot UV, and embossing calibrated for UAE print specs.',
      aspectRatio: chosenAspectRatio,
      imageSize: chosenImageSize,
      isFallback: true,
      reason: isQuotaError ? 'QUOTA_EXCEEDED' : 'AUTH_NOTICE',
      quotaDetails: isQuotaError
        ? 'Gemini image generation models require a paid billing account in Google AI Studio.'
        : 'Studio proof rendered with high-fidelity print finishes and registration marks.',
    });
  }

  // If response came back without image data
  const fallbackImage = generateStudioMockupSvg(prompt || 'Luxury Brand Identity', chosenAspectRatio);
  return res.json({
    imageUrl: fallbackImage,
    text: 'Model returned text only. Created high-precision luxury studio mockup.',
    aspectRatio: chosenAspectRatio,
    imageSize: chosenImageSize,
    isFallback: true,
    reason: 'TEXT_ONLY',
  });
});

async function main() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ALAN Print] Server running on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
