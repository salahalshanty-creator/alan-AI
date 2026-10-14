import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { DEMO_ORDERS } from '../data/products';
import { formatAED } from '../utils/pricing';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  AlertCircle,
  FileCheck,
  Printer,
  Sparkles,
  MapPin
} from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
  userOrders?: Order[];
  isArabic?: boolean;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
  userOrders = [],
  isArabic = false,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState(initialOrderNumber || 'AW-7842');
  const [activeOrder, setActiveOrder] = useState<any>(() => {
    if (initialOrderNumber) {
      const foundUserOrder = userOrders.find((o) => o.orderNumber === initialOrderNumber);
      if (foundUserOrder) return foundUserOrder;
      if (DEMO_ORDERS[initialOrderNumber]) return DEMO_ORDERS[initialOrderNumber];
    }
    return DEMO_ORDERS['AW-7842'];
  });
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    
    // Check in user placed orders
    const foundUserOrder = userOrders.find((o) => o.orderNumber === query);
    if (foundUserOrder) {
      setActiveOrder(foundUserOrder);
      setNotFound(false);
      return;
    }

    // Check in demo orders
    if (DEMO_ORDERS[query]) {
      setActiveOrder(DEMO_ORDERS[query]);
      setNotFound(false);
      return;
    }

    setNotFound(true);
  };

  const loadPreset = (orderId: string) => {
    setSearchQuery(orderId);
    if (DEMO_ORDERS[orderId]) {
      setActiveOrder(DEMO_ORDERS[orderId]);
      setNotFound(false);
    }
  };

  const STAGES: { key: OrderStatus; label: string; labelAr: string; icon: React.ReactNode }[] = [
    { key: 'preflight', label: '1. Prepress Proof', labelAr: '1. فحص البروفة وتجهيز القوالب', icon: <FileCheck className="w-4 h-4" /> },
    { key: 'printing', label: '2. Press Running', labelAr: '2. طباعة أوفست / ديجيتال', icon: <Printer className="w-4 h-4" /> },
    { key: 'finishing', label: '3. Foil & Die-Cut', labelAr: '3. بصمة ذهبية وقص ليزر', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'qc', label: '4. Quality Control', labelAr: '4. فحص الجودة والتغليف', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'dispatched', label: '5. Dispatched', labelAr: '5. تم الشحن والتسليم', icon: <Truck className="w-4 h-4" /> },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'preflight': return 0;
      case 'printing': return 1;
      case 'finishing': return 2;
      case 'qc': return 3;
      case 'dispatched': 
      case 'ready_for_pickup': 
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStageIdx = activeOrder ? getStageIndex(activeOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>ALAN Production Floor</span>
              <span aria-hidden="true">·</span>
              <span>Dubai Al Quoz Live Tracking</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900 mt-0.5">
              {isArabic ? 'تتبع مسار إنتاج المطبوعات والتسليم' : 'Print Job Live Tracking & Logistics'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input & preset shortcuts */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/40">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order Reference (e.g. AW-7842)..."
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
            >
              {isArabic ? 'بحث' : 'Track Order'}
            </button>
          </form>

          {/* Quick preset selector buttons */}
          <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500">
            <span>{isArabic ? 'أمثلة لطلبات قيد الإنتاج:' : 'Live sample UAE jobs:'}</span>
            <button
              type="button"
              onClick={() => loadPreset('AW-7842')}
              className="px-2 py-0.5 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-mono text-[11px] transition-colors"
            >
              AW-7842 (Dubai DIFC)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('AW-9103')}
              className="px-2 py-0.5 rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-mono text-[11px] transition-colors"
            >
              AW-9103 (Abu Dhabi)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {notFound ? (
            <div className="py-12 text-center text-neutral-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
              <p className="text-sm font-semibold text-neutral-700">Order not found</p>
              <p className="text-xs text-neutral-500 mt-1">
                Please verify the reference code (e.g. AW-7842) or contact our Dubai prepress studio.
              </p>
            </div>
          ) : activeOrder ? (
            <div className="space-y-6">
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 font-mono">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-medium capitalize">
                      {activeOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-neutral-900 text-base mt-1">
                    {activeOrder.items[0]?.productTitle || activeOrder.items[0]?.product?.title}
                  </h4>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Client: {activeOrder.customer.companyName || activeOrder.customer.fullName} · {activeOrder.customer.emirate}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-neutral-500 block">Expected Arrival:</span>
                  <span className="font-bold text-sm text-neutral-900 text-emerald-800 flex items-center sm:justify-end gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeOrder.estimatedDeliveryDate}
                  </span>
                </div>
              </div>

              {/* Progress Milestones Bar */}
              <div>
                <div className="grid grid-cols-5 gap-1.5 mb-6">
                  {STAGES.map((stage, idx) => {
                    const isDone = idx < currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div key={stage.key} className="text-center">
                        <div
                          className={`w-full h-1.5 rounded-full mb-2 transition-all ${
                            isDone
                              ? 'bg-emerald-600'
                              : isCurrent
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-neutral-200'
                          }`}
                        />
                        <div className={`text-[10px] font-semibold leading-tight ${
                          isCurrent ? 'text-amber-950 font-bold' : isDone ? 'text-emerald-800' : 'text-neutral-400'
                        }`}>
                          {isArabic ? stage.labelAr : stage.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Production Timeline Logs */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                  Production Studio Timeline Logs
                </h5>

                <div className="space-y-3">
                  {activeOrder.trackingUpdates?.map((update: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                      <div className="flex-1 pb-3 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900">{update.title}</span>
                          <span className="text-[10px] font-mono text-neutral-400">{update.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-0.5">{update.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facility & Courier Note */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  <span>
                    Fulfillment: {activeOrder.customer.deliveryType === 'pickup' 
                      ? 'Self-pickup at Al Quoz 2 Facility' 
                      : `Dedicated UAE Courier to ${activeOrder.customer.areaAddress}`}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  Total: {formatAED(activeOrder.totalAED, isArabic)}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
