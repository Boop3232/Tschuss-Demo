import React from 'react';

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-3 border border-stone-200/70 animate-pulse flex flex-col space-y-3 shadow-2xs">
    <div className="w-full aspect-4/3 bg-stone-200 rounded-xl" />
    <div className="space-y-2">
      <div className="h-4 bg-stone-200 rounded-md w-3/4" />
      <div className="h-3 bg-stone-200 rounded-md w-1/2" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-6 bg-stone-200 rounded-md w-20" />
      <div className="h-8 bg-stone-200 rounded-lg w-24" />
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full bg-white rounded-2xl border border-stone-200/80 p-4 space-y-4 animate-pulse">
    <div className="h-6 bg-stone-200 rounded-md w-48 mb-4" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center border-b border-stone-100 pb-3">
        <div className="w-12 h-12 bg-stone-200 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 rounded w-1/3" />
          <div className="h-3 bg-stone-200 rounded w-1/4" />
        </div>
        <div className="h-4 bg-stone-200 rounded w-16" />
        <div className="h-8 bg-stone-200 rounded-lg w-20" />
      </div>
    ))}
  </div>
);
