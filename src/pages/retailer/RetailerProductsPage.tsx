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
  SlidersHorizontal
} from 'lucide-react';
import { Product, ProductStatus } from '../../types';
import { productService } from '../../services/productService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DiscountBadge } from '../../components/common/DiscountBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency, formatExpiry } from '../../utils/businessLogic';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export const RetailerProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const storeId = 'store_rewe_kleve';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const items = await productService.getProducts({ storeId });
      setProducts(items);
    } catch (err) {
      console.error('Error fetching retailer products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return;
    try {
      await productService.deleteProduct(deletingProductId);
      setProducts(products.filter(p => p.id !== deletingProductId));
      setDeletingProductId(null);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus: ProductStatus = product.status === 'active' ? 'paused' : 'active';
    await productService.updateProduct(product.id, { status: newStatus });
    setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
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
          className="px-4 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rescue Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by product name, category..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'active', 'paused', 'expired', 'sold_out'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
                statusFilter === st
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Products */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : filteredProducts.length > 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200/80 text-3xs uppercase font-bold text-stone-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
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

                      {/* Category */}
                      <td className="py-3 px-4 font-semibold text-stone-600">
                        {prod.category}
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(prod)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 text-2xs font-semibold"
                            title="Toggle active / paused"
                          >
                            {prod.status === 'active' ? 'Pause' : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingProductId(prod.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Delete product"
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
