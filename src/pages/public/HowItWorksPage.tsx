import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Info
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the difference between Best-Before (MHD) and Use-By (Verbrauchsdatum)?',
      a: 'In Germany and the EU, the Best-Before Date (Mindesthaltbarkeitsdatum or MHD) is a quality indicator, not an expiry deadline. Products past or near their MHD remain completely safe and nutritious to eat. Conversely, products with a strict Use-By date (Verbrauchsdatum), such as raw poultry or minced meat, are strictly monitored and must not be sold after that date.'
    },
    {
      q: 'Do I pay online when reserving products on Tschüss?',
      a: 'No! Reservations on Tschüss are completely free. You reserve your item online to secure stock, and you pay directly at the store cash register using your regular payment methods (cash, EC-card, credit card).'
    },
    {
      q: 'What if I cannot make it to pick up my reservation?',
      a: 'We ask consumers to click "Cancel Reservation" as soon as possible in the app. This instantly releases the item back onto the live marketplace so someone else can rescue it before the store closes.'
    },
    {
      q: 'How does Tschüss calculate the CO2e avoided?',
      a: 'We adhere to the internationally recognized benchmark from the UN Food and Agriculture Organization (FAO) and UNEP, which estimates that diverting 1 kg of retail food waste avoids approximately 2.5 kg of CO2 equivalent emissions. This metric is a transparent estimate and not a certified carbon credit.'
    },
    {
      q: 'How can our supermarket or bakery join Tschüss?',
      a: 'Retail partners can register via the "For Business" page. Onboarding takes less than 15 minutes, after which your store staff can begin listing surplus inventory using our rapid listing tool.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider">
          Transparency & Guidance
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-display tracking-tight">
          How Tschüss Works
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Everything you need to know about near-expiry grocery rescue, food safety standards, and store pickup.
        </p>
      </div>

      {/* Safety & Standards Callout */}
      <div className="bg-emerald-50/80 rounded-3xl border border-emerald-200/80 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-800 shrink-0" />
          <h2 className="text-lg font-black text-stone-900 font-display">
            Food Safety & Legal Framework in Germany
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          Supermarkets and retailers in Germany comply with §11 of the German Food and Feed Code (LFGB) and EU Regulation 1169/2011. Products approaching or having reached their Mindesthaltbarkeitsdatum (MHD) are thoroughly inspected by store professionals to ensure package integrity, hygiene, and full consumable quality before being discounted.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-200">
            <span className="font-bold text-emerald-950 block mb-1">MHD (Best-Before Date)</span>
            <span className="text-stone-600 leading-snug">
              Guarantees specific sensory qualities (taste, aroma). Completely safe to consume for weeks or months after if properly stored.
            </span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-emerald-200">
            <span className="font-bold text-stone-950 block mb-1">Verbrauchsdatum (Use-By)</span>
            <span className="text-stone-600 leading-snug">
              Strict microbiological deadline for highly perishable raw animal products. Tschüss partners do not sell items exceeding this date.
            </span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-stone-900 font-display">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
              >
                <span className="font-bold text-xs sm:text-sm text-stone-900">{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action CTA in Soft Pastel */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-amber-50/40 border border-emerald-200/70 text-stone-900 text-center space-y-4 shadow-2xs">
        <h3 className="text-xl sm:text-2xl font-black font-display text-stone-900">Ready to rescue food today?</h3>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          Explore discounted fresh goods, groceries, and bakery items available right now in Kleve.
        </p>
        <Link
          to="/app/discover"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm hover:shadow-emerald-200/70 active:scale-95"
        >
          <span>Browse Active Deals</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
