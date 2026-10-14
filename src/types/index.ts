export type Emirate = 
  | 'Dubai' 
  | 'Abu Dhabi' 
  | 'Sharjah' 
  | 'Ajman' 
  | 'Ras Al Khaimah' 
  | 'Fujairah' 
  | 'Umm Al Quwain';

export const UAE_EMIRATES: Emirate[] = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
];

export type ProductCategory = 
  | 'all'
  | 'business-cards'
  | 'premium-business-cards'
  | 'official-commercial-papers'
  | 'flyers'
  | 'brochures'
  | 'envelopes'
  | 'table-mat'
  | 'shopping-bags'
  | 'fast-food-boxes'
  | 'die-cutting-products'
  | 'menu'
  | 'car-mat'
  | 'banners'
  | 'custom-print'
  | 'luxury-packaging'
  | 'labels-stickers';

export interface PaperStock {
  id: string;
  name: string;
  nameAr: string;
  finishType: 'matte' | 'gloss' | 'uncoated' | 'kraft' | 'recycled' | 'silk' | 'cotton' | 'synthetic' | 'rigid' | 'pvc' | 'unspecified';
  weightGsm: number;
  displaySpecification?: string;
  description: string;
  priceMultiplier: number;
}

export interface PrintFinish {
  id: string;
  name: string;
  nameAr: string;
  type: 'lamination' | 'uv' | 'diecut' | 'foil' | 'emboss' | 'none';
  colorHex?: string;
  extraAED: number;
  description: string;
}

export interface PrintSize {
  id: string;
  label: string;
  dimensions: string;
  multiplier: number;
  isCustom?: boolean;
  widthMm?: number;
  heightMm?: number;
}

export interface QuantityTier {
  qty: number;
  discountPercentage: number;
}

export interface Product {
  id: string;
  title: string;
  titleAr: string;
  category: ProductCategory;
  categoryName: string;
  categoryNameAr: string;
  tagline: string;
  description: string;
  descriptionAr: string;
  basePriceAED: number; // Base price for minimum quantity
  minQty: number;
  unitLabel: string;
  image?: string;
  leadTimeDays: number;
  isPopular?: boolean;
  sameDayAvailable?: boolean;
  availableStocks: PaperStock[];
  availableFinishes: PrintFinish[];
  availableSizes: PrintSize[];
  quantityTiers: QuantityTier[];
  specHighlights: string[];
  catalogMinQuantity?: string;
  catalogCategoryName?: string;
  catalogDescription?: string;
  catalogSubstrateSummary?: string;
  catalogSpecificationSummary?: string;
  catalogFinishSummary?: string;
  catalogHighlightCount?: number;
  catalogHideMinimum?: boolean;
  catalogHideDescription?: boolean;
  catalogHideSubstrateSummary?: boolean;
  catalogHideFinishSummary?: boolean;
  catalogHidePrice?: boolean;
  catalogHideLeadTime?: boolean;
  catalogOnly?: boolean;
  configuratorFinishHeading?: string;
  hideConfiguratorFinishDetails?: boolean;
  hideQuantityConfigurator?: boolean;
  printedSideOptions?: { id: PrintedSide; label: string }[];
}

export type PrintedSide = 'front' | 'back';

export type TurnaroundSpeed = 'standard' | 'express24h' | 'rushSameDay';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedStock: PaperStock;
  selectedFinish: PrintFinish;
  selectedFinishes?: PrintFinish[];
  spotUv?: boolean;
  hotFoil?: boolean;
  foilColor?: 'none' | 'gold' | 'silver';
  customDieCut?: boolean;
  lamination?: 'matt' | 'glossy' | 'velvet';
  roundCorner?: boolean;
  dieCutReference?: { name: string; type: string };
  selectedSize: PrintSize;
  printedSides?: PrintedSide[];
  customDimensions?: {
    width: number;
    height: number;
    unit: 'mm' | 'cm';
  };
  turnaroundSpeed: TurnaroundSpeed;
  artworkFileName?: string;
  artworkPreviewUrl?: string;
  preflightPassed?: boolean;
  customNotes?: string;
  unitPriceAED: number;
  totalPriceAED: number;
}

export interface OrderCustomer {
  fullName: string;
  companyName?: string;
  trnNumber?: string; // UAE Tax Registration Number (15 digits)
  email: string;
  phone: string;
  emirate: Emirate;
  areaAddress: string;
  deliveryType: 'delivery' | 'pickup';
}

export type OrderStatus = 
  | 'preflight' 
  | 'printing' 
  | 'finishing' 
  | 'qc' 
  | 'dispatched' 
  | 'ready_for_pickup' 
  | 'delivered';

export type PaymentMethodType = 
  | 'apple_pay' 
  | 'google_pay' 
  | 'card' 
  | 'tabby_tamara' 
  | 'bank_transfer' 
  | 'cod';

export interface PaymentDetails {
  method: PaymentMethodType;
  provider: string;
  transactionRef: string;
  authorizationCode?: string;
  threeDSecureVerified?: boolean;
  cardBrand?: 'Visa' | 'Mastercard' | 'Jaywan' | 'Amex' | 'ApplePay' | 'GooglePay' | 'Tabby';
  cardLast4?: string;
  paidAt: string;
}

export interface Order {
  orderNumber: string;
  createdAt: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotalAED: number;
  vatAED: number; // 5% UAE VAT
  shippingAED: number;
  totalAED: number;
  paymentMethod: PaymentMethodType;
  paymentDetails?: PaymentDetails;
  status: OrderStatus;
  estimatedDeliveryDate: string;
  trackingUpdates: {
    status: OrderStatus;
    title: string;
    description: string;
    timestamp: string;
  }[];
}

export interface QuoteCalculationRequest {
  productType: string;
  widthMm: number;
  heightMm: number;
  unit: 'mm' | 'cm';
  stockId: string;
  finishingId: string;
  quantity: number;
  speed: TurnaroundSpeed;
  hasArtwork: boolean;
}

export interface QuoteCalculationResult {
  estimatedUnitPriceAED: number;
  subtotalAED: number;
  volumeDiscountAED: number;
  discountPercentage: number;
  finishingFeeAED: number;
  turnaroundFeeAED: number;
  netBeforeVatAED: number;
  vatAED: number;
  grandTotalAED: number;
}
