import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { savedService } from '../../services/savedService';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from '../../components/consumer/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton';

export const SavedPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = currentUser?.uid || userProfile?.uid || 'guest_user';

  const loadSaved = async () => {
    setLoading(true);
    try {
      const items = await savedService.getSavedProducts(userId);
      setSavedProducts(items);
    } catch (e) {
      console.error('Error fetching saved:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [userId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
          Saved Rescue Deals
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Keep track of discounted items you love before stock runs out.
        </p>
      </div>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : savedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {savedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved rescue deals yet"
          description="Click the heart icon on any product in the marketplace to bookmark it here for quick access."
          actionText="Explore Marketplace"
          onAction={() => window.location.assign('/app/discover')}
        />
      )}
    </div>
  );
};
