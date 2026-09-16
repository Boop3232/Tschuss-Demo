import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Clock, Store, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { DiscountBadge } from '../common/DiscountBadge';
import { PriceDisplay } from '../common/PriceDisplay';
import { formatExpiry, formatDistance } from '../../utils/businessLogic';
import { savedService } from '../../services/savedService';
import { useAuth } from '../../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onQuickReserve?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickReserve }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const userId = currentUser?.uid || userProfile?.uid || 'guest_user';

  useEffect(() => {
    savedService.isProductSaved(userId, product.id).then(setIsSaved);
  }, [userId, product.id]);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    const newState = await savedService.toggleSave(userId, product.id);
    setIsSaved(newState);
    setSaving(false);
  };

  const handleCardClick = () => {
    navigate(`/app/products/${product.id}`);
  };

  const handleReserveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickReserve) {
      onQuickReserve(product);
    } else {
      navigate(`/app/products/${product.id}?reserve=true`);
    }
  };

  const expiryInfo = formatExpiry(product.expiryAt);

  const expiryStyles = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200/80 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80 font-semibold',
    normal: 'bg-emerald-50 text-emerald-800 border-emerald-200/70 font-medium',
    expired: 'bg-stone-100 text-stone-500 border-stone-200 font-medium'
  }[expiryInfo.urgency];

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="group bg-white rounded-3xl border border-stone-200/70 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer text-left"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-4/3 w-full bg-stone-50 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3">
          <DiscountBadge percent={product.discountPercent} size="md" />
        </div>

        {/* Save Heart Button */}
        <button
          type="button"
          id={`btn-heart-${product.id}`}
          onClick={handleHeartClick}
          aria-label={isSaved ? 'Remove from saved' : 'Save product'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs backdrop-blur-xs ${
            isSaved
              ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105'
              : 'bg-white/90 text-stone-600 hover:text-rose-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Pill */}
        <div className="absolute bottom-2.5 right-2.5 bg-stone-900/70 backdrop-blur-xs text-white text-2xs font-semibold px-2 py-0.5 rounded-lg shadow-2xs">
          {product.quantityAvailable} left
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Store & Distance Row */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 gap-2">
            <span className="font-semibold text-emerald-800 truncate flex items-center gap-1">
              <Store className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              {product.storeName}
            </span>
            {(product as any).calculatedDistance !== undefined && (
              <span className="shrink-0 flex items-center gap-0.5 font-medium text-stone-600 bg-stone-50 border border-stone-200/60 px-2 py-0.5 rounded-lg text-2xs">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {formatDistance((product as any).calculatedDistance)}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h4 className="font-bold text-stone-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
            {product.name}
          </h4>

          {/* Expiry Urgency Pill */}
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-lg border ${expiryStyles}`}>
              <Clock className="w-3 h-3" />
              {expiryInfo.text}
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <PriceDisplay
            originalPrice={product.originalPrice}
            rescuePrice={product.rescuePrice}
            size="sm"
          />

          <button
            type="button"
            id={`btn-reserve-${product.id}`}
            onClick={handleReserveClick}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
};
