import React, { useState } from 'react';
import { Emirate } from '../types';
import { UAE_EMIRATES } from '../data/products';
import { X, Sparkles, CheckCircle2, PackageCheck } from 'lucide-react';

interface SwatchKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
}

export const SwatchKitModal: React.FC<SwatchKitModalProps> = ({
  isOpen,
  onClose,
  isArabic = false,
}) => {
  if (!isOpen) return null;

  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+971 ');
  const [emirate, setEmirate] = useState<Emirate>('Dubai');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // keep open with success state
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>ALAN Paper Archive</span>
              <span aria-hidden="true">·</span>
              <span>Delivered across 7 Emirates</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900 mt-0.5">
              {isArabic ? 'طلب كتالوج عينات الأوراق والتشطيبات الفاخرة' : 'Request Complimentary Swatch Book'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-serif font-bold text-neutral-900">
              {isArabic ? 'تم تأكيد إرسال العينات لمكتبكم' : 'Sample Swatch Kit Dispatched!'}
            </h4>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
              {isArabic 
                ? 'سيتم توصيل كتالوج العينات الورقية الفاخرة الملموسة مع نماذج البصمة الحرارية والورنيش البارز إلى عنوانكم في الإمارات خلال 24-48 ساعة.' 
                : 'Our physical sample book featuring 24 luxury Italian cotton & Fedrigoni boards, 5 hot foil finishes, and Spot UV effects will arrive at your UAE office within 24-48 hours.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold"
            >
              Back to Catalog
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Complimentary for UAE Corporate Design & Marketing Teams:</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Includes real printed swatches of 600gsm Cotton, 450gsm Velvet, Gold/Rose Gold/Silver foils, 3D Spot UV, and rigid box materials.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Noura Al Kaabi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Company / Agency *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atelier Dubai Architecture"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="noura@atelier.ae"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  UAE Mobile *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+971 50 987 6543"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Emirate *
                </label>
                <select
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value as Emirate)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {UAE_EMIRATES.map((em) => (
                    <option key={em.name} value={em.name}>
                      {em.name} ({em.nameAr})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Office Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tower, Floor, Office & Street Address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isArabic ? 'إرسال عينات الأوراق مجاناً' : 'Request Free UAE Swatch Kit'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
