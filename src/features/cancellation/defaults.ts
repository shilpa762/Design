import { PLACEHOLDERS } from './copy';
import type { LowerPlan, OfferDetails, UsageCounts } from './types';

/** Fallback data used until the billing API supplies real values. */
export const DEFAULT_FIRST_OFFER: OfferDetails = {
  id: 'first_offer',
  title: PLACEHOLDERS.FIRST_OFFER,
  price: PLACEHOLDERS.FIRST_OFFER_PRICE,
  term: PLACEHOLDERS.FIRST_OFFER_TERM,
};

export const DEFAULT_LIFETIME_OFFER: OfferDetails = {
  id: 'lifetime_offer',
  title: PLACEHOLDERS.LIFETIME_OFFER,
  price: PLACEHOLDERS.LIFETIME_OFFER_PRICE,
  term: PLACEHOLDERS.LIFETIME_OFFER_TERM,
};

/** Usage counts from the current "You will lose" screen. Replace with per-org data. */
export const DEFAULT_USAGE: UsageCounts = {
  surveys: 16,
  responses: 465,
  aiDataAnalysis: 12,
  responseReports: 14,
  analyticsReports: 25,
  contactLists: 8,
  emailCampaigns: 4,
  textCampaigns: 2,
};

/** Plans below Team. Free is omitted: moving to Free is what cancelling does. */
export const DEFAULT_LOWER_PLANS: LowerPlan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: '[STANDARD_PRICE]',
    limits: {
      members: '[STANDARD_MEMBERS]',
      responses: '[STANDARD_RESPONSES]',
      campaigns: '[STANDARD_CAMPAIGNS]',
      branding: '[STANDARD_BRANDING]',
      ai: '[STANDARD_AI]',
    },
  },
];
