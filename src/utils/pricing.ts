import { Product, PaperStock, PrintFinish, PrintSize, TurnaroundSpeed, QuoteCalculationRequest, QuoteCalculationResult } from '../types';

export function calculateCustomPrice({
  product,
  quantity,
  selectedStock,
  selectedFinish,
  selectedFinishes,
  selectedSize,
  turnaroundSpeed,
  customWidthMm,
  customHeightMm,
}: {
  product: Product;
  quantity: number;
  selectedStock: PaperStock;
  selectedFinish: PrintFinish;
  selectedFinishes?: PrintFinish[];
  selectedSize: PrintSize;
  turnaroundSpeed: TurnaroundSpeed;
  customWidthMm?: number;
  customHeightMm?: number;
}): {
  baseUnitCostAED: number;
  finishExtraAED: number;
  unitPriceAED: number;
  subtotalAED: number;
  turnaroundFeeAED: number;
  totalBeforeVatAED: number;
  vatAED: number;
  totalAED: number;
  discountPercentage: number;
} {
  // Find applicable volume tier discount
  let discountPercentage = 0;
  const sortedTiers = [...product.quantityTiers].sort((a, b) => b.qty - a.qty);
  
  for (const tier of sortedTiers) {
    if (quantity >= tier.qty) {
      discountPercentage = tier.discountPercentage;
      break;
    }
  }

  // If quantity is between tiers, compute smooth interpolation
  if (sortedTiers.length > 0 && quantity > sortedTiers[sortedTiers.length - 1].qty) {
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const high = sortedTiers[i];
      const low = sortedTiers[i + 1];
      if (quantity >= low.qty && quantity <= high.qty) {
        const ratio = (quantity - low.qty) / (high.qty - low.qty);
        discountPercentage = Math.round(low.discountPercentage + ratio * (high.discountPercentage - low.discountPercentage));
        break;
      }
    }
  }

  // Base unit cost per item calculated from base price / minQty
  const rawBaseUnit = (product.basePriceAED / Math.max(1, product.minQty));
  
  // Apply stock and size multiplier
  const stockMultiplier = selectedStock?.priceMultiplier || 1.0;
  
  let sizeMultiplier = selectedSize?.multiplier || 1.0;
  if (selectedSize?.isCustom && customWidthMm && customHeightMm) {
    // Dynamic area calculation relative to standard reference item
    const customAreaSqMm = customWidthMm * customHeightMm;
    // Default reference area (A5 ~ 31,080 sq mm or standard card 4,500 sq mm based on minQty)
    const refArea = product.category === 'business-cards' ? 4500 : product.category === 'banners' ? 1700000 : 31080;
    const ratio = Math.sqrt(customAreaSqMm / refArea);
    sizeMultiplier = Math.max(0.6, Math.min(6.0, Number((ratio * 1.15).toFixed(2))));
  }

  // Adjusted unit cost
  const adjustedUnitCost = rawBaseUnit * stockMultiplier * sizeMultiplier;

  // Apply volume discount
  const discountedUnitCost = adjustedUnitCost * (1 - discountPercentage / 100);

  // Subtotal for base print run
  const printSubtotal = discountedUnitCost * quantity;

  // Finish extra setup/die cost
  const finishExtraAED = selectedFinishes
    ? selectedFinishes.reduce((total, finish) => total + (finish.extraAED || 0), 0)
    : selectedFinish?.extraAED || 0;

  // Turnaround multiplier
  let speedMultiplier = 1.0;
  let speedFlatFee = 0;

  if (turnaroundSpeed === 'express24h') {
    speedMultiplier = 1.15;
    speedFlatFee = 45;
  } else if (turnaroundSpeed === 'rushSameDay') {
    speedMultiplier = 1.35;
    speedFlatFee = 90;
  }

  const calculatedBase = (printSubtotal + finishExtraAED) * speedMultiplier + speedFlatFee;
  const turnaroundFeeAED = Math.round(calculatedBase - (printSubtotal + finishExtraAED));
  const totalBeforeVatAED = Math.round(calculatedBase);
  const vatAED = Math.round(totalBeforeVatAED * 0.05 * 100) / 100; // 5% UAE FTA VAT
  const totalAED = Math.round((totalBeforeVatAED + vatAED) * 100) / 100;
  const unitPriceAED = Math.round((totalBeforeVatAED / quantity) * 100) / 100;

  return {
    baseUnitCostAED: Math.round(discountedUnitCost * 100) / 100,
    finishExtraAED,
    unitPriceAED,
    subtotalAED: Math.round(printSubtotal),
    turnaroundFeeAED,
    totalBeforeVatAED,
    vatAED,
    totalAED,
    discountPercentage,
  };
}

export function calculateOnlineQuote(req: QuoteCalculationRequest): QuoteCalculationResult {
  // Convert dimensions to sq cm
  const widthCm = req.unit === 'cm' ? req.widthMm : req.widthMm / 10;
  const heightCm = req.unit === 'cm' ? req.heightMm : req.heightMm / 10;
  const areaSqCm = Math.max(1, widthCm * heightCm);

  // Determine base rate per sq cm based on product type
  let baseRatePerSqCm = 0.005; // default
  let baseUnitFloor = 0.50;

  switch (req.productType.toLowerCase()) {
    case 'business-cards':
    case 'business cards':
      baseRatePerSqCm = 0.025;
      baseUnitFloor = 0.95;
      break;
    case 'flyers':
    case 'marketing flyers':
      baseRatePerSqCm = 0.0035;
      baseUnitFloor = 0.45;
      break;
    case 'brochures':
    case 'catalogs':
    case 'brochures & catalogs':
      baseRatePerSqCm = 0.0065;
      baseUnitFloor = 1.80;
      break;
    case 'banners':
    case 'roll up & banners':
      baseRatePerSqCm = 0.0018;
      baseUnitFloor = 85.00;
      break;
    case 'rigid boxes':
    case 'luxury packaging':
      baseRatePerSqCm = 0.012;
      baseUnitFloor = 18.00;
      break;
    default:
      baseRatePerSqCm = 0.0045;
      baseUnitFloor = 1.20;
      break;
  }

  // Stock multiplier
  let stockMult = 1.0;
  if (req.stockId.includes('cotton') || req.stockId.includes('rigid')) stockMult = 1.6;
  else if (req.stockId.includes('synthetic')) stockMult = 1.45;
  else if (req.stockId.includes('recycled') || req.stockId.includes('kraft')) stockMult = 1.2;
  else if (req.stockId.includes('gloss')) stockMult = 0.95;

  // Finishing fee
  let finishingFlat = 0;
  if (req.finishingId.includes('foil')) finishingFlat = 180;
  else if (req.finishingId.includes('uv')) finishingFlat = 140;
  else if (req.finishingId.includes('die')) finishingFlat = 160;
  else if (req.finishingId.includes('emboss')) finishingFlat = 200;

  // Volume discount calculation
  let discountPercentage = 0;
  if (req.quantity >= 5000) discountPercentage = 55;
  else if (req.quantity >= 2500) discountPercentage = 45;
  else if (req.quantity >= 1000) discountPercentage = 35;
  else if (req.quantity >= 500) discountPercentage = 25;
  else if (req.quantity >= 250) discountPercentage = 15;
  else if (req.quantity >= 100) discountPercentage = 8;

  // Raw unit calculation
  const rawUnit = Math.max(baseUnitFloor, (areaSqCm * baseRatePerSqCm * stockMult));
  const rawSubtotal = rawUnit * req.quantity;
  const volumeDiscountAED = Math.round(rawSubtotal * (discountPercentage / 100));
  const subtotalAED = Math.max(60, Math.round(rawSubtotal - volumeDiscountAED));

  // Turnaround speed
  let turnaroundFeeAED = 0;
  if (req.speed === 'express24h') turnaroundFeeAED = 45;
  if (req.speed === 'rushSameDay') turnaroundFeeAED = 90;

  const netBeforeVatAED = subtotalAED + finishingFlat + turnaroundFeeAED;
  const vatAED = Math.round(netBeforeVatAED * 0.05 * 100) / 100; // 5% UAE VAT
  const grandTotalAED = Math.round((netBeforeVatAED + vatAED) * 100) / 100;
  const estimatedUnitPriceAED = Math.round((grandTotalAED / req.quantity) * 100) / 100;

  return {
    estimatedUnitPriceAED,
    subtotalAED,
    volumeDiscountAED,
    discountPercentage,
    finishingFeeAED: finishingFlat,
    turnaroundFeeAED,
    netBeforeVatAED,
    vatAED,
    grandTotalAED,
  };
}

export function formatAED(amount: number, isArabic = false): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isArabic ? `${formatted} د.إ` : `AED ${formatted}`;
}
