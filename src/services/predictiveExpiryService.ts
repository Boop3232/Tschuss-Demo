import { ProductCategory } from '../types';

export interface PricingRecommendation {
  suggestedDiscountPercent: number;
  reasoning: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  minRecommendedDiscount: number;
  maxRecommendedDiscount: number;
}

export interface ExpiryRiskAssessment {
  riskScore: number; // 0 - 100
  estimatedHoursRemaining: number;
  sellThroughLikelihood: 'high' | 'moderate' | 'at_risk' | 'critical';
  suggestedAction: string;
}

/**
 * Service abstraction for predictive expiry & markdown pricing.
 * Current version uses rule-based velocity & shelf-life heuristics.
 * Designed with a clean interface for plug-and-play machine learning integration.
 */
export const pricingRecommendationService = {
  getDiscountRecommendation(
    category: ProductCategory,
    originalPrice: number,
    expiryDateString: string,
    quantityAvailable: number
  ): PricingRecommendation {
    const expiry = new Date(expiryDateString).getTime();
    const now = Date.now();
    const hoursLeft = Math.max(0, (expiry - now) / (1000 * 60 * 60));

    // Category sensitivity factor
    const isPerishableFood = category === 'Grocery' || category === 'Bakery' || category === 'Flowers';

    if (hoursLeft <= 14) {
      return {
        suggestedDiscountPercent: isPerishableFood ? 75 : 65,
        minRecommendedDiscount: 60,
        maxRecommendedDiscount: 85,
        urgencyLevel: 'critical',
        reasoning: 'Critical expiry window (<14 hours). Aggressive discount recommended to guarantee rescue before store close.'
      };
    } else if (hoursLeft <= 36) {
      return {
        suggestedDiscountPercent: isPerishableFood ? 60 : 50,
        minRecommendedDiscount: 45,
        maxRecommendedDiscount: 70,
        urgencyLevel: 'high',
        reasoning: 'Expires tomorrow. 50-60% discount drives optimal sell-through rate while preserving retailer margin.'
      };
    } else if (hoursLeft <= 72) {
      return {
        suggestedDiscountPercent: isPerishableFood ? 40 : 35,
        minRecommendedDiscount: 30,
        maxRecommendedDiscount: 50,
        urgencyLevel: 'medium',
        reasoning: 'Expires in 2-3 days. Standard discount level to build demand.'
      };
    } else {
      return {
        suggestedDiscountPercent: 25,
        minRecommendedDiscount: 20,
        maxRecommendedDiscount: 35,
        urgencyLevel: 'low',
        reasoning: 'Proactive early markdown. Attracts price-conscious consumers early.'
      };
    }
  }
};

export const expiryPredictionService = {
  assessExpiryRisk(
    expiryDateString: string,
    quantityAvailable: number
  ): ExpiryRiskAssessment {
    const expiry = new Date(expiryDateString).getTime();
    const now = Date.now();
    const hoursLeft = Math.max(0, (expiry - now) / (1000 * 60 * 60));

    let riskScore = 0;
    let sellThroughLikelihood: ExpiryRiskAssessment['sellThroughLikelihood'] = 'high';
    let suggestedAction = 'Maintain current pricing.';

    if (hoursLeft <= 0) {
      riskScore = 100;
      sellThroughLikelihood = 'critical';
      suggestedAction = 'Product has expired. Mark as expired or divert to food donation.';
    } else if (hoursLeft <= 16) {
      riskScore = 85;
      sellThroughLikelihood = quantityAvailable > 5 ? 'critical' : 'at_risk';
      suggestedAction = 'Apply deep markdown (70%+) or trigger instant notification to nearby shoppers.';
    } else if (hoursLeft <= 40) {
      riskScore = 55;
      sellThroughLikelihood = quantityAvailable > 10 ? 'at_risk' : 'moderate';
      suggestedAction = 'Ensure product is featured in daily deals.';
    } else {
      riskScore = 25;
      sellThroughLikelihood = 'high';
      suggestedAction = 'Monitor regular inventory velocity.';
    }

    return {
      riskScore,
      estimatedHoursRemaining: Math.round(hoursLeft),
      sellThroughLikelihood,
      suggestedAction
    };
  }
};
