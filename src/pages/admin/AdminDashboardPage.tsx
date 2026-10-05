import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  ShieldCheck,
  Store as StoreIcon, 
  ShoppingBag, 
  Leaf, 
  RefreshCw, 
  CheckCircle2, 
  Database,
  Search,
  Plus,
  MapPin,
  Clock,
  Trash2,
  X,
  DollarSign,
  Users,
  Building2,
  ChevronRight,
  Download,
  CheckCircle
} from 'lucide-react';
import { Store, Product, Reservation, ReservationStatus, ProductCategory } from '../../types';
import { storeService } from '../../services/storeService';
import { productService } from '../../services/productService';
import { reservationService } from '../../services/reservationService';
import { forceReSeedDemoData } from '../../services/seedDataService';
import { formatCurrency, isExpired } from '../../utils/businessLogic';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { onboardingService, RetailerApplicationDoc } from '../../services/onboardingService';

type AdminTab = 'overview' | 'applications' | 'stores' | 'inventory' | 'reservations' | 'system';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [applications, setApplications] = useState<RetailerApplicationDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reSeeding, setReSeeding] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter & Search states
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const [storeSearch, setStoreSearch] = useState('');
  const [storeStatusFilter, setStoreStatusFilter] = useState<'all' | 'active' | 'paused' | 'pending'>('all');
  
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationStatusFilter, setReservationStatusFilter] = useState<string>('all');

  // New Store Onboarding Modal
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreData, setNewStoreData] = useState<{
    name: string;
    category: ProductCategory;
    address: string;
    city: string;
    phone: string;
    openingHours: string;
    pickupInstructions: string;
  }>({
    name: '',
    category: 'Grocery',
    address: '',
    city: 'Kleve',
    phone: '+49 2821 ',
    openingHours: '08:00 - 20:00',
    pickupInstructions: 'Pick up at the customer service desk. Show order voucher.'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, r, apps] = await Promise.all([
        storeService.getStores(),
        productService.getProducts(),
        reservationService.getAllReservations(),
        onboardingService.getApplications()
      ]);
      setStores(s);
      setProducts(p);
      setReservations(r);
      setApplications(apps);
    } catch (e) {
      console.error('Error loading admin operations data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReSeed = async () => {
    setReSeeding(true);
    try {
      await forceReSeedDemoData();
      showToast('Catalog refreshed: Live Kleve surplus items re-seeded');
      await loadData();
    } catch (e) {
      console.error('Re-seed failed:', e);
      showToast('Failed to reset demo catalog');
    } finally {
      setReSeeding(false);
    }
  };

  const handleToggleStoreStatus = async (store: Store) => {
    const newStatus: 'active' | 'paused' = store.status === 'active' ? 'paused' : 'active';
    await storeService.updateStore(store.id, { status: newStatus });
    setStores(stores.map(s => s.id === store.id ? { ...s, status: newStatus } : s));
    showToast(`Store ${store.name} status set to ${newStatus}`);
  };

  const handleDeleteStore = async (storeId: string, storeName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${storeName}" from the platform directory?`)) return;
    await storeService.deleteStore(storeId);
    setStores(stores.filter(s => s.id !== storeId));
    showToast(`Store "${storeName}" removed`);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreData.name.trim() || !newStoreData.address.trim()) return;

    try {
      await storeService.createStore({
        name: newStoreData.name.trim(),
        ownerId: 'dev_admin_tschuess',
        address: newStoreData.address.trim(),
        city: newStoreData.city.trim() || 'Kleve',
        latitude: 51.789 + (Math.random() - 0.5) * 0.04,
        longitude: 6.138 + (Math.random() - 0.5) * 0.04,
        openingHours: newStoreData.openingHours,
        phone: newStoreData.phone.trim(),
        categories: [newStoreData.category],
        status: 'active',
        pickupInstructions: newStoreData.pickupInstructions
      });

      showToast(`Partner store "${newStoreData.name}" onboarded successfully!`);
      setShowAddStoreModal(false);
      setNewStoreData({
        name: '',
        category: 'Grocery',
        address: '',
        city: 'Kleve',
        phone: '+49 2821 ',
        openingHours: '08:00 - 20:00',
        pickupInstructions: 'Pick up at the customer service desk. Show order voucher.'
      });
      await loadData();
    } catch (err) {
      console.error('Error creating store:', err);
      showToast('Could not create store');
    }
  };

  const handleUpdateProductStock = async (prod: Product, delta: number) => {
    const newQty = Math.max(0, prod.quantityAvailable + delta);
    const newStatus = newQty === 0 ? 'sold_out' : 'active';
    await productService.updateProduct(prod.id, { quantityAvailable: newQty, status: newStatus });
    setProducts(products.map(p => p.id === prod.id ? { ...p, quantityAvailable: newQty, status: newStatus } : p));
    showToast(`Updated stock for ${prod.name}: ${newQty} units`);
  };

  const handleForceCompleteReservation = async (reservation: Reservation) => {
    try {
      await reservationService.updateReservationStatus(reservation.id, 'COLLECTED');
      setReservations(reservations.map(r => r.id === reservation.id ? { ...r, status: 'COLLECTED', updatedAt: new Date() } : r));
      showToast(`Order voucher ${reservation.reservationCode || reservation.id.slice(0, 8)} verified and collected`);
    } catch (e) {
      showToast('Failed to update reservation');
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      city: 'Kleve, NRW',
      metrics: {
        totalStores: stores.length,
        totalProducts: products.length,
        totalReservations: reservations.length
      },
      stores,
      products,
      reservations
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tschuess_operations_audit_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Platform audit export downloaded');
  };

  // Application Handlers
  const handleApproveApp = async (appDoc: RetailerApplicationDoc) => {
    try {
      await onboardingService.approveApplication(appDoc);
      showToast(`Approved ${appDoc.storeName}! Live store created and activated.`);
      await loadData();
    } catch (e) {
      console.error('Approve application error:', e);
      showToast('Failed to approve application');
    }
  };

  const handleRejectApp = async (appDoc: RetailerApplicationDoc) => {
    try {
      await onboardingService.updateApplicationStatus(appDoc.id, 'rejected');
      setApplications(applications.map(a => a.id === appDoc.id ? { ...a, status: 'rejected' } : a));
      showToast(`Application for ${appDoc.storeName} marked as rejected`);
    } catch (e) {
      showToast('Failed to reject application');
    }
  };

  const handleSetPendingApp = async (appDoc: RetailerApplicationDoc) => {
    try {
      await onboardingService.updateApplicationStatus(appDoc.id, 'pending');
      setApplications(applications.map(a => a.id === appDoc.id ? { ...a, status: 'pending' } : a));
      showToast(`Application for ${appDoc.storeName} set back to pending`);
    } catch (e) {
      showToast('Failed to set application to pending');
    }
  };

  // Telemetry KPIs
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const activeStoresCount = stores.filter(s => s.status === 'active').length;
  const activeProductsCount = products.filter(p => p.status === 'active' && !isExpired(p.expiryAt)).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.quantityAvailable || 0), 0);
  const totalRescuedValue = products.reduce((acc, p) => acc + (p.originalPrice * (p.quantityAvailable || 1)), 0);
  const totalConsumerSavings = products.reduce((acc, p) => acc + ((p.originalPrice - p.rescuePrice) * (p.quantityAvailable || 1)), 0);
  const totalKgFoodDiverted = (products.length * 0.85).toFixed(1);
  const totalCO2eAverted = (parseFloat(totalKgFoodDiverted) * 2.5).toFixed(1);
  const pickupFulfillmentRate = reservations.length > 0 
    ? Math.round((reservations.filter(r => r.status === 'COLLECTED' || r.status === 'COMPLETED').length / reservations.length) * 100)
    : 100;

  // Filtered lists
  const filteredApplications = useMemo(() => {
    return applications.filter(a => {
      const q = appSearch.toLowerCase();
      const matchSearch = a.storeName.toLowerCase().includes(q) ||
                          a.contactName.toLowerCase().includes(q) ||
                          a.email.toLowerCase().includes(q) ||
                          a.city.toLowerCase().includes(q) ||
                          (a.referenceId && a.referenceId.toLowerCase().includes(q));
      const matchStatus = appStatusFilter === 'all' || a.status === appStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, appSearch, appStatusFilter]);

  // Filtered lists
  const filteredStores = useMemo(() => {
    return stores.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(storeSearch.toLowerCase()) || 
                          s.address.toLowerCase().includes(storeSearch.toLowerCase()) ||
                          s.city.toLowerCase().includes(storeSearch.toLowerCase());
      const matchStatus = storeStatusFilter === 'all' || s.status === storeStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [stores, storeSearch, storeStatusFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.storeName.toLowerCase().includes(productSearch.toLowerCase());
      const matchCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const q = reservationSearch.toLowerCase();
      const matchSearch = (r.reservationCode && r.reservationCode.toLowerCase().includes(q)) ||
                          (r.storeName && r.storeName.toLowerCase().includes(q)) ||
                          (r.consumerName && r.consumerName.toLowerCase().includes(q));
      const matchStatus = reservationStatusFilter === 'all' || r.status === reservationStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [reservations, reservationSearch, reservationStatusFilter]);

  return (
    <div className="min-h-screen bg-stone-50/70 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          id="admin-toast-banner"
          className="fixed top-20 right-5 z-50 px-4 py-3 rounded-2xl bg-stone-950/90 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-stone-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Context */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-2xs font-extrabold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tschüss Operations · Corporate Administration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
                City Operations Console
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
                Centralized management for supermarket partners, bakery surplus streams, order voucher audits, and municipal food rescue telemetry in <strong>Kleve, NRW</strong>.
              </p>
            </div>

            {/* Quick Global Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                id="btn-admin-onboard-store"
                onClick={() => setShowAddStoreModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Retailer</span>
              </button>

              <button
                type="button"
                id="btn-admin-reseed-data"
                onClick={handleReSeed}
                disabled={reSeeding}
                className="px-3.5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Database className={`w-3.5 h-3.5 text-emerald-400 ${reSeeding ? 'animate-spin' : ''}`} />
                <span>{reSeeding ? 'Resetting Catalog...' : 'Re-seed Catalog'}</span>
              </button>

              <button
                type="button"
                id="btn-admin-export-audit"
                onClick={handleExportData}
                className="px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Download platform audit log"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit</span>
              </button>
            </div>
          </div>

          {/* Quick Environment & Switcher Toolbar */}
          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold text-stone-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Operations: <span className="text-stone-900">Kleve (47533)</span>
              </span>
              <span className="text-stone-300">|</span>
              <span className="text-stone-500">
                Sync Engine: <strong className="text-emerald-700 font-semibold">Active</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Executive Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-2xs font-bold uppercase tracking-wider">Partner Stores</span>
              <StoreIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              {stores.length}
            </div>
            <p className="text-3xs text-emerald-700 font-semibold">
              {activeStoresCount} active in store network
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-2xs font-bold uppercase tracking-wider">Live Inventory</span>
              <ShoppingBag className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              {totalStockUnits}
            </div>
            <p className="text-3xs text-stone-500">
              {activeProductsCount} active rescue listings
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-2xs font-bold uppercase tracking-wider">Rescue Orders</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              {reservations.length}
            </div>
            <p className="text-3xs text-indigo-700 font-semibold">
              {pickupFulfillmentRate}% pickup fulfillment
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-2xs font-bold uppercase tracking-wider">Consumer Savings</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              {formatCurrency(totalConsumerSavings)}
            </div>
            <p className="text-3xs text-stone-500">
              Retail value: {formatCurrency(totalRescuedValue)}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span className="text-2xs font-bold uppercase tracking-wider">CO2e Averted</span>
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-display">
              {totalCO2eAverted} <span className="text-sm font-bold text-stone-400">kg</span>
            </div>
            <p className="text-3xs text-emerald-700 font-semibold">
              {totalKgFoodDiverted} kg food preserved
            </p>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-2xl w-full sm:w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Overview & Telemetry
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Partner Applications ({applications.length})</span>
            {pendingAppsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-3xs animate-pulse">
                {pendingAppsCount} pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'stores'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Partner Stores ({stores.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Live Surplus Inventory ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reservations'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Order Vouchers ({reservations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'system'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            System Operations
          </button>
        </div>

        {/* Tab 1: Overview & Telemetry */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Partner Store Breakdown */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-stone-900 font-display">
                    Kleve Partner Network Categories
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('stores')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all stores</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60">
                    <span className="text-3xs font-bold text-stone-400 uppercase block">Groceries & Supermarkets</span>
                    <span className="text-xl font-black text-stone-900">
                      {stores.filter(s => s.categories.includes('Grocery')).length}
                    </span>
                    <span className="text-3xs text-stone-500 block">REWE, EDEKA, ALDI</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60">
                    <span className="text-3xs font-bold text-stone-400 uppercase block">Bakeries</span>
                    <span className="text-xl font-black text-stone-900">
                      {stores.filter(s => s.categories.includes('Bakery')).length}
                    </span>
                    <span className="text-3xs text-stone-500 block">Artisan bread & pretzels</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60">
                    <span className="text-3xs font-bold text-stone-400 uppercase block">Flowers</span>
                    <span className="text-xl font-black text-stone-900">
                      {stores.filter(s => s.categories.includes('Flowers')).length}
                    </span>
                    <span className="text-3xs text-stone-500 block">Plants & bouquets</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60">
                    <span className="text-3xs font-bold text-stone-400 uppercase block">Drinks & Other</span>
                    <span className="text-xl font-black text-stone-900">
                      {stores.filter(s => s.categories.includes('Drinks') || s.categories.includes('Other')).length}
                    </span>
                    <span className="text-3xs text-stone-500 block">Juices & pantries</span>
                  </div>
                </div>
              </div>

              {/* Surplus Category Distribution */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-stone-900 font-display">
                    Live Surplus Categories in Kleve
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage listings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Supermarket Groceries', cat: 'Grocery', color: 'bg-emerald-500' },
                    { label: 'Artisan Bakery & Pretzels', cat: 'Bakery', color: 'bg-amber-500' },
                    { label: 'Fresh Flowers & Bouquets', cat: 'Flowers', color: 'bg-rose-500' },
                    { label: 'Drinks & Beverages', cat: 'Drinks', color: 'bg-blue-500' },
                    { label: 'Household & Care', cat: 'Household', color: 'bg-purple-500' }
                  ].map(item => {
                    const count = products.filter(p => p.category === item.cat).length;
                    const pct = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                    return (
                      <div key={item.cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                          <span>{item.label}</span>
                          <span>{count} items ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Platform Audit & Compliance */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm font-display">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>German Food Safety Standards (MHD)</span>
                </div>
                <div className="space-y-3 text-xs text-stone-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>DIN 10514 hygiene & cold-chain compliance active for all catalog listings.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>MHD (Best-Before) near-expiry products certified safe for immediate consumption.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automated purge prevents expired listings past the designated pickup deadline.</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900 to-stone-900 text-white rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-bold uppercase tracking-wider text-indigo-300">
                    Municipal Operations
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Stage 1 Active
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-base font-display">
                    Kleve Operations & Rollout
                  </h4>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    Operations Hub covers 15km radius including Materborn, Rindern, Kellen, and Kleve City Center.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-2xs text-stone-300 font-medium">
                  <span>Target food recovery:</span>
                  <span className="font-bold text-white">5,000 kg / month</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Retailer Partner Applications (Pending & Processed) */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-3xs font-extrabold uppercase tracking-wider mb-1">
                  <span>Inbound Retailer Pipeline</span>
                </div>
                <h3 className="text-xl font-black text-stone-900 font-display">
                  Retailer Onboarding Applications
                </h3>
                <p className="text-xs text-stone-500">
                  Review supermarket and store partnership submissions sent from the onboarding portal.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder="Search by store or contact..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-semibold focus:outline-none"
                >
                  <option value="all">All Statuses ({applications.length})</option>
                  <option value="pending">Pending ({pendingAppsCount})</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 bg-stone-50/60 rounded-2xl border border-dashed border-stone-200 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl">
                  📋
                </div>
                <h4 className="font-bold text-stone-800 text-sm">No applications found</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {appStatusFilter === 'pending'
                    ? 'There are currently no pending retailer applications waiting for review.'
                    : 'No onboarding applications match the current filter search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredApplications.map((appDoc) => {
                  const isPending = appDoc.status === 'pending';
                  const isApproved = appDoc.status === 'approved';
                  const isRejected = appDoc.status === 'rejected';

                  return (
                    <div
                      key={appDoc.id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 ${
                        isPending
                          ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                          : isApproved
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : 'bg-stone-50 border-stone-200 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-xl bg-stone-900 text-white font-mono font-bold text-2xs">
                            {appDoc.referenceId || appDoc.id.slice(0, 8)}
                          </span>

                          <span
                            className={`px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-200 text-amber-950 border border-amber-300'
                                : isApproved
                                ? 'bg-emerald-200 text-emerald-950 border border-emerald-300'
                                : 'bg-rose-200 text-rose-950 border border-rose-300'
                            }`}
                          >
                            Status: {appDoc.status}
                          </span>
                        </div>

                        <span className="text-3xs text-stone-400 font-medium">
                          Submitted: {new Date(appDoc.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700">
                        {/* Store Info */}
                        <div className="space-y-1">
                          <span className="text-3xs font-bold text-stone-400 uppercase tracking-wider block">
                            Store Details
                          </span>
                          <h4 className="font-extrabold text-stone-900 text-sm">
                            {appDoc.storeName}
                          </h4>
                          <div className="text-stone-600">{appDoc.storeType}</div>
                          <div className="flex items-center gap-1 text-stone-500 text-3xs">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>
                              {appDoc.address}, {appDoc.postalCode} {appDoc.city}
                            </span>
                          </div>
                          {appDoc.coordinates && (
                            <div className="text-3xs font-mono text-emerald-800">
                              Pin: Lat {appDoc.coordinates.lat?.toFixed(4)}, Lng {appDoc.coordinates.lng?.toFixed(4)}
                            </div>
                          )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-1">
                          <span className="text-3xs font-bold text-stone-400 uppercase tracking-wider block">
                            Contact Person
                          </span>
                          <div className="font-bold text-stone-900">{appDoc.contactName}</div>
                          <div className="text-stone-600 font-medium">{appDoc.email}</div>
                          <div className="text-stone-500">{appDoc.phone}</div>
                        </div>

                        {/* Operational Details */}
                        <div className="space-y-1">
                          <span className="text-3xs font-bold text-stone-400 uppercase tracking-wider block">
                            Operations & Shrink
                          </span>
                          <div>
                            Est. Monthly Shrink: <strong className="text-stone-900">€{appDoc.monthlyShrinkEur}</strong>
                          </div>
                          <div>
                            Daily Pickup Window: <strong className="text-emerald-800">{appDoc.pickupStartTime} – {appDoc.pickupEndTime}</strong>
                          </div>
                          {appDoc.operationalNotes && (
                            <div className="text-3xs text-stone-500 italic bg-white/80 p-2 rounded-xl border border-stone-200 mt-1">
                              "{appDoc.operationalNotes}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Decision Actions */}
                      <div className="pt-3 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-3xs text-stone-500">
                          {isApproved && appDoc.createdStoreId && (
                            <span className="text-emerald-800 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Activated as Live Store (ID: {appDoc.createdStoreId})
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-rose-700 font-semibold">
                              Application rejected
                            </span>
                          )}
                          {isPending && (
                            <span className="text-amber-900 font-medium">
                              Pending review. Action required by admin.
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveApp(appDoc)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve & Activate Store</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRejectApp(appDoc)}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {!isPending && (
                            <button
                              type="button"
                              onClick={() => handleSetPendingApp(appDoc)}
                              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Reset to Pending
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Partner Stores Directory */}
        {activeTab === 'stores' && (
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-stone-900 font-display">
                  Partner Store Directory
                </h3>
                <p className="text-xs text-stone-500">
                  Manage supermarket chains, local bakeries, opening hours, and partner verification badges.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    placeholder="Search stores..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <select
                  value={storeStatusFilter}
                  onChange={(e) => setStoreStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-semibold focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="pending">Pending</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Store</span>
                </button>
              </div>
            </div>

            {/* Stores Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200/80 text-3xs uppercase font-bold text-stone-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Store Brand</th>
                    <th className="py-3 px-4">Address & City</th>
                    <th className="py-3 px-4">Opening Hours</th>
                    <th className="py-3 px-4">Active Listings</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400 text-xs">
                        No stores matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStores.map(s => {
                      const storeProducts = products.filter(p => p.storeId === s.id);
                      return (
                        <tr key={s.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-2xs border border-emerald-200">
                                {s.name.charAt(0)}
                              </div>
                              <div>
                                <span className="block font-bold">{s.name}</span>
                                <span className="text-3xs text-stone-400">{s.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-stone-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{s.address}, {s.city}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-stone-600 font-medium">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{s.openingHours || '08:00 - 20:00'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-stone-900">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-2xs">
                              {storeProducts.length} items
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={s.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleStoreStatus(s)}
                                className={`px-2.5 py-1 rounded-lg border text-2xs font-semibold transition-colors cursor-pointer ${
                                  s.status === 'active'
                                    ? 'border-amber-200 text-amber-800 hover:bg-amber-50'
                                    : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                                }`}
                              >
                                {s.status === 'active' ? 'Pause' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStore(s.id, s.name)}
                                className="p-1 text-stone-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer"
                                title="Delete store"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Live Surplus Inventory */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-stone-900 font-display">
                  Live Surplus Food Stream
                </h3>
                <p className="text-xs text-stone-500">
                  Inspect real-time near-expiry food listings, discount rates, remaining stock, and expiration safety countdowns.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product or brand..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-semibold focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Flowers">Flowers</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Household">Household</option>
                  <option value="Cosmetics">Cosmetics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200/80 text-3xs uppercase font-bold text-stone-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product Item</th>
                    <th className="py-3 px-4">Retail Partner</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Rescue Pricing</th>
                    <th className="py-3 px-4">Stock Left</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400 text-xs">
                        No surplus food items matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      const discountPct = p.discountPercent || Math.round(((p.originalPrice - p.rescuePrice) / p.originalPrice) * 100);
                      const expired = isExpired(p.expiryAt);

                      return (
                        <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-stone-900">
                            <div className="flex items-center gap-2.5">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                                  <ShoppingBag className="w-4 h-4 text-stone-400" />
                                </div>
                              )}
                              <div>
                                <span className="block font-bold text-stone-900 line-clamp-1">{p.name}</span>
                                <span className="text-3xs text-stone-400">ID: {p.id.slice(0, 10)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-700 font-semibold">
                            {p.storeName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-3xs font-semibold capitalize">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-extrabold text-emerald-700">{formatCurrency(p.rescuePrice)}</span>
                              <span className="text-3xs text-stone-400 line-through">{formatCurrency(p.originalPrice)}</span>
                              <span className="text-3xs px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                                -{discountPct}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold">
                            <span className={p.quantityAvailable <= 2 ? 'text-amber-600' : 'text-stone-900'}>
                              {p.quantityAvailable} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {expired ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-3xs font-bold">
                                Expired
                              </span>
                            ) : (
                              <StatusBadge status={p.status} />
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateProductStock(p, -1)}
                                disabled={p.quantityAvailable <= 0}
                                className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-30"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold text-stone-800 text-xs">
                                {p.quantityAvailable}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateProductStock(p, 1)}
                                className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Reservations & Order Vouchers */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-stone-900 font-display">
                  Order Vouchers & Audit Log
                </h3>
                <p className="text-xs text-stone-500">
                  Real-time consumer pickup verification, dispute resolution, and settlement telemetry.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={reservationSearch}
                    onChange={(e) => setReservationSearch(e.target.value)}
                    placeholder="Search voucher code..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <select
                  value={reservationStatusFilter}
                  onChange={(e) => setReservationStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 font-semibold focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COLLECTED">Collected / Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Reservations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200/80 text-3xs uppercase font-bold text-stone-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Voucher Code</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Store Location</th>
                    <th className="py-3 px-4">Total (€)</th>
                    <th className="py-3 px-4">Pickup Window</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400 text-xs">
                        No reservations recorded in this filter view.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map(r => (
                      <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-xs">
                            {r.reservationCode || r.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-700">
                          <span className="font-semibold block">{r.consumerName || 'Shopper'}</span>
                          <span className="text-3xs text-stone-400 truncate max-w-[150px] block">{r.consumerEmail || r.consumerId}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-stone-800">
                          {r.storeName}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-800">
                          {formatCurrency(r.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {r.pickupWindow || 'Standard Window'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {(r.status === 'PENDING' || r.status === 'CONFIRMED' || r.status === 'READY') && (
                            <button
                              type="button"
                              onClick={() => handleForceCompleteReservation(r)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-2xs transition-colors cursor-pointer"
                              title="Force verify voucher pickup"
                            >
                              Verify Pickup
                            </button>
                          )}
                          {(r.status === 'COLLECTED' || r.status === 'COMPLETED') && (
                            <span className="text-2xs text-emerald-700 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                            </span>
                          )}
                          {r.status === 'CANCELLED' && (
                            <span className="text-2xs text-stone-400 font-medium">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: System Operations & Seeding */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-6 space-y-6">
            <div>
              <h3 className="text-lg font-black text-stone-900 font-display">
                Database Seeding & Platform Controls
              </h3>
              <p className="text-xs text-stone-500">
                Administrative tools for testing and maintaining the Kleve food rescue catalog.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Seed Demo Food Rescue Catalog</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Reset the platform catalog with fresh, appetizing bakery treats, organic produce, fresh meals, and supermarket groceries located at real Kleve addresses.
                </p>
                <button
                  type="button"
                  onClick={handleReSeed}
                  disabled={reSeeding}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reSeeding ? 'animate-spin' : ''}`} />
                  <span>{reSeeding ? 'Re-seeding...' : 'Reset & Re-seed Now'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span>Commission & Economics Settings</span>
                </div>
                <div className="space-y-2 text-xs text-stone-700">
                  <div className="flex items-center justify-between">
                    <span>Platform Commission:</span>
                    <strong className="font-bold text-stone-900">15.0% flat</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Coverage Radius:</span>
                    <strong className="font-bold text-stone-900">15 km (Kleve Hub)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>MHD Expiry Window Grace:</span>
                    <strong className="font-bold text-stone-900">2 hours post-closing</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Onboard New Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-200/90 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-stone-900 font-display">
                  Onboard Retail Partner Store
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStoreModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Store Name / Brand</label>
                <input
                  type="text"
                  required
                  value={newStoreData.name}
                  onChange={(e) => setNewStoreData({ ...newStoreData, name: e.target.value })}
                  placeholder="e.g. EDEKA Center Materborn"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Primary Category</label>
                  <select
                    value={newStoreData.category}
                    onChange={(e) => setNewStoreData({ ...newStoreData, category: e.target.value as ProductCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Flowers">Flowers</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Household">Household</option>
                    <option value="Cosmetics">Cosmetics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newStoreData.city}
                    onChange={(e) => setNewStoreData({ ...newStoreData, city: e.target.value })}
                    placeholder="Kleve"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newStoreData.address}
                  onChange={(e) => setNewStoreData({ ...newStoreData, address: e.target.value })}
                  placeholder="e.g. Materborner Allee 42"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newStoreData.phone}
                    onChange={(e) => setNewStoreData({ ...newStoreData, phone: e.target.value })}
                    placeholder="+49 2821 98765"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={newStoreData.openingHours}
                    onChange={(e) => setNewStoreData({ ...newStoreData, openingHours: e.target.value })}
                    placeholder="08:00 - 20:00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Pickup Instructions</label>
                <input
                  type="text"
                  value={newStoreData.pickupInstructions}
                  onChange={(e) => setNewStoreData({ ...newStoreData, pickupInstructions: e.target.value })}
                  placeholder="e.g. Pick up at service counter"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Onboard Partner Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
