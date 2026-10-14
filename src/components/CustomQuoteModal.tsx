import React, { useState } from 'react';
import { X, Send, CheckCircle2, FileText, Upload } from 'lucide-react';
import { UAE_EMIRATES } from '../data/products';
import { Emirate } from '../types';

import { db } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

interface CustomQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic?: boolean;
}

export const CustomQuoteModal: React.FC<CustomQuoteModalProps> = ({
  isOpen,
  onClose,
  isArabic = false,
}) => {
  if (!isOpen) return null;

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '+971 ',
    projectType: 'Luxury Packaging & Gift Boxes',
    estimatedQuantity: '1,000 - 5,000 units',
    requiredDeadline: 'Within 2 Weeks',
    emirate: 'Dubai' as Emirate,
    specifications: '',
    hasArtwork: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    try {
      const quoteRef = doc(collection(db, 'quotes'));
      await setDoc(quoteRef, {
        quoteId: quoteRef.id,
        fullName: formData.name,
        companyName: formData.company,
        email: formData.email,
        phone: formData.phone,
        productType: formData.projectType,
        specifications: formData.specifications,
        emirate: formData.emirate,
        estimatedQuantity: formData.estimatedQuantity,
        createdAt: new Date().toISOString(),
      });
      console.log('[Firestore] Quote saved successfully');
    } catch (err) {
      console.warn('[Firestore] Quote save notice:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>Bespoke Engineering & Tenders</span>
              <span aria-hidden="true">·</span>
              <span>Dedicated Prepress Consultant</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900 mt-0.5">
              {isArabic ? 'طلب عرض سعر لمشروع مخصص' : 'Custom Print RFP & Enterprise Quote'}
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
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-serif font-bold text-neutral-900">
              {isArabic ? 'تم استلام طلب التسعير بنجاح' : 'Bespoke RFP Received'}
            </h4>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
              {isArabic 
                ? 'يقوم خبير الإنتاج في ALAN ADVERTISMENT AND PRINTING بدراسة المواصفات الفنية وإعداد عرض السعر الرسمي وعينة الطباعة خلال ساعتي عمل.' 
                : 'Our production engineering team is reviewing your substrate and finishing specifications. An itemized proposal with dieline mockups will be emailed within 2 hours.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sultan Al Qasimi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Louvre Abu Dhabi Exhibition Pavilion"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="sultan@pavilion.ae"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  placeholder="+971 50 234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Project Domain
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Luxury Packaging & Gift Boxes">Luxury Packaging & Rigid Boxes</option>
                  <option value="Corporate Identity & Foiled Stationery">Corporate Identity & Stationery Suites</option>
                  <option value="Hardcover Books & Art Catalogs">Hardcover Books & Art Catalogs</option>
                  <option value="Large Scale Exhibition & Pavilion Signage">Exhibition & Pavilion Signage</option>
                  <option value="Perfume & Cosmetic Packaging Rolls">Cosmetic & Perfume Bottle Packaging</option>
                  <option value="Other Bespoke Printing">Other Bespoke Printing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Target Quantity
                </label>
                <select
                  value={formData.estimatedQuantity}
                  onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="500 - 1,000 units">500 - 1,000 units</option>
                  <option value="1,000 - 5,000 units">1,000 - 5,000 units</option>
                  <option value="5,000 - 25,000 units">5,000 - 25,000 units</option>
                  <option value="25,000+ units">25,000+ units</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Technical Specifications & Finishing Details
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your dimensions, desired GSM, foil stamping colors, embossing depths, or special Pantone color requirements..."
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isArabic ? 'إرسال طلب التسعير المخصص' : 'Submit Bespoke Print Tender'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
