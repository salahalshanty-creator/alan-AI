import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
  ShieldCheck,
  Truck,
  Zap,
  Tag,
  CheckCircle2,
} from 'lucide-react';

import heroPrintingPress from '../assets/images/hero-modern-printing-press.png';
import luxuryCardsImg from '../assets/images/product_luxury_business_cards_1790497087122.jpg';
import rigidBoxesImg from '../assets/images/product_bespoke_rigid_boxes_1790497098587.jpg';
import heidelbergFacilityImg from '../assets/images/facility_heidelberg_press_1790497128205.jpg';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onRequestSwatches: () => void;
  onOpenQuote?: () => void;
  onNavigate?: (path: string) => void;
  isArabic?: boolean;
}

interface OfferSlide {
  id: string;
  badgeEn: string;
  badgeAr: string;
  discountBadgeEn: string;
  discountBadgeAr: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  priceValueEn: string;
  priceValueAr: string;
  priceUnitEn: string;
  priceUnitAr: string;
  highlightsEn: string[];
  highlightsAr: string[];
  image: string;
  ctaTextEn: string;
  ctaTextAr: string;
  ctaAction: 'catalog' | 'swatches' | 'quote' | 'products';
}

const SLIDE_DURATION_MS = 3000; // 3 seconds per user instruction

const SLIDES: OfferSlide[] = [
  {
    id: 'luxury-gold-cards',
    badgeEn: 'EXCLUSIVE OFFER · PREMIUM CARDS',
    badgeAr: 'عرض حصري · بطاقات أعمال فاخرة',
    discountBadgeEn: '15% OFF Online Orders',
    discountBadgeAr: 'خصم 15% للطلب أونلاين',
    titleEn: 'Bespoke Gold Foil Business Cards & Velvet Touch',
    titleAr: 'بطاقات عمل بالبصمة الذهبية الحرارية والملمس المخملي',
    subtitleEn: 'Heavyweight 400gsm Artboard with precision 24K hot gold foil stamping, deep tactile embossing, and fingerprint-resistant velvet lamination. Express 3-hour printing available.',
    subtitleAr: 'كرتون أرت بورد 400 جرام مع فويل ذهبي عيار 24 بارز، ملمس مخملي فاخر مقاوم للبصمات، مع توفر خيار الطباعة السريعة خلال 3 ساعات وتوصيل فوري لكافة الإمارات.',
    priceValueEn: 'From 245 AED',
    priceValueAr: 'يبدأ من 245 درهم',
    priceUnitEn: 'for 500 Cards (2 Sides)',
    priceUnitAr: 'لكل 500 كرت (وجهين ملون)',
    highlightsEn: ['24K Metallic Hot Gold Foil', 'Velvet Soft-Touch Coating', 'Heidelberg Press Quality'],
    highlightsAr: ['بصمة ذهبية معدنية حرارية 24K', 'سلوفان مخملي سوفت تاتش', 'طباعة ماكينات هايدلبرغ الألمانية'],
    image: luxuryCardsImg,
    ctaTextEn: 'Order Cards & Calculate Price',
    ctaTextAr: 'احسب السعر واطلب البطاقات فوراً',
    ctaAction: 'catalog',
  },
  {
    id: 'bespoke-rigid-boxes',
    badgeEn: 'LUXURY PACKAGING & RIGID GIFT BOXES',
    badgeAr: 'تغليف الهدايا والمتاجر الفاخرة',
    discountBadgeEn: 'Free Custom Die-Line Mockup',
    discountBadgeAr: 'تصميم قوالب مخصصة مجاناً',
    titleEn: 'Luxury Rigid Presentation Boxes with Magnetic Flap',
    titleAr: 'علب صلبة فاخرة بقفل مغناطيسي وبصمة ذهبية بارزة',
    subtitleEn: 'Sturdy 1200gsm greyboard rigid boxes engineered for luxury retail, watches, perfumery, VIP corporate gifts, and bespoke retail presentation.',
    subtitleAr: 'علب صلبة كرتونية سميكة 1200 جرام للمجوهرات، العطور، الساعات، والهدايا الترويجية لكبار العملاء مع تشطيب الفويل المعدني وبطانة إسفنجية مخملية.',
    priceValueEn: 'From 18 AED',
    priceValueAr: 'تبدأ من 18 درهم',
    priceUnitEn: 'per Custom Rigid Box',
    priceUnitAr: 'للعلبة الواحدة (كميات تبدأ من 250)',
    highlightsEn: ['Concealed Magnetic Closure', 'Heavy 1200 GSM Greyboard', 'Custom Velvet Foam Insert'],
    highlightsAr: ['قفل مغناطيسي مدمج غير مرئي', 'كرتون رمادي سميك 1200 جرام', 'بطانة إسفنجية مخملية مقصوصة بالليزر'],
    image: rigidBoxesImg,
    ctaTextEn: 'Explore Packaging Options',
    ctaTextAr: 'استكشف تشكيلة العلب والتغليف',
    ctaAction: 'quote',
  },
  {
    id: 'corporate-stationery-suite',
    badgeEn: 'EXECUTIVE CORPORATE STATIONERY',
    badgeAr: 'مطبوعات المكاتب والشركات المعتمدة',
    discountBadgeEn: 'Laser & Inkjet Guaranteed',
    discountBadgeAr: 'معتمد لطابعات الليزر والمكتبية',
    titleEn: 'Executive Letterhead & Matching Window Envelopes',
    titleAr: 'أوراق مراسلات وترويسة رسمية وأظرف بنكية فاخرة',
    subtitleEn: 'High-opacity 100–120gsm wood-free uncoated letterheads paired with peel-and-seal corporate envelopes in DL, C5, and C4 formats with metallic foil crests.',
    subtitleAr: 'ورق خالي من الخشب ناصع البياض 100 و120 جرام مع أظرف شركات رسمية بشريط لاصق ذاتي ومقاسات DL وC5 وC4، مع إمكانية إضافة البصمة الذهبية لشعار شركتك.',
    priceValueEn: 'From 195 AED',
    priceValueAr: 'يبدأ من 195 درهم',
    priceUnitEn: 'for 500 A4 Sheets',
    priceUnitAr: 'لكل 500 ورقة A4 رسمية',
    highlightsEn: ['Ultra-White Wood Free Paper', 'High Opacity (No Show-Through)', 'Optional 24K Corporate Crest'],
    highlightsAr: ['ورق خالي من الخشب ناصع البياض', 'عتامة عالية تمنع شفافية الوجهين', 'إمكانية الختم الذهبي للشعار'],
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=1600&h=900&fit=crop&q=90',
    ctaTextEn: 'Configure Corporate Paper',
    ctaTextAr: 'تخصيص مطبوعات الشركة الرسمية',
    ctaAction: 'catalog',
  },
  {
    id: 'food-kraft-packaging',
    badgeEn: 'FOOD-GRADE & KRAFT PACKAGING',
    badgeAr: 'تجهيز المطاعم والمقاهي والتوصيل',
    discountBadgeEn: 'FDA Certified Greaseproof',
    discountBadgeAr: 'كرتون غذائي مانع لتسرب الزيوت',
    titleEn: 'Greaseproof Food Boxes & Twisted Kraft Shopping Bags',
    titleAr: 'علب طعام مانعة للزيوت وأكياس كرافت فاخرة للمطاعم',
    subtitleEn: 'Grease-resistant burger boxes, french fries cone packaging, and reinforced twisted-handle Kraft shopping bags with vivid food-safe CMYK printing.',
    subtitleAr: 'علب برجر وبطاطس مصنوعة من ورق غذائي معتمد مانع لتسرب الدهون، وأكياس تسوق ورقية كرافت متينة بيد مبرومة وطباعة شعار ملونة حتى 4 ألوان.',
    priceValueEn: 'From 0.45 AED',
    priceValueAr: 'تبدأ من 0.45 درهم',
    priceUnitEn: 'per piece in bulk volume',
    priceUnitAr: 'للقطعة للكميات التجارية',
    highlightsEn: ['FDA Food Safe Coating', 'Eco-Friendly Biodegradable Kraft', 'Vivid CMYK Inks'],
    highlightsAr: ['طلاء غذائي آمن معتمد', 'ورق كرافت صديق للبيئة وقابل للتحلل', 'أحبار نقية مطابقة للمواصفات'],
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1600&h=900&fit=crop&q=90',
    ctaTextEn: 'View Food Packaging Catalog',
    ctaTextAr: 'تصفح علب المطاعم والأكياس',
    ctaAction: 'catalog',
  },
  {
    id: 'heidelberg-printing-press',
    badgeEn: 'MODERN OFFSET PRESS IN DUBAI',
    badgeAr: 'أحدث ماكينات الطباعة الألمانية في دبي',
    discountBadgeEn: 'Direct Factory Pricing',
    discountBadgeAr: 'أسعار المصنع مباشرة بدون وسيط',
    titleEn: 'Your Ideas. Printed to Reality with Heidelberg Precision.',
    titleAr: 'أرقى مطبوعات الشركات، البصمة الحرارية والتغليف الفاخر بدبي',
    subtitleEn: 'From luxury business cards, stickers, and brochures to large-format exhibition displays and rigid packaging — crafted with Heidelberg perfection and delivered across the UAE.',
    subtitleAr: 'من بطاقات الأعمال والمطبوعات الإعلانية إلى اللوحات الإعلانية الضخمة والتغليف الفاخر. إنتاج احترافي بدبي مع خيارات تشطيب متميزة وضمان جودة 100%.',
    priceValueEn: '500+ Projects',
    priceValueAr: '500+ مشروع منجز',
    priceUnitEn: 'Delivered Across UAE',
    priceUnitAr: 'توصيل سريع لكافة الإمارات',
    highlightsEn: ['German Heidelberg Speedmaster', 'Spot UV, Foil & Laser Die-Cut', 'Fast UAE Delivery'],
    highlightsAr: ['ماكينات هايدلبرغ الألمانية الحديثة', 'سبوت يو في، فويل وقص قوالب', 'توصيل سريع لجميع الإمارات'],
    image: heroPrintingPress,
    ctaTextEn: 'Explore Full Print Catalog',
    ctaTextAr: 'تصفح الكتالوج واحسب سعرك فوراً',
    ctaAction: 'catalog',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCatalog,
  onRequestSwatches,
  onOpenQuote,
  onNavigate,
  isArabic = false,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentSlide = SLIDES[currentSlideIndex];

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  // 3-second auto-timer with smooth progress ticker
  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now() - (progress / 100) * SLIDE_DURATION_MS;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentPct = Math.min(100, (elapsed / SLIDE_DURATION_MS) * 100);
      setProgress(currentPct);

      if (elapsed >= SLIDE_DURATION_MS) {
        goToNextSlide();
      }
    }, 40);

    timerRef.current = interval;

    return () => {
      window.clearInterval(interval);
    };
  }, [isPaused, currentSlideIndex, goToNextSlide, progress]);

  const handleCtaClick = (action: OfferSlide['ctaAction']) => {
    if (action === 'catalog') {
      onExploreCatalog();
    } else if (action === 'swatches') {
      onRequestSwatches();
    } else if (action === 'quote' && onOpenQuote) {
      onOpenQuote();
    } else if (onNavigate) {
      onNavigate('/products');
    } else {
      onExploreCatalog();
    }
  };

  return (
    <section
      className="relative overflow-hidden border-b border-neutral-800 bg-[#06080B] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Offers Carousel Slider"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Background Slides with smooth Cross-fade and subtle Ken-Burns Motion */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.image}
                alt=""
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover object-center transition-transform duration-[4000ms] ease-out ${
                  isActive ? 'scale-105 motion-safe:scale-110' : 'scale-100'
                }`}
              />
              {/* Dual Dark Gradients for Maximum Typographic Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06080B] via-[#06080B]/80 to-[#06080B]/70 sm:hidden" />
              <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-[#06080B] via-[#06080B]/85 to-transparent rtl:bg-gradient-to-l" />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#06080B] via-[#06080B]/75 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#06080B]/80 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="site-shell relative z-20 flex min-h-[660px] sm:min-h-[700px] lg:min-h-[740px] flex-col justify-between py-10 sm:py-14 lg:py-16">
        {/* Top Control Bar: Slide Counter, Timer Pill, Pause Toggle */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Badge & Discount Pill */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/40 px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-amber-300 backdrop-blur-md shadow-lg shadow-amber-500/10">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
              <span>{isArabic ? currentSlide.badgeAr : currentSlide.badgeEn}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 px-3 py-1.5 text-[11px] font-bold text-emerald-300 backdrop-blur-md shadow-md">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isArabic ? currentSlide.discountBadgeAr : currentSlide.discountBadgeEn}</span>
            </div>
          </div>

          {/* Slide Indicator & Pause/Play Button */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 bg-neutral-900/80 px-2.5 py-1 rounded-lg border border-neutral-800">
              <span className="text-amber-400">0{currentSlideIndex + 1}</span>
              <span className="text-neutral-600 mx-1">/</span>
              <span>0{SLIDES.length}</span>
            </span>

            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? (isArabic ? 'تشغيل الحركة التلقائية' : 'Play motion') : (isArabic ? 'إيقاف مؤقت' : 'Pause')}
              aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-neutral-400" />}
            </button>
          </div>
        </div>

        {/* Center Main Slide Details with Keyframe-like Motion Transitions */}
        <div className="my-auto max-w-4xl py-6">
          {/* Animated Heading */}
          <div key={`title-${currentSlide.id}`} className="transition-all duration-500 ease-out">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[clamp(3.2rem,5vw,4.5rem)] font-bold leading-[1.08] tracking-tight text-white [text-wrap:balance]">
              {isArabic ? currentSlide.titleAr : currentSlide.titleEn}
            </h1>

            {/* Description Subtitle */}
            <p className="mt-4 sm:mt-5 max-w-2xl font-sans text-sm sm:text-base lg:text-lg leading-relaxed text-neutral-200/90 font-normal">
              {isArabic ? currentSlide.subtitleAr : currentSlide.subtitleEn}
            </p>

            {/* Real Price Tag Card & Highlights */}
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="bg-gradient-to-r from-neutral-900/95 via-neutral-900/90 to-neutral-950/90 border border-amber-400/40 rounded-2xl px-4 sm:px-5 py-3 shadow-xl backdrop-blur-md flex items-center gap-3.5">
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-neutral-400">
                    {isArabic ? 'السعر التنافسي المباشر' : 'Direct Press Price'}
                  </div>
                  <div className="text-xl sm:text-2xl font-serif font-black text-amber-400 mt-0.5">
                    {isArabic ? currentSlide.priceValueAr : currentSlide.priceValueEn}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {isArabic ? currentSlide.priceUnitAr : currentSlide.priceUnitEn}
                  </div>
                </div>
              </div>

              {/* Specification Feature Chips */}
              <div className="flex flex-col gap-2">
                {(isArabic ? currentSlide.highlightsAr : currentSlide.highlightsEn).map((highlight, hIdx) => (
                  <div key={hIdx} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3.5">
              <button
                type="button"
                onClick={() => handleCtaClick(currentSlide.ctaAction)}
                className="flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 px-6 py-3.5 font-sans text-sm font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{isArabic ? currentSlide.ctaTextAr : currentSlide.ctaTextEn}</span>
                <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onRequestSwatches}
                className="min-h-12 rounded-xl border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 px-5 py-3.5 font-sans text-sm font-semibold text-white backdrop-blur-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{isArabic ? 'طلب دفتر العينات مجاناً' : 'Request Free Swatch Kit'}</span>
              </button>

              {onOpenQuote && (
                <button
                  type="button"
                  onClick={onOpenQuote}
                  className="min-h-12 rounded-xl border border-neutral-700 hover:border-amber-400/50 bg-neutral-900/80 hover:bg-neutral-800 px-5 py-3.5 font-sans text-sm font-semibold text-amber-300 backdrop-blur-md transition-all active:scale-[0.98] cursor-pointer hidden md:flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isArabic ? 'طلب تسعير خاص للكميات' : 'Custom Corporate Quote'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Progress Bar, Slide Navigator Pills & Trust Indicators */}
        <div className="pt-6 border-t border-neutral-800/80 flex flex-col gap-6">
          {/* Slide Indicator Tabs with 3-Second Active Progress Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Slide Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {SLIDES.map((slide, idx) => {
                const isActive = idx === currentSlideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left rtl:text-right shrink-0 overflow-hidden cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 text-white border border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-neutral-950/70 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {/* Animated Progress Fill Bar (Active Slide) */}
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${isActive ? 'text-amber-400 font-black' : 'text-neutral-500'}`}>
                        0{idx + 1}
                      </span>
                      <span className="truncate max-w-[130px] sm:max-w-[180px]">
                        {isArabic ? slide.badgeAr.split('·')[1]?.trim() || slide.badgeAr : slide.badgeEn.split('·')[1]?.trim() || slide.badgeEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next / Previous Arrow Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={goToPrevSlide}
                className="w-10 h-10 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>

              <button
                type="button"
                onClick={goToNextSlide}
                className="w-10 h-10 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-neutral-300 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-neutral-100 font-mono text-sm">500+ Projects</p>
                <p className="text-[11px] text-neutral-400">{isArabic ? 'مشاريع منفذة بنجاح' : 'Delivered with precision'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-neutral-100 font-mono text-sm">{isArabic ? 'توصيل للإمارات' : 'UAE Fast Courier'}</p>
                <p className="text-[11px] text-neutral-400">{isArabic ? 'شحن لكافة الإمارات' : 'Doorstep delivery'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-neutral-100 font-mono text-sm">{isArabic ? 'تشطيب فاخر' : 'Luxury Finishes'}</p>
                <p className="text-[11px] text-neutral-400">{isArabic ? 'بصمة حرارية وسبوت يو في' : 'Gold foil & Spot UV'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-neutral-100 font-mono text-sm">{isArabic ? 'طباعة سريعة 3 ساعات' : 'Express 3h Turnaround'}</p>
                <p className="text-[11px] text-neutral-400">{isArabic ? 'خيارات للطلبات العاجلة' : 'For urgent requirements'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
