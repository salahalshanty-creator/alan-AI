import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import footerLogo from '../assets/branding/alan-mark.png';

interface FooterProps {
  onOpenTracker: () => void;
  onOpenSwatchModal: () => void;
  onOpenQuoteModal: () => void;
  onScrollToCatalog: () => void;
  onNavigate: (path: string) => void;
  isArabic?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTracker,
  onOpenSwatchModal,
  onOpenQuoteModal,
  onScrollToCatalog,
  onNavigate,
  isArabic = false,
}) => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-800">
      <div className="site-shell py-16" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & UAE credentials */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <img src={footerLogo} alt="ALAN Advertisement and Printing" className="w-[330px] max-w-full h-auto object-contain object-left" />
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              {isArabic
                ? 'المطبعة التجارية الفاخرة الرائدة في دبي والإمارات. متخصصون في بطاقات الأعمال المخملية، العلب المقواة، كتالوجات المعارض والأوراق الرسمية مع فحص فني مجاني للبروفات.'
                : 'Premier commercial & bespoke printing press in the United Arab Emirates. Specializing in hot foil stamping, architectural embossing, luxury rigid gift packaging, and exhibition collateral.'}
            </p>

          </div>

          {/* Col 2: Collections */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              {isArabic ? 'المطبوعات الفاخرة' : 'Print Collections'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                  Foil & Velvet Business Cards
                </button>
              </li>
              <li>
                <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                  Bespoke Rigid Gift Boxes
                </button>
              </li>
              <li>
                <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                  Corporate Catalogs & Lookbooks
                </button>
              </li>
              <li>
                <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                  Tearproof Restaurant Menus
                </button>
              </li>
              <li>
                <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                  Roll-Up Banners & Event Stands
                </button>
              </li>
              <li>
                <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                  Foil Die-Cut Product Labels
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services & Tools */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              {isArabic ? 'الخدمات والأدوات' : 'Client Services'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={onScrollToCatalog} className="hover:text-white transition-colors">
                  Live Price Calculator (AED)
                </button>
              </li>
              <li>
                <button onClick={onOpenTracker} className="hover:text-white transition-colors">
                  Live Job Production Tracker
                </button>
              </li>
              <li>
                <button onClick={onOpenSwatchModal} className="hover:text-white transition-colors">
                  Complimentary Paper Swatch Kit
                </button>
              </li>
              <li>
                <button onClick={onOpenQuoteModal} className="hover:text-white transition-colors">
                  Enterprise RFP & Custom Quotes
                </button>
              </li>
              <li>
                <span className="text-neutral-500">Same-Day Dubai Al Quoz Rush</span>
              </li>
              <li>
                <span className="text-neutral-500">Prepress Preflight Flight Check</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Facility & Contact */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              {isArabic ? 'الموقع والتواصل' : 'Dubai Facility'}
            </h4>
            <div className="space-y-3 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Street 8, Al Quoz Industrial Area 2, Dubai, United Arab Emirates</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="https://wa.me/971523640939" target="_blank" rel="noreferrer" className="hover:text-white">052 364 0939</a>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Sat – Thu: 8:00 AM – 8:00 PM GST (Friday Closed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <p>© {new Date().getFullYear()} ALAN ADVERTISMENT AND PRINTING. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>Delivering across all 7 Emirates: DXB · AUH · SHJ · AJM · RAK · UAQ · FUJ</span>
            <span aria-hidden="true">·</span>
            <a href="https://wa.me/971523640939" target="_blank" rel="noreferrer" className="text-white font-semibold">WhatsApp 052 364 0939</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
