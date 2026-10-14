import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ProductShowcaseProps {
  onBrowseProducts: () => void;
  isArabic?: boolean;
}

const CATEGORIES = [
  {
    id: 'business-cards',
    nameEn: 'Business Cards',
    nameAr: 'بطاقات الأعمال',
    descEn: 'Foil, spot UV & luxury cotton paper',
    descAr: 'فويل ذهبي ولمعان وورق قطني',
    illustration: (
      <svg viewBox="0 0 240 300" className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-300 ease-out group-hover:scale-105" aria-hidden="true">
        <defs>
          <linearGradient id="bcGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDEAB8" />
            <stop offset="35%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#AA820A" />
            <stop offset="100%" stopColor="#ECC880" />
          </linearGradient>
          <linearGradient id="cardDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E3036" />
            <stop offset="100%" stopColor="#17181B" />
          </linearGradient>
          <linearGradient id="cardIvory" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E9E5DC" />
          </linearGradient>
          <filter id="bcShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.16" />
          </filter>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="120" cy="245" rx="80" ry="14" fill="#000000" fillOpacity="0.08" />

        {/* Bottom Card - Light Cotton Paper */}
        <g transform="translate(120,150) rotate(-8) translate(-120,-150)" filter="url(#bcShadow)">
          <rect x="36" y="80" width="168" height="106" rx="7" fill="url(#cardIvory)" stroke="#D8D4CA" strokeWidth="1" />
          <rect x="44" y="88" width="152" height="90" rx="4" fill="none" stroke="url(#bcGold)" strokeWidth="0.8" strokeOpacity="0.7" />
          <line x1="56" y1="116" x2="96" y2="116" stroke="#9E988A" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="56" y1="126" x2="128" y2="126" stroke="#C2BCB0" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="56" y1="135" x2="106" y2="135" stroke="#C2BCB0" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="172" cy="106" r="7" fill="url(#bcGold)" />
        </g>

        {/* Top Card - Black Velvet & Gold Foil */}
        <g transform="translate(120,165) rotate(6) translate(-120,-165)" filter="url(#bcShadow)">
          <rect x="36" y="105" width="168" height="106" rx="7" fill="url(#cardDark)" stroke="#454950" strokeWidth="1" />
          <rect x="43" y="112" width="154" height="92" rx="4" fill="none" stroke="url(#bcGold)" strokeWidth="1.2" />

          {/* Spot UV sheen path */}
          <path d="M 65 105 L 115 105 L 85 211 L 36 211 Z" fill="#FFFFFF" fillOpacity="0.04" />

          {/* Emblem */}
          <circle cx="70" cy="146" r="14" fill="#1C1E22" stroke="url(#bcGold)" strokeWidth="1.5" />
          <text x="70" y="151" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="bold" fill="url(#bcGold)">A</text>

          {/* Gold text lines */}
          <text x="94" y="143" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="800" letterSpacing="1.5" fill="url(#bcGold)">ALAN PRINT</text>
          <text x="94" y="152" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="600" letterSpacing="0.8" fill="#888E96">LUXURY BUSINESS CARDS</text>

          <line x1="56" y1="180" x2="114" y2="180" stroke="url(#bcGold)" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="56" y1="187" x2="88" y2="187" stroke="#686C73" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="176" cy="184" r="3.5" fill="url(#bcGold)" />
        </g>
      </svg>
    ),
  },
  {
    id: 'packaging',
    nameEn: 'Packaging',
    nameAr: 'التغليف والعلب',
    descEn: 'Rigid magnetic luxury boxes',
    descAr: 'علب صلبة مغناطيسية فاخرة',
    illustration: (
      <svg viewBox="0 0 240 300" className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-300 ease-out group-hover:scale-105" aria-hidden="true">
        <defs>
          <linearGradient id="boxGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDEAB8" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9C7709" />
          </linearGradient>
          <linearGradient id="boxBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25272B" />
            <stop offset="100%" stopColor="#141517" />
          </linearGradient>
          <linearGradient id="boxLid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#303338" />
            <stop offset="100%" stopColor="#1C1E22" />
          </linearGradient>
          <linearGradient id="boxInside" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#111214" />
            <stop offset="100%" stopColor="#0B0C0D" />
          </linearGradient>
          <filter id="pkgShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Ambient shadow */}
        <ellipse cx="120" cy="248" rx="85" ry="16" fill="#000000" fillOpacity="0.1" />

        {/* Rigid Box Isometric Perspective */}
        <g filter="url(#pkgShadow)">
          {/* Main Box Base */}
          {/* Back wall */}
          <path d="M 40 160 L 120 120 L 200 160 L 120 200 Z" fill="url(#boxInside)" stroke="#222428" strokeWidth="1" />
          
          {/* Box Outer Left Face */}
          <path d="M 40 160 L 120 200 L 120 240 L 40 200 Z" fill="url(#boxBody)" stroke="#383B42" strokeWidth="0.8" />
          {/* Box Outer Right Face */}
          <path d="M 120 200 L 200 160 L 200 200 L 120 240 Z" fill="#18191C" stroke="#2B2D33" strokeWidth="0.8" />
          
          {/* Gold metallic edge trim along rim */}
          <path d="M 40 160 L 120 200 L 200 160" fill="none" stroke="url(#boxGold)" strokeWidth="1.5" />

          {/* Velvet cushion insert */}
          <ellipse cx="120" cy="168" rx="42" ry="16" fill="#17181C" stroke="#2A2C31" strokeWidth="1" />

          {/* Lifted Lid (Angled opening upward) */}
          <g transform="translate(0, -32)">
            {/* Lid Top Face */}
            <path d="M 45 100 L 120 62 L 195 100 L 120 138 Z" fill="url(#boxLid)" stroke="#3E424A" strokeWidth="1" />
            {/* Lid Front Left Drop */}
            <path d="M 45 100 L 120 138 L 120 152 L 45 114 Z" fill="url(#boxBody)" stroke="#303338" strokeWidth="0.8" />
            {/* Lid Front Right Drop */}
            <path d="M 120 138 L 195 100 L 195 114 L 120 152 Z" fill="#151618" stroke="#25272B" strokeWidth="0.8" />

            {/* Gold foil debossed emblem on lid */}
            <circle cx="120" cy="100" r="15" fill="#1C1D21" stroke="url(#boxGold)" strokeWidth="1.5" />
            <text x="120" y="105" textAnchor="middle" fontFamily="Georgia, serif" fontSize="15" fontWeight="bold" fill="url(#boxGold)">A</text>
            <rect x="80" y="99.5" width="22" height="1" fill="url(#boxGold)" />
            <rect x="138" y="99.5" width="22" height="1" fill="url(#boxGold)" />

            {/* Satin pull ribbon in gold */}
            <path d="M 116 142 L 124 142 L 122 166 L 118 166 Z" fill="url(#boxGold)" stroke="#A0780A" strokeWidth="0.5" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'bags',
    nameEn: 'Bags',
    nameAr: 'الأكياس الفاخرة',
    descEn: 'Luxury paper shopping bags',
    descAr: 'أكياس تسوق ورقية بمقابض حبال',
    illustration: (
      <svg viewBox="0 0 240 300" className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-300 ease-out group-hover:scale-105" aria-hidden="true">
        <defs>
          <linearGradient id="bagGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDEAB8" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9C7709" />
          </linearGradient>
          <linearGradient id="bagFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#282A2E" />
            <stop offset="100%" stopColor="#181A1D" />
          </linearGradient>
          <linearGradient id="bagGusset" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E2024" />
            <stop offset="100%" stopColor="#111215" />
          </linearGradient>
          <filter id="bagShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="125" cy="254" rx="75" ry="13" fill="#000000" fillOpacity="0.1" />

        {/* Rope Handles */}
        <g stroke="url(#bagGold)" strokeWidth="3" fill="none" strokeLinecap="round">
          {/* Back handle */}
          <path d="M 88 108 C 88 50, 142 50, 142 108" opacity="0.4" />
          {/* Front handle */}
          <path d="M 98 114 C 98 56, 154 56, 154 114" />
        </g>

        {/* Bag Body */}
        <g filter="url(#bagShadow)">
          {/* Side Gusset */}
          <path d="M 52 115 L 75 106 L 75 236 L 52 245 Z" fill="url(#bagGusset)" stroke="#30333A" strokeWidth="0.8" />
          <line x1="63" y1="110" x2="63" y2="240" stroke="#0D0E10" strokeWidth="0.8" strokeDasharray="3,3" />

          {/* Front Face */}
          <path d="M 75 106 L 188 106 L 188 236 L 75 236 Z" fill="url(#bagFront)" stroke="#3D4048" strokeWidth="1" />

          {/* Top Fold Crease Line */}
          <line x1="75" y1="124" x2="188" y2="124" stroke="#383B43" strokeWidth="1" />

          {/* Brass Eyelets */}
          <circle cx="98" cy="115" r="4.5" fill="#1C1D21" stroke="url(#bagGold)" strokeWidth="1.5" />
          <circle cx="154" cy="115" r="4.5" fill="#1C1D21" stroke="url(#bagGold)" strokeWidth="1.5" />

          {/* Gold Foil Hot Stamped Logo on Front */}
          <g transform="translate(131.5, 168)">
            <circle cx="0" cy="0" r="18" fill="#1F2024" stroke="url(#bagGold)" strokeWidth="1.5" />
            <text x="0" y="6" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fontWeight="bold" fill="url(#bagGold)">A</text>
            <text x="0" y="32" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="800" letterSpacing="2" fill="url(#bagGold)">ALAN</text>
            <text x="0" y="41" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="500" letterSpacing="1" fill="#8E9399">BOUTIQUE &amp; RETAIL</text>
          </g>

          {/* Bottom Fold Lines */}
          <path d="M 75 220 L 95 236" stroke="#222428" strokeWidth="1" />
          <path d="M 188 220 L 168 236" stroke="#222428" strokeWidth="1" />
        </g>
      </svg>
    ),
  },
  {
    id: 'brochures',
    nameEn: 'Brochures',
    nameAr: 'البروشورات',
    descEn: 'Tri-fold & corporate catalogs',
    descAr: 'كتيبات ومطويات ثلاثية فاخرة',
    illustration: (
      <svg viewBox="0 0 240 300" className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-300 ease-out group-hover:scale-105" aria-hidden="true">
        <defs>
          <linearGradient id="brochGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDEAB8" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9C7709" />
          </linearGradient>
          <linearGradient id="panelWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EFECE6" />
          </linearGradient>
          <linearGradient id="panelDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2C30" />
            <stop offset="100%" stopColor="#17181A" />
          </linearGradient>
          <filter id="brochShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.16" />
          </filter>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="120" cy="252" rx="85" ry="14" fill="#000000" fillOpacity="0.08" />

        {/* Tri-Fold Brochure Fanned Out in 3D */}
        <g filter="url(#brochShadow)">
          {/* Left Panel (Angled Back) */}
          <path d="M 45 92 L 95 80 L 95 232 L 45 244 Z" fill="url(#panelWhite)" stroke="#D8D4CA" strokeWidth="1" />
          {/* Content lines on left panel */}
          <rect x="53" y="102" width="34" height="26" rx="2" fill="#E2DED4" />
          <line x1="53" y1="138" x2="84" y2="138" stroke="#9E988A" strokeWidth="2" strokeLinecap="round" />
          <line x1="53" y1="146" x2="87" y2="146" stroke="#C2BCB0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="53" y1="153" x2="78" y2="153" stroke="#C2BCB0" strokeWidth="1.5" strokeLinecap="round" />

          {/* Center Panel (Straight) */}
          <path d="M 95 80 L 145 80 L 145 232 L 95 232 Z" fill="#FBF9F5" stroke="#D8D4CA" strokeWidth="1" />
          {/* Gold banner block */}
          <rect x="103" y="92" width="34" height="6" rx="1.5" fill="url(#brochGold)" />
          {/* Editorial columns */}
          <line x1="103" y1="108" x2="137" y2="108" stroke="#68645C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="103" y1="116" x2="137" y2="116" stroke="#BCB6A8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="103" y1="123" x2="132" y2="123" stroke="#BCB6A8" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="103" y="136" width="34" height="38" rx="3" fill="#EAE5DB" stroke="#D3CDC0" strokeWidth="0.8" />
          <line x1="103" y1="184" x2="137" y2="184" stroke="#BCB6A8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="103" y1="191" x2="128" y2="191" stroke="#BCB6A8" strokeWidth="1.5" strokeLinecap="round" />

          {/* Front Cover Panel (Angled Forward Right) */}
          <path d="M 145 80 L 195 94 L 195 246 L 145 232 Z" fill="url(#panelDark)" stroke="#454850" strokeWidth="1" />
          
          {/* Spot UV gloss sheen band */}
          <path d="M 158 83 L 180 89 L 170 239 L 148 233 Z" fill="#FFFFFF" fillOpacity="0.05" />

          {/* Cover Foil Stamped Elements */}
          <circle cx="170" cy="125" r="13" fill="#1C1E22" stroke="url(#brochGold)" strokeWidth="1.4" />
          <text x="170" y="130" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fontWeight="bold" fill="url(#brochGold)">A</text>
          
          <text x="170" y="156" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="800" letterSpacing="1.5" fill="url(#brochGold)">CATALOG</text>
          <text x="170" y="164" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="500" letterSpacing="0.8" fill="#888E96">ANNUAL PROSPECTUS</text>
          
          <line x1="156" y1="192" x2="184" y2="200" stroke="url(#brochGold)" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="156" y1="200" x2="176" y2="206" stroke="#666A73" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </svg>
    ),
  },
  {
    id: 'stickers-labels',
    nameEn: 'Stickers & Labels',
    nameAr: 'الملصقات والستيكرات',
    descEn: 'Die-cut, roll & waterproof decals',
    descAr: 'قص ليزر وملصقات رول مقاومة',
    illustration: (
      <svg viewBox="0 0 240 300" className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-300 ease-out group-hover:scale-105" aria-hidden="true">
        <defs>
          <linearGradient id="stkGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDEAB8" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="85%" stopColor="#A07A0A" />
            <stop offset="100%" stopColor="#E2BD64" />
          </linearGradient>
          <linearGradient id="stkCurl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8A330" />
            <stop offset="100%" stopColor="#F9E0A2" />
          </linearGradient>
          <linearGradient id="stkSheet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF7F0" />
            <stop offset="100%" stopColor="#ECE7DC" />
          </linearGradient>
          <linearGradient id="stkDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25272B" />
            <stop offset="100%" stopColor="#141517" />
          </linearGradient>
          <filter id="stkShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="120" cy="250" rx="78" ry="14" fill="#000000" fillOpacity="0.08" />

        {/* Release Liner Backing Sheet */}
        <g filter="url(#stkShadow)">
          <rect x="42" y="75" width="156" height="170" rx="8" fill="url(#stkSheet)" stroke="#D5CFBE" strokeWidth="1" />
          {/* Grid peel markers */}
          <line x1="42" y1="160" x2="198" y2="160" stroke="#DDD8CC" strokeWidth="0.8" strokeDasharray="4,4" />
          <line x1="120" y1="75" x2="120" y2="245" stroke="#DDD8CC" strokeWidth="0.8" strokeDasharray="4,4" />

          {/* Sticker 1: Top-Left Circular Gold Foil Seal (with peeling bottom-right corner) */}
          <g transform="translate(85, 118)">
            {/* Main Circle Seal */}
            <circle cx="0" cy="0" r="30" fill="url(#stkGold)" stroke="#9C7709" strokeWidth="1" />
            <circle cx="0" cy="0" r="25" fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="2.5,2.5" />
            <text x="0" y="4" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fontWeight="bold" fill="#1C1E22">A</text>
            <text x="0" y="14" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="4.5" fontWeight="800" letterSpacing="1" fill="#1C1E22">SEAL OF QUALITY</text>

            {/* Realistic 3D Peeling Edge */}
            <path d="M 12 24 Q 24 12, 28 6 Q 16 16, 12 24 Z" fill="#000000" fillOpacity="0.25" />
            <path d="M 12 24 C 18 20, 24 16, 28 6 L 18 12 Z" fill="url(#stkCurl)" stroke="#B89218" strokeWidth="0.5" />
          </g>

          {/* Sticker 2: Top-Right Hexagonal Metallic Badge */}
          <g transform="translate(156, 118)">
            <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" fill="url(#stkDark)" stroke="url(#stkGold)" strokeWidth="1.4" />
            <text x="0" y="-3" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="800" letterSpacing="1.2" fill="url(#stkGold)">PREMIUM</text>
            <text x="0" y="7" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="500" letterSpacing="0.8" fill="#888E96">UAE VERIFIED</text>
            <circle cx="0" cy="14" r="1.5" fill="url(#stkGold)" />
          </g>

          {/* Sticker 3: Bottom Wide Luxury Cosmetic / Product Label */}
          <g transform="translate(120, 202)">
            <rect x="-62" y="-22" width="124" height="44" rx="6" fill="#181A1D" stroke="url(#stkGold)" strokeWidth="1.2" />
            <rect x="-58" y="-18" width="116" height="36" rx="4" fill="none" stroke="#33373E" strokeWidth="0.7" />
            <text x="0" y="-4" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="800" letterSpacing="2" fill="url(#stkGold)">ALAN PRINTWORKS</text>
            <text x="0" y="6" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="5.5" fontWeight="500" letterSpacing="1" fill="#9CA3AF">WATERPROOF VINYL EMBOSSED</text>
            <line x1="-30" y1="12" x2="30" y2="12" stroke="url(#stkGold)" strokeWidth="0.8" strokeOpacity="0.7" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'custom-products',
    nameEn: 'Custom Products',
    nameAr: 'منتجات مخصصة',
    descEn: 'Corporate gifts, pens & acrylic passes',
    descAr: 'هدايا شركات، أقلام، وبطاقات أكريليك',
    illustration: (
      <svg viewBox="0 0 240 300" className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-300 ease-out group-hover:scale-105" aria-hidden="true">
        <defs>
          <linearGradient id="cstGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDEAB8" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9C7709" />
          </linearGradient>
          <linearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2C30" />
            <stop offset="100%" stopColor="#151619" />
          </linearGradient>
          <linearGradient id="penMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E4E8" />
            <stop offset="50%" stopColor="#A8ACB4" />
            <stop offset="100%" stopColor="#5B5F66" />
          </linearGradient>
          <filter id="cstShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="9" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="120" cy="250" rx="80" ry="14" fill="#000000" fillOpacity="0.08" />

        <g filter="url(#cstShadow)">
          {/* Executive Hardcover Journal (Angled) */}
          <g transform="translate(105, 160) rotate(-6) translate(-105,-160)">
            {/* Book Spine Shadow & Base */}
            <rect x="45" y="85" width="108" height="140" rx="6" fill="url(#bookCover)" stroke="#3E4249" strokeWidth="1" />
            {/* Gold Page Edge Gilt */}
            <rect x="146" y="90" width="6" height="130" fill="url(#cstGold)" />
            {/* Debossed Spine Ribbon */}
            <path d="M 80 85 L 85 85 L 85 225 L 80 225 Z" fill="#D4AF37" fillOpacity="0.3" />
            {/* Debossed Gold Monogram */}
            <circle cx="95" cy="145" r="16" fill="#1A1C1F" stroke="url(#cstGold)" strokeWidth="1.4" />
            <text x="95" y="151" textAnchor="middle" fontFamily="Georgia, serif" fontSize="16" fontWeight="bold" fill="url(#cstGold)">A</text>
            <text x="95" y="174" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="6.5" fontWeight="800" letterSpacing="1.5" fill="url(#cstGold)">NOTEBOOK</text>
            <text x="95" y="182" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="4.5" fontWeight="500" letterSpacing="0.8" fill="#888E96">EXECUTIVE EDITION</text>
            {/* Bookmark ribbon dangling */}
            <path d="M 98 225 L 98 245 L 102 240 L 106 245 L 106 225 Z" fill="url(#cstGold)" />
          </g>

          {/* Premium Metallic Twist Pen (Crossing across notebook) */}
          <g transform="translate(160, 160) rotate(22) translate(-160,-160)">
            {/* Pen shadow */}
            <rect x="156" y="65" width="10" height="155" rx="4" fill="#000000" fillOpacity="0.2" transform="translate(4, 6)" />
            {/* Pen Body Barrel */}
            <rect x="156" y="65" width="9" height="150" rx="4" fill="url(#penMetal)" stroke="#3E4248" strokeWidth="0.8" />
            {/* Pen Gold Grip / Trim */}
            <rect x="156" y="135" width="9" height="10" fill="url(#cstGold)" />
            <rect x="156" y="70" width="9" height="5" fill="url(#cstGold)" />
            {/* Gold Pocket Clip */}
            <path d="M 154 70 L 154 110 L 156 112" fill="none" stroke="url(#cstGold)" strokeWidth="2.2" strokeLinecap="round" />
            {/* Pen Tip */}
            <polygon points="156,215 165,215 160.5,230" fill="url(#cstGold)" />
          </g>

          {/* Floating Acrylic VIP Badge with Gold Beveled Rim */}
          <g transform="translate(175, 105)">
            <rect x="-24" y="-32" width="48" height="64" rx="4" fill="#FFFFFF" fillOpacity="0.2" stroke="url(#cstGold)" strokeWidth="1.5" />
            <rect x="-8" y="-30" width="16" height="4" rx="2" fill="#2E3036" />
            <circle cx="0" cy="-6" r="8" fill="#1C1E22" stroke="url(#cstGold)" strokeWidth="1" />
            <text x="0" y="-3" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="bold" fill="url(#cstGold)">VIP</text>
            <text x="0" y="14" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="5" fontWeight="800" letterSpacing="1" fill="#FFFFFF">PASS</text>
          </g>
        </g>
      </svg>
    ),
  },
];

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  onBrowseProducts,
  isArabic = false,
}) => {
  return (
    <section className="border-b border-neutral-200 bg-[#F7F6F2]" aria-labelledby="product-showcase-title">
      <div className="site-shell py-10 sm:py-12 lg:py-14">
        <div className="lg:grid lg:grid-cols-[clamp(250px,17vw,310px)_minmax(0,1fr)] lg:items-stretch lg:gap-8 xl:gap-10">
          <div className="max-w-md lg:flex lg:flex-col lg:self-stretch">
            <p className="text-base font-extrabold uppercase tracking-[0.16em] text-amber-700 lg:text-[clamp(1.125rem,1.1vw,1.25rem)]">
              {isArabic ? 'منتجاتنا' : 'Our Products'}
              <span className="mt-3 block h-px w-12 bg-amber-700/80" aria-hidden="true" />
            </p>
            <h2 id="product-showcase-title" className="mt-5 font-sans text-[clamp(2.125rem,2.2vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.025em] text-neutral-950">
              {isArabic ? (
                <>
                  <span className="block">كل ما تحتاجه</span>
                  <span className="block whitespace-nowrap">للطباعة الفاخرة</span>
                </>
              ) : (
                <>
                  <span className="block">Everything</span>
                  <span className="block whitespace-nowrap">You Can Print</span>
                </>
              )}
            </h2>
            <p className="mt-6 max-w-[18rem] text-[clamp(1rem,.95vw,1.0625rem)] leading-[1.6] text-neutral-600">
              {isArabic
                ? 'مطبوعات وتغليف وهدايا ترويجية تناسب جميع الشركات والمناسبات في دولة الإمارات.'
                : 'Premium print products for every idea, occasion and industry.'}
            </p>
            <button
              type="button"
              onClick={onBrowseProducts}
              className="group mt-7 inline-flex items-center gap-3 text-[clamp(1rem,1vw,1.0625rem)] font-bold text-neutral-900 transition-colors duration-200 ease-out hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 lg:mt-auto lg:border-t lg:border-neutral-300 lg:pt-3 cursor-pointer"
            >
              <span>{isArabic ? 'تصفح جميع المنتجات' : 'Browse All Products'}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>

          <div className="-mx-4 mt-8 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-0 lg:overflow-visible lg:px-0 lg:pb-0">
            <div className="grid auto-cols-[minmax(150px,42vw)] grid-flow-col gap-3 sm:auto-cols-[190px] lg:grid-flow-row lg:grid-cols-6 lg:gap-3">
              {CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={onBrowseProducts}
                  className="group min-w-0 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 cursor-pointer"
                  aria-label={`Browse ${category.nameEn}`}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-neutral-200 bg-[#ECEAE4] p-1 shadow-sm transition-all duration-300 group-hover:border-amber-600/50 group-hover:bg-[#E7E3D8] group-hover:shadow-md">
                    {category.illustration}
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2 border-t border-neutral-300 pt-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-5 text-neutral-900 group-hover:text-amber-800 transition-colors truncate">
                        {isArabic ? category.nameAr : category.nameEn}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate hidden sm:block">
                        {isArabic ? category.descAr : category.descEn}
                      </p>
                    </div>
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
