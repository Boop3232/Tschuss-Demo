import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Store as StoreIcon
} from 'lucide-react';
import { Product, ProductStatus } from '../../types';
import { productService } from '../../services/productService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DiscountBadge } from '../../components/common/DiscountBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency, formatExpiry, isExpired } from '../../utils/businessLogic';
import { seedDemoDataIfEmpty } from '../../services/seedDataService';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

const STORE_TABS = [
  { id: 'all', name: 'All Partner Stores' },
  { id: 'store_rewe_kleve', name: 'REWE Kleve' },
  { id: 'store_baeckerei_kleve', name: 'Bäckerei Derks' },
  { id: 'store_biomarkt_kleve', name: 'BioMarkt Kleve' },
  { id: 'store_edeka_kleve', name: 'EDEKA Center' },
  { id: 'store_blumen_kleve', name: 'Blumen Floristik' },
];

export const RetailerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const items = await productService.getProducts({ 
        storeId: selectedStoreId === 'all' ? undefined : selectedStoreId,
        includeAllStatuses: true
      });
      setProducts(items);
    } catch (err) {
      console.error('Error fetching retailer products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    const unsub = productService.subscribeToProducts(
      selectedStoreId === 'all' ? undefined : selectedStoreId, 
      (items) => {
        setProducts(items);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [selectedStoreId]);

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return;
    const idToDelete = deletingProductId;
    setDeletingProductId(null);
    // Instant optimistic update
    setProducts(prev => prev.filter(p => p.id !== idToDelete));
    try {
      await productService.deleteProduct(idToDelete);
      showToast('Product successfully removed from catalogue.', 'info');
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    if (togglingProductId) return;
    setTogglingProductId(product.id);
    const newStatus: ProductStatus = product.status === 'active' ? 'paused' : 'active';
    
    // When activating, ensure expiry date is in the future (+24 hours) and available stock is at least 5 units
    const needsExpiryRefresh = newStatus === 'active' && isExpired(product.expiryAt);
    const newExpiryAt = needsExpiryRefresh 
      ? new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      : product.expiryAt;
    const newQuantity = (newStatus === 'active' && product.quantityAvailable <= 0) 
      ? 5 
      : product.quantityAvailable;

    const updates: Partial<Product> = {
      status: newStatus,
      expiryAt: newExpiryAt,
      quantityAvailable: newQuantity
    };

    // Strictly update ONLY this targeted product in component state
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...updates } : p));
    try {
      await productService.updateProduct(product.id, updates);
      if (newStatus === 'active') {
        showToast(`"${product.name}" is now ACTIVE and visible on the Discover page.`, 'success');
      } else {
        showToast(`"${product.name}" is PAUSED and hidden from shoppers.`, 'info');
      }
    } catch (err) {
      console.error('Error toggling product status:', err);
      // Revert if failed
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: product.status } : p));
    } finally {
      setTogglingProductId(null);
    }
  };

  // Status counts
  const statusCounts = {
    all: products.length,
    active: products.filter(p => p.status === 'active').length,
    paused: products.filter(p => p.status === 'paused').length,
    expired: products.filter(p => p.status === 'expired').length,
    sold_out: products.filter(p => p.status === 'sold_out').length
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const store = (p.storeName || '').toLowerCase();
    const matchesSearch = !q || name.includes(q) || cat.includes(q) || store.includes(q);
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
            Rescue Inventory & Deals
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your near-expiry supermarket and retail goods published to shoppers.
          </p>
        </div>

        <Link
          to="/business/products/new"
          id="btn-add-rescue-product"
          className="px-4 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rescue Product</span>
        </Link>
      </div>

      {/* Feedback Toast Notification */}
      {feedbackToast && (
        <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
          feedbackToast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-stone-50 border-stone-200 text-stone-900'
        }`}>
          <CheckCircle className={`w-4 h-4 shrink-0 ${
            feedbackToast.type === 'success' ? 'text-emerald-700' : 'text-stone-600'
          }`} />
          <span className="flex-1">{feedbackToast.message}</span>
        </div>
      )}

      {/* Store Branch Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <StoreIcon className="w-3.5 h-3.5 text-stone-500" />
          Store Branch:
        </span>
        <div className="flex items-center gap-1.5">
          {STORE_TABS.map((st) => (
            <button
              key={st.id}
              type="button"
              id={`tab-store-${st.id}`}
              onClick={() => setSelectedStoreId(st.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedStoreId === st.id
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by product name, store, category..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'active', 'paused', 'expired', 'sold_out'] as const).map((st) => {
            const count = statusCounts[st];
            return (
              <button
                key={st}
                id={`filter-status-${st}`}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                <span>{st.replace('_', ' ')}</span>
                <span className={`text-3xs px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === st ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List: Mobile Cards + Desktop Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredProducts.length > 0 ? (
        <div className="space-y-4">
          {/* Mobile Card Layout (md:hidden) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {filteredProducts.map((prod) => {
              const exp = formatExpiry(prod.expiryAt);

              return (
                <div 
                  key={`mobile-${prod.id}`}
                  className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-2xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md truncate">
                          {prod.category}
                        </span>
                        <StatusBadge status={prod.status} />
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm mt-1 truncate">
                        {prod.name}
                      </h4>
                      <p className="text-2xs text-stone-500 truncate">
                        {prod.storeName} • {prod.unit || 'Standard unit'}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Stock Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
                    <div>
                      <span className="text-3xs text-stone-400 uppercase font-bold block">Price</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="font-extrabold text-stone-900">{formatCurrency(prod.rescuePrice)}</span>
                        <span className="text-3xs text-stone-400 line-through">{formatCurrency(prod.originalPrice)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-3xs text-stone-400 uppercase font-bold block">Stock & Expiry</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-stone-800">{prod.quantityAvailable} units</span>
                        <span className="text-stone-300">•</span>
                        <span className={`text-2xs font-semibold ${exp.urgency === 'critical' ? 'text-rose-700 font-bold' : 'text-stone-600'}`}>
                          {exp.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-stone-100">
                    <button
                      type="button"
                      id={`btn-mobile-toggle-status-${prod.id}`}
                      onClick={() => handleToggleStatus(prod)}
                      disabled={togglingProductId === prod.id}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 ${
                        prod.status === 'active'
                          ? 'border-amber-300 bg-amber-50/80 text-amber-900 hover:bg-amber-100'
                          : 'border-emerald-300 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100'
                      }`}
                    >
                      {togglingProductId === prod.id ? (
                        <span className="inline-flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </span>
                      ) : (
                        prod.status === 'active' ? 'Pause Listing' : 'Activate Deal'
                      )}
                    </button>

                    <button
                      type="button"
                      id={`btn-mobile-delete-product-${prod.id}`}
                      onClick={() => setDeletingProductId(prod.id)}
                      className="p-2 rounded-xl text-rose-600 bg-rose-50/60 hover:bg-rose-100 border border-rose-200 transition-colors shrink-0"
                      title="Delete product"
                      aria-label={`Delete ${prod.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (hidden on mobile, visible on md+) */}
          <div className="hidden md:block bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50/80 border-b border-stone-200/80 text-3xs uppercase font-bold text-stone-400 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Store & Category</th>
                    <th className="py-3.5 px-4">Pricing</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Expiry</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((prod) => {
                    const exp = formatExpiry(prod.expiryAt);

                    return (
                      <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Product details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-stone-900 block truncate max-w-xs">{prod.name}</span>
                              <span className="text-2xs text-stone-500">{prod.unit || 'Standard unit'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Store & Category */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-900 block">{prod.storeName}</span>
                          <span className="text-2xs text-stone-500 font-semibold">{prod.category}</span>
                        </td>

                        {/* Pricing */}
                        <td className="py-3 px-4">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-extrabold text-stone-900">{formatCurrency(prod.rescuePrice)}</span>
                            <span className="text-2xs text-stone-400 line-through">{formatCurrency(prod.originalPrice)}</span>
                          </div>
                          <DiscountBadge percent={prod.discountPercent} size="sm" className="mt-0.5" />
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4">
                          <span className={`font-bold ${prod.quantityAvailable <= 3 ? 'text-amber-700' : 'text-stone-900'}`}>
                            {prod.quantityAvailable} units
                          </span>
                        </td>

                        {/* Expiry */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 font-semibold ${
                            exp.urgency === 'critical' ? 'text-rose-700 font-bold' : 'text-stone-600'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            {exp.text}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <StatusBadge status={prod.status} />
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              id={`btn-toggle-status-${prod.id}`}
                              onClick={() => handleToggleStatus(prod)}
                              disabled={togglingProductId === prod.id}
                              className={`px-2.5 py-1 rounded-lg border text-2xs font-semibold transition-colors cursor-pointer ${
                                prod.status === 'active'
                                  ? 'border-amber-200 text-amber-800 hover:bg-amber-50'
                                  : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                              }`}
                              title={prod.status === 'active' ? 'Pause product' : 'Activate product'}
                            >
                              {togglingProductId === prod.id ? (
                                <span className="inline-flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  <span>Updating...</span>
                                </span>
                              ) : (
                                prod.status === 'active' ? 'Pause' : 'Activate'
                              )}
                            </button>

                            <button
                              type="button"
                              id={`btn-delete-product-${prod.id}`}
                              onClick={() => setDeletingProductId(prod.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                              title="Delete product"
                              aria-label={`Delete ${prod.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
          <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-900 text-base">No products found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or add your first surplus rescue item.
          </p>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!deletingProductId}
        title="Delete this rescue product?"
        message="This product will be permanently removed from the public marketplace. Existing reservations will remain intact."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeletingProductId(null)}
      />
    </div>
  );
};

