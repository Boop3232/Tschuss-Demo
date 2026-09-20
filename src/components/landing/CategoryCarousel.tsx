import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowUpRight 
} from 'lucide-react';

import lavaCakeImg from '../../assets/images/category_desserts_lavacake_1789648743693.jpg';
import crispySnacksImg from '../../assets/images/category_crispy_snacks_1789648761497.jpg';
import bakeryPastryImg from '../../assets/images/category_bakery_pastry_1789648774969.jpg';
import freshProduceImg from '../../assets/images/category_fresh_produce_1789648794857.jpg';
import freshGroceriesImg from '../../assets/images/fresh_groceries_basket_1789648225376.jpg';
import preparedMealsImg from '../../assets/images/supermarket_fresh_counter_1789648365532.jpg';

export interface CategoryCardData {
  id: string;
  categoryParam: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  discount: string;
  image: string;
  itemCount: string;
}

export const CATEGORY_ITEMS: CategoryCardData[] = [
  {
    id: 'desserts',
    categoryParam: 'Grocery',
    title: 'Gourmet Desserts & Sweets',
    subtitle: 'Warm chocolate lava cakes, artisan tarts & pastries',
    badge: 'Sweet Treats',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    discount: 'Up to -70%',
    image: lavaCakeImg,
    itemCount: '18+ deals'
  },
  {
    id: 'snacks',
    categoryParam: 'Grocery',
    title: 'Crispy Snacks & Delis',
    subtitle: 'Golden finger bites, tapas, dips & savory appetizers',
    badge: 'Quick Bites',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    discount: 'Up to -60%',
    image: crispySnacksImg,
    itemCount: '24+ deals'
  },
  {
    id: 'bakery',
    categoryParam: 'Bakery',
    title: 'Artisan Bakery & Boulangerie',
    subtitle: 'French butter croissants, sourdough loaves & pretzels',
    badge: 'Artisan Oven',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    discount: 'Up to -65%',
    image: bakeryPastryImg,
    itemCount: '32+ deals'
  },
  {
    id: 'produce',
    categoryParam: 'Grocery',
    title: 'Organic Produce & Greens',
    subtitle: 'Sun-ripened berries, avocados, leafy greens & citrus',
    badge: 'Farm Harvest',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    discount: 'Up to -55%',
    image: freshProduceImg,
    itemCount: '40+ deals'
  },
  {
    id: 'meals',
    categoryParam: 'Grocery',
    title: 'Chef Bowls & Prepared Dishes',
    subtitle: 'Ready-to-eat dinner bowls, wraps, sushi & gourmet salads',
    badge: 'Ready to Eat',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    discount: 'Up to -70%',
    image: preparedMealsImg,
    itemCount: '15+ deals'
  },
  {
    id: 'pantry',
    categoryParam: 'Grocery',
    title: 'Supermarket Dairy & Pantry',
    subtitle: 'Gourmet cheeses, yogurts, organic milk & dry essentials',
    badge: 'Pantry Deals',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    discount: 'Up to -50%',
    image: freshGroceriesImg,
    itemCount: '28+ deals'
  }
];

export const CategoryCarousel: React.FC = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // Pause RAF when out of viewport to save battery/CPU on mobile
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(entries[0]?.isIntersecting ?? true);
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll loop using requestAnimationFrame with touch-pause and view-detection
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const speed = 0.65; // pixels per frame

    const step = () => {
      if (!isHovered && !isTouching && isInView && container) {
        container.scrollLeft += speed;

        // Infinite loop wrap-around: when reaching half, reset smoothly
        const maxScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, isTouching, isInView]);

  const handleCardClick = (categoryParam: string) => {
    navigate(`/app/discover?category=${encodeURIComponent(categoryParam)}`);
  };

  // Duplicate items twice to ensure seamless infinite looping without gaps
  const displayItems = [...CATEGORY_ITEMS, ...CATEGORY_ITEMS];

  return (
    <section className="relative overflow-hidden py-8 sm:py-10 bg-white">
      {/* Top Text Header directly inspired by image 2 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-2xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Category Variety Explorer</span>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-stone-700 leading-relaxed font-normal">
            <strong className="text-stone-900 font-bold">Discover our variety:</strong> Choose your favorite surplus categories directly from the rescue menu and fill your kitchen with artisan bakery, crispy snacks, gourmet desserts, and organic produce at up to 70% off.
          </p>
        </div>
      </div>

      {/* Carousel Container with Edge Fades */}
      <div 
        className="relative w-full overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsTouching(true)}
        onTouchEnd={() => setIsTouching(false)}
      >
        {/* Left subtle fade mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />

        {/* Right subtle fade mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

        {/* Scrollable track */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-4 sm:px-12 select-none cursor-grab active:cursor-grabbing -webkit-overflow-scrolling-touch"
          style={{ scrollBehavior: 'auto' }}
        >
          {displayItems.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}`}
              onClick={() => handleCardClick(item.categoryParam)}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group/card relative shrink-0 w-[72vw] max-w-[280px] xs:w-72 sm:w-88 md:w-[26rem] aspect-16/10 rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer bg-stone-100 hardware-accelerated"
            >
              {/* Card Image */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlays for readable text and badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20 pointer-events-none" />

              {/* Top Row Badges */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                <span className={`px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs border ${item.badgeColor}`}>
                  {item.badge}
                </span>

                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-stone-950 shadow-xs">
                  {item.discount}
                </span>
              </div>

              {/* Bottom Information */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white flex items-end justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black font-display tracking-tight text-white group-hover/card:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-200 line-clamp-1 font-normal">
                    {item.subtitle}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md group-hover/card:bg-emerald-600 text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
