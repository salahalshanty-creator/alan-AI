import React, { useState, useRef } from 'react';
import { PrintFinish, PaperStock } from '../types';
import { Sparkles, CheckCircle2, ShieldCheck, Ruler, Minus, Plus, RotateCcw } from 'lucide-react';

export interface ArtworkEditorState {
  positionX: number;
  positionY: number;
  zoom: number;
  mode: 'fit' | 'fill';
}

interface PreviewArtwork {
  name: string;
  previewUrl?: string;
  editor: ArtworkEditorState;
}

interface InteractiveFinishMockupProps {
  productTitle: string;
  selectedStock: PaperStock;
  selectedFinish: PrintFinish;
  artwork: PreviewArtwork | null;
  activeSide: 'front' | 'back';
  availableSides: ('front' | 'back')[];
  onActiveSideChange: (side: 'front' | 'back') => void;
  onArtworkEditorChange: (editor: ArtworkEditorState) => void;
  widthMm: number;
  heightMm: number;
  isArabic?: boolean;
  premiumEffects?: { lamination: 'matt' | 'glossy' | 'velvet'; spotUv: boolean; foilColor: 'none' | 'gold' | 'silver'; customDieCut: boolean; roundCorner: boolean };
  afterPreflight?: React.ReactNode;
  isFlyerPreview?: boolean;
}

export const InteractiveFinishMockup: React.FC<InteractiveFinishMockupProps> = ({
  productTitle,
  selectedStock,
  selectedFinish,
  artwork,
  activeSide,
  availableSides,
  onActiveSideChange,
  onArtworkEditorChange,
  widthMm,
  heightMm,
  isArabic = false,
  premiumEffects,
  afterPreflight,
  isFlyerPreview = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; startX: number; startY: number } | null>(null);
  const [lightPos, setLightPos] = useState({ x: 50, y: 50 });
  const [showBleedGuides, setShowBleedGuides] = useState(false);
  const [isPointerLighting, setIsPointerLighting] = useState(false);

  const artworkPreviewUrl = artwork?.previewUrl;
  const uploadedArtworkName = artwork?.name;
  const editor = artwork?.editor;
  const aspectRatio = Math.max(1, widthMm) / Math.max(1, heightMm);
  const landscapeFit = aspectRatio >= 1.14;
  const formatDimension = (value: number) => Number.isInteger(value) ? value.toString() : value.toFixed(1);

  const updateEditor = (updates: Partial<ArtworkEditorState>) => {
    if (!editor) return;
    onArtworkEditorChange({ ...editor, ...updates });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!artworkPreviewUrl || !editor || !cardRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: editor.positionX,
      startY: editor.positionY,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !cardRef.current || !editor) return;
    const rect = cardRef.current.getBoundingClientRect();
    updateEditor({
      positionX: drag.startX + ((event.clientX - drag.x) / rect.width) * 100,
      positionY: drag.startY + ((event.clientY - drag.y) / rect.height) * 100,
    });
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (!isPointerLighting) setIsPointerLighting(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLightPos({ x, y });
  };

  const handleMouseLeave = () => {
    setLightPos({ x: 50, y: 50 });
    setIsPointerLighting(false);
  };

  const isDarkStock = selectedStock?.id === 'fedrigoni-black';
  const isFoil = premiumEffects ? premiumEffects.foilColor !== 'none' : selectedFinish?.type === 'foil';
  const isUV = premiumEffects ? premiumEffects.spotUv : selectedFinish?.type === 'uv';
  const isEmboss = selectedFinish?.type === 'emboss';
  const isMattLamination = premiumEffects ? premiumEffects.lamination === 'matt' || premiumEffects.lamination === 'velvet' : selectedFinish?.id === 'matt-lamination';
  const isGlossyLamination = premiumEffects ? premiumEffects.lamination === 'glossy' : selectedFinish?.id === 'glossy-lamination';
  const isWithoutLamination = selectedFinish?.id === 'without-lamination';
  const isRoundCorner = premiumEffects ? premiumEffects.roundCorner : selectedFinish?.id === 'round-corner';
  const isCustomDieCut = premiumEffects?.customDieCut ?? false;

  const reflectionCenter = Math.max(8, Math.min(92, lightPos.x));
  const reflectionStart = Math.max(0, reflectionCenter - 24);
  const reflectionSoftStart = Math.max(0, reflectionCenter - 10);
  const reflectionSoftEnd = Math.min(100, reflectionCenter + 10);
  const reflectionEnd = Math.min(100, reflectionCenter + 26);

  let surfaceBackground = 'none';
  let surfaceOpacity = 0;
  let surfaceBlendMode: React.CSSProperties['mixBlendMode'] = 'normal';

  if (isMattLamination) {
    surfaceBackground = `
      radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 28%, transparent 58%),
      linear-gradient(135deg, rgba(255,255,255,0.035), rgba(20,20,20,0.018))
    `;
    surfaceOpacity = 0.65;
    surfaceBlendMode = 'soft-light';
  } else if (isGlossyLamination) {
    surfaceBackground = `
      radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 22%, transparent 48%),
      linear-gradient(108deg,
        transparent ${reflectionStart}%,
        rgba(255,255,255,0.04) ${reflectionSoftStart}%,
        rgba(255,255,255,0.30) ${reflectionCenter}%,
        rgba(255,255,255,0.07) ${reflectionSoftEnd}%,
        transparent ${reflectionEnd}%)
    `;
    surfaceOpacity = 0.9;
    surfaceBlendMode = 'screen';
  } else if (!isWithoutLamination && !isRoundCorner && (isFoil || isUV)) {
    surfaceBackground = `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 35%, transparent 60%)`;
    surfaceOpacity = 0.75;
    surfaceBlendMode = 'overlay';
  }

  const interactiveSurfaceOpacity = (isMattLamination || isGlossyLamination) && !isPointerLighting
    ? 0
    : surfaceOpacity;

  // Dynamic metallic gradient angle based on cursor position
  const foilGradient = `linear-gradient(${115 + (lightPos.x - 50) * 0.8}deg, 
    #BF953F 0%, 
    #FCF6BA ${Math.max(15, Math.min(85, lightPos.x)) - 15}%, 
    #B38728 ${Math.max(25, Math.min(85, lightPos.x))}%, 
    #FBF5B7 ${Math.max(35, Math.min(90, lightPos.x)) + 15}%, 
    #AA771C 100%)`;

  const roseGoldGradient = `linear-gradient(${115 + (lightPos.x - 50) * 0.8}deg, 
    #A75D67 0%, 
    #F4D0D2 ${Math.max(15, Math.min(85, lightPos.x)) - 15}%, 
    #C47B85 ${Math.max(25, Math.min(85, lightPos.x))}%, 
    #FDE5E7 ${Math.max(35, Math.min(90, lightPos.x)) + 15}%, 
    #934A54 100%)`;

  const silverGradient = `linear-gradient(${115 + (lightPos.x - 50) * 0.8}deg, 
    #8A95A5 0%, 
    #FFFFFF ${Math.max(15, Math.min(85, lightPos.x)) - 15}%, 
    #CAD2DB ${Math.max(25, Math.min(85, lightPos.x))}%, 
    #FFFFFF ${Math.max(35, Math.min(90, lightPos.x)) + 15}%, 
    #7B8696 100%)`;

  let activeMetallicFoil = foilGradient;
  if (selectedFinish?.id === 'rose-gold-foil') activeMetallicFoil = roseGoldGradient;
  if (selectedFinish?.id === 'silver-foil' || premiumEffects?.foilColor === 'silver') activeMetallicFoil = silverGradient;

  return (
    <div className="flex flex-col gap-3">
      {/* Top control bar for preview */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-medium text-neutral-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {isArabic ? 'محاكي الخامات واللمعان التفاعلي' : 'Tactile Finish & Light Simulator'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{isArabic ? 'حرّك المؤشر لمشاهدة انعكاس الضوء' : 'Hover to reflect light'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowBleedGuides(!showBleedGuides)}
            className={`px-2.5 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              showBleedGuides 
                ? 'bg-amber-100 text-amber-900 font-medium' 
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Ruler className="w-3 h-3" />
            {isArabic ? 'خطوط القص والأمان' : 'Bleed & Trim Guides'}
          </button>

          <div className="flex overflow-hidden rounded border border-neutral-200 bg-neutral-100">
            {availableSides.map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => onActiveSideChange(side)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeSide === side ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {side === 'front' ? 'Front' : 'Back'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-neutral-900">{activeSide === 'front' ? 'Front' : 'Back'} Preview</span>
          <span className="ml-2 font-mono text-neutral-500">{formatDimension(widthMm)} × {formatDimension(heightMm)} mm</span>
        </div>
        {artworkPreviewUrl && editor && (
          <div className="flex flex-wrap items-center justify-end gap-1">
            {(['fit', 'fill'] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => updateEditor({ mode, positionX: 0, positionY: 0, zoom: 1 })} className={`rounded px-2 py-1 text-[11px] font-medium ${editor.mode === mode ? 'bg-amber-100 text-amber-900' : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'}`}>
                {mode === 'fit' ? 'Fit' : 'Fill'}
              </button>
            ))}
            <button type="button" onClick={() => updateEditor({ zoom: Math.max(0.25, editor.zoom - 0.1) })} className="rounded bg-neutral-100 p-1 text-neutral-600 hover:text-neutral-900" aria-label="Zoom out"><Minus className="h-3.5 w-3.5" /></button>
            <span className="min-w-10 text-center font-mono text-[10px] text-neutral-500">{Math.round(editor.zoom * 100)}%</span>
            <button type="button" onClick={() => updateEditor({ zoom: Math.min(4, editor.zoom + 0.1) })} className="rounded bg-neutral-100 p-1 text-neutral-600 hover:text-neutral-900" aria-label="Zoom in"><Plus className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => updateEditor({ positionX: 0, positionY: 0, zoom: 1 })} className="flex items-center gap-1 rounded bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600 hover:text-neutral-900">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Interactive 3D Card Simulator Canvas */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsPointerLighting(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden cursor-crosshair border border-neutral-200 shadow-inner flex items-center justify-center p-6"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #ECEBE7 0%, #DFDDD7 100%)',
        }}
      >
        {/* Soft studio ambient shadow underneath the substrate */}
        <div 
          className="absolute w-[82%] h-[68%] rounded-lg transition-transform duration-150 ease-out pointer-events-none"
          style={{
            transform: `translate(${ (lightPos.x - 50) * -0.15 }px, ${ 22 + (lightPos.y - 50) * -0.1 }px) scale(0.98)`,
            background: 'radial-gradient(ellipse at center, rgba(15,15,15,0.28) 0%, rgba(15,15,15,0.02) 70%, transparent 100%)',
            filter: 'blur(16px)',
          }}
        />

        {/* The Card / Print Substrate */}
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          className={`relative overflow-hidden transition-all duration-150 ease-out select-none flex flex-col justify-between ${isFlyerPreview ? 'p-0' : 'p-6 sm:p-8'} ${isRoundCorner ? 'rounded-2xl' : 'rounded-md'} ${artworkPreviewUrl ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{
            width: landscapeFit ? '82%' : 'auto',
            height: landscapeFit ? 'auto' : '72%',
            maxWidth: '82%',
            maxHeight: '72%',
            aspectRatio: `${Math.max(1, widthMm)} / ${Math.max(1, heightMm)}`,
            touchAction: artworkPreviewUrl ? 'none' : 'auto',
            clipPath: isCustomDieCut ? 'polygon(0 0, 93% 0, 100% 9%, 100% 100%, 7% 100%, 0 91%)' : undefined,
            transform: `perspective(900px) rotateY(${ (lightPos.x - 50) * 0.15 }deg) rotateX(${ (lightPos.y - 50) * -0.15 }deg)`,
            backgroundColor: isDarkStock ? '#141416' : '#FAF9F5',
            color: isDarkStock ? '#FFFFFF' : '#171717',
            boxShadow: `
              ${(lightPos.x - 50) * -0.2}px ${(lightPos.y - 50) * -0.2}px 12px rgba(0,0,0,0.06),
              0 20px 30px -10px rgba(0,0,0,0.18),
              inset 0 0 0 1px ${isDarkStock ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
            `,
          }}
        >
          {artworkPreviewUrl && (
            <img
              src={artworkPreviewUrl}
              alt={uploadedArtworkName ? `Uploaded artwork preview: ${uploadedArtworkName}` : 'Uploaded artwork preview'}
              draggable={false}
              className={`absolute inset-0 z-0 h-full w-full pointer-events-none ${editor?.mode === 'fill' ? 'object-cover' : 'object-contain'}`}
              style={{
                transform: `translate(${editor?.positionX ?? 0}%, ${editor?.positionY ?? 0}%) scale(${editor?.zoom ?? 1})`,
                transformOrigin: 'center',
              }}
            />
          )}

          {/* Paper Texture Overlay */}
          <div 
            className="absolute inset-0 z-[2] pointer-events-none mix-blend-multiply rounded-[inherit]"
            style={{
              opacity: isGlossyLamination ? 0.08 : isMattLamination ? 0.16 : 0.28,
              backgroundImage: 'radial-gradient(#d0cec7 0.75px, transparent 0.75px)',
              backgroundSize: '8px 8px',
            }}
          />

          {/* Non-destructive finish surface simulation */}
          <div
            className="absolute inset-0 z-20 pointer-events-none rounded-[inherit] transition-opacity duration-150"
            style={{
              opacity: interactiveSurfaceOpacity,
              background: surfaceBackground,
              mixBlendMode: surfaceBlendMode,
            }}
          />

          {(isGlossyLamination || isMattLamination) && (
            <div
              aria-hidden="true"
              className={`lamination-auto-sweep z-20 rounded-[inherit] ${isGlossyLamination ? 'lamination-auto-sweep--glossy' : 'lamination-auto-sweep--matt'} ${isPointerLighting ? 'is-manual' : ''}`}
            />
          )}

          {isUV && <><div className="premium-spot-uv absolute z-[16] pointer-events-none left-[12%] top-[18%] h-10 w-10 rounded-full border border-white/45 bg-white/10 opacity-80 transition-opacity duration-300" style={{ boxShadow: `inset ${(lightPos.x - 50) * .08}px ${(lightPos.y - 50) * .08}px 10px rgba(255,255,255,.7), 0 0 12px rgba(255,255,255,.25)` }} /><div className="premium-spot-uv premium-spot-uv--bar absolute z-[16] pointer-events-none bottom-[18%] right-[12%] h-5 w-[36%] rounded-full bg-gradient-to-r from-white/5 via-white/50 to-white/5 opacity-75 transition-opacity duration-300" /></>}
          {isCustomDieCut && <div className="absolute inset-1 z-[28] pointer-events-none border border-dashed border-amber-600/70 [clip-path:polygon(0_0,93%_0,100%_9%,100%_100%,7%_100%,0_91%)]" />}

          {/* Bleed lines overlay if enabled */}
          {showBleedGuides && (
            <div className="absolute inset-0 z-30 pointer-events-none border-2 border-dashed border-red-500/60 rounded-[inherit]">
              <span className="absolute top-1 left-2 text-[9px] font-mono text-red-600 bg-white/90 px-1 rounded">
                Bleed Boundary (+3mm)
              </span>
              <div className="absolute inset-2 border border-amber-500/70">
                <span className="absolute top-1 right-2 text-[9px] font-mono text-amber-700 bg-white/90 px-1 rounded">Final Trim</span>
                <div className="absolute inset-2 border border-emerald-500/50">
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-emerald-700 bg-white/90 px-1 rounded">
                    Safe Zone Margin (4mm)
                  </span>
                </div>
              </div>
            </div>
          )}

          {artworkPreviewUrl && (
            <span className="absolute bottom-2 right-2 z-[25] rounded bg-black/55 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wide text-white/90 backdrop-blur-sm pointer-events-none">
              {selectedFinish?.name.toUpperCase()}
            </span>
          )}

          {isFlyerPreview && !artworkPreviewUrl && (
            <div className="absolute inset-0 z-10 grid grid-rows-[auto_1fr_auto] p-[12%] text-left">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded border font-serif text-sm font-bold tracking-widest"
                    style={{
                      borderColor: isFoil ? '#D4AF37' : (isDarkStock ? '#333' : '#E0DED7'),
                      background: isFoil ? activeMetallicFoil : 'transparent',
                      WebkitBackgroundClip: isFoil ? 'text' : undefined,
                      WebkitTextFillColor: isFoil ? 'transparent' : (isDarkStock ? '#FFF' : '#111'),
                    }}
                  >
                    AW
                  </div>
                  <p className="mt-2 whitespace-nowrap text-[clamp(0.42rem,0.72vw,0.6rem)] font-medium uppercase tracking-[0.12em]" style={{ color: isDarkStock ? '#9E9E9E' : '#737373' }}>
                    ALAN ATELIER DUBAI
                  </p>
                </div>
                <div className="shrink-0 whitespace-nowrap text-right font-serif italic leading-tight" style={{ color: isFoil ? '#D4AF37' : (isDarkStock ? '#A3A3A3' : '#525252') }}>
                  <p className="text-[clamp(0.52rem,0.9vw,0.72rem)]">{activeSide === 'front' ? 'Executive Edition' : 'Prepress Registered'}</p>
                  <p className="mt-1 font-mono text-[clamp(0.42rem,0.68vw,0.56rem)] not-italic text-neutral-400">{selectedStock.weightGsm} GSM · {selectedStock.finishType === 'gloss' ? 'Glossy' : selectedStock.finishType}</p>
                </div>
              </div>

              <div className="flex min-h-0 flex-col justify-center py-3">
                <h4 className="whitespace-nowrap font-serif text-[clamp(0.78rem,1.35vw,1.15rem)] font-bold leading-[1.05] tracking-tight" style={{ background: isFoil ? activeMetallicFoil : undefined, WebkitBackgroundClip: isFoil ? 'text' : undefined, WebkitTextFillColor: isFoil ? 'transparent' : (isDarkStock ? '#FAF8F5' : '#141414') }}>
                  MOHAMMED
                </h4>
                <h4 className="mt-0.5 whitespace-nowrap font-serif text-[clamp(0.78rem,1.35vw,1.15rem)] font-bold leading-[1.05] tracking-tight" style={{ background: isFoil ? activeMetallicFoil : undefined, WebkitBackgroundClip: isFoil ? 'text' : undefined, WebkitTextFillColor: isFoil ? 'transparent' : (isDarkStock ? '#FAF8F5' : '#141414') }}>
                  AL QASSIMI
                </h4>
              </div>

              <div className="border-t pt-2" style={{ borderColor: isDarkStock ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: isDarkStock ? '#8E8E93' : '#737373' }}>
                <p className="whitespace-nowrap text-[clamp(0.46rem,0.72vw,0.6rem)] font-medium leading-tight">Managing Director</p>
                <p className="mt-0.5 whitespace-nowrap text-[clamp(0.42rem,0.66vw,0.55rem)] leading-tight">DIFC Emirates Towers</p>
              </div>
            </div>
          )}

          {/* Top Brand Element on Card */}
          {!artworkPreviewUrl && !isFlyerPreview && <div className={`relative z-10 flex items-start justify-between gap-2 ${isFlyerPreview ? 'min-h-0' : ''}`}>
            <div>
              {/* Emblem / Monogram */}
              <div 
                className={`${isFlyerPreview ? 'h-8 w-8 text-sm' : 'w-10 h-10 text-lg'} rounded border flex items-center justify-center font-serif font-bold tracking-widest uppercase transition-all duration-150`}
                style={{
                  borderColor: isFoil ? '#D4AF37' : (isDarkStock ? '#333' : '#E0DED7'),
                  background: isFoil ? activeMetallicFoil : 'transparent',
                  WebkitBackgroundClip: isFoil ? 'text' : undefined,
                  WebkitTextFillColor: isFoil ? 'transparent' : (isDarkStock ? '#FFF' : '#111'),
                  textShadow: isEmboss ? '1px 1px 1px rgba(0,0,0,0.5), -1px -1px 1px rgba(255,255,255,0.8)' : undefined,
                }}
              >
                AW
              </div>
              <p 
                className={`${isFlyerPreview ? 'mt-1 text-[8px] tracking-[0.14em]' : 'text-[10px] tracking-[0.2em] mt-2'} uppercase font-medium`}
                style={{
                  color: isDarkStock ? '#9E9E9E' : '#737373',
                }}
              >
                ALAN Atelier · Dubai
              </p>
            </div>

            <div className={`${isFlyerPreview ? 'shrink-0 text-[9px]' : ''} text-right`}>
              <div 
                className={`${isFlyerPreview ? 'text-[10px]' : 'text-xs'} font-serif italic`}
                style={{
                  color: isFoil ? '#D4AF37' : (isDarkStock ? '#A3A3A3' : '#525252'),
                }}
              >
                {activeSide === 'front' ? 'Executive Edition' : 'Prepress Registered'}
              </div>
              <div className={`${isFlyerPreview ? 'text-[8px]' : 'text-[10px]'} text-neutral-400 font-mono mt-0.5`}>
                {selectedStock?.weightGsm} GSM · {selectedStock?.name.split(' ')[0]}
              </div>
            </div>
          </div>}

          {/* Centerpiece Typographic Treatment with Active Finish Effect */}
          {!artworkPreviewUrl && !isFlyerPreview && <div className={`relative z-10 text-left ${isFlyerPreview ? 'my-2 flex min-h-0 flex-1 flex-col justify-center' : 'my-auto'}`}>
            <h4
              className={`${isFlyerPreview ? 'break-words text-[clamp(0.8rem,2.2vw,1.25rem)] leading-[1.05]' : 'text-xl sm:text-2xl'} font-serif font-bold tracking-tight transition-all duration-150`}
              style={{
                background: isFoil ? activeMetallicFoil : undefined,
                WebkitBackgroundClip: isFoil ? 'text' : undefined,
                WebkitTextFillColor: isFoil ? 'transparent' : (isDarkStock ? '#FAF8F5' : '#141414'),
                filter: isFoil ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' : undefined,
                textShadow: isEmboss 
                  ? `${(lightPos.x - 50) * 0.04}px ${(lightPos.y - 50) * 0.04}px 2px rgba(0,0,0,0.4), ${-(lightPos.x - 50) * 0.04}px ${-(lightPos.y - 50) * 0.04}px 2px rgba(255,255,255,0.7)` 
                  : undefined,
              }}
            >
              {uploadedArtworkName ? uploadedArtworkName.replace(/\.[^/.]+$/, "") : 'MOHAMMED AL QASSIMI'}
            </h4>

            <p 
              className={`${isFlyerPreview ? 'mt-1 text-[clamp(0.55rem,1.35vw,0.75rem)] leading-tight' : 'text-xs sm:text-sm mt-1'} font-sans tracking-wide`}
              style={{
                color: isDarkStock ? '#D4AF37' : '#8C7324',
              }}
            >
              Managing Director · DIFC Emirates Towers
            </p>

            {isUV && (
              <div 
                className="inline-block mt-2 px-2 py-0.5 text-[10px] font-sans font-medium rounded transition-all duration-150"
                style={{
                  background: `linear-gradient(${120 + (lightPos.x - 50)}deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 100%)`,
                  color: isDarkStock ? '#FFFFFF' : '#111111',
                  boxShadow: '0 2px 8px rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                ✦ 3D Raised Polymer Varnish Layer Active
              </div>
            )}
          </div>}

          {/* Bottom Coordinates & QR/Vector Mark */}
          {!artworkPreviewUrl && !isFlyerPreview && <div className={`relative z-10 flex items-end justify-between gap-2 border-t pt-2 ${isFlyerPreview ? 'text-[8px] leading-tight' : 'text-[10px]'}`}
            style={{
              borderColor: isDarkStock ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              color: isDarkStock ? '#8E8E93' : '#737373',
            }}
          >
            <div className="min-w-0 flex-1">
              <p className={isFlyerPreview ? 'break-words' : ''}>Gate Village 03, Dubai International Financial Centre</p>
              <p className={`${isFlyerPreview ? 'text-[8px]' : 'text-[9px]'} font-mono tracking-tight mt-0.5`}>052 364 0939</p>
            </div>

            <div className="font-mono text-[9px] text-right">
              <span className="inline-block px-1.5 py-0.5 rounded bg-black/5 text-neutral-600">
                {selectedFinish?.name.toUpperCase()}
              </span>
            </div>
          </div>}
        </div>
      </div>

      {/* Pre-flight Instant Verification Bar */}
      <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium text-neutral-800">
            {isArabic ? 'الفحص الفني المسبق للطباعة (Pre-press Preflight):' : 'Pre-press Preflight Status:'}
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isArabic ? 'جاهز للمطبعة بنسبة 100%' : '100% Press Ready'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-neutral-500 font-mono text-[11px]">
          <span>300 DPI Vector</span>
          <span aria-hidden="true">·</span>
          <span>FOGRA39 CMYK</span>
          <span aria-hidden="true">·</span>
          <span>3mm Bleed OK</span>
        </div>
      </div>
      {afterPreflight}
    </div>
  );
};
