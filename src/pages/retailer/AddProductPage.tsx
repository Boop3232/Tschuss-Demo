import React, { useState, useRef } from 'react';
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
  Loader2,
  Store as StoreIcon,
  Percent,
  Coins,
  TrendingUp,
  UploadCloud,
  Camera,
  X,
  FileImage,
  Check
} from 'lucide-react';
import { ProductCategory, Product, Store } from '../../types';
import { productService } from '../../services/productService';
import { pricingRecommendationService } from '../../services/predictiveExpiryService';
import { calculateRescuePrice, formatCurrency } from '../../utils/businessLogic';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { DEMO_STORES } from '../../services/seedDataService';

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

  const [selectedStoreId, setSelectedStoreId] = useState<string>('store_rewe_kleve');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Grocery');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('500g package');
  
  // Pricing state: Original Price, Selling Price, Discount Percent
  const [originalPrice, setOriginalPrice] = useState<number>(2.99);
  const [sellingPrice, setSellingPrice] = useState<number>(1.20);
  const [discountPercent, setDiscountPercent] = useState<number>(60);
  const [pricingMode, setPricingMode] = useState<'selling_price' | 'discount_percent'>('selling_price');

  const [quantityAvailable, setQuantityAvailable] = useState<number>(5);
  const [expiryAt, setExpiryAt] = useState<string>(defaultTomorrow);
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES.Grocery[0]);
  const [isCustomUpload, setIsCustomUpload] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [estimatedWeightKg, setEstimatedWeightKg] = useState<number>(0.5);
  const [pickupStartTime, setPickupStartTime] = useState('08:00');
  const [pickupEndTime, setPickupEndTime] = useState('21:00');

  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const processUploadedFile = (file: File) => {
    setPhotoError(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    // Check max size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image size is too large. Please upload an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setImageUrl(e.target.result);
        setIsCustomUpload(true);
        setUploadedFileName(file.name);
        const sizeKb = Math.round(file.size / 1024);
        setUploadedFileSize(sizeKb > 1000 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
      }
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleResetToPreset = (cat: ProductCategory) => {
    setIsCustomUpload(false);
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setPhotoError(null);
    setImageUrl(PRESET_IMAGES[cat][0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Dynamic pricing recommendation
  const pricingRec = pricingRecommendationService.getDiscountRecommendation(
    category,
    originalPrice,
    expiryAt,
    quantityAvailable
  );

  // Synchronize when Original Price changes
  const handleOriginalPriceChange = (val: number) => {
    const orig = Math.max(0, val);
    setOriginalPrice(orig);
    if (pricingMode === 'discount_percent') {
      const newSelling = Number((orig * (1 - discountPercent / 100)).toFixed(2));
      setSellingPrice(newSelling);
    } else {
      if (orig > 0 && sellingPrice > 0) {
        const calculatedDiscount = Math.round(((orig - sellingPrice) / orig) * 100);
        setDiscountPercent(Math.max(0, Math.min(99, calculatedDiscount)));
      }
    }
  };

  // Synchronize when Selling Price is directly typed
  const handleSellingPriceChange = (val: number) => {
    const sell = Math.max(0, val);
    setSellingPrice(sell);
    if (originalPrice > 0) {
      const calculatedDiscount = Math.round(((originalPrice - sell) / originalPrice) * 100);
      setDiscountPercent(Math.max(0, Math.min(99, calculatedDiscount)));
    }
  };

  // Synchronize when Discount Percent is adjusted
  const handleDiscountPercentChange = (val: number) => {
    const disc = Math.max(0, Math.min(99, val));
    setDiscountPercent(disc);
    if (originalPrice > 0) {
      const newSelling = Number((originalPrice * (1 - disc / 100)).toFixed(2));
      setSellingPrice(newSelling);
    }
  };

  const handleApplyRecommendation = () => {
    const recDiscount = pricingRec.suggestedDiscountPercent;
    handleDiscountPercentChange(recDiscount);
  };

  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    setImageUrl(PRESET_IMAGES[newCat][0]);
  };

  const currentStore = DEMO_STORES.find(s => s.id === selectedStoreId) || DEMO_STORES[0];
  const calculatedSavings = Math.max(0, originalPrice - sellingPrice);
  const batchRevenue = Number((sellingPrice * quantityAvailable).toFixed(2));
  const batchWeightKg = Number((estimatedWeightKg * quantityAvailable).toFixed(2));

  const handleSubmit = async (publishStatus: 'active' | 'draft') => {
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter a product title.');
      return;
    }
    if (originalPrice <= 0) {
      setValidationError('Original retail price must be greater than €0.00');
      return;
    }
    if (sellingPrice <= 0) {
      setValidationError('Selling price must be greater than €0.00');
      return;
    }
    if (sellingPrice > originalPrice) {
      setValidationError('Selling rescue price cannot exceed the original retail price.');
      return;
    }
    if (quantityAvailable < 1) {
      setValidationError('Available stock quantity must be at least 1 unit.');
      return;
    }

    setSubmitting(true);
    try {
      await productService.createProduct({
        storeId: currentStore.id,
        storeName: currentStore.name,
        storeAddress: currentStore.address,
        storeCity: currentStore.city,
        storeLat: currentStore.latitude,
        storeLng: currentStore.longitude,
        name,
        category,
        description,
        unit,
        originalPrice,
        discountPercent,
        rescuePrice: sellingPrice,
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
          type="button"
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
            List an item nearing its sell-by date to attract local shoppers, customize selling price & discount, and reduce store shrink.
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
        {/* Section 0: Store Branch Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-stone-700 block">
            Partner Store Location *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {DEMO_STORES.map((s) => (
              <button
                key={s.id}
                type="button"
                id={`btn-store-select-${s.id}`}
                onClick={() => setSelectedStoreId(s.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                  selectedStoreId === s.id
                    ? 'border-emerald-800 bg-emerald-50/50 ring-2 ring-emerald-800/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <StoreIcon className={`w-4 h-4 shrink-0 mt-0.5 ${
                  selectedStoreId === s.id ? 'text-emerald-800' : 'text-stone-400'
                }`} />
                <div className="min-w-0">
                  <span className="font-bold text-xs text-stone-900 block truncate">{s.name}</span>
                  <span className="text-3xs text-stone-500 block truncate">{s.address}, {s.city}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Basic Details */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
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
                id="input-product-name"
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
                id="select-category"
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
                id="input-unit"
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
                id="input-description"
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
                id="input-expiry-at"
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
                id="input-quantity-available"
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
                id="input-weight"
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

        {/* Section 3: Pricing Strategy (Custom Selling Price & Synchronized Discount System) */}
        <div className="pt-4 border-t border-stone-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                3. Pricing & Selling Price Customization
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Choose your selling price directly or adjust by discount percentage. Both remain automatically synchronized.
              </p>
            </div>

            {/* AI/Rule-based suggestion badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold shrink-0 self-start sm:self-auto">
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
              id="btn-apply-recommendation"
              onClick={handleApplyRecommendation}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shrink-0 self-start sm:self-auto transition-colors shadow-2xs"
            >
              Apply Recommended ({pricingRec.suggestedDiscountPercent}% OFF)
            </button>
          </div>

          {/* Pricing Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl max-w-md">
            <button
              type="button"
              id="btn-mode-selling-price"
              onClick={() => setPricingMode('selling_price')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                pricingMode === 'selling_price'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-emerald-800" />
              <span>Direct Selling Price (€)</span>
            </button>
            <button
              type="button"
              id="btn-mode-discount-percent"
              onClick={() => setPricingMode('discount_percent')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                pricingMode === 'discount_percent'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Percent className="w-3.5 h-3.5 text-emerald-800" />
              <span>Discount Slider (%)</span>
            </button>
          </div>

          {/* Pricing Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Original Retail Price */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Original Retail Price (€) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">€</span>
                <input
                  type="number"
                  id="input-original-price"
                  step="0.05"
                  min="0.10"
                  value={originalPrice || ''}
                  onChange={(e) => handleOriginalPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                  required
                />
              </div>
              <span className="text-3xs text-stone-400 mt-1 block">Full shelf value before discount</span>
            </div>

            {/* 2. Custom Selling Price Input */}
            <div className={pricingMode === 'selling_price' ? 'ring-2 ring-emerald-800/30 rounded-2xl p-1 bg-emerald-50/20' : ''}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-emerald-950 block">
                  Your Selling Price (€) *
                </label>
                <span className="text-3xs font-bold text-emerald-800 uppercase px-1.5 py-0.5 rounded-md bg-emerald-100">
                  Direct Edit
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-800 font-bold text-xs">€</span>
                <input
                  type="number"
                  id="input-selling-price"
                  step="0.05"
                  min="0.05"
                  max={originalPrice > 0 ? originalPrice : undefined}
                  value={sellingPrice || ''}
                  onChange={(e) => handleSellingPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 bg-white border-2 border-emerald-800/60 rounded-xl text-xs sm:text-sm font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-800 shadow-2xs"
                  required
                />
              </div>
              <span className="text-3xs text-emerald-700 font-semibold mt-1 block">
                Shoppers pay this price
              </span>
            </div>

            {/* 3. Discount Percentage Input */}
            <div className={pricingMode === 'discount_percent' ? 'ring-2 ring-emerald-800/30 rounded-2xl p-1 bg-emerald-50/20' : ''}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-stone-700">
                  Discount Percentage
                </label>
                <span className="text-xs font-black text-emerald-800">
                  -{discountPercent}%
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="input-discount-percent"
                  min="0"
                  max="95"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => handleDiscountPercentChange(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">%</span>
              </div>
              <span className="text-3xs text-stone-400 mt-1 block">Markdown off original price</span>
            </div>
          </div>

          {/* Quick Discount Percent Presets & Range Slider */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-2xs font-bold text-stone-700 uppercase tracking-wider">
                Quick Discount Presets:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[30, 40, 50, 60, 70, 80].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    id={`btn-preset-discount-${pct}`}
                    onClick={() => handleDiscountPercentChange(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                      discountPercent === pct
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    -{pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <input
                type="range"
                id="range-discount-percent"
                min="10"
                max="90"
                step="5"
                value={discountPercent}
                onChange={(e) => handleDiscountPercentChange(parseInt(e.target.value))}
                className="w-full accent-emerald-800 cursor-pointer"
              />
              <div className="flex justify-between text-3xs text-stone-400 font-semibold mt-1">
                <span>10% (Minor markdown)</span>
                <span>50% (Standard rescue)</span>
                <span>90% (Urgent clearance)</span>
              </div>
            </div>
          </div>

          {/* Pricing Calculation Summary & Revenue Projection Card */}
          <div className="p-5 rounded-2xl bg-emerald-950 text-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-4">
              <div>
                <span className="text-3xs font-bold text-emerald-300 uppercase tracking-wider block">
                  Final Consumer Rescue Deal
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black font-display text-white">
                    {formatCurrency(sellingPrice)}
                  </span>
                  <span className="text-xs text-emerald-300/80 line-through">
                    Was {formatCurrency(originalPrice)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-emerald-200 text-xs font-bold">
                    -{discountPercent}%
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xs font-bold text-emerald-300 uppercase tracking-wider block">
                  Shopper Benefit
                </span>
                <span className="text-base font-bold text-emerald-200">
                  {formatCurrency(calculatedSavings)} saved per unit
                </span>
              </div>
            </div>

            {/* Batch projection */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-800/50">
                <span className="text-3xs text-emerald-300 uppercase font-bold block">Batch Quantity</span>
                <span className="font-bold text-white text-sm">{quantityAvailable} units</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-800/50">
                <span className="text-3xs text-emerald-300 uppercase font-bold block">Recovered Revenue</span>
                <span className="font-bold text-emerald-300 text-sm">{formatCurrency(batchRevenue)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-800/50 col-span-2 sm:col-span-1">
                <span className="text-3xs text-emerald-300 uppercase font-bold block">Food Diverted</span>
                <span className="font-bold text-white text-sm">~{batchWeightKg} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Product Photo & Custom Upload */}
        <div className="pt-4 border-t border-stone-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              4. Product Photo & Visuals
            </h3>
            <span className="text-3xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              Upload custom photo or select stock preset
            </span>
          </div>

          {/* Photo Error Banner if any */}
          {photoError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{photoError}</span>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            id="file-input-product-photo"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Dual Column Photo Section: Upload Zone / Preview + Stock Presets */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Left: Drag & Drop / Direct Upload Box */}
            <div className="md:col-span-7 space-y-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[170px] ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50/80 scale-[1.01]'
                    : isCustomUpload
                    ? 'border-emerald-700/60 bg-emerald-50/30 hover:bg-emerald-50/50'
                    : 'border-stone-200 hover:border-emerald-600/70 bg-stone-50/70 hover:bg-stone-50'
                }`}
              >
                {imageUrl && isCustomUpload ? (
                  <div className="flex items-center gap-4 w-full text-left">
                    <img
                      src={imageUrl}
                      alt="Uploaded preview"
                      className="w-20 h-20 rounded-xl object-cover border border-emerald-200 shadow-2xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full mb-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        Custom Photo Uploaded
                      </div>
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {uploadedFileName || 'Custom Store Image'}
                      </p>
                      {uploadedFileSize && (
                        <p className="text-3xs text-stone-500 font-medium mt-0.5">
                          Size: {uploadedFileSize}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="text-3xs font-bold text-emerald-800 hover:underline bg-white px-2 py-1 rounded-lg border border-stone-200 shadow-2xs"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetToPreset(category);
                          }}
                          className="text-3xs font-bold text-rose-700 hover:underline bg-white px-2 py-1 rounded-lg border border-stone-200 shadow-2xs"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 shadow-2xs">
                      <UploadCloud className="w-6 h-6 text-emerald-700" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                      Upload Your Product Photo
                    </h4>
                    <p className="text-3xs sm:text-2xs text-stone-500 mt-1 max-w-xs">
                      Drag & drop a photo here, or <span className="text-emerald-800 font-bold underline">browse files</span> from your phone or desktop.
                    </p>
                    <span className="text-3xs text-stone-400 mt-2">
                      Supports JPG, PNG, WEBP (up to 5MB)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right: Active Preview & Custom URL */}
            <div className="md:col-span-5 space-y-3 flex flex-col justify-between">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-200">
                  <img
                    src={imageUrl}
                    alt="Active selection"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-3xs font-bold text-stone-400 uppercase tracking-wider block">
                    Current Listing Photo
                  </span>
                  <span className="text-xs font-bold text-stone-800 block truncate mt-0.5">
                    {isCustomUpload ? (uploadedFileName || 'Uploaded image') : `${category} preset photo`}
                  </span>
                  <span className="text-3xs text-emerald-700 font-semibold block mt-0.5">
                    Ready to display in store catalogue
                  </span>
                </div>
              </div>

              <div>
                <label className="text-3xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Or Paste External Image URL:
                </label>
                <input
                  type="url"
                  id="input-image-url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setIsCustomUpload(false);
                    setUploadedFileName('External Image URL');
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
            </div>
          </div>

          {/* Stock Presets Gallery */}
          <div className="pt-2">
            <span className="text-3xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Quick stock photos for {category}:
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
              {(PRESET_IMAGES[category] || PRESET_IMAGES.Grocery).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  id={`btn-preset-image-${i}`}
                  onClick={() => {
                    setImageUrl(img);
                    setIsCustomUpload(false);
                    setUploadedFileName(null);
                    setUploadedFileSize(null);
                  }}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    imageUrl === img && !isCustomUpload
                      ? 'border-emerald-800 ring-2 ring-emerald-800/40 shadow-xs scale-105'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="preset" className="w-full h-full object-cover" />
                  {imageUrl === img && !isCustomUpload && (
                    <div className="absolute inset-0 bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            type="button"
            id="btn-save-draft"
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
                <span>Publish Rescue Deal ({formatCurrency(sellingPrice)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

