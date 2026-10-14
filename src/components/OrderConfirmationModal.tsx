import React from 'react';
import { Order } from '../types';
import { formatAED } from '../utils/pricing';
import { CheckCircle2, Printer, ArrowRight, ShieldCheck, MapPin, Building, QrCode } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
  isArabic?: boolean;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
  isArabic = false,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Top green success banner */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
                {isArabic ? 'تم تأكيد طلبك بنجاح' : 'Order Successfully Placed'}
              </p>
              <h3 className="font-serif font-bold text-lg">
                {isArabic ? `رقم الطلب: ${order.orderNumber}` : `Order Ref: ${order.orderNumber}`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-700/60 hover:bg-emerald-700 text-white text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isArabic ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
            </button>
          </div>
        </div>

        {/* Printable Official UAE Tax Invoice Container */}
        <div className="p-6 sm:p-8 space-y-6 text-neutral-800" id="printable-tax-invoice">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-200 pb-5">
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-neutral-900">
                ALAN ADVERTISMENT AND PRINTING
              </div>
              <p className="text-xs text-neutral-500 font-medium">ALAN ADVERTISMENT AND PRINTING · UAE</p>
              <div className="text-[11px] text-neutral-500 mt-2 space-y-0.5">
                <p>Street 8, Al Quoz Industrial Area 2, Dubai, UAE</p>
                <p className="font-mono font-medium text-neutral-700">
                  
                </p>
                <p>Commercial License: CN-2491049 · Government of Dubai</p>
              </div>
            </div>

            <div className="sm:text-right text-[11px] text-neutral-500">
              <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-900 font-semibold rounded text-xs border border-amber-200 mb-2">
                TAX INVOICE / فاتورة ضريبية
              </span>
              <p className="font-mono font-medium text-neutral-900">
                Invoice No: INV-{order.orderNumber}
              </p>
              <p>Issue Date: {order.createdAt}</p>
              <p>Supply Date: {order.estimatedDeliveryDate}</p>
            </div>
          </div>

          {/* Customer / Billed To details */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Billed To / العميل:
              </span>
              <p className="font-semibold text-neutral-900 mt-0.5">{order.customer.fullName}</p>
              {order.customer.companyName && (
                <p className="text-neutral-700 font-medium">{order.customer.companyName}</p>
              )}
              {order.customer.trnNumber && (
                <p className="font-mono text-neutral-600">Client TRN: {order.customer.trnNumber}</p>
              )}
              <p className="text-neutral-500 mt-0.5">{order.customer.email} · {order.customer.phone}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Fulfillment Destination:
              </span>
              <p className="font-semibold text-neutral-900 mt-0.5">
                {order.customer.deliveryType === 'delivery' 
                  ? `Courier Delivery · ${order.customer.emirate}` 
                  : 'Self Pickup at Dubai Al Quoz Facility'}
              </p>
              {order.customer.deliveryType === 'delivery' && (
                <p className="text-neutral-600 mt-0.5">{order.customer.areaAddress}</p>
              )}
              <p className="text-amber-800 text-[11px] font-medium mt-1">
                Estimated Delivery: {order.estimatedDeliveryDate}
              </p>
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-neutral-500 uppercase text-[10px] font-semibold">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Rate</th>
                  <th className="py-2 text-right">Total (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="text-neutral-700">
                    <td className="py-2.5 pr-2">
                      <div className="font-medium text-neutral-900">{item.product.title}</div>
                      <div className="text-[11px] text-neutral-500 space-y-0.5 mt-0.5">
                        <p>{item.selectedStock.name}</p>
                        <p className="text-amber-800">✦ {item.selectedFinish.name}</p>
                        <p className="font-mono">{item.selectedSize.label}</p>
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-mono tabular-nums">
                      {item.quantity} {item.product.unitLabel}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums">
                      {formatAED(item.unitPriceAED, isArabic)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium text-neutral-900 tabular-nums">
                      {formatAED(item.totalPriceAED, isArabic)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax summary */}
          <div className="border-t border-neutral-200 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs">
            <div className="space-y-1 text-neutral-500 text-[11px] max-w-xs">
              <p className="font-semibold text-neutral-700">Payment Status: Confirmed ({order.paymentMethod.toUpperCase()})</p>
              {order.paymentMethod === 'bank_transfer' && (
                <div className="p-2 bg-neutral-100 rounded text-[10px] font-mono text-neutral-800">
                  <p>Bank: Emirates NBD UAE</p>
                  <p>IBAN: AE09 0260 0001 0284 9284 01</p>
                  <p>Swift: EBILAEADXXX</p>
                </div>
              )}
              <p>This invoice is electronically certified under UAE Cabinet Decision No. (52) of 2017 on Executive Regulations of the Federal Law No. (8) on VAT.</p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal (Net):</span>
                <span className="font-mono tabular-nums">{formatAED(order.subtotalAED, isArabic)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping / Logistics:</span>
                <span className="font-mono tabular-nums">
                  {order.shippingAED === 0 ? 'FREE' : formatAED(order.shippingAED, isArabic)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>UAE 5% VAT (Included):</span>
                <span className="font-mono tabular-nums">{formatAED(order.vatAED, isArabic)}</span>
              </div>
              <div className="border-t border-neutral-900 pt-1.5 flex justify-between font-bold text-neutral-900 text-sm">
                <span>Total Amount Due:</span>
                <span className="font-mono text-base tabular-nums">{formatAED(order.totalAED, isArabic)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.orderNumber);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Track Production in Real-Time</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-medium transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    </div>
  );
};
