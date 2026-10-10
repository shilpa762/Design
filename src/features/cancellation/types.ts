export type Flow = 'A' | 'B';

export type PauseMonths = 1 | 2 | 3;

export type ReasonId =
  | 'not_needed_now'
  | 'missing_features'
  | 'hard_to_use'
  | 'expensive'
  | 'found_alternative'
  | 'no_longer_need'
  | 'technical_issues'
  | 'not_used_enough'
  | 'other';

export interface SurveyAnswers {
  reason: ReasonId;
  /** 1 = not likely, 5 = very likely. Optional. */
  likelihoodToReturn: number | null;
  comments: string;
}

export interface OfferDetails {
  id: string;
  /** Headline, e.g. "[FIRST_OFFER]". */
  title: string;
  /** Exact new price, e.g. "$24.50/month". */
  price: string;
  /** Exact term, e.g. "for the next 3 months, then $49/month". */
  term: string;
}

export interface UsageCounts {
  surveys: number;
  responses: number;
  aiDataAnalysis: number;
  responseReports: number;
  analyticsReports: number;
  contactLists: number;
  emailCampaigns: number;
  textCampaigns: number;
}

export interface LowerPlan {
  id: string;
  name: string;
  price: string;
  /** Values for the compact comparison rows, keyed like COMPACT_COMPARISON_ROWS. */
  limits: Record<CompactRowId, string>;
}

export type CompactRowId = 'members' | 'responses' | 'campaigns' | 'branding' | 'ai';

/** Where the modal ended up when it closed. Only `cancelled` means the plan was cancelled. */
export type Outcome =
  | 'kept'
  | 'offer_claimed'
  | 'lifetime_claimed'
  | 'paused'
  | 'downgraded'
  | 'cancelled'
  | 'reactivated';
