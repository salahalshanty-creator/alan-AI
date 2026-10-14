import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Save,
  ChevronLeft,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  FileText,
  X,
  Printer,
  Sparkles,
  MessageSquare,
  RotateCcw,
  Briefcase,
  Hash,
  Globe,
  Check,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderStatus, UAE_EMIRATES, Emirate } from '../types';
import { formatAED } from '../utils/pricing';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export type FilterStatusGroup = 'all' | 'pending' | 'in_progress' | 'completed';

interface CustomerProfilePageProps {
  userOrders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  onOpenTracker: (orderNumber: string) => void;
  onNavigate: (path: string) => void;
  isArabic?: boolean;
}

const STATUS_CONFIG: Record<
  OrderStatus | 'submitted',
  { labelEn: string; labelAr: string; color: string; step: number }
> = {
  submitted: { labelEn: 'Submitted', labelAr: 'تم الاستلام', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', step: 1 },
  preflight: { labelEn: 'Preflight & Proofing', labelAr: 'فحص الملفات والاعتماد', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', step: 2 },
  printing: { labelEn: 'Printing on Press', labelAr: 'الطباعة في الماكينة', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', step: 3 },
  finishing: { labelEn: 'Foil & Finishing', labelAr: 'الفويل والتشطيب الفاخر', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', step: 4 },
  qc: { labelEn: 'Quality Control', labelAr: 'فحص الجودة والتغليف', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', step: 5 },
  dispatched: { labelEn: 'Dispatched / Courier', labelAr: 'في الطريق للتوصيل', color: 'bg-amber-600/15 text-amber-300 border-amber-500/40', step: 6 },
  ready_for_pickup: { labelEn: 'Ready for Pickup', labelAr: 'جاهز للاستلام من الفرع', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', step: 6 },
  delivered: { labelEn: 'Delivered', labelAr: 'تم التسليم بنجاح', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', step: 7 },
};

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  userOrders,
  onUpdateOrders,
  onOpenTracker,
  onNavigate,
  isArabic = false,
}) => {
  const { user, userProfile, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Profile Form State
  const [displayName, setDisplayName] = useState(user?.displayName || userProfile?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '+971 ');
  const [whatsappNumber, setWhatsappNumber] = useState(userProfile?.whatsappNumber || '');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'whatsapp' | 'phone' | 'email'>(userProfile?.preferredContactMethod || 'whatsapp');
  const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
  const [companyActivity, setCompanyActivity] = useState(userProfile?.companyActivity || 'Luxury Retail & Commercial');
  const [trnNumber, setTrnNumber] = useState(userProfile?.trnNumber || '');
  const [defaultEmirate, setDefaultEmirate] = useState<Emirate>((userProfile?.defaultEmirate as Emirate) || 'Dubai');
  const [defaultAddress, setDefaultAddress] = useState(userProfile?.defaultAddress || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmirate, setEditEmirate] = useState<Emirate>('Dubai');
  const [editAreaAddress, setEditAreaAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSaveSuccess, setOrderSaveSuccess] = useState(false);

  // Orders Filtering, Searching, and Sorting State
  const [statusFilter, setStatusFilter] = useState<FilterStatusGroup>('all');
  const [specificStatusFilter, setSpecificStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderSortBy, setOrderSortBy] = useState<'newest' | 'oldest' | 'highest'>('newest');

  // Status Counts for Badges
  const orderCounts = useMemo(() => {
    const all = userOrders.length;
    const pending = userOrders.filter((o) => ['submitted', 'preflight'].includes(o.status)).length;
    const inProgress = userOrders.filter((o) => ['printing', 'finishing', 'qc', 'dispatched'].includes(o.status)).length;
    const completed = userOrders.filter((o) => ['ready_for_pickup', 'delivered'].includes(o.status)).length;
    return { all, pending, inProgress, completed };
  }, [userOrders]);

  // Filtered and Sorted Orders List
  const filteredOrders = useMemo(() => {
    return userOrders
      .filter((order) => {
        // 1. Group Status Filter (Pending / In Progress / Completed)
        if (statusFilter === 'pending' && !['submitted', 'preflight'].includes(order.status)) {
          return false;
        }
        if (statusFilter === 'in_progress' && !['printing', 'finishing', 'qc', 'dispatched'].includes(order.status)) {
          return false;
        }
        if (statusFilter === 'completed' && !['ready_for_pickup', 'delivered'].includes(order.status)) {
          return false;
        }

        // 2. Specific Sub-Status Filter
        if (specificStatusFilter !== 'all' && order.status !== specificStatusFilter) {
          return false;
        }

        // 3. Search Query Filter (order number, product title, emirate, customer name)
        if (orderSearchQuery.trim()) {
          const q = orderSearchQuery.toLowerCase().trim();
          const matchesNum = order.orderNumber.toLowerCase().includes(q);
          const matchesEmirate = (order.customer?.emirate || '').toLowerCase().includes(q);
          const matchesCust = (order.customer?.fullName || '').toLowerCase().includes(q);
          const matchesItems = order.items.some((item) => {
            const title = (item.product?.title || (item as any).productTitle || (item as any).title || '').toLowerCase();
            const titleAr = (item.product?.titleAr || '').toLowerCase();
            return title.includes(q) || titleAr.includes(q);
          });
          if (!matchesNum && !matchesEmirate && !matchesCust && !matchesItems) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (orderSortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (orderSortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (orderSortBy === 'highest') {
          return b.totalAED - a.totalAED;
        }
        return 0;
      });
  }, [userOrders, statusFilter, specificStatusFilter, orderSearchQuery, orderSortBy]);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) setDisplayName(userProfile.displayName);
      if (userProfile.phoneNumber) setPhoneNumber(userProfile.phoneNumber);
      if (userProfile.whatsappNumber) setWhatsappNumber(userProfile.whatsappNumber);
      if (userProfile.preferredContactMethod) setPreferredContactMethod(userProfile.preferredContactMethod);
      if (userProfile.companyName) setCompanyName(userProfile.companyName);
      if (userProfile.companyActivity) setCompanyActivity(userProfile.companyActivity);
      if (userProfile.trnNumber) setTrnNumber(userProfile.trnNumber);
      if (userProfile.defaultEmirate) setDefaultEmirate(userProfile.defaultEmirate as Emirate);
      if (userProfile.defaultAddress) setDefaultAddress(userProfile.defaultAddress);
    } else if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [userProfile, user?.displayName]);

  const handleResetProfile = () => {
    setDisplayName(user?.displayName || userProfile?.displayName || '');
    setPhoneNumber(userProfile?.phoneNumber || '+971 ');
    setWhatsappNumber(userProfile?.whatsappNumber || '');
    setPreferredContactMethod(userProfile?.preferredContactMethod || 'whatsapp');
    setCompanyName(userProfile?.companyName || '');
    setCompanyActivity(userProfile?.companyActivity || 'Luxury Retail & Commercial');
    setTrnNumber(userProfile?.trnNumber || '');
    setDefaultEmirate((userProfile?.defaultEmirate as Emirate) || 'Dubai');
    setDefaultAddress(userProfile?.defaultAddress || '');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSaveSuccess(false);

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        preferredContactMethod,
        companyName: companyName.trim(),
        companyActivity: companyActivity.trim(),
        trnNumber: trnNumber.trim(),
        defaultEmirate,
        defaultAddress: defaultAddress.trim(),
      });
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openEditOrderModal = (order: Order) => {
    setEditingOrder(order);
    setEditCustomerName(order.customer.fullName || '');
    setEditPhone(order.customer.phone || '');
    setEditEmirate(order.customer.emirate || 'Dubai');
    setEditAreaAddress(order.customer.areaAddress || '');
    setEditNotes((order as any).customNotes || '');
    setOrderSaveSuccess(false);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsSavingOrder(true);

    const updatedCustomer = {
      ...editingOrder.customer,
      fullName: editCustomerName.trim(),
      phone: editPhone.trim(),
      emirate: editEmirate,
      areaAddress: editAreaAddress.trim(),
    };

    const updatedOrder: Order = {
      ...editingOrder,
      customer: updatedCustomer,
    };
    (updatedOrder as any).customNotes = editNotes.trim();

    try {
      // Persist directly to Firestore
      const orderRef = doc(db, 'orders', editingOrder.orderNumber);
      await setDoc(
        orderRef,
        {
          customer: updatedCustomer,
          customNotes: editNotes.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update local state and memory
      const nextOrders = userOrders.map((o) =>
        o.orderNumber === editingOrder.orderNumber ? updatedOrder : o
      );
      onUpdateOrders(nextOrders);

      setOrderSaveSuccess(true);
      setTimeout(() => {
        setOrderSaveSuccess(false);
        setEditingOrder(null);
      }, 1200);
    } catch (err) {
      console.error('Failed to update order in Firestore:', err);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleAddSampleOrder = () => {
    const demoOrder: Order = {
      orderNumber: `ALAN-${Math.floor(1000 + Math.random() * 9000)}-DXB`,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: displayName || (isArabic ? 'سلطان النعيمي' : 'Sultan Al Nuaimi'),
        email: user?.email || 'client@alanprinting.ae',
        phone: phoneNumber && phoneNumber !== '+971 ' ? phoneNumber : '+971 50 882 1945',
        emirate: defaultEmirate || 'Dubai',
        areaAddress: defaultAddress || 'DIFC, Gate Village 03, Suite 401',
        deliveryType: 'delivery',
        companyName: companyName || 'Royal Horizon Group',
      },
      items: [
        {
          id: `item-${Date.now()}`,
          product: {
            id: 'cards-luxury-gold',
            title: isArabic ? 'بطاقات عمل بالفويل الذهبي الفاخر 400 جرام' : 'Bespoke Gold Foil Business Cards 400gsm',
            titleAr: 'بطاقات عمل فاخرة بالفويل الذهبي 400 جرام',
            category: 'premium-business-cards',
            categoryName: 'Premium Business Cards',
            categoryNameAr: 'بطاقات عمل فاخرة',
            tagline: 'Foil stamped luxury cards',
            description: 'Luxury matte finish with raised metallic gold foil.',
            descriptionAr: 'طباعة فاخرة مع فويل ذهبي بارز وملمس مخملي',
            basePriceAED: 380,
            minQty: 500,
            unitLabel: 'cards',
            leadTimeDays: 2,
            availableStocks: [],
            availableFinishes: [],
            availableSizes: [],
            quantityTiers: [],
            specHighlights: ['Hot Gold Foil', 'Velvet Touch', 'Heidelberg Press'],
          },
          quantity: 500,
          selectedStock: {
            id: 'stock-400',
            name: '400gsm Imperial Silk Matte',
            nameAr: 'ورق حريري مطفي 400 جرام',
            finishType: 'matte',
            weightGsm: 400,
            description: 'Thick premium board',
            priceMultiplier: 1,
          },
          selectedFinish: {
            id: 'finish-gold-foil',
            name: 'Hot Gold Foil Stamping + Velvet Soft-Touch',
            nameAr: 'فويل ذهبي ساخن + لمسة مخملية',
            type: 'foil',
            extraAED: 120,
            description: 'Reflective gold stamping with tactile depth',
          },
          selectedSize: {
            id: 'size-std',
            label: 'Standard UAE (90 × 55 mm)',
            dimensions: '90 × 55 mm',
            multiplier: 1,
          },
          turnaroundSpeed: 'standard',
          unitPriceAED: 0.76,
          totalPriceAED: 380,
        },
      ],
      subtotalAED: 380,
      vatAED: 19,
      shippingAED: 35,
      totalAED: 434,
      paymentMethod: 'apple_pay',
      status: 'finishing',
      estimatedDeliveryDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      trackingUpdates: [
        {
          status: 'preflight',
          title: isArabic ? 'تم اعتماد ملفات التصميم' : 'Artwork Approved & Preflight',
          description: isArabic ? 'تم فحص ملفات الفيكتور وخطوط القص للطباعة الأوفست' : 'Vector artwork and die-line verified for Heidelberg offset press.',
          timestamp: 'Today, 09:30 AM',
        },
        {
          status: 'printing',
          title: isArabic ? 'اكتملت الطباعة الأوفست CMYK' : 'Offset CMYK Press Complete',
          description: isArabic ? 'ألوان مطابقة لمعايير الجودة الفاخرة' : 'High-density color reproduction achieved.',
          timestamp: 'Today, 11:45 AM',
        },
        {
          status: 'finishing',
          title: isArabic ? 'تطبيق الفويل الذهبي الحراري' : 'Gold Foil Applied',
          description: isArabic ? 'تطبيق الفويل بدقة عالية على الشعار والبيانات' : 'Precision heated stamping applied to logo and titles.',
          timestamp: 'Today, 02:15 PM',
        },
      ],
    };
    onUpdateOrders([demoOrder, ...userOrders]);
  };

  return (
    <div className="min-h-screen bg-[#111215] text-white py-10">
      <div className="site-shell">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hover:text-amber-400 transition-colors flex items-center gap-1 font-medium"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            {isArabic ? 'الرئيسية' : 'Home'}
          </button>
          <span className="text-neutral-600">/</span>
          <span className="text-amber-400 font-semibold">
            {isArabic ? 'حساب العميل والطلبات' : 'Client Profile & Orders'}
          </span>
        </div>

        {/* Profile Hero Header Card */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName || 'Avatar'}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-amber-400/80 object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-neutral-800 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 font-serif text-2xl font-bold shadow-lg">
                  {(displayName || user?.email || 'A').charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-neutral-100">
                    {displayName || user?.email?.split('@')[0] || (isArabic ? 'عميل ألان المميز' : 'ALAN Client')}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isArabic ? 'حساب تجاري موثق' : 'Verified UAE Account'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-500" />
                    {user?.email || 'client@alanpress.ae'}
                  </span>
                  {phoneNumber && phoneNumber !== '+971 ' && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      {phoneNumber}
                    </span>
                  )}
                  {companyName && (
                    <span className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      {companyName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-300/50'
                    : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 hover:border-amber-400/40'
                }`}
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>{isArabic ? 'تعديل الملف الشخصي' : 'Edit Profile'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  setStatusFilter('all');
                  setSpecificStatusFilter('all');
                }}
                title={isArabic ? 'عرض جميع الطلبات' : 'View all orders'}
                className="px-4 py-2 bg-neutral-950/80 hover:bg-neutral-850 hover:border-amber-400/50 border border-neutral-800 rounded-xl text-center min-w-[80px] transition-all cursor-pointer group"
              >
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 group-hover:text-neutral-400">
                  {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
                </p>
                <p className="text-lg font-bold text-amber-400 font-serif mt-0.5">
                  {userOrders.length}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  setStatusFilter('in_progress');
                  setSpecificStatusFilter('all');
                }}
                title={isArabic ? 'تصفية الطلبات قيد التنفيذ' : 'Filter orders in production'}
                className="px-4 py-2 bg-neutral-950/80 hover:bg-neutral-850 hover:border-purple-400/50 border border-neutral-800 rounded-xl text-center min-w-[80px] transition-all cursor-pointer group"
              >
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 group-hover:text-neutral-400">
                  {isArabic ? 'قيد التنفيذ' : 'In Production'}
                </p>
                <p className="text-lg font-bold text-neutral-200 group-hover:text-purple-300 font-serif mt-0.5">
                  {orderCounts.inProgress}
                </p>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mt-8 pt-4 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{isArabic ? 'سجل الطلبات وتتبع الشحنات' : 'My Orders & Tracking'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'orders' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-800 text-neutral-400'}`}>
                {userOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{isArabic ? 'قسم تعديل الملف الشخصي والشركة' : 'Edit Profile & Business Info'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Orders and Tracking with Status Filtering */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {userOrders.length === 0 ? (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-10 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 mx-auto flex items-center justify-center text-amber-400 mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-serif font-bold text-neutral-200">
                  {isArabic ? 'لا توجد طلبات مسجلة بعد' : 'No Print Orders Yet'}
                </h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  {isArabic
                    ? 'ابدأ بتصفح كتالوج المطبوعات الفاخرة أو صمم بطاقتك وتغليفك باستخدام استوديو الذكاء الاصطناعي.'
                    : 'Explore our luxury printing collection or start generating bespoke designs with Gemini AI.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => onNavigate('/products')}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isArabic ? 'تصفح المنتجات' : 'Browse Catalog'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/ai-design')}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{isArabic ? 'استوديو الذكاء الاصطناعي' : 'AI Design Studio'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSampleOrder}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-semibold rounded-lg border border-amber-400/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>{isArabic ? 'إضافة طلب تجريبي للتجربة والتحكم' : 'Add Demo Order to Test & Edit'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Status Filtering & Search Toolbar */}
                <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
                  {/* Status Category Pills (All, Pending, In Progress, Completed) */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                          {isArabic ? 'تصفية الطلبات بحسب الحالة:' : 'Filter Orders by Status:'}
                        </span>
                      </div>
                      {(statusFilter !== 'all' || specificStatusFilter !== 'all' || orderSearchQuery.trim()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('all');
                            setSpecificStatusFilter('all');
                            setOrderSearchQuery('');
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{isArabic ? 'إلغاء كافة الفلاتر' : 'Reset all filters'}</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* 1. All Orders */}
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('all');
                          setSpecificStatusFilter('all');
                        }}
                        className={`p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          statusFilter === 'all' && specificStatusFilter === 'all'
                            ? 'bg-amber-400/15 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="p-1.5 rounded-lg bg-neutral-800/80 text-amber-400 shrink-0">
                            <Package className="w-4 h-4" />
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              statusFilter === 'all' && specificStatusFilter === 'all'
                                ? 'bg-amber-400 text-neutral-950 font-mono font-black'
                                : 'bg-neutral-800 text-neutral-400 font-mono'
                            }`}
                          >
                            {orderCounts.all}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-100">
                            {isArabic ? 'جميع الطلبات' : 'All Orders'}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {isArabic ? 'كافة السجلات' : 'Full history'}
                          </p>
                        </div>
                      </button>

                      {/* 2. Pending */}
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('pending');
                          setSpecificStatusFilter('all');
                        }}
                        className={`p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          statusFilter === 'pending'
                            ? 'bg-blue-500/15 border-blue-400/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400/50'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                            <Clock className="w-4 h-4" />
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              statusFilter === 'pending'
                                ? 'bg-blue-400 text-neutral-950 font-mono font-black'
                                : 'bg-neutral-800 text-neutral-400 font-mono'
                            }`}
                          >
                            {orderCounts.pending}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-100">
                            {isArabic ? 'قيد المراجعة' : 'Pending'}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {isArabic ? 'استلام واعتماد الملفات' : 'Submitted & Preflight'}
                          </p>
                        </div>
                      </button>

                      {/* 3. In Progress */}
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('in_progress');
                          setSpecificStatusFilter('all');
                        }}
                        className={`p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          statusFilter === 'in_progress'
                            ? 'bg-purple-500/15 border-purple-400/80 shadow-lg shadow-purple-500/10 ring-1 ring-purple-400/50'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                            <Printer className="w-4 h-4" />
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              statusFilter === 'in_progress'
                                ? 'bg-purple-400 text-neutral-950 font-mono font-black'
                                : 'bg-neutral-800 text-neutral-400 font-mono'
                            }`}
                          >
                            {orderCounts.inProgress}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-100">
                            {isArabic ? 'قيد التنفيذ' : 'In Progress'}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {isArabic ? 'طباعة وتشطيب وشحن' : 'Press, Foil, Shipping'}
                          </p>
                        </div>
                      </button>

                      {/* 4. Completed */}
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('completed');
                          setSpecificStatusFilter('all');
                        }}
                        className={`p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          statusFilter === 'completed'
                            ? 'bg-emerald-500/15 border-emerald-400/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/50'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              statusFilter === 'completed'
                                ? 'bg-emerald-400 text-neutral-950 font-mono font-black'
                                : 'bg-neutral-800 text-neutral-400 font-mono'
                            }`}
                          >
                            {orderCounts.completed}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-100">
                            {isArabic ? 'مكتمل ومسلّم' : 'Completed'}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {isArabic ? 'تم التسليم أو جاهز' : 'Delivered or Ready'}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Secondary Filters: Search Input, Sub-Status Select, and Sort */}
                  <div className="pt-3 border-t border-neutral-800/80 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-neutral-500 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        placeholder={
                          isArabic
                            ? 'بحث برقم الطلب (ALAN-XXXX) أو اسم المنتج أو الإمارة...'
                            : 'Search by order # (ALAN-XXXX), product, or emirate...'
                        }
                        className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl pl-9 pr-9 rtl:pl-9 rtl:pr-9 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                      {orderSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setOrderSearchQuery('')}
                          className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                          aria-label="Clear search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Specific Sub-Status Filter */}
                    <div className="flex items-center gap-2">
                      <select
                        value={specificStatusFilter}
                        onChange={(e) => {
                          setSpecificStatusFilter(e.target.value);
                          if (e.target.value !== 'all') {
                            setStatusFilter('all');
                          }
                        }}
                        className="bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      >
                        <option value="all">{isArabic ? 'كل المراحل التفصيلية' : 'All Specific Stages'}</option>
                        <option value="submitted">{isArabic ? 'تم الاستلام (Submitted)' : 'Submitted'}</option>
                        <option value="preflight">{isArabic ? 'فحص الملفات (Preflight)' : 'Preflight & Proofing'}</option>
                        <option value="printing">{isArabic ? 'الطباعة الأوفست (Printing)' : 'Printing on Press'}</option>
                        <option value="finishing">{isArabic ? 'التشطيب والفويل (Finishing)' : 'Foil & Finishing'}</option>
                        <option value="qc">{isArabic ? 'فحص الجودة (QC)' : 'Quality Control'}</option>
                        <option value="dispatched">{isArabic ? 'في طريق التوصيل (Dispatched)' : 'Dispatched / Courier'}</option>
                        <option value="ready_for_pickup">{isArabic ? 'جاهز للاستلام (Ready)' : 'Ready for Pickup'}</option>
                        <option value="delivered">{isArabic ? 'تم التسليم بنجاح (Delivered)' : 'Delivered'}</option>
                      </select>

                      {/* Sort Dropdown */}
                      <select
                        value={orderSortBy}
                        onChange={(e) => setOrderSortBy(e.target.value as any)}
                        className="bg-neutral-950/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      >
                        <option value="newest">{isArabic ? 'الأحدث أولاً' : 'Newest First'}</option>
                        <option value="oldest">{isArabic ? 'الأقدم أولاً' : 'Oldest First'}</option>
                        <option value="highest">{isArabic ? 'الأعلى قيمة (AED)' : 'Highest Amount'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter Summary & Demo Generator */}
                <div className="flex items-center justify-between text-xs text-neutral-400 px-1 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span>
                      {isArabic
                        ? `عرض ${filteredOrders.length} من أصل ${userOrders.length} طلب`
                        : `Showing ${filteredOrders.length} of ${userOrders.length} orders`}
                    </span>
                    {statusFilter !== 'all' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-semibold">
                        {statusFilter === 'pending'
                          ? isArabic ? 'قيد المراجعة' : 'Pending'
                          : statusFilter === 'in_progress'
                          ? isArabic ? 'قيد التنفيذ' : 'In Progress'
                          : isArabic ? 'مكتمل' : 'Completed'}
                      </span>
                    )}
                    {specificStatusFilter !== 'all' && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-400/10 border border-purple-400/30 text-purple-400 text-[10px] font-semibold">
                        {STATUS_CONFIG[specificStatusFilter as OrderStatus]?.labelEn || specificStatusFilter}
                      </span>
                    )}
                    {orderSearchQuery && (
                      <span className="text-[11px] text-neutral-400">
                        {isArabic ? `عن: "${orderSearchQuery}"` : `for "${orderSearchQuery}"`}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSampleOrder}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>{isArabic ? '+ طلب تجريبي إضافي' : '+ Add Test Demo Order'}</span>
                  </button>
                </div>

                {/* Orders List or Zero Filter Match State */}
                {filteredOrders.length === 0 ? (
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-10 text-center max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-full bg-neutral-800/90 border border-neutral-700 mx-auto flex items-center justify-center text-amber-400 mb-3.5">
                      <Filter className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-serif font-bold text-neutral-200">
                      {isArabic ? 'لا توجد طلبات تطابق الفلتر المحدد' : 'No Orders Match Selected Filter'}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      {isArabic
                        ? 'لم يتم العثور على أي طلبات في هذه الحالة أو تطابق كلمة البحث الحالية.'
                        : 'No orders found matching this status filter or search query.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('all');
                        setSpecificStatusFilter('all');
                        setOrderSearchQuery('');
                      }}
                      className="mt-5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'إعادة ضبط الفلتر وعرض الكل' : 'Clear Filters & Show All'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredOrders.map((order) => {
                      const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.preflight;

                      return (
                        <div
                          key={order.orderNumber}
                          className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl hover:border-neutral-700/80 transition-all"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-mono text-base font-bold text-neutral-100 flex items-center gap-2">
                                  <span>#{order.orderNumber}</span>
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                                  {isArabic ? statusInfo.labelAr : statusInfo.labelEn}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                                <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span>·</span>
                                <span>{order.customer.emirate}</span>
                                <span>·</span>
                                <span>{order.paymentMethod?.toUpperCase()}</span>
                              </p>
                            </div>

                            {/* Order Actions */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => onOpenTracker(order.orderNumber)}
                                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>{isArabic ? 'تتبع الشحنة' : 'Track Order'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditOrderModal(order)}
                                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                <span>{isArabic ? 'تعديل الطلب' : 'Edit Order'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Visual Production Stage Stepper */}
                          <div className="py-4 border-b border-neutral-800/80">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center text-[10px]">
                              {[
                                { nameEn: 'Proofing', nameAr: 'اعتماد الملفات', active: statusInfo.step >= 1 },
                                { nameEn: 'Printing', nameAr: 'الطباعة', active: statusInfo.step >= 3 },
                                { nameEn: 'Foil / Spot UV', nameAr: 'التشطيب والفويل', active: statusInfo.step >= 4 },
                                { nameEn: 'Quality Check', nameAr: 'فحص الجودة', active: statusInfo.step >= 5 },
                                { nameEn: 'Dispatched', nameAr: 'الشحن', active: statusInfo.step >= 6 },
                                { nameEn: 'Delivered', nameAr: 'تم التسليم', active: statusInfo.step >= 7 },
                              ].map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] mb-1 transition-all ${
                                      step.active
                                        ? 'bg-amber-400 text-neutral-950 ring-2 ring-amber-400/30'
                                        : 'bg-neutral-800 text-neutral-500'
                                    }`}
                                  >
                                    {step.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                                  </div>
                                  <span className={step.active ? 'text-neutral-200 font-semibold' : 'text-neutral-500'}>
                                    {isArabic ? step.nameAr : step.nameEn}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              {order.items.map((item) => {
                                const title = item.product?.title || (item as any).productTitle || (item as any).title || 'Print Order';
                                const finish = item.selectedFinish?.name || (item as any).finishingName;
                                return (
                                  <div key={item.id} className="flex items-center gap-3 text-xs">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                                    <span className="font-semibold text-neutral-200">{title}</span>
                                    <span className="text-neutral-500">·</span>
                                    <span className="text-neutral-400 font-mono">{item.quantity.toLocaleString()} pcs</span>
                                    {finish && (
                                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-400 text-[10px]">
                                        {finish}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}

                              {(order as any).customNotes && (
                                <p className="text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800 mt-2">
                                  <span className="font-bold text-amber-400">{isArabic ? 'ملاحظات العميل: ' : 'Order Notes: '}</span>
                                  {(order as any).customNotes}
                                </p>
                              )}
                            </div>

                            {/* Order Financials */}
                            <div className="text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800">
                              <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                                {isArabic ? 'المبلغ الإجمالي' : 'Total Amount'}
                              </p>
                              <p className="text-lg md:text-xl font-bold font-serif text-neutral-100">
                                {formatAED(order.totalAED)}
                              </p>
                              <p className="text-[10px] text-emerald-400 font-medium">
                                {isArabic ? 'شامل ضريبة القيمة المضافة 5%' : 'Incl. 5% UAE VAT'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: Edit Profile and Business Info */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Edit Profile Form */}
            <div className="lg:col-span-8 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="border-b border-neutral-800 pb-5 mb-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px] font-bold inline-flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      {isArabic ? 'إعدادات الحساب والمطبوعات' : 'Account & Commercial Settings'}
                    </span>
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-neutral-100 flex items-center gap-2.5">
                      <Edit3 className="w-5 h-5 text-amber-400" />
                      <span>{isArabic ? 'تعديل الملف الشخصي وبيانات الشركة' : 'Edit Profile & Corporate Details'}</span>
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      {isArabic
                        ? 'قم بتحديث اسم العرض، ورقم التواصل، ومعلومات شركتك وبيانات الفوترة الضريبية في الإمارات.'
                        : 'Update your display name, contact telephone, and commercial UAE business profile for quotations and delivery.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetProfile}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded-lg border border-neutral-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title={isArabic ? 'استعادة البيانات الأصلية' : 'Reset to saved values'}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'استعادة' : 'Reset'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* 1. Display Name & Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>{isArabic ? '1. اسم العرض والبيانات الشخصية' : '1. Display Name & Personal Identity'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-neutral-200">
                          {isArabic ? 'اسم العرض (الاسم الشخصي / التجاري) *' : 'Display Name (Personal or Brand) *'}
                        </label>
                        <span className="text-[10px] text-neutral-500 font-mono">{displayName.length}/50</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={50}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Sultan Al Nuaimi"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                        />
                        <div className="absolute right-3 top-2.5 text-amber-400 pointer-events-none">
                          <User className="w-4 h-4 text-neutral-500" />
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {isArabic ? 'يظهر هذا الاسم في ترويسة الموقع، وعلى عروض الأسعار وفواتير الطباعة.' : 'Displayed in the top navigation, official print quotes, and tax invoices.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        {isArabic ? 'البريد الإلكتروني المعتمد' : 'Authenticated Email'}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={user?.email || 'client@alanpress.ae'}
                          className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-neutral-400 cursor-not-allowed font-mono"
                        />
                        <div className="absolute right-3 top-2.5 text-emerald-400 pointer-events-none">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{isArabic ? 'تم ربط الحساب بنجاح بالسحابة والطلبات' : 'Cloud sync active for this account'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Contact Numbers & Communication */}
                <div className="space-y-4 pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>{isArabic ? '2. بيانات التواصل وأرقام الهاتف' : '2. Contact Numbers & Communication'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        {isArabic ? 'رقم الهاتف والتواصل الأساسي *' : 'Primary Contact Phone *'}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+971 50 123 4567"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                        />
                        <div className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none">
                          <Phone className="w-4 h-4 text-neutral-500" />
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {isArabic ? 'للتواصل السريع عند تسليم الشحنات ومندوبي التوصيل.' : 'Used for delivery courier dispatch and urgent call coordination.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        {isArabic ? 'رقم الواتساب للتنسيق واعتماد العينات' : 'WhatsApp Number (Artwork Proofs)'}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="+971 50 882 1945"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                        />
                        <div className="absolute right-3 top-2.5 text-emerald-400 pointer-events-none">
                          <MessageSquare className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {isArabic ? 'لإرسال بروفات الطباعة واعتماد خطوط الفويل والقص فورياً.' : 'Direct instant messaging for Heidelberg proofs and color approvals.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-200 mb-2">
                      {isArabic ? 'قناة التواصل المفضلة' : 'Preferred Communication Channel'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'whatsapp', labelEn: 'WhatsApp Chat', labelAr: 'واتساب', icon: MessageSquare },
                        { id: 'phone', labelEn: 'Phone Call', labelAr: 'اتصال هاتفي', icon: Phone },
                        { id: 'email', labelEn: 'Email', labelAr: 'بريد إلكتروني', icon: Mail },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = preferredContactMethod === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPreferredContactMethod(item.id as any)}
                            className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400/10 border-amber-400/50 text-amber-300 ring-1 ring-amber-400/30'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span>{isArabic ? item.labelAr : item.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Company & Corporate Information */}
                <div className="space-y-4 pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>{isArabic ? '3. بيانات الشركة والمؤسسة في الإمارات' : '3. UAE Commercial & Company Information'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        {isArabic ? 'اسم الشركة / العلامة التجارية' : 'Company / Brand Name'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Al Wasl Luxury Hospitality LLC"
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                        />
                        <div className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none">
                          <Building2 className="w-4 h-4 text-neutral-500" />
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {isArabic ? 'تطبع على الفواتير الضريبية وتُدرج في عروض الأسعار الرسمية.' : 'Printed on official UAE tax invoices and quotation summaries.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        {isArabic ? 'مجال النشاط التجاري' : 'Business Sector / Industry'}
                      </label>
                      <div className="relative">
                        <select
                          value={companyActivity}
                          onChange={(e) => setCompanyActivity(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
                        >
                          <option value="Luxury Retail & Commercial">{isArabic ? 'تجارة التجزئة الفاخرة والعطور' : 'Luxury Retail & Commercial'}</option>
                          <option value="Hospitality & Dining">{isArabic ? 'الضيافة والمطاعم والفنادق' : 'Hospitality & Dining'}</option>
                          <option value="Corporate & Legal">{isArabic ? 'شركات ومكاتب محاماة واستشارات' : 'Corporate & Legal'}</option>
                          <option value="Event Management & Weddings">{isArabic ? 'تنظيم الفعاليات والمؤتمرات والأعراس' : 'Event Management & Weddings'}</option>
                          <option value="Real Estate & Architecture">{isArabic ? 'التطوير العقاري والهندسي' : 'Real Estate & Architecture'}</option>
                          <option value="Creative & Design Agency">{isArabic ? 'وكالات التصميم والدعاية والإعلان' : 'Creative & Design Agency'}</option>
                          <option value="Healthcare & Wellness">{isArabic ? 'الرعاية الصحية والمراكز الطبية' : 'Healthcare & Wellness'}</option>
                          <option value="General Commercial">{isArabic ? 'نشاط تجاري عام' : 'General Commercial'}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-neutral-200">
                          {isArabic ? 'الرقم الضريبي (TRN - 15 رقم)' : 'UAE Tax Registration Number (TRN)'}
                        </label>
                        <span className={`text-[10px] font-mono ${trnNumber.length === 15 ? 'text-emerald-400' : 'text-neutral-500'}`}>
                          {trnNumber.length}/15 {trnNumber.length === 15 ? '✓' : ''}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={trnNumber}
                          onChange={(e) => setTrnNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 15))}
                          placeholder="100XXXXXXXXXXXX"
                          maxLength={15}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                        />
                        <div className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none">
                          <Hash className="w-4 h-4 text-neutral-500" />
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {isArabic ? 'الرقم الضريبي الصادر من الهيئة الاتحادية للضرائب (15 رقماً يبدأ بـ 100).' : '15-digit FTA tax identification number for input VAT deduction.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                        {isArabic ? 'الإمارة الافتراضية للتوصيل' : 'Default Delivery Emirate'}
                      </label>
                      <div className="relative">
                        <select
                          value={defaultEmirate}
                          onChange={(e) => setDefaultEmirate(e.target.value as Emirate)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
                        >
                          {UAE_EMIRATES.map((em: Emirate) => (
                            <option key={em} value={em}>
                              {em}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {isArabic ? 'يتم تطبيق حساب تكلفة الشحن ومواعيد التوصيل السريع بناءً عليها.' : 'Used to calculate express courier dispatch fees and scheduling.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-200 mb-1.5">
                      {isArabic ? 'العنوان التفصيلي لمقر الشركة / التوصيل' : 'Company Headquarters / Delivery Address Details'}
                    </label>
                    <textarea
                      rows={2}
                      value={defaultAddress}
                      onChange={(e) => setDefaultAddress(e.target.value)}
                      placeholder="e.g. Suite 1804, Al Wasl Tower, Sheikh Zayed Road, Dubai"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Save Feedback Status */}
                {profileSaveSuccess && (
                  <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">
                        {isArabic ? 'تم تحديث الملف الشخصي وبيانات الشركة بنجاح!' : 'Profile and company details updated successfully!'}
                      </p>
                      <p className="text-[11px] text-emerald-400/80 mt-0.5">
                        {isArabic
                          ? 'تم حفظ اسم العرض ورقم التواصل وبيانات الشركة ومزامنتها سحابياً.'
                          : 'Your display name, contact telephone, and company info have been synchronized.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-neutral-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-60"
                  >
                    {isSavingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                        <span>{isArabic ? 'جاري الحفظ والمزامنة...' : 'Saving Changes...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{isArabic ? 'حفظ تعديلات الملف الشخصي' : 'Save Profile Changes'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isArabic ? 'العودة إلى سجل الطلبات' : 'View Orders & Tracking'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Corporate Preview Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                    {isArabic ? 'معاينة بطاقة الحساب الفاخرة' : 'Live Profile Card Preview'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
                    {isArabic ? 'تحديث فوري' : 'Live Sync'}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-amber-500/30 rounded-xl p-5 shadow-2xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/30 to-neutral-800 border-2 border-amber-400/70 flex items-center justify-center text-amber-300 font-serif text-lg font-bold shadow-md">
                      {(displayName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-bold">
                      ALAN CLIENT
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-neutral-100">
                    {displayName || (isArabic ? 'اسم العميل' : 'Client Display Name')}
                  </h3>

                  <p className="text-xs text-amber-300 font-medium mt-0.5">
                    {companyName || (isArabic ? 'اسم الشركة غير محدد' : 'Company Not Specified')}
                  </p>

                  <div className="space-y-1.5 mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span className="font-mono">{phoneNumber || '+971 -- --- ----'}</span>
                    </div>

                    {whatsappNumber && (
                      <div className="flex items-center gap-2 text-emerald-400/90">
                        <MessageSquare className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="font-mono">{whatsappNumber} (WhatsApp)</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span>{defaultEmirate} · {defaultAddress || 'UAE Delivery Address'}</span>
                    </div>

                    {trnNumber && (
                      <div className="flex items-center gap-2 text-neutral-300 pt-1 font-mono text-[10px]">
                        <Hash className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>TRN: {trnNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3.5 mt-4 text-[11px] text-neutral-400 space-y-1.5 leading-relaxed">
                  <div className="font-bold text-neutral-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isArabic ? 'معايير الفوترة الضريبية في الإمارات' : 'UAE Commercial Billing Standard'}</span>
                  </div>
                  <p>
                    {isArabic
                      ? 'تُدرج هذه البيانات تلقائياً في فواتير ضريبة القيمة المضافة 5% وعروض الأسعار الموجهة لمؤسستكم.'
                      : 'These details are automatically embedded into official 5% UAE VAT invoices and commercial Heidelberg print proofs.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-100 flex items-center gap-2">
                  <span>{isArabic ? 'تعديل تفاصيل الطلب' : 'Modify Order Details'}</span>
                  <span className="font-mono text-amber-400 text-sm">#{editingOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isArabic
                    ? 'يمكنك تعديل عنوان التوصيل ورقم الهاتف وملاحظات المطبوعات قبل خروج الشحنة.'
                    : 'Update your delivery address, phone, and instructions before dispatch.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  {isArabic ? 'اسم المستلم' : 'Recipient Name'}
                </label>
                <input
                  type="text"
                  required
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {isArabic ? 'رقم الهاتف' : 'Contact Phone'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {isArabic ? 'الإمارة' : 'Emirate'}
                  </label>
                  <select
                    value={editEmirate}
                    onChange={(e) => setEditEmirate(e.target.value as Emirate)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {UAE_EMIRATES.map((em: Emirate) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  {isArabic ? 'عنوان التوصيل' : 'Delivery Address / Office Location'}
                </label>
                <input
                  type="text"
                  required
                  value={editAreaAddress}
                  onChange={(e) => setEditAreaAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  {isArabic ? 'ملاحظات وتوجيهات خاصة بالطلب والطباعة' : 'Special Instructions for Print Team'}
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Please call before delivery or request rush packing"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {orderSaveSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isArabic ? 'تم تحديث بيانات الطلب في Firestore بنجاح!' : 'Order updated successfully in Firestore!'}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingOrder}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingOrder ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ التعديلات' : 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
