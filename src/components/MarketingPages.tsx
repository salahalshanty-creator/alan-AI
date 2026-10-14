import React from 'react';
import { ArrowRight, BadgePercent, Megaphone, Package, Phone, Star, Target } from 'lucide-react';
import { PRODUCTS } from '../data/products';

interface Props { isArabic: boolean; onNavigate: (path: string) => void; onOpenQuote: () => void; }

const photos = [
  '/src/assets/images/product_luxury_business_cards_1790497087122.jpg',
  '/src/assets/images/product_marketing_flyers_1790497628920.jpg',
  '/src/assets/images/product_catalog_brochure_print_1790497116019.jpg',
  '/src/assets/images/product_exhibition_banners_1790497641557.jpg',
  '/src/assets/images/product_bespoke_rigid_boxes_1790497098587.jpg',
  '/src/assets/images/facility_heidelberg_press_1790497128205.jpg',
];

export const OffersPage: React.FC<Props> = ({ isArabic, onNavigate, onOpenQuote }) => (
  <main className="bg-[#FBFBFA] min-h-[70vh]" dir={isArabic ? 'rtl' : 'ltr'}>
    <section className="bg-neutral-950 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="text-amber-400 text-xs uppercase tracking-[0.2em] font-semibold">{isArabic ? 'عروض خاصة' : 'Special Offers'}</span>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold mt-3">{isArabic ? 'حلول إعلانية وطباعة للشركات' : 'Offers & Advertising Solutions'}</h1>
        <p className="text-neutral-300 max-w-2xl mt-5 leading-relaxed">{isArabic ? 'باقات عملية للمشاريع الجديدة والمتاجر والمطاعم والفعاليات.' : 'Practical print packages for new businesses, retail brands, restaurants, events and growing companies.'}</p>
      </div>
    </section>
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          ['New Business', 'Business cards + flyers + stickers + roll-up', 'From AED 299'],
          ['E-commerce', 'Labels + thank-you cards + hang tags + stickers', 'From AED 249'],
          ['Café & Restaurant', 'Menus + loyalty cards + stickers + flyers', 'From AED 399'],
          ['Salon & Beauty', 'Cards + loyalty cards + stickers + T-shirts', 'From AED 349'],
        ].map(([title, desc, price]) => (
          <article key={title} className="bg-white border border-neutral-200 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-5"><BadgePercent className="w-5 h-5" /></div>
            <h2 className="font-serif font-bold text-xl text-neutral-900">{title}</h2><p className="text-sm text-neutral-600 mt-2 leading-relaxed">{desc}</p><p className="font-semibold text-amber-800 mt-5">{price}</p>
            <button onClick={onOpenQuote} className="mt-5 text-sm font-semibold flex items-center gap-2">Get a quote <ArrowRight className="w-4 h-4" /></button>
          </article>
        ))}
      </div>
      <div className="mt-12 rounded-3xl overflow-hidden relative min-h-[360px] flex items-end">
        <img src={photos[1]} alt="Professional printed advertising materials" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="relative z-10 p-8 sm:p-12 text-white max-w-2xl"><Megaphone className="w-8 h-8 text-amber-300" /><h2 className="text-3xl font-serif font-bold mt-3">{isArabic ? 'اجعل علامتك التجارية ظاهرة' : 'Make your brand impossible to miss.'}</h2><p className="text-neutral-200 mt-3">{isArabic ? 'طباعة إعلانية، ملصقات، بانرات ومواد فعاليات بجودة احترافية.' : 'Flyers, stickers, banners and event materials designed to make your brand stand out.'}</p></div>
      </div>
    </section>
  </main>
);

export const WorkPage: React.FC<Props> = ({ isArabic, onNavigate, onOpenQuote }) => (
  <main className="bg-[#FBFBFA] min-h-[70vh]" dir={isArabic ? 'rtl' : 'ltr'}>
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><span className="text-amber-800 text-xs uppercase tracking-[0.2em] font-semibold">{isArabic ? 'معرض الأعمال' : 'Portfolio'}</span><h1 className="text-4xl sm:text-6xl font-serif font-bold mt-3">{isArabic ? 'أعمالنا' : 'Our Work'}</h1><p className="text-neutral-600 max-w-2xl mt-4">{isArabic ? 'مجموعة من أمثلة الطباعة والتغليف والمواد الإعلانية.' : 'A visual selection of print, packaging, signage and advertising work.'}</p></section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {photos.map((src, i) => <div key={src} className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-neutral-200"><img src={src} alt="ALAN printing work" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/75 to-transparent text-white"><p className="font-semibold">{['Business Cards','Flyers & Advertising','Brochures & Catalogues','Banners & Displays','Packaging','Professional Printing'][i]}</p></div></div>)}
    </section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"><div className="rounded-2xl bg-neutral-900 text-white p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"><div><h2 className="text-2xl font-serif font-bold">{isArabic ? 'لديك مشروع طباعة؟' : 'Have a project in mind?'}</h2><p className="text-neutral-300 mt-1">{isArabic ? 'أرسل التفاصيل وسنجهز لك عرضاً مناسباً.' : 'Send us your requirements and we will prepare a quote.'}</p></div><button onClick={onOpenQuote} className="px-5 py-3 bg-amber-500 text-neutral-950 rounded-xl font-semibold">Get a Quote</button></div></section>
  </main>
);

export const AboutPage: React.FC<Props> = ({ isArabic, onNavigate, onOpenQuote }) => (
  <main className="bg-[#FBFBFA] min-h-[70vh]" dir={isArabic ? 'rtl' : 'ltr'}>
    <section className="bg-neutral-950 text-white py-20"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><span className="text-amber-400 text-xs uppercase tracking-[0.2em] font-semibold">ALAN</span><h1 className="text-4xl sm:text-6xl font-serif font-bold mt-3">{isArabic ? 'من نحن' : 'About ALAN'}</h1><p className="text-neutral-300 max-w-2xl mt-5 leading-relaxed">{isArabic ? 'الإعلان والطباعة تحت اسم واحد، مع التركيز على الجودة والتفاصيل.' : 'Advertising and printing under one name, with a focus on quality, presentation and dependable service.'}</p></div></section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-10 items-center"><img src={photos[5]} alt="Professional printing facility" className="rounded-3xl w-full aspect-[4/3] object-cover" /><div><Target className="w-9 h-9 text-amber-700" /><h2 className="text-3xl font-serif font-bold mt-4">{isArabic ? 'نركز على علامتك التجارية' : 'Your brand is the focus.'}</h2><p className="text-neutral-600 mt-4 leading-relaxed">{isArabic ? 'نوفر مواد مطبوعة وإعلانية تساعد الشركات على الظهور بصورة احترافية، من بطاقات الأعمال إلى التغليف والمواد الإعلانية.' : 'We provide printed and advertising materials that help businesses present themselves professionally—from business cards and brochures to packaging and promotional materials.'}</p><div className="grid sm:grid-cols-3 gap-4 mt-8"><div className="p-4 bg-white border rounded-xl"><Star className="w-5 h-5 text-amber-600"/><p className="font-semibold mt-2">Quality</p></div><div className="p-4 bg-white border rounded-xl"><Package className="w-5 h-5 text-amber-600"/><p className="font-semibold mt-2">Printing</p></div><div className="p-4 bg-white border rounded-xl"><Megaphone className="w-5 h-5 text-amber-600"/><p className="font-semibold mt-2">Advertising</p></div></div><button onClick={onOpenQuote} className="mt-8 px-5 py-3 bg-neutral-900 text-white rounded-xl font-semibold">Contact ALAN</button></div></section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"><div className="rounded-2xl border bg-white p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div><h3 className="font-serif font-bold text-2xl">{isArabic ? 'تواصل معنا' : 'Talk to our team'}</h3><p className="text-neutral-600 mt-1">052 364 0939</p></div><a href="https://wa.me/971523640939" target="_blank" rel="noreferrer" className="px-5 py-3 bg-[#25D366] text-white rounded-xl font-semibold flex items-center gap-2"><Phone className="w-4 h-4"/> WhatsApp</a></div></section>
  </main>
);
