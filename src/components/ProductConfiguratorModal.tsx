import React, { useState, useEffect, useRef } from 'react';
import { Product, PaperStock, PrintFinish, PrintSize, TurnaroundSpeed, CartItem, PrintedSide } from '../types';
import { calculateCustomPrice, formatAED } from '../utils/pricing';
import {
  getPremiumBusinessCardCompatibility,
  normalizePremiumBusinessCardConfiguration,
  PremiumLamination,
} from '../utils/premiumBusinessCardCompatibility';
import { InteractiveFinishMockup, ArtworkEditorState } from './InteractiveFinishMockup';
import { BusinessCardArtworkGuide } from './BusinessCardArtworkGuide';
import { 
  X, 
  Upload, 
  Clock, 
  Check, 
  FileText, 
  Sparkles,
  ShoppingBag,
  Sliders,
  Scissors,
  Layers,
  Zap,
  Info
  , ChevronDown
} from 'lucide-react';

interface ProductConfiguratorModalProps {
  product: Product | null;
  initialStockId?: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  isArabic?: boolean;
}

interface ArtworkFile {
  name: string;
  size: string;
  status: string;
  previewUrl?: string;
  editor: ArtworkEditorState;
}

const ARTWORK_FILE_TYPES = '.pdf,.ai,.eps,.psd,.tif,.tiff,.png,.jpg,.jpeg,.webp';
const DEFAULT_ARTWORK_EDITOR: ArtworkEditorState = {
  positionX: 0,
  positionY: 0,
  zoom: 1,
  mode: 'fit',
};
const PREMIUM_LAMINATION_OPTIONS = [
  { id: 'matt', label: 'Matt Lamination' },
  { id: 'glossy', label: 'Glossy Lamination' },
  { id: 'velvet', label: 'Velvet Lamination' },
] as const;

export const ProductConfiguratorModal: React.FC<ProductConfiguratorModalProps> = ({
  product,
  initialStockId,
  isOpen,
  onClose,
  onAddToCart,
  isArabic = false,
}) => {
  if (!isOpen || !product) return null;
  const supportsArtworkOnBothSides = Boolean(product.printedSideOptions) || product.id === 'premium-marketing-flyers';

  const getInitialStock = (p: Product) => {
    if (initialStockId) {
      const match = p.availableStocks.find(s => s.id === initialStockId);
      if (match) return match;
    }
    return p.availableStocks[0];
  };

  // Defaults
  const [selectedStock, setSelectedStock] = useState<PaperStock>(
    getInitialStock(product)
  );
  const [selectedFinish, setSelectedFinish] = useState<PrintFinish>(
    product.availableFinishes[0]
  );
  const [roundCorner, setRoundCorner] = useState(false);
  const [premiumFinishSelections, setPremiumFinishSelections] = useState({ spotUv: false, customDieCut: false, roundCorner: false });
  const [foilColor, setFoilColor] = useState<'none' | 'gold' | 'silver'>('none');
  const [premiumLamination, setPremiumLamination] = useState<PremiumLamination>('matt');
  const [dieCutReference, setDieCutReference] = useState<{ name: string; type: string } | undefined>();
  const [selectedSize, setSelectedSize] = useState<PrintSize>(
    product.availableSizes[0]
  );
  const [selectedPrintedSides, setSelectedPrintedSides] = useState<PrintedSide[]>(
    product.printedSideOptions?.map((option) => option.id) ?? (supportsArtworkOnBothSides ? ['front', 'back'] : [])
  );

  // Custom dimension controls if custom size is picked
  const [isCustomDimension, setIsCustomDimension] = useState<boolean>(false);
  const [customWidthMm, setCustomWidthMm] = useState<number>(148);
  const [customHeightMm, setCustomHeightMm] = useState<number>(210);
  const [customUnit, setCustomUnit] = useState<'mm' | 'cm'>('mm');

  // Quantity controls
  const [quantity, setQuantity] = useState<number>(product.minQty);
  const [isCustomQtyMode, setIsCustomQtyMode] = useState<boolean>(false);

  // Speed & Artwork
  const [turnaroundSpeed, setTurnaroundSpeed] = useState<TurnaroundSpeed>('standard');
  const [frontArtwork, setFrontArtwork] = useState<ArtworkFile | null>(null);
  const [backArtwork, setBackArtwork] = useState<ArtworkFile | null>(null);
  const [activePreviewSide, setActivePreviewSide] = useState<PrintedSide>('front');
  const artworkObjectUrlRefs = useRef<Record<PrintedSide, string | null>>({ front: null, back: null });
  const [customNotes, setCustomNotes] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showArtworkGuide, setShowArtworkGuide] = useState(false);

  const replaceArtworkObjectUrl = (side: PrintedSide, nextUrl: string | null) => {
    if (artworkObjectUrlRefs.current[side]) {
      URL.revokeObjectURL(artworkObjectUrlRefs.current[side]!);
    }
    artworkObjectUrlRefs.current[side] = nextUrl;
  };

  useEffect(() => () => {
    (['front', 'back'] as PrintedSide[]).forEach((side) => {
      if (artworkObjectUrlRefs.current[side]) URL.revokeObjectURL(artworkObjectUrlRefs.current[side]!);
      artworkObjectUrlRefs.current[side] = null;
    });
  }, []);

  // Reset when product changes
  useEffect(() => {
    if (product) {
      setSelectedStock(getInitialStock(product));
      setSelectedFinish(product.availableFinishes[0]);
      setRoundCorner(false);
      setPremiumFinishSelections({ spotUv: false, customDieCut: false, roundCorner: false });
      setFoilColor('none');
      setPremiumLamination('matt');
      setDieCutReference(undefined);
      setSelectedSize(product.availableSizes[0]);
      setSelectedPrintedSides(product.printedSideOptions?.map((option) => option.id) ?? (supportsArtworkOnBothSides ? ['front', 'back'] : []));
      setIsCustomDimension(product.availableSizes[0].isCustom || false);
      setQuantity(product.minQty);
      setIsCustomQtyMode(false);
      replaceArtworkObjectUrl('front', null);
      replaceArtworkObjectUrl('back', null);
      setFrontArtwork(null);
      setBackArtwork(null);
      setActivePreviewSide('front');
      setCustomNotes('');
    }
  }, [product]);

  const handleSizeSelect = (size: PrintSize) => {
    setSelectedSize(size);
    if (size.isCustom) {
      setIsCustomDimension(true);
      if (size.widthMm) setCustomWidthMm(size.widthMm);
      if (size.heightMm) setCustomHeightMm(size.heightMm);
    } else {
      setIsCustomDimension(false);
    }
  };

  const togglePrintedSide = (side: PrintedSide) => {
    setSelectedPrintedSides((current) => {
      if (current.includes(side)) {
        return current.length === 1 ? current : current.filter((item) => item !== side);
      }
      return [...current, side];
    });
  };

  const availableArtworkSides: PrintedSide[] = supportsArtworkOnBothSides
    ? selectedPrintedSides
    : ['front'];

  useEffect(() => {
    if (!availableArtworkSides.includes(activePreviewSide)) {
      setActivePreviewSide(availableArtworkSides[0] ?? 'front');
    }
  }, [activePreviewSide, selectedPrintedSides]);

  const physicalWidthMm = isCustomDimension
    ? customWidthMm * (customUnit === 'cm' ? 10 : 1)
    : selectedSize.widthMm ?? 90;
  const physicalHeightMm = isCustomDimension
    ? customHeightMm * (customUnit === 'cm' ? 10 : 1)
    : selectedSize.heightMm ?? 50;
  const isNormalBusinessCards = product.id === 'royal-foil-business-cards';
  const isPremiumBusinessCards = product.id === 'recycled-cotton-letterpress-cards';
  const premiumCompatibility = getPremiumBusinessCardCompatibility(selectedStock.id);
  const normalizedPremiumConfiguration = normalizePremiumBusinessCardConfiguration({
    stockId: selectedStock.id,
    lamination: premiumLamination,
    finishes: premiumFinishSelections,
    foilColor,
  });

  useEffect(() => {
    if (!isPremiumBusinessCards) return;

    const normalized = normalizePremiumBusinessCardConfiguration({
      stockId: selectedStock.id,
      lamination: premiumLamination,
      finishes: premiumFinishSelections,
      foilColor,
    });
    if (normalized.lamination !== premiumLamination) setPremiumLamination(normalized.lamination);
    if (
      normalized.finishes.spotUv !== premiumFinishSelections.spotUv ||
      normalized.finishes.customDieCut !== premiumFinishSelections.customDieCut ||
      normalized.finishes.roundCorner !== premiumFinishSelections.roundCorner
    ) setPremiumFinishSelections(normalized.finishes);
    if (normalized.foilColor !== foilColor) setFoilColor(normalized.foilColor);
  }, [isPremiumBusinessCards, selectedStock.id, premiumLamination, premiumFinishSelections, foilColor]);

  const handleStockSelect = (stock: PaperStock) => {
    setSelectedStock(stock);
    if (!isPremiumBusinessCards) return;
    const normalized = normalizePremiumBusinessCardConfiguration({
      stockId: stock.id,
      lamination: premiumLamination,
      finishes: premiumFinishSelections,
      foilColor,
    });
    setPremiumLamination(normalized.lamination);
    setPremiumFinishSelections(normalized.finishes);
    setFoilColor(normalized.foilColor);
  };
  const roundCornerFinish = product.availableFinishes.find((finish) => finish.id === 'round-corner');
  const selectedFinishes = isPremiumBusinessCards
    ? product.availableFinishes.filter((finish) =>
      (finish.id === 'spot-uv' && normalizedPremiumConfiguration.finishes.spotUv) ||
      (finish.id === 'gold-hot-foil' && normalizedPremiumConfiguration.foilColor !== 'none') ||
      (finish.id === 'custom-die-cut' && normalizedPremiumConfiguration.finishes.customDieCut),
    )
    : roundCorner && roundCornerFinish ? [selectedFinish, roundCornerFinish] : [selectedFinish];
  const quantityOptions = isNormalBusinessCards
    ? [500, 1000, 2000, 5000].map((qty) => ({
        qty,
        discountPercentage: [...product.quantityTiers].sort((a, b) => b.qty - a.qty).find((tier) => qty >= tier.qty)?.discountPercentage ?? 0,
      }))
    : product.quantityTiers;

  // Compute live price
  const priceData = calculateCustomPrice({
    product,
    quantity,
    selectedStock,
    selectedFinish,
    selectedFinishes,
    selectedSize,
    turnaroundSpeed,
    customWidthMm: isCustomDimension ? (customUnit === 'cm' ? customWidthMm * 10 : customWidthMm) : undefined,
    customHeightMm: isCustomDimension ? (customUnit === 'cm' ? customHeightMm * 10 : customHeightMm) : undefined,
  });

  const handleFileUpload = (side: PrintedSide, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const canPreviewInBrowser =
        file.type === 'image/png' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/webp' ||
        extension === 'png' ||
        extension === 'jpg' ||
        extension === 'jpeg' ||
        extension === 'webp';
      const previewUrl = canPreviewInBrowser ? URL.createObjectURL(file) : undefined;

      replaceArtworkObjectUrl(side, previewUrl ?? null);
      const nextArtwork: ArtworkFile = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: 'Vector Bleed & 300 DPI Verified',
        previewUrl,
        editor: { ...DEFAULT_ARTWORK_EDITOR },
      };
      if (side === 'front') setFrontArtwork(nextArtwork);
      else setBackArtwork(nextArtwork);
      setActivePreviewSide(side);

      e.target.value = '';
    }
  };

  const handleRemoveArtwork = (side: PrintedSide) => {
    replaceArtworkObjectUrl(side, null);
    if (side === 'front') setFrontArtwork(null);
    else setBackArtwork(null);
  };

  const updateActiveArtworkEditor = (editor: ArtworkEditorState) => {
    const updateArtwork = (current: ArtworkFile | null) => current ? { ...current, editor } : current;
    if (activePreviewSide === 'front') setFrontArtwork(updateArtwork);
    else setBackArtwork(updateArtwork);
  };

  const activeArtwork = activePreviewSide === 'front' ? frontArtwork : backArtwork;

  const handleAddToCartClick = () => {
    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      quantity,
      selectedStock,
      selectedFinish: selectedFinishes[0] ?? selectedFinish,
      selectedFinishes,
      spotUv: isPremiumBusinessCards ? normalizedPremiumConfiguration.finishes.spotUv : undefined,
      hotFoil: isPremiumBusinessCards ? normalizedPremiumConfiguration.foilColor !== 'none' : undefined,
      foilColor: isPremiumBusinessCards ? normalizedPremiumConfiguration.foilColor : undefined,
      customDieCut: isPremiumBusinessCards ? normalizedPremiumConfiguration.finishes.customDieCut : undefined,
      lamination: isPremiumBusinessCards ? normalizedPremiumConfiguration.lamination : undefined,
      roundCorner: isPremiumBusinessCards ? normalizedPremiumConfiguration.finishes.roundCorner : undefined,
      dieCutReference: isPremiumBusinessCards && normalizedPremiumConfiguration.finishes.customDieCut ? dieCutReference : undefined,
      selectedSize: isCustomDimension
        ? {
            ...selectedSize,
            isCustom: true,
            dimensions: `${customWidthMm} × ${customHeightMm} ${customUnit}`,
            label: `Custom Size (${customWidthMm} × ${customHeightMm} ${customUnit})`,
          }
        : selectedSize,
      printedSides: supportsArtworkOnBothSides ? selectedPrintedSides : undefined,
      customDimensions: isCustomDimension
        ? {
            width: customWidthMm,
            height: customHeightMm,
            unit: customUnit,
          }
        : undefined,
      turnaroundSpeed,
      artworkFileName: [frontArtwork?.name, backArtwork?.name].filter(Boolean).join(' / ') || undefined,
      preflightPassed: true,
      customNotes,
      unitPriceAED: priceData.unitPriceAED,
      totalPriceAED: priceData.totalAED,
    };

    onAddToCart(cartItem);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative flex w-full max-w-[1560px] max-h-[94vh] flex-col bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-3 sm:my-4 transition-all lg:w-[96vw]"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header bar */}
        <div className="shrink-0 px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <span className="text-amber-800 font-semibold">{isArabic ? product.categoryNameAr : product.categoryName}</span>
              <span aria-hidden="true">·</span>
              <span>{isArabic ? 'تخصيص الورق، المقاسات والتشطيب الفاخر' : 'Custom Specifications Configurator'}</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900 mt-0.5">
              {isArabic ? product.titleAr : product.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body grid: Left = Visual Preview & Artwork, Right = Controls & Live Price */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-6 p-6 border-b lg:border-b-0 lg:border-r border-neutral-200 bg-[#FDFDFD] flex flex-col gap-6">
            <InteractiveFinishMockup
              productTitle={product.title}
              selectedStock={selectedStock}
              selectedFinish={selectedFinish}
              premiumEffects={isPremiumBusinessCards ? { lamination: normalizedPremiumConfiguration.lamination, spotUv: normalizedPremiumConfiguration.finishes.spotUv, foilColor: normalizedPremiumConfiguration.foilColor, customDieCut: normalizedPremiumConfiguration.finishes.customDieCut, roundCorner: normalizedPremiumConfiguration.finishes.roundCorner } : undefined}
              artwork={activeArtwork}
              activeSide={activePreviewSide}
              availableSides={availableArtworkSides}
              onActiveSideChange={setActivePreviewSide}
              onArtworkEditorChange={updateActiveArtworkEditor}
              widthMm={physicalWidthMm}
              heightMm={physicalHeightMm}
              isArabic={isArabic}
              isFlyerPreview={product.id === 'premium-marketing-flyers'}
              afterPreflight={isPremiumBusinessCards ? <div title={!premiumCompatibility.customDieCut ? 'Not available with PET 760MIC' : undefined} className={`rounded-xl border p-3 shadow-xs transition-opacity ${normalizedPremiumConfiguration.finishes.customDieCut ? 'border-neutral-200 bg-white' : 'border-neutral-200 bg-neutral-50 opacity-60'}`}>
                <div className="flex items-start justify-between gap-3"><div><span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900"><Scissors className="h-3.5 w-3.5 text-neutral-600" />Custom Die Cut Design</span><p className="mt-1 text-[11px] leading-relaxed text-neutral-500">Upload the cutting shape/reference for your custom die-cut.</p></div>{dieCutReference && <button type="button" onClick={() => setDieCutReference(undefined)} disabled={!premiumFinishSelections.customDieCut} className="text-[10px] text-neutral-400 hover:text-neutral-700 disabled:cursor-not-allowed">Remove</button>}</div>
                {dieCutReference ? <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-2"><span className="min-w-0 truncate text-[11px] font-medium text-emerald-950">✓ {dieCutReference.name}<small className="ml-1 text-emerald-700">{dieCutReference.type}</small></span><label className={`ml-2 shrink-0 text-[10px] font-medium ${premiumFinishSelections.customDieCut ? 'cursor-pointer text-emerald-700 hover:text-emerald-900' : 'cursor-not-allowed text-neutral-400'}`}>Replace<input type="file" disabled={!premiumFinishSelections.customDieCut} className="hidden" accept=".pdf,.svg,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; if (file) setDieCutReference({ name: file.name, type: file.type || file.name.split('.').pop() || 'unknown' }); event.target.value = ''; }} /></label></div> : <label className={`mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-[11px] font-medium ${premiumFinishSelections.customDieCut ? 'cursor-pointer border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-amber-500' : 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'}`}><Upload className="h-3.5 w-3.5" />{premiumFinishSelections.customDieCut ? 'Upload Die-Cut Design' : 'Enable Custom Die Cut to upload a die-cut design.'}<input type="file" disabled={!premiumFinishSelections.customDieCut} className="hidden" accept=".pdf,.svg,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0]; if (file) setDieCutReference({ name: file.name, type: file.type || file.name.split('.').pop() || 'unknown' }); event.target.value = ''; }} /></label>}
                <p className="mt-1.5 text-[10px] text-neutral-500">Accepted formats: PDF · SVG · PNG · JPG/JPEG</p>
              </div> : undefined}
            />

            {/* Artwork Upload & Pre-flight Module */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-neutral-600" />
                  {isArabic ? 'رفع ملف التصميم (Artwork & Dielines)' : 'Upload Artwork & Prepress Check'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowArtworkGuide(true)}
                  className="flex items-center gap-1 text-xs font-medium text-amber-700 underline hover:text-amber-800"
                >
                  <FileText className="h-3.5 w-3.5" /> Guide
                </button>
              </div>

              <div className="space-y-3">
                {availableArtworkSides.map((side) => {
                  const artwork = side === 'front' ? frontArtwork : backArtwork;
                  const sideLabel = side === 'front' ? 'Front' : 'Back';
                  return (
                    <div key={side} className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">{sideLabel} Artwork</div>
                      {artwork ? (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between">
                          <button type="button" onClick={() => setActivePreviewSide(side)} className="flex min-w-0 items-center gap-2.5 text-left">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              <span className="block text-xs font-medium text-emerald-950 truncate">{artwork.name}</span>
                              <span className="block text-[11px] text-emerald-700">{artwork.size} · {artwork.status}</span>
                            </span>
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <label className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 cursor-pointer px-1.5 py-1">
                              Replace
                              <input type="file" className="hidden" accept={ARTWORK_FILE_TYPES} onChange={(event) => handleFileUpload(side, event)} />
                            </label>
                            <button type="button" onClick={() => handleRemoveArtwork(side)} className="text-xs text-neutral-400 hover:text-neutral-600 p-1" aria-label={`Remove ${sideLabel} artwork`}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-neutral-200 hover:border-amber-500 rounded-lg p-3 flex items-center justify-center gap-2 text-center cursor-pointer transition-colors bg-neutral-50/60 hover:bg-amber-50/30">
                          <Upload className="w-4 h-4 text-neutral-400" />
                          <span className="text-xs font-medium text-neutral-800">Upload {sideLabel} Design</span>
                          <input type="file" className="hidden" accept={ARTWORK_FILE_TYPES} onChange={(event) => handleFileUpload(side, event)} />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Special instructions */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder={isArabic ? 'ملاحظات خاصة للمطبعة (مثال: ألوان بانتون خاصة، زوايا دائرية)...' : 'Production notes (e.g. Pantone spot color, exact crease position)...'}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Configurator Controls */}
          <div className="lg:col-span-6 p-6 flex flex-col justify-between gap-6 bg-white">
            <div className="space-y-5">
              {/* 1. Paper Quality & Substrate Specification */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-neutral-600" />
                    {isArabic ? 'جودة ونوع الورق (Paper Quality & Stock)' : 'Paper Quality & Material Substrate'}
                  </label>
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {selectedStock.finishType}
                  </span>
                </div>

                <div className="space-y-2">
                  {product.availableStocks.map((stock) => (
                    <div
                      key={stock.id}
                      onClick={() => handleStockSelect(stock)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        selectedStock.id === stock.id
                          ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-600/30'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900">
                            {isArabic ? stock.nameAr : stock.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {stock.displaySpecification ?? `${stock.weightGsm} GSM`}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                          {stock.description}
                        </p>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedStock.id === stock.id 
                            ? 'border-amber-600 bg-amber-600 text-white' 
                            : 'border-neutral-300'
                        }`}>
                          {selectedStock.id === stock.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Size Options (A4, A5, standard presets OR Custom Dimensions) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-900">
                    {isArabic ? 'خيارات المقاس والأبعاد (Size Options)' : 'Size Options & Dimensions'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const customOption = product.availableSizes.find(s => s.isCustom) || {
                        id: 'custom-dimension',
                        label: 'Custom Size',
                        dimensions: 'Custom mm',
                        multiplier: 1.25,
                        isCustom: true
                      };
                      handleSizeSelect(customOption);
                    }}
                    className="text-[11px] text-amber-700 hover:text-amber-900 underline font-medium"
                  >
                    {isArabic ? '+ تحديد مقاس مخصص' : '+ Enter custom dimensions'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => handleSizeSelect(size)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        selectedSize.id === size.id
                          ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white'
                      }`}
                    >
                      <div className="truncate font-semibold">{size.label.split('(')[0]}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${selectedSize.id === size.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {size.dimensions}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Dimensions Input Reveal */}
                {isCustomDimension && (
                  <div className="mt-3 p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-amber-700" />
                        {isArabic ? 'المقاس المخصص الدقيق:' : 'Exact Custom Dimensions:'}
                      </span>
                      <div className="flex items-center gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setCustomUnit('mm')}
                          className={`px-2 py-0.5 rounded ${customUnit === 'mm' ? 'bg-amber-600 text-white font-bold' : 'bg-white text-neutral-600'}`}
                        >
                          mm
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomUnit('cm')}
                          className={`px-2 py-0.5 rounded ${customUnit === 'cm' ? 'bg-amber-600 text-white font-bold' : 'bg-white text-neutral-600'}`}
                        >
                          cm
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-600 mb-0.5">
                          {isArabic ? 'العرض' : 'Width'} ({customUnit})
                        </label>
                        <input
                          type="number"
                          min={20}
                          max={5000}
                          value={customWidthMm}
                          onChange={(e) => setCustomWidthMm(Math.max(1, Number(e.target.value)))}
                          className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-600 mb-0.5">
                          {isArabic ? 'الارتفاع' : 'Height'} ({customUnit})
                        </label>
                        <input
                          type="number"
                          min={20}
                          max={5000}
                          value={customHeightMm}
                          onChange={(e) => setCustomHeightMm(Math.max(1, Number(e.target.value)))}
                          className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-amber-800">
                      Calculated Area: {((customWidthMm * customHeightMm) / (customUnit === 'cm' ? 1 : 100)).toFixed(1)} sq cm · Dynamic prepress dieline calculated.
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Finishing Choices (Lamination, Spot UV, Die-Cutting, Foil) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-900 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-neutral-600" />
                    {isArabic ? 'خيارات التشطيب (Finishing Choices)' : product.configuratorFinishHeading ?? 'Finishing Choices (Lamination, UV, Die-Cut)'}
                  </span>
                  {!product.hideConfiguratorFinishDetails && (
                    <span className="text-[10px] text-neutral-500 font-normal">
                      Precision Swiss Tooling
                    </span>
                  )}
                </label>

                {isPremiumBusinessCards ? <><div className="mb-3"><label className="mb-1 block text-[11px] font-medium text-neutral-600">Lamination</label><div className="relative"><select value={normalizedPremiumConfiguration.lamination} onChange={(event) => setPremiumLamination(event.target.value as PremiumLamination)} className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-8 text-xs font-medium text-neutral-800 outline-none transition-colors focus:border-amber-600 focus:ring-1 focus:ring-amber-600">{PREMIUM_LAMINATION_OPTIONS.filter((option) => premiumCompatibility.allowedLaminations.includes(option.id)).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" /></div></div><div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                  {product.availableFinishes.filter((finish) => finish.id !== 'custom-die-cut').map((finish) => {
                    const isAvailable = finish.id === 'spot-uv' ? premiumCompatibility.spotUv : premiumCompatibility.hotFoil;
                    const selected = finish.id === 'spot-uv' ? normalizedPremiumConfiguration.finishes.spotUv : normalizedPremiumConfiguration.foilColor !== 'none';
                    const toggle = () => !isAvailable ? undefined : finish.id === 'gold-hot-foil' ? setFoilColor(foilColor === 'none' ? 'gold' : 'none') : setPremiumFinishSelections((current) => ({ ...current, spotUv: !selected }));
                    return <div key={finish.id} title={!isAvailable ? 'Not available with PET 760MIC' : undefined} className={`h-10 rounded-md border px-2.5 text-xs transition-all ${!isAvailable ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-50' : selected ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600' : 'border-neutral-200 bg-white'}`}>
                      {finish.id === 'gold-hot-foil' ? <div className="flex h-full items-center justify-between gap-2"><span className="min-w-0 truncate text-[11px] font-semibold text-neutral-900">Gold Hot Foil</span><div className="relative shrink-0"><select value={foilColor} onChange={(event) => setFoilColor(event.target.value as 'none' | 'gold' | 'silver')} className="appearance-none bg-transparent py-1 pl-1 pr-4 text-[10px] font-semibold text-neutral-700 outline-none"><option value="none">Off</option><option value="gold">Gold</option><option value="silver">Silver</option></select><ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-500" /></div></div> : <button type="button" disabled={!isAvailable} aria-pressed={selected} onClick={toggle} className="flex h-full w-full items-center justify-between text-left disabled:cursor-not-allowed"><span className="text-[11px] font-semibold text-neutral-900">{finish.name}</span><span className={`flex h-4 w-4 items-center justify-center rounded border ${selected ? 'border-amber-600 bg-amber-600 text-white' : 'border-neutral-300'}`}>{selected && <Check className="h-3 w-3 stroke-[3]" />}</span></button>}
                    </div>;
                  })}
                  <button type="button" disabled={!premiumCompatibility.roundCorner} aria-pressed={normalizedPremiumConfiguration.finishes.roundCorner} onClick={() => setPremiumFinishSelections((current) => ({ ...current, roundCorner: !current.roundCorner }))} className={`flex h-10 items-center rounded-md border px-2.5 text-left text-xs transition-all ${normalizedPremiumConfiguration.finishes.roundCorner ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600' : 'border-neutral-200 bg-white'}`}><span className="flex w-full items-center justify-between text-[11px] font-semibold text-neutral-900">Round Corner<span className={`flex h-4 w-4 items-center justify-center rounded border ${normalizedPremiumConfiguration.finishes.roundCorner ? 'border-amber-600 bg-amber-600 text-white' : 'border-neutral-300'}`}>{normalizedPremiumConfiguration.finishes.roundCorner && <Check className="h-3 w-3 stroke-[3]" />}</span></span></button>
                  <div title={!premiumCompatibility.customDieCut ? 'Not available with PET 760MIC' : undefined} className={`h-10 rounded-md border px-2.5 text-xs transition-all ${!premiumCompatibility.customDieCut ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-50' : normalizedPremiumConfiguration.finishes.customDieCut ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600' : 'border-neutral-200 bg-white'}`}><button type="button" disabled={!premiumCompatibility.customDieCut} aria-pressed={normalizedPremiumConfiguration.finishes.customDieCut} onClick={() => setPremiumFinishSelections((current) => ({ ...current, customDieCut: !current.customDieCut }))} className="flex h-full w-full items-center justify-between text-left text-[11px] font-semibold text-neutral-900 disabled:cursor-not-allowed">Custom Die Cut<span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${normalizedPremiumConfiguration.finishes.customDieCut ? 'border-amber-600 bg-amber-600 text-white' : 'border-neutral-300'}`}>{normalizedPremiumConfiguration.finishes.customDieCut && <Check className="h-3 w-3 stroke-[3]" />}</span></button></div>
                </div></> : isNormalBusinessCards ? <>
                  <p className="mb-2 text-[11px] font-medium text-neutral-600">Lamination</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.availableFinishes.filter((finish) => finish.id !== 'round-corner').map((finish) => (
                      <button key={finish.id} type="button" onClick={() => setSelectedFinish(finish)} className={`p-2.5 rounded-lg border text-left text-xs transition-all ${selectedFinish.id === finish.id ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600 font-medium' : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'}`}>
                        <span className="text-[11px] font-semibold">{isArabic ? finish.nameAr : finish.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mb-2 mt-3 text-[11px] font-medium text-neutral-600">Additional Finishing</p>
                  <button type="button" aria-pressed={roundCorner} onClick={() => setRoundCorner((selected) => !selected)} className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${roundCorner ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600 font-medium' : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'}`}>
                    <span className="text-[11px] font-semibold">Round Corner</span><span className={`flex h-4 w-4 items-center justify-center rounded border ${roundCorner ? 'border-amber-600 bg-amber-600 text-white' : 'border-neutral-300'}`}>{roundCorner && <Check className="h-3 w-3 stroke-[3]" />}</span>
                  </button>
                </> : <div className="grid grid-cols-2 gap-2">
                  {product.availableFinishes.map((finish) => (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => setSelectedFinish(finish)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col justify-between ${
                        selectedFinish.id === finish.id
                          ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600 font-medium'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[11px] font-semibold truncate pr-1">
                          {isArabic ? finish.nameAr : finish.name}
                        </span>
                        {finish.colorHex && (
                          <span 
                            className="w-3 h-3 rounded-full shrink-0 border border-neutral-300"
                            style={{ backgroundColor: finish.colorHex }}
                          />
                        )}
                      </div>
                      {!product.hideConfiguratorFinishDetails && (
                        <>
                          <div className="text-[10px] text-neutral-500 line-clamp-1">
                            {finish.description}
                          </div>
                          <div className="text-[10px] text-amber-800 font-mono mt-1 font-semibold">
                            {finish.extraAED > 0 ? `+AED ${finish.extraAED}` : 'Included'}
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>}

              </div>

              {product.printedSideOptions && product.printedSideOptions.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-900">
                    Printed Side
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.printedSideOptions.map((option) => {
                      const isSelected = selectedPrintedSides.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => togglePrintedSide(option.id)}
                          className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50/40 font-medium text-neutral-900 ring-1 ring-amber-600'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                          }`}
                        >
                          <span className="font-semibold">{option.label}</span>
                          <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-neutral-300'
                          }`}>
                            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Quantity (Presets + Custom Quantity Input) */}
              {!product.hideQuantityConfigurator && <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-900">
                    {isArabic ? 'الكمية المطلوبة (Quantity)' : 'Print Quantity & Volume Tiers'}
                  </span>
                  <div className="flex items-center gap-2">
                    {priceData.discountPercentage > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Save {priceData.discountPercentage}%
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCustomQtyMode(!isCustomQtyMode)}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 underline"
                    >
                      {isCustomQtyMode ? 'Show preset tiers' : 'Custom number'}
                    </button>
                  </div>
                </div>

                {!isCustomQtyMode ? (
                  <div className={`grid gap-1.5 ${isNormalBusinessCards || isPremiumBusinessCards ? 'grid-cols-4' : 'grid-cols-5'}`}>
                    {quantityOptions.map((tier) => (
                      <button
                        key={tier.qty}
                        type="button"
                        onClick={() => setQuantity(tier.qty)}
                        className={`py-2 px-1 text-center rounded-lg border text-xs transition-all ${
                          quantity === tier.qty
                            ? 'border-amber-600 bg-amber-50/70 font-semibold text-amber-950 ring-1 ring-amber-600'
                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50/40'
                        }`}
                      >
                        <div className="tabular-nums font-semibold">{tier.qty}</div>
                        <div className="text-[10px] text-neutral-500">
                          {tier.discountPercentage > 0
                            ? `-${tier.discountPercentage}%`
                            : tier.qty === product.minQty || !isPremiumBusinessCards
                              ? 'Base'
                              : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
                    <span className="text-xs text-neutral-600 font-medium">Quantity:</span>
                    <input
                      type="number"
                      min={product.minQty}
                      step={product.minQty >= 100 ? 50 : 1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(product.minQty, Number(e.target.value)))}
                      className="flex-1 text-xs px-3 py-1.5 border border-neutral-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-xs text-neutral-500 font-medium">{product.unitLabel}</span>
                  </div>
                )}
              </div>}
            </div>

            {/* Bottom Real-time Cost Breakdown & Action */}
            <div className="pt-4 border-t border-neutral-200">
              {/* Turnaround speed selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-900 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-600" />
                  {isArabic ? 'سرعة الإنتاج والتسليم في الإمارات' : 'Turnaround Speed (UAE Delivery)'}
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTurnaroundSpeed('standard')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      turnaroundSpeed === 'standard'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">Standard</div>
                    <div className={`text-[10px] ${turnaroundSpeed === 'standard' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {product.leadTimeDays} Days Regular
                    </div>
                    <div className={`text-[10px] mt-1 font-mono ${turnaroundSpeed === 'standard' ? 'text-amber-300' : 'text-neutral-400'}`}>
                      Base rate
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTurnaroundSpeed('express24h')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      turnaroundSpeed === 'express24h'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center justify-between">
                      <span>Express</span>
                      <Zap className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className={`text-[10px] ${turnaroundSpeed === 'express24h' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      24h Dispatch
                    </div>
                    <div className={`text-[10px] mt-1 font-mono ${turnaroundSpeed === 'express24h' ? 'text-amber-300' : 'text-neutral-600 font-medium'}`}>
                      +AED 45
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTurnaroundSpeed('rushSameDay')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      turnaroundSpeed === 'rushSameDay'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-semibold flex items-center justify-between">
                      <span>Same-Day</span>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className={`text-[10px] ${turnaroundSpeed === 'rushSameDay' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Dubai Atelier Rush
                    </div>
                    <div className={`text-[10px] mt-1 font-mono ${turnaroundSpeed === 'rushSameDay' ? 'text-amber-300' : 'text-neutral-600 font-medium'}`}>
                      +AED 90
                    </div>
                  </button>
                </div>
              </div>

              <div className="my-5 w-full border-t-[1.5px] border-[#cfcfcf]" aria-hidden="true" />

              <div>
              <div className="space-y-1 text-xs text-neutral-600 mb-3">
                <div className="flex items-center justify-between">
                  <span>Unit cost ({quantity} {product.unitLabel}):</span>
                  <span className="font-mono tabular-nums text-neutral-900 font-medium">
                    {formatAED(priceData.unitPriceAED, isArabic)} / unit
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Print run subtotal:</span>
                  <span className="font-mono tabular-nums text-neutral-900">
                    {formatAED(priceData.subtotalAED, isArabic)}
                  </span>
                </div>

                {priceData.finishExtraAED > 0 && (
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Precision tooling & finishing die:</span>
                    <span className="font-mono tabular-nums">
                      {formatAED(priceData.finishExtraAED, isArabic)}
                    </span>
                  </div>
                )}

                {priceData.turnaroundFeeAED > 0 && (
                  <div className="flex items-center justify-between text-amber-800">
                    <span>Rush turnaround fee:</span>
                    <span className="font-mono tabular-nums">
                      +{formatAED(priceData.turnaroundFeeAED, isArabic)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-neutral-500 pt-1 border-t border-neutral-100">
                  <span>UAE 5% VAT (FTA Certified):</span>
                  <span className="font-mono tabular-nums">
                    {formatAED(priceData.vatAED, isArabic)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-base font-bold text-neutral-900 pt-1">
                  <span>Total Calculated Price:</span>
                  <span className="text-xl font-serif text-neutral-900 font-mono tabular-nums">
                    {formatAED(priceData.totalAED, isArabic)}
                  </span>
                </div>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
              >
                {addedSuccess ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-4 h-4 stroke-[3]" />
                    {isArabic ? 'تمت الإضافة إلى السلة بنجاح' : 'Added to UAE Cart!'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4" />
                    {isArabic ? 'إضافة إلى السلة والمتابعة للدفع' : 'Add Configured Specifications to Cart'}
                  </span>
                )}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showArtworkGuide && <BusinessCardArtworkGuide onClose={() => setShowArtworkGuide(false)} />}
    </div>
  );
};
