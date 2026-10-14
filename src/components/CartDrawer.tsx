import React from 'react';
import { CartItem } from '../types';
import { formatAED } from '../utils/pricing';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, FileCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  isArabic?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onProceedToCheckout,
  isArabic = false,
}) => {
  if (!isOpen) return null;

  const subtotalAED = items.reduce((acc, item) => acc + item.totalPriceAED, 0);
  const vatAED = Math.round(subtotalAED * 0.05 * 100) / 100;
  const grandTotalAED = subtotalAED; // Note: totalPriceAED already incorporates VAT from calculator

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-800" />
            <h3 className="font-serif font-bold text-lg text-neutral-900">
              {isArabic ? 'سلة المطبوعات' : 'Printing Press Cart'}
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <ShoppingBag className="w-12 h-12 mx-auto stroke-1 mb-3 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-700">
                {isArabic ? 'سلة الطلبات فارغة حالياً' : 'Your printing cart is empty'}
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                {isArabic 
                  ? 'اختر من المنتجات الفاخرة وخصص الأوراق والتشطيبات للحصول على تسعير فوري' 
                  : 'Select any product from our catalog to configure papers, foils, and instant pricing.'}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 relative group hover:border-neutral-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-serif font-bold text-neutral-900">
                      {isArabic ? item.product.titleAr : item.product.title}
                    </h4>
                    
                    {/* Specs summary as clean unboxed text with bullets */}
                    <div className="text-[11px] text-neutral-500 mt-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-700">Qty: {item.quantity} {item.product.unitLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.selectedSize.label.split('(')[0]}</span>
                      </div>
                      <div className="text-neutral-600 truncate">
                        {item.selectedStock.name}
                      </div>
                      <div className="text-amber-800 font-medium truncate">
                        ✦ {item.selectedFinish.name}
                      </div>
                      {item.artworkFileName && (
                        <div className="flex items-center gap-1 text-emerald-700 text-[10px] mt-1">
                          <FileCheck className="w-3 h-3" />
                          <span className="truncate">{item.artworkFileName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {item.turnaroundSpeed === 'rushSameDay' 
                      ? '⚡ Same-Day Rush' 
                      : item.turnaroundSpeed === 'express24h' 
                      ? '⚡ 24h Express' 
                      : 'Standard 3 Days'}
                  </span>
                  <span className="font-serif font-bold text-neutral-900 font-mono tabular-nums text-sm">
                    {formatAED(item.totalPriceAED, isArabic)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with summary and CTA */}
        {items.length > 0 && (
          <div className="p-5 border-t border-neutral-200 bg-neutral-50/60">
            <div className="space-y-1.5 text-xs text-neutral-600 mb-4">
              <div className="flex justify-between">
                <span>{isArabic ? 'إجمالي الطلبات' : 'Cart Subtotal'}:</span>
                <span className="font-mono tabular-nums text-neutral-900 font-medium">
                  {formatAED(grandTotalAED, isArabic)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500 text-[11px]">
                <span>{isArabic ? 'شامل ضريبة القيمة المضافة 5%' : 'Includes 5% UAE VAT'}:</span>
                <span>Professional invoice available</span>
              </div>
              <div className="flex justify-between text-neutral-500 text-[11px]">
                <span>{isArabic ? 'التوصيل' : 'Delivery'}:</span>
                <span className="text-emerald-700 font-medium">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3 text-[11px] text-neutral-500 bg-white p-2.5 rounded-lg border border-neutral-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isArabic 
                  ? 'ضمان جودة الألوان والمطابقة لقوالب النحاس الألمانية 100%' 
                  : '100% Color Precision & Registration Quality Guarantee.'}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>{isArabic ? 'المتابعة للدفع وتأكيد الطلب' : 'Proceed to UAE Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
