import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Store as StoreIcon, 
  Users, 
  ShoppingBag, 
  Leaf, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Database,
  ExternalLink
} from 'lucide-react';
import { Store, Product, Reservation } from '../../types';
import { storeService } from '../../services/storeService';
import { productService } from '../../services/productService';
import { reservationService } from '../../services/reservationService';
import { forceReSeedDemoData } from '../../services/seedDataService';
import { formatCurrency } from '../../utils/businessLogic';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminDashboardPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [reSeeding, setReSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, r] = await Promise.all([
        storeService.getStores(),
        productService.getProducts(),
        reservationService.getAllReservations()
      ]);
      setStores(s);
      setProducts(p);
      setReservations(r);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReSeed = async () => {
    setReSeeding(true);
    try {
      await forceReSeedDemoData();
      setSeedSuccess(true);
      await loadData();
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (e) {
      console.error('Re-seed failed:', e);
    } finally {
      setReSeeding(false);
    }
  };

  const handleToggleStoreStatus = async (store: Store) => {
    const newStatus = store.status === 'active' ? 'suspended' : 'active';
    await storeService.updateStore(store.id, { status: newStatus as any });
    setStores(stores.map(s => s.id === store.id ? { ...s, status: newStatus as any } : s));
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-stone-200 text-2xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Platform Administration & Operations</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
            Tschüss City-Level Admin (Kleve Pilot)
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor partner stores, platform transactions, safety verification and system seed health.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReSeed}
          disabled={reSeeding}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>{reSeeding ? 'Resetting Data...' : 'Re-seed Demo Data'}</span>
        </button>
      </div>

      {seedSuccess && (
        <div className="p-4 bg-emerald-100 text-emerald-950 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Demo database reset & seeded with fresh near-expiry inventory in Kleve!</span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
            Registered Partner Stores
          </span>
          <span className="text-2xl font-black text-stone-900">{stores.length}</span>
          <span className="text-3xs text-stone-500 block mt-1">Supermarkets, bakeries & florists</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
            Total Active Listings
          </span>
          <span className="text-2xl font-black text-emerald-950">{products.length}</span>
          <span className="text-3xs text-emerald-700 font-semibold block mt-1">Live rescue products</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
            Reservations Tracked
          </span>
          <span className="text-2xl font-black text-stone-900">{reservations.length}</span>
          <span className="text-3xs text-stone-500 block mt-1">Order vouchers generated</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider block mb-1">
            Total CO2e Diverted
          </span>
          <span className="text-2xl font-black text-teal-950">
            {(products.length * 0.8 * 2.5).toFixed(1)} <span className="text-xs font-normal text-stone-500">kg</span>
          </span>
          <span className="text-3xs text-stone-500 block mt-1">Based on standard FAO metric</span>
        </div>
      </div>

      {/* Stores Management Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900">Partner Store Directory</h3>
          <span className="text-xs text-stone-500 font-semibold">{stores.length} stores active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-3xs uppercase font-bold text-stone-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Store Name</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {stores.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="py-3 px-4 font-bold text-stone-900">{s.name}</td>
                  <td className="py-3 px-4 text-stone-600">{s.address}</td>
                  <td className="py-3 px-4 font-semibold text-stone-700">{s.city}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleStoreStatus(s)}
                      className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold text-2xs"
                    >
                      {s.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
