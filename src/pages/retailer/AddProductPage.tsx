import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Tag, 
  Clock, 
  Calendar, 
  Package, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ProductCategory, Product } from '../../types';
import { productService } from '../../services/productService';
import { pricingRecommendationService } from '../../services/predictiveExpiryService';
import { calculateRescuePrice, formatCurrency } from '../../utils/businessLogic';
import { PriceDisplay } from '../../components/common/PriceDisplay';

const PRESET_IMAGES: Record<ProductCategory, string[]> = {
  Grocery: [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  ],
  Bakery: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80'
  ],
  Drinks: [
    'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80'
  ],
  Cosmetics: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
  ],
  Flowers: [
    'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80'
  ],
  Household: [
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80'
  ],
  Other: [
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80'
  ]
};

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();

  // Tomorrow by default
  const defaultTomorrow = new Date(Date.now() + 26 * 3600 * 1000).toISOString().slice(0, 16);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Grocery');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('500g package');
  const [originalPrice, setOriginalPrice] = useState<number>(2.99);
  const [discountPercent, setDiscountPercent] = useState<number>(60);
  const [quantityAvailable, setQuantityAvailable] = useState<number>(5);
  const [expiryAt, setExpiryAt] = useState<string>(defaultTomorrow);
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES.Grocery[0]);
  const [estimatedWeightKg, setEstimatedWeightKg] = useState<number>(0.5);
  const [pickupStartTime, setPickupStartTime] = useState('08:00');
  const [pickupEndTime, setPickupEndTime] = useState('21:00');

  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Dynamic pricing recommendation
  const pricingRec = pricingRecommendationService.getDiscountRecommendation(
    category,
    originalPrice,
    expiryAt,
    quantityAvailable
  );

  const calculatedRescuePrice = calculateRescuePrice(originalPrice, discountPercent);
  const calculatedSavings = Math.max(0, originalPrice - calculatedRescuePrice);

  const handleApplyRecommendation = () => {
    setDiscountPercent(pricingRec.suggestedDiscountPercent);
  };

  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    setImageUrl(PRESET_IMAGES[newCat][0]);
  };

  const handleSubmit = async (publishStatus: 'active' | 'draft') => {
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter a product name.');
      return;
    }
    if (originalPrice <= 0) {
      setValidationError('Original price must be greater than €0.00');
      return;
    }
    if (discountPercent < 10 || discountPercent > 95) {
      setValidationError('Discount percentage must be between 10% and 95%');
      return;
    }
    if (quantityAvailable < 1) {
      setValidationError('Available stock quantity must be at least 1 unit.');
      return;
    }

    setSubmitting(true);
    try {
      await productService.createProduct({
        storeId: 'store_rewe_kleve',
        storeName: 'REWE Kleve (Demo Partner)',
        storeAddress: 'Große Straße 45',
        storeCity: 'Kleve',
        storeLat: 51.7885,
        storeLng: 6.1362,
        name,
        category,
        description,
        unit,
        originalPrice,
        discountPercent,
        rescuePrice: calculatedRescuePrice,
        quantityAvailable,
        expiryAt,
        imageUrl,
        pickupStartTime,
        pickupEndTime,
        status: publishStatus,
        estimatedWeightKg
      });

      navigate('/business/products');
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to save product. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
            Add Rescue Food Product
          </h1>
          <p className="text-xs text-stone-500">
            List an item nearing its sell-by date to attract local shoppers and reduce store shrink.
          </p>
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-8">
        {/* Section 1: Basic Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            1. Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Product Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Organic Whole Milk 1L, Artisan Sourdough Loaf..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              >
                <option value="Grocery">Grocery (Dairy, Produce, Pantry)</option>
                <option value="Bakery">Bakery & Bread</option>
                <option value="Drinks">Drinks & Juices</option>
                <option value="Cosmetics">Cosmetics & Personal Care</option>
                <option value="Flowers">Flowers & Plants</option>
                <option value="Household">Household Goods</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Unit / Packaging
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., 500g tub, 4-pack, 1 bunch"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Details about quality, storage temperature, or freshness..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Expiry & Inventory */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            2. Expiry & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Expiry Date & Time *
              </label>
              <input
                type="datetime-local"
                value={expiryAt}
                onChange={(e) => setExpiryAt(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Available Units in Stock *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Est. Weight per Unit (kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.05"
                max="50"
                value={estimatedWeightKg}
                onChange={(e) => setEstimatedWeightKg(parseFloat(e.target.value) || 0.5)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Pricing & Discount Recommendation */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              3. Pricing & Markdown Strategy
            </h3>

            {/* AI/Rule-based suggestion badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Recommended: -{pricingRec.suggestedDiscountPercent}%</span>
            </div>
          </div>

          {/* Pricing Recommendation Banner */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Tag className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">Pricing Recommendation Engine</span>
                <span className="text-stone-600 leading-snug">{pricingRec.reasoning}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyRecommendation}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shrink-0 self-start sm:self-auto transition-colors"
            >
              Apply {pricingRec.suggestedDiscountPercent}% OFF
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Original Retail Price (€) *
              </label>
              <input
                type="number"
                step="0.05"
                min="0.10"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-stone-700">
                  Discount Percentage *
                </label>
                <span className="text-xs font-black text-emerald-800">
                  -{discountPercent}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                className="w-full accent-emerald-800 cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Calculated Rescue Price Preview Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-3xs font-bold text-emerald-800 uppercase tracking-wider block">
                Calculated Consumer Rescue Price
              </span>
              <span className="text-2xl font-black text-emerald-950">
                {formatCurrency(calculatedRescuePrice)}
              </span>
              <span className="text-xs text-stone-500 line-through block mt-0.5">
                Was {formatCurrency(originalPrice)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-3xs font-bold text-emerald-800 uppercase tracking-wider block">
                Shopper Savings
              </span>
              <span className="text-lg font-bold text-emerald-700">
                {formatCurrency(calculatedSavings)} saved
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Image Presets */}
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            4. Product Photo
          </h3>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {(PRESET_IMAGES[category] || PRESET_IMAGES.Grocery).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImageUrl(img)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                  imageUrl === img ? 'border-emerald-800 ring-2 ring-emerald-800/30' : 'border-stone-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="preset" className="w-full h-full object-cover" />
                {imageUrl === img && (
                  <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-stone-500 block mb-1">Or paste custom image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={submitting}
            className="px-5 py-3 rounded-2xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-colors"
          >
            Save as Draft
          </button>

          <button
            type="button"
            id="btn-publish-product"
            onClick={() => handleSubmit('active')}
            disabled={submitting}
            className="px-7 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Publish Rescue Deal ({formatCurrency(calculatedRescuePrice)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
