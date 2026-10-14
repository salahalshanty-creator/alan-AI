import React, { useEffect, useRef, useState } from 'react';
import { Product, ProductCategory } from '../types';
import { PRODUCTS } from '../data/products';
import { formatAED } from '../utils/pricing';
import { Sparkles, ArrowRight, Zap, Check, Calculator, Sliders, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCatalogProps {
  onSelectProduct: (product: Product, initialStockId?: string) => void;
  onOpenOnlineQuote?: () => void;
  isArabic?: boolean;
  maxProducts?: number;
}

interface UnifiedProductCardProps {
  product: Product;
  onSelectProduct: (product: Product, initialStockId?: string) => void;
  isArabic: boolean;
}

const UnifiedProductCard: React.FC<UnifiedProductCardProps> = ({
  product,
  onSelectProduct,
  isArabic,
}) => {
  const [selectedStockId, setSelectedStockId] = useState<string>(product.availableStocks[0]?.id || '');
  const currentStock = product.availableStocks.find(s => s.id === selectedStockId) || product.availableStocks[0];
  const dynamicPrice = Math.round(product.basePriceAED * (currentStock?.priceMultiplier || 1.0));

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-[#FBFBFA] overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300">
      {/* Product Visual */}
      <div 
        className="relative aspect-[4/3] overflow-hidden bg-neutral-200 cursor-pointer"
        onClick={() => onSelectProduct(product, currentStock?.id)}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={isArabic ? product.titleAr : product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center p-4">
            <span className="text-white text-xs font-semibold text-center">{isArabic ? product.titleAr : product.title}</span>
          </div>
        )}

        {/* Lead Time / Express Badge */}
        {!product.catalogHideLeadTime && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-medium text-neutral-800 shadow-xs">
            {product.sameDayAvailable ? (
              <span className="flex items-center gap-1 text-amber-800 font-semibold">
                <Zap className="w-3 h-3 fill-amber-700 text-amber-700" />
                {isArabic ? 'توصيل بنفس اليوم' : 'Dubai Same-Day'}
              </span>
            ) : (
              <span>{product.leadTimeDays ? `${product.leadTimeDays} ${isArabic ? 'أيام عمل' : 'Days Standard'}` : (isArabic ? 'إنتاج قياسي' : 'Standard Turnaround')}</span>
            )}
          </div>
        )}

        {/* Hover Quick Action */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isArabic ? 'تخصيص المواصفات' : 'Configure Specifications'}
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5 font-medium">
            <span className="text-amber-800 font-semibold">{isArabic ? product.categoryNameAr : product.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span>{product.catalogMinQuantity ?? `Min ${product.minQty} ${product.unitLabel}`}</span>
          </div>

          <h3 
            onClick={() => onSelectProduct(product, currentStock?.id)}
            className="text-lg font-serif font-bold text-neutral-900 group-hover:text-amber-800 transition-colors cursor-pointer"
          >
            {isArabic ? product.titleAr : product.title}
          </h3>

          <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
            {isArabic ? (product.descriptionAr || product.description) : product.description}
          </p>

          {/* Interactive Variant Options Pill Switcher */}
          {product.availableStocks.length > 1 && (
            <div className="mt-4 pt-3 border-t border-neutral-200/80">
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-semibold text-neutral-700 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-700" />
                  {isArabic ? 'الخامة / الوزن:' : 'Substrate / Weight:'}
                </span>
                <span className="text-[10px] text-amber-800 font-medium">
                  {currentStock?.displaySpecification || (isArabic ? currentStock?.nameAr : currentStock?.name)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.availableStocks.map((stock) => {
                  const isSelected = stock.id === currentStock?.id;
                  const label = stock.displaySpecification || (isArabic ? stock.nameAr : stock.name);
                  return (
                    <button
                      key={stock.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStockId(stock.id);
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                        isSelected
                          ? 'bg-neutral-900 text-white shadow-xs ring-1 ring-neutral-900'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Finishes */}
          {product.availableFinishes.length > 1 && (
            <div className="mt-3 text-[11px] text-neutral-500 flex items-center gap-1.5">
              <span className="font-semibold text-neutral-700">{isArabic ? 'التشطيب:' : 'Finishes:'}</span>
              <span className="truncate text-neutral-600">
                {product.availableFinishes.slice(0, 3).map(f => isArabic ? f.nameAr : f.name).join(' · ')}
                {product.availableFinishes.length > 3 && ` +${product.availableFinishes.length - 3}`}
              </span>
            </div>
          )}

          {/* Highlights */}
          <ul className="mt-3 space-y-1 text-[11px] text-neutral-600">
            {product.specHighlights.slice(0, 2).map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card Footer with Price and CTA */}
        <div className="mt-6 pt-4 border-t border-neutral-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-medium">
              {isArabic ? 'يبدأ من' : 'Starting From'}
            </span>
            <span className="text-base font-serif font-bold text-neutral-900 font-mono tabular-nums">
              {formatAED(dynamicPrice, isArabic)}
            </span>
            <span className="text-[10px] text-neutral-400 block">
              / {product.minQty} {isArabic ? (product.unitLabel === 'cards' ? 'بطاقة' : product.unitLabel === 'sheets' ? 'ورقة' : product.unitLabel === 'bags' ? 'كيس' : product.unitLabel === 'menus' ? 'قائمة' : product.unitLabel === 'mats' ? 'مفرش' : 'قطعة') : product.unitLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectProduct(product, currentStock?.id)}
            className="px-4 py-2 bg-neutral-900 group-hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>{isArabic ? 'تهيئة وحساب' : 'Configure'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectProduct,
  onOpenOnlineQuote,
  isArabic = false,
  maxProducts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [paperFilter, setPaperFilter] = useState<string>('all');
  const categoryViewportRef = useRef<HTMLDivElement>(null);
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false);

  const legacyCategories: { id: ProductCategory; label: string; labelAr: string }[] = [
    { id: 'all', label: 'All Print Collections', labelAr: 'كافة المجموعات' },
    { id: 'business-cards', label: 'Business Cards', labelAr: 'بطاقات الأعمال' },
    { id: 'flyers', label: 'Flyers', labelAr: 'المنشورات الإعلانية' },
    { id: 'brochures', label: 'Brochures', labelAr: 'الكتيبات والمطويات' },
    { id: 'banners', label: 'Banners', labelAr: 'اللافتات والرول اب' },
    { id: 'custom-print', label: 'Custom Print Jobs', labelAr: 'المشاريع والطباعة المخصصة' },
  ];

  const categories: { id: ProductCategory; label: string; labelAr: string }[] = [
    { id: 'all', label: 'All Print Collections', labelAr: 'All Print Collections' },
    { id: 'business-cards', label: 'Business Cards', labelAr: 'Business Cards' },
    { id: 'premium-business-cards', label: 'Premium Business Cards', labelAr: 'Premium Business Cards' },
    { id: 'official-commercial-papers', label: 'Official and Commercial Papers', labelAr: 'Official and Commercial Papers' },
    { id: 'brochures', label: 'Brochures', labelAr: 'Brochures' },
    { id: 'flyers', label: 'Flyers', labelAr: 'Flyers' },
    { id: 'envelopes', label: 'Envelopes', labelAr: 'Envelopes' },
    { id: 'table-mat', label: 'Table Mat', labelAr: 'Table Mat' },
    { id: 'shopping-bags', label: 'Shopping Bags', labelAr: 'Shopping Bags' },
    { id: 'fast-food-boxes', label: 'Fast Food Boxes', labelAr: 'Fast Food Boxes' },
    { id: 'die-cutting-products', label: 'Die Cutting Products', labelAr: 'Die Cutting Products' },
    { id: 'labels-stickers', label: 'Sticker', labelAr: 'Sticker' },
    { id: 'menu', label: 'Menu', labelAr: 'Menu' },
    { id: 'car-mat', label: 'Car Mat', labelAr: 'Car Mat' },
    { id: 'banners', label: 'Banners', labelAr: 'Banners' },
    { id: 'custom-print', label: 'Custom Print Jobs', labelAr: 'Custom Print Jobs' },
  ];

  const handleCategoryChange = (category: ProductCategory) => {
    setSelectedCategory(category);
    if (category === 'business-cards') setPaperFilter('all');
  };

  const updateCategoryScrollButtons = () => {
    const viewport = categoryViewportRef.current;
    if (!viewport) return;
    setCanScrollCategoriesLeft(viewport.scrollLeft > 1);
    setCanScrollCategoriesRight(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    const viewport = categoryViewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({
      left: viewport.clientWidth * 0.7 * (direction === 'right' ? 1 : -1),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    updateCategoryScrollButtons();
    window.addEventListener('resize', updateCategoryScrollButtons);
    return () => window.removeEventListener('resize', updateCategoryScrollButtons);
  }, []);

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = 
      product.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      product.titleAr.includes(searchFilter) ||
      product.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesPaper = paperFilter === 'all' || product.availableStocks.some((stock) =>
      stock.finishType === paperFilter || (paperFilter === 'recycled' && stock.finishType === 'kraft'),
    );
    return matchesCategory && matchesSearch && matchesPaper;
  });

  return (
    <section id="print-catalog" className="py-16 bg-white border-b border-neutral-200">
      <div className="site-shell" dir={isArabic ? 'rtl' : 'ltr'}>
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{isArabic ? 'المجموعة الشاملة للطباعة والإعلان في الإمارات' : 'Commercial & Luxury Print Collection'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-neutral-900 tracking-tight">
              {isArabic ? 'كتالوج المنتجات والتهيئة الفورية' : 'UAE Printing Press Product Catalog'}
            </h2>
            <p className="text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
              {isArabic 
                ? 'اختر أي فئة لتحديد مواصفات الورق (مطفي، لامع، معاد تدويره)، المقاسات (A4, A5 أو مقاس مخصص)، والتشطيبات الفاخرة (سلوفان، سبوت يو في، قص ليزر، بصمة ذهبية).'
                : 'Select any product to specify paper quality (matte, glossy, recycled), standard or custom dimensions, volume quantities, and luxury finishing (lamination, 3D spot UV, precision die-cutting, hot foil).'}
            </p>
          </div>

          {/* Action Header Items: Online Quotation Estimator button + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onOpenOnlineQuote && (
              <button
                type="button"
                onClick={onOpenOnlineQuote}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
              >
                <Calculator className="w-4 h-4 text-amber-700" />
                <span>{isArabic ? 'حاسبة عروض الأسعار المخصصة' : 'Custom Online Quotation Tool'}</span>
              </button>
            )}

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder={isArabic ? 'بحث في المنتجات (مثال: بطاقات، فلاير، رول اب)...' : 'Search catalog (e.g. cards, banners)...'}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Primary Category Filter Bar */}
        <div className="mb-4 flex w-full max-w-full items-stretch gap-2">
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            disabled={!canScrollCategoriesLeft}
            aria-label="Show previous product categories"
            className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 disabled:pointer-events-none disabled:invisible"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div ref={categoryViewportRef} onScroll={updateCategoryScrollButtons} className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto overscroll-x-contain rounded-xl bg-neutral-100 p-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`shrink-0 px-4 py-3 text-xs rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60 font-medium'
                }`}
              >
                <span>{isArabic ? cat.labelAr : cat.label}</span>
                {selectedCategory === cat.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            disabled={!canScrollCategoriesRight}
            aria-label="Show next product categories"
            className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 disabled:pointer-events-none disabled:invisible"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-filter bar: Quick Paper Stock Substrate Selector */}
        {selectedCategory === 'business-cards' ? (
          <div className="flex items-center mb-8 text-xs text-neutral-700">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 font-semibold">
              <Sliders className="w-3 h-3 text-neutral-500" />
              {isArabic ? 'جودة الورق' : 'Paper Qualities'}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 mb-8 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-neutral-500" />
              {isArabic ? 'تصفية حسب نوع الورق:' : 'Paper Substrate Filter:'}
            </span>
            {[
              { id: 'all', label: 'All Paper Qualities' },
              { id: 'matte', label: 'Matte Coated' },
              { id: 'gloss', label: 'Glossy Art' },
              { id: 'uncoated', label: 'Wood Free Paper' },
              { id: 'recycled', label: 'Recycled Eco / Kraft' },
              { id: 'synthetic', label: 'Waterproof Synthetic' },
              { id: 'rigid', label: 'Rigid Kappa Board' },
            ].map((pf) => (
              <button
                key={pf.id}
                type="button"
                onClick={() => setPaperFilter(pf.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  paperFilter === pf.id
                    ? 'bg-neutral-900 text-white font-medium'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.slice(0, maxProducts ?? filteredProducts.length).map((product) => (
            <UnifiedProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              isArabic={isArabic}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-base font-medium">No print products match your query.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchFilter(''); setPaperFilter('all'); }}
              className="mt-2 text-xs text-amber-800 underline font-semibold"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
