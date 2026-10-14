import React, { useState } from 'react';
import { CartItem, Emirate, Order, OrderCustomer, PaymentMethodType, PaymentDetails } from '../types';
import { UAE_EMIRATES } from '../data/products';
import { formatAED } from '../utils/pricing';
import { 
  X, 
  Building2, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Lock, 
  Smartphone, 
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCreated: (order: Order) => void;
  isArabic?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCreated,
  isArabic = false,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<OrderCustomer>({
    fullName: '',
    companyName: '',
    trnNumber: '',
    email: '',
    phone: '+971 ',
    emirate: 'Dubai',
    areaAddress: '',
    deliveryType: 'delivery',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Card fields state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // 3D Secure OTP simulator state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pendingOrderData, setPendingOrderData] = useState<Order | null>(null);

  // Digital Wallet Quick Authorization simulator state
  const [walletAuthorizing, setWalletAuthorizing] = useState<string | null>(null);

  // Delivery fee calculation
  const currentEmirateData = UAE_EMIRATES.find((e) => e.name === formData.emirate) || UAE_EMIRATES[0];
  const itemsSubtotal = items.reduce((acc, it) => acc + it.totalPriceAED, 0);
  
  const shippingAED = formData.deliveryType === 'pickup' 
    ? 0 
    : itemsSubtotal >= currentEmirateData.freeThreshold 
    ? 0 
    : currentEmirateData.deliveryFee;

  const grandTotalAED = itemsSubtotal + shippingAED;
  const vatCalculated = Math.round(grandTotalAED * 0.05 * 100) / 100;

  // Auto-detect card network
  const getCardBrand = (number: string): 'Visa' | 'Mastercard' | 'Jaywan' | 'Amex' | 'Card' => {
    const clean = number.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'Visa';
    if (/^5[1-5]|^2[2-7]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'Amex';
    if (/^67|^50|^58|^60/.test(clean)) return 'Jaywan'; // UAE national debit
    return 'Card';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 16);
    // Format in groups of 4
    const parts = value.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : value);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const executeOrderFinalization = (order: Order) => {
    onOrderCreated(order);
    onClose();
  };

  // Digital Wallet One-Click Checkout (Apple Pay / Google Pay)
  const handleDigitalWalletPay = (wallet: 'apple_pay' | 'google_pay') => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg(isArabic ? 'يرجى إدخال اسم العميل والبريد ورقم الهاتف أولاً' : 'Please provide your name, email and UAE phone number above.');
      return;
    }
    if (formData.deliveryType === 'delivery' && !formData.areaAddress.trim()) {
      setErrorMsg(isArabic ? 'يرجى إدخال عنوان التوصيل' : 'Please provide your delivery address in ' + formData.emirate);
      return;
    }

    setErrorMsg('');
    setWalletAuthorizing(wallet);

    setTimeout(() => {
      const orderNumber = `AW-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        orderNumber,
        createdAt: new Date().toLocaleString('en-US', { 
          timeZone: 'Asia/Dubai', 
          dateStyle: 'medium', 
          timeStyle: 'short' 
        }) + ' GST',
        customer: formData,
        items,
        subtotalAED: itemsSubtotal,
        vatAED: vatCalculated,
        shippingAED,
        totalAED: grandTotalAED,
        paymentMethod: wallet,
        paymentDetails: {
          method: wallet,
          provider: wallet === 'apple_pay' ? 'Apple Pay (Secure Enclave Token)' : 'Google Pay (Google Payment API)',
          transactionRef: `UAE-WAL-${Date.now().toString(36).toUpperCase()}`,
          authorizationCode: `AUTH-CBUAE-${Math.floor(100000 + Math.random() * 900000)}`,
          threeDSecureVerified: true,
          cardBrand: wallet === 'apple_pay' ? 'ApplePay' : 'GooglePay',
          cardLast4: '4821',
          paidAt: new Date().toISOString(),
        },
        status: 'preflight',
        estimatedDeliveryDate: formData.emirate === 'Dubai' ? 'Tomorrow, 4:00 PM GST' : 'In 2 Business Days',
        trackingUpdates: [
          {
            status: 'preflight',
            title: 'Payment Authorized & Pre-flight Proof Queued',
            description: `Paid via ${wallet === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}. Prepress studio preparing digital color proof and die registration.`,
            timestamp: 'Just now',
          },
        ],
      };

      setWalletAuthorizing(null);
      executeOrderFinalization(newOrder);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg(isArabic ? 'يرجى استكمال الاسم والبريد ورقم الهاتف' : 'Please complete your name, email, and UAE phone number.');
      return;
    }

    if (formData.deliveryType === 'delivery' && !formData.areaAddress.trim()) {
      setErrorMsg(isArabic ? 'يرجى تحديد عنوان التوصيل في ' + formData.emirate : 'Please specify your delivery address in ' + formData.emirate);
      return;
    }

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 15) {
        setErrorMsg('Please enter a valid 16-digit credit/debit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg('Please specify card expiry MM/YY.');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('Please enter the 3-digit CVV security code.');
        return;
      }
    }

    setIsProcessing(true);
    setErrorMsg('');

    const orderNumber = `AW-${Math.floor(1000 + Math.random() * 9000)}`;
    const brand = getCardBrand(cardNumber);
    const cardLast4 = cardNumber.replace(/\s/g, '').slice(-4) || '8842';

    const orderObj: Order = {
      orderNumber,
      createdAt: new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Dubai', 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }) + ' GST',
      customer: formData,
      items,
      subtotalAED: itemsSubtotal,
      vatAED: vatCalculated,
      shippingAED,
      totalAED: grandTotalAED,
      paymentMethod,
      paymentDetails: {
        method: paymentMethod,
        provider: paymentMethod === 'card' ? `UAE Gateway (3DS 2.0 / ${brand})` : 'Corporate Terms',
        transactionRef: `TXN-${Date.now().toString(36).toUpperCase()}`,
        authorizationCode: `APPR-${Math.floor(100000 + Math.random() * 900000)}`,
        threeDSecureVerified: paymentMethod === 'card',
        cardBrand: brand === 'Card' ? 'Visa' : brand,
        cardLast4: paymentMethod === 'card' ? cardLast4 : undefined,
        paidAt: new Date().toISOString(),
      },
      status: 'preflight',
      estimatedDeliveryDate: formData.emirate === 'Dubai' ? 'Tomorrow, 4:00 PM GST' : 'In 2 Business Days',
      trackingUpdates: [
        {
          status: 'preflight',
          title: 'Order Confirmed & Pre-flight Queued',
          description: 'Order registered. Prepress studio preparing digital color proof and die registration.',
          timestamp: 'Just now',
        },
      ],
    };

    // If card payment, simulate UAE Central Bank 3D Secure OTP verification
    if (paymentMethod === 'card') {
      setTimeout(() => {
        setIsProcessing(false);
        setPendingOrderData(orderObj);
        setShowOtpModal(true);
      }, 700);
      return;
    }

    // Direct fulfillment for wire or COD or Tabby
    setTimeout(() => {
      setIsProcessing(false);
      executeOrderFinalization(orderObj);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() !== '784291' && otpCode.trim().length !== 6) {
      setOtpError('Invalid OTP code. Please enter 784291 (or any 6 digits).');
      return;
    }

    if (pendingOrderData) {
      setShowOtpModal(false);
      executeOrderFinalization(pendingOrderData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <span className="text-amber-800 font-semibold">ALAN ADVERTISMENT AND PRINTING</span>
              <span aria-hidden="true">·</span>
              <span>UAE Central Bank & FTA Tax Compliant</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900 mt-0.5">
              {isArabic ? 'الدفع الآمن وإصدار الفاتورة الضريبية' : 'Secure UAE Payment & Tax Invoicing'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Express Digital Wallets (Apple Pay / Google Pay) */}
          <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                {isArabic ? 'الدفع السريع بمحفظة رقمية مشفرة' : 'Express Digital Wallet (UAE CBUAE Tokenized)'}
              </span>
              <span className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1-Click Instant Pay
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Apple Pay Button */}
              <button
                type="button"
                onClick={() => handleDigitalWalletPay('apple_pay')}
                disabled={walletAuthorizing !== null}
                className="w-full py-3 bg-black hover:bg-neutral-900 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 disabled:opacity-50"
              >
                {walletAuthorizing === 'apple_pay' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Touch ID / Face ID Authenticating...
                  </span>
                ) : (
                  <>
                    <span className="text-base font-semibold tracking-tighter"></span>
                    <span className="font-semibold text-sm">Pay</span>
                    <span className="text-[11px] text-neutral-300">({formatAED(grandTotalAED, isArabic)})</span>
                  </>
                )}
              </button>

              {/* Google Pay Button */}
              <button
                type="button"
                onClick={() => handleDigitalWalletPay('google_pay')}
                disabled={walletAuthorizing !== null}
                className="w-full py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 disabled:opacity-50"
              >
                {walletAuthorizing === 'google_pay' ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-neutral-800 rounded-full animate-spin" />
                    Google Account Tokenizing...
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-sm tracking-tight text-blue-600">G</span>
                    <span className="font-semibold text-sm text-neutral-800">Pay</span>
                    <span className="text-[11px] text-neutral-500 font-mono">({formatAED(grandTotalAED, isArabic)})</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
              <span>Tokenized via Central Bank of the UAE Payment Standards</span>
              <span>No card details stored on server</span>
            </div>
          </div>

          {/* Section 1: Contact & Organization Credentials */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-700" />
              {isArabic ? '1. بيانات العميل والشركة والفاتورة الضريبية' : '1. Client Credentials & Tax Invoice Information'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {isArabic ? 'الاسم الكامل *' : 'Full Contact Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rashid Al Nuaimi"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {isArabic ? 'اسم الشركة أو العلامة التجارية' : 'Company or Brand Name (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Al Nuaimi Luxury Holdings"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {isArabic ? 'البريد الإلكتروني للبروفات والفاتورة *' : 'Work Email for Proofs & Tax Invoice *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="rashid@company.ae"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {isArabic ? 'رقم الهاتف الإماراتي *' : 'UAE Mobile Number *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+971 50 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {isArabic ? 'الرقم الضريبي للشركة (TRN - اختياري لخصم الضريبة)' : 'UAE Corporate Tax Registration Number (TRN - 15 Digits, Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="TRN (optional)"
                  value={formData.trnNumber}
                  onChange={(e) => setFormData({ ...formData, trnNumber: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Fulfillment & Emirate */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-700" />
              {isArabic ? '2. التوصيل في الإمارات أو الاستلام من المطبعة' : '2. Fulfillment & Emirates Logistics'}
            </h4>

            {/* Delivery type toggle */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryType: 'delivery' })}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${
                  formData.deliveryType === 'delivery'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <Truck className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Direct Courier Fleet</div>
                  <div className={`text-[11px] mt-0.5 ${formData.deliveryType === 'delivery' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Fast delivery across all 7 Emirates
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryType: 'pickup' })}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${
                  formData.deliveryType === 'pickup'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <div className="font-semibold">Facility Pickup (Al Quoz)</div>
                  <div className={`text-[11px] mt-0.5 ${formData.deliveryType === 'pickup' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Collect free from our Dubai atelier
                  </div>
                </div>
              </button>
            </div>

            {formData.deliveryType === 'delivery' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-50/70 rounded-xl border border-neutral-200">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    {isArabic ? 'الإمارة *' : 'Select Emirate *'}
                  </label>
                  <select
                    value={formData.emirate}
                    onChange={(e) => setFormData({ ...formData, emirate: e.target.value as Emirate })}
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
                    {isArabic ? 'العنوان التفصيلي (المنطقة، البرج، الطابق، المكتب) *' : 'Street Address, Tower, Floor & Office *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Saada St, DIFC Gate Village 04, Level 6"
                    value={formData.areaAddress}
                    onChange={(e) => setFormData({ ...formData, areaAddress: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Atelier Pickup Address:</span> Street 8, Al Quoz Industrial Area 2, Dubai (Near Alserkal Avenue).
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Open Mon-Sat 8:00 AM – 7:30 PM. Order tracking notification will be dispatched when packed.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Payment Gateway Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-700" />
                {isArabic ? '3. بوابات وطرق الدفع المعتمدة في الإمارات' : '3. Payment Gateway & UAE Compliant Settlement'}
              </h4>
              <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                CBUAE & 3DS 2.0
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  paymentMethod === 'card'
                    ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="font-semibold">Credit/Debit Card</div>
                <div className={`text-[10px] mt-0.5 ${paymentMethod === 'card' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Visa, MC, Jaywan
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tabby_tamara')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  paymentMethod === 'tabby_tamara'
                    ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>Tabby / Tamara</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${paymentMethod === 'tabby_tamara' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  4 Interest-Free Splits
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="font-semibold">Corporate Wire</div>
                <div className={`text-[10px] mt-0.5 ${paymentMethod === 'bank_transfer' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Emirates NBD IBAN
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="font-semibold">Card on Delivery</div>
                <div className={`text-[10px] mt-0.5 ${paymentMethod === 'cod' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Corporate PO / COD
                </div>
              </button>
            </div>

            {/* Credit / Debit Card Fields (Visa, Mastercard, Jaywan) */}
            {paymentMethod === 'card' && (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-800">
                    Enter Card Details
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-neutral-600">
                    <span className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">VISA</span>
                    <span className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded">Mastercard</span>
                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded">JAYWAN (UAE)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-600 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-amber-800 uppercase">
                      {getCardBrand(cardNumber)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-600 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={handleCardExpiryChange}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-600 mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-neutral-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Protected by 3-D Secure 2.0 with Central Bank of the UAE regulatory protocol</span>
                </div>
              </div>
            )}

            {/* Tabby / Tamara Details */}
            {paymentMethod === 'tabby_tamara' && (
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="font-semibold flex items-center justify-between">
                  <span>Pay in 4 interest-free installments:</span>
                  <span className="font-mono font-bold text-sm">4 × {formatAED(grandTotalAED / 4, isArabic)}</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  No hidden interest, no administration fees. Pay 25% today upon confirmation, and the remaining 3 payments every 30 days automatically.
                </p>
                <div className="text-[10px] text-emerald-700 font-medium">
                  Approved by Central Bank of the UAE Buy Now Pay Later (BNPL) regulations.
                </div>
              </div>
            )}

            {/* Bank Wire Details */}
            {paymentMethod === 'bank_transfer' && (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 space-y-1.5">
                <div className="font-semibold text-neutral-900">Official Corporate Account (Emirates NBD):</div>
                <div className="font-mono text-[11px] space-y-0.5 text-neutral-700">
                  <p>Account Name: ALAN ADVERTISMENT AND PRINTING</p>
                  <p>IBAN: AE28 0260 0001 0284 9104 001</p>
                  <p>SWIFT / BIC: EBILAEAD</p>
                  <p>Branch: Al Quoz Industrial 2, Dubai</p>
                </div>
                <p className="text-[10px] text-neutral-500 pt-1">
                  Tax invoice generated immediately. Prepress proofs proceed while corporate finance releases the wire.
                </p>
              </div>
            )}

            {/* COD Details */}
            {paymentMethod === 'cod' && (
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-800 space-y-1">
                <div className="font-semibold">Corporate Card / Cash on Delivery</div>
                <p className="text-[11px] text-neutral-600">
                  Our delivery drivers carry point-of-sale terminals accepting Visa, Mastercard, and Jaywan debit cards upon signing receipt in Dubai, Abu Dhabi, and Sharjah.
                </p>
              </div>
            )}
          </div>

          {/* Price Breakdown & Tax Confirmation */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Items Total ({items.length} print orders):</span>
              <span className="font-mono tabular-nums">{formatAED(itemsSubtotal, isArabic)}</span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>Delivery to {formData.emirate}:</span>
              <span className="font-mono tabular-nums">
                {shippingAED === 0 ? 'FREE' : formatAED(shippingAED, isArabic)}
              </span>
            </div>

            <div className="flex justify-between text-neutral-500">
              <span>UAE Federal Tax Authority VAT (5% Included):</span>
              <span className="font-mono tabular-nums">{formatAED(vatCalculated, isArabic)}</span>
            </div>

            <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-sm font-bold text-neutral-900">
              <span>Grand Total Payable:</span>
              <span className="text-xl font-serif font-mono tabular-nums">
                {formatAED(grandTotalAED, isArabic)}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting to UAE Payment Gateway...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                {isArabic ? 'تأكيد السداد وإصدار الفاتورة الضريبية الرسمية' : `Pay ${formatAED(grandTotalAED, isArabic)} & Generate Tax Invoice`}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* 3-D SECURE 2.0 UAE BANK OTP SIMULATION MODAL */}
      {showOtpModal && pendingOrderData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Bank Header */}
            <div className="bg-[#002D62] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">UAE Central Bank 3-D Secure</div>
                  <div className="text-[10px] text-neutral-300">Emirates NBD / ADCB / FAB Gateway</div>
                </div>
              </div>
              <button 
                onClick={() => setShowOtpModal(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center space-y-1">
                <div className="text-sm font-semibold text-neutral-900">
                  Authenticate Transaction
                </div>
                <p className="text-[11px] text-neutral-500">
                  A 6-digit One-Time Password (OTP) has been sent via SMS to your UAE registered mobile number ending in <span className="font-bold text-neutral-800 font-mono">**84</span>.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Merchant:</span>
                  <span className="font-semibold text-neutral-900">ALAN ADVERTISMENT AND PRINTING</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount:</span>
                  <span className="font-mono font-bold text-neutral-900">{formatAED(pendingOrderData.totalAED, isArabic)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Card:</span>
                  <span className="font-mono text-neutral-900">•••• •••• •••• {pendingOrderData.paymentDetails?.cardLast4 || '8842'}</span>
                </div>
              </div>

              {otpError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-[11px] rounded-lg border border-red-200">
                  {otpError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Enter 6-Digit OTP:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="784291"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-lg font-mono font-bold px-3 py-2.5 border-2 border-neutral-300 rounded-xl focus:border-[#002D62] focus:outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2">
                  <span>Demo code: <strong className="text-amber-800 font-mono">784291</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpCode('784291')}
                    className="text-amber-700 underline font-medium"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full py-3 bg-[#002D62] hover:bg-[#001D42] text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm & Authorize Payment</span>
              </button>

              <div className="text-[10px] text-center text-neutral-400">
                In compliance with Central Bank of the UAE regulatory consumer protection requirements.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
