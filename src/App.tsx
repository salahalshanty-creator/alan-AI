import React, { useEffect, useState } from 'react';
import { Product, CartItem, Order } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductShowcase } from './components/ProductShowcase';
import { AIDesignPromotions } from './components/AIDesignPromotions';
import { AIDesignStudio } from './components/AIDesignStudio';
import { HowItWorksSection } from './components/HowItWorksSection';
import { OrderTrackingSection } from './components/OrderTrackingSection';
import { ProductCatalog } from './components/ProductCatalog';
import { Footer } from './components/Footer';
import { ProductConfiguratorModal } from './components/ProductConfiguratorModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { SwatchKitModal } from './components/SwatchKitModal';
import { CustomQuoteModal } from './components/CustomQuoteModal';
import { ShoppingBag, Sparkles, Truck, ShieldCheck, Zap } from 'lucide-react';
import { OffersPage, WorkPage, AboutPage } from './components/MarketingPages';
import { CustomerProfilePage } from './components/CustomerProfilePage';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { useAuth } from './contexts/AuthContext';
import { db } from './lib/firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function App() {
  const [isArabic, setIsArabic] = useState(false);
  const [route, setRoute] = useState(() => window.location.pathname || '/');
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('alan_cart') || '[]'); } catch { return []; }
  });
  const [userOrders, setUserOrders] = useState<Order[]>(() => {
    try { return JSON.parse(localStorage.getItem('alan_orders') || '[]'); } catch { return []; }
  });
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStockId, setSelectedStockId] = useState<string | undefined>();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [isSwatchModalOpen, setIsSwatchModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useEffect(() => { localStorage.setItem('alan_cart', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('alan_orders', JSON.stringify(userOrders)); }, [userOrders]);

  // Sync user orders from Firestore when authenticated
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    getDocs(q).then((snapshot) => {
      const fetched: Order[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as unknown as Order;
        if (data.orderNumber) {
          fetched.push(data);
        }
      });
      if (fetched.length > 0) {
        setUserOrders(prev => {
          const map = new Map<string, Order>();
          fetched.forEach(o => map.set(o.orderNumber, o));
          prev.forEach(o => map.set(o.orderNumber, o));
          return Array.from(map.values());
        });
      }
    }).catch(err => {
      console.warn('[Firestore] Fetch orders notice:', err);
    });
  }, [user?.uid]);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    if (route === '/' && window.location.hash === '#ai-design') {
      requestAnimationFrame(() => document.getElementById('ai-design')?.scrollIntoView({ behavior: 'smooth' }));
    }
  }, [route]);

  const navigate = (path: string) => {
    if (path === route) {
      if (window.location.hash) window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.history.pushState({}, '', path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const navigateToAIDesign = () => {
    navigate('/ai-design');
  };
  const scrollToCatalog = () => {
    if (route !== '/products') { navigate('/products'); return; }
    document.getElementById('print-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };
  const openTracker = () => { setTrackingOrderNumber(''); setIsTrackerOpen(true); };

  const handleOrderCreated = async (order: Order) => {
    setUserOrders(p => [order, ...p]);
    setLatestOrder(order);
    setCartItems([]);
    setIsConfirmationOpen(true);

    // Persist to Firestore
    try {
      const orderRef = doc(db, 'orders', order.orderNumber);
      await setDoc(orderRef, {
        ...order,
        userId: user?.uid || null,
        total: order.totalAED,
      });
      console.log('[Firestore] Order persisted successfully:', order.orderNumber);
    } catch (err) {
      console.warn('[Firestore] Order persistence error:', err);
    }
  };

  const home = (
    <>
      <HeroSection
        onExploreCatalog={scrollToCatalog}
        onRequestSwatches={() => setIsSwatchModalOpen(true)}
        onOpenQuote={() => setIsQuoteModalOpen(true)}
        onNavigate={navigate}
        isArabic={isArabic}
      />
      <ProductShowcase onBrowseProducts={() => navigate('/products')} isArabic={isArabic} />
      <AIDesignPromotions onExploreGifts={() => navigate('/products')} onStartDesigning={() => navigate('/ai-design')} />
      <HowItWorksSection />
      <OrderTrackingSection />
      <section className="bg-white border-b border-neutral-200 py-6">
        <div className="site-shell grid grid-cols-2 md:grid-cols-4 gap-6 text-neutral-800">
          {[
            [ShieldCheck, 'Professional Quality', 'Careful production and finishing for business materials.'],
            [Sparkles, 'Premium Finishes', 'Foil, lamination, spot UV and custom finishing options.'],
            [Truck, 'UAE Delivery', 'Delivery support for customers across the Emirates.'],
            [Zap, 'Fast Service', 'Quick turnaround options for urgent print requirements.'],
          ].map(([Icon, title, desc]) => <div key={String(title)} className="flex items-start gap-3"><Icon className="w-5 h-5 text-amber-700 shrink-0"/><div><h4 className="text-xs font-bold text-neutral-900">{title as string}</h4><p className="text-[11px] text-neutral-500 mt-0.5">{desc as string}</p></div></div>)}
        </div>
      </section>
    </>
  );

  let page: React.ReactNode = home;
  if (route === '/ai-design') page = <AIDesignStudio isArabic={isArabic} onOpenQuote={() => setIsQuoteModalOpen(true)} onNavigate={navigate} />;
  if (route === '/products') page = <ProductCatalog onSelectProduct={(prod, sId) => { setSelectedProduct(prod); setSelectedStockId(sId); }} isArabic={isArabic} onOpenOnlineQuote={() => setIsQuoteModalOpen(true)} />;
  if (route === '/offers') page = <OffersPage isArabic={isArabic} onNavigate={navigate} onOpenQuote={() => setIsQuoteModalOpen(true)} />;
  if (route === '/work') page = <WorkPage isArabic={isArabic} onNavigate={navigate} onOpenQuote={() => setIsQuoteModalOpen(true)} />;
  if (route === '/about') page = <AboutPage isArabic={isArabic} onNavigate={navigate} onOpenQuote={() => setIsQuoteModalOpen(true)} />;
  if (route === '/profile') {
    page = (
      <CustomerProfilePage
        userOrders={userOrders}
        onUpdateOrders={setUserOrders}
        onOpenTracker={(orderNum) => {
          setTrackingOrderNumber(orderNum);
          setIsTrackerOpen(true);
        }}
        onNavigate={navigate}
        isArabic={isArabic}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#FBFBFA] ${isArabic ? 'font-arabic' : 'font-sans'}`}>
      <aside aria-label="Announcement" className="bg-[#1C1B1A] text-neutral-300 text-[11px] py-2 border-b border-neutral-800"><div className="site-shell flex items-center justify-between gap-3 text-center text-[#e85c5c]"><div className="flex min-w-0 items-center gap-2"><span className="w-1.5 h-1.5 shrink-0 rounded-full bg-amber-400" /><span className="hidden text-[#d22d2d] font-medium sm:inline">ALAN ADVERTISMENT AND PRINTING</span><span className="truncate">Professional Advertising & Printing Solutions · UAE</span></div><div className="flex shrink-0 items-center gap-3"><div className="flex items-center gap-1 font-semibold tracking-wide"><button type="button" onClick={() => !isArabic && setIsArabic(true)} disabled={isArabic} className={isArabic ? 'text-white' : 'text-neutral-500 hover:text-neutral-200'} aria-pressed={isArabic}>AR</button><span className="text-neutral-600">|</span><button type="button" onClick={() => isArabic && setIsArabic(false)} disabled={!isArabic} className={!isArabic ? 'text-white' : 'text-neutral-500 hover:text-neutral-200'} aria-pressed={!isArabic}>EN</button></div><button type="button" onClick={() => setIsCartOpen(true)} className="relative text-neutral-100 hover:text-white" aria-label="View Cart"><ShoppingBag className="h-4 w-4" />{cartItems.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-neutral-950">{cartItems.length}</span>}</button></div></div></aside>
      <Navbar onOpenTracker={openTracker} onOpenSwatchModal={() => setIsSwatchModalOpen(true)} onOpenQuoteModal={() => setIsQuoteModalOpen(true)} onScrollToCatalog={scrollToCatalog} onNavigateToAIDesign={navigateToAIDesign} onNavigate={navigate} isArabic={isArabic} />
      <main className="flex-1">{page}</main>
      <Footer onOpenTracker={openTracker} onOpenSwatchModal={() => setIsSwatchModalOpen(true)} onOpenQuoteModal={() => setIsQuoteModalOpen(true)} onScrollToCatalog={scrollToCatalog} isArabic={isArabic} onNavigate={navigate} />

      <ProductConfiguratorModal product={selectedProduct} initialStockId={selectedStockId} isOpen={!!selectedProduct} onClose={() => { setSelectedProduct(null); setSelectedStockId(undefined); }} onAddToCart={(item) => setCartItems(p => [item, ...p])} isArabic={isArabic} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemoveItem={(id) => setCartItems(p => p.filter(i => i.id !== id))} onProceedToCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} isArabic={isArabic} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={cartItems} onOrderCreated={handleOrderCreated} isArabic={isArabic} />
      <OrderConfirmationModal order={latestOrder} isOpen={isConfirmationOpen} onClose={() => setIsConfirmationOpen(false)} onTrackOrder={(n) => { setTrackingOrderNumber(n); setIsTrackerOpen(true); }} isArabic={isArabic} />
      <OrderTrackerModal isOpen={isTrackerOpen} onClose={() => setIsTrackerOpen(false)} initialOrderNumber={trackingOrderNumber} userOrders={userOrders} isArabic={isArabic} />
      <SwatchKitModal isOpen={isSwatchModalOpen} onClose={() => setIsSwatchModalOpen(false)} isArabic={isArabic} />
      <CustomQuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} isArabic={isArabic} />
      <WhatsAppWidget />
    </div>
  );
}
