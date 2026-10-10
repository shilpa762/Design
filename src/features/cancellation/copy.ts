/**
 * All user-facing copy for the cancellation flow.
 * Values in [BRACKETS] are placeholders to be filled by billing data / product.
 */
import type { CompactRowId, ReasonId } from './types';

export const PLACEHOLDERS = {
  FIRST_OFFER: '[FIRST_OFFER]',
  FIRST_OFFER_PRICE: '[FIRST_OFFER_PRICE]',
  FIRST_OFFER_TERM: '[FIRST_OFFER_TERM]',
  LIFETIME_OFFER: '[LIFETIME_OFFER]',
  LIFETIME_OFFER_PRICE: '[LIFETIME_OFFER_PRICE]',
  LIFETIME_OFFER_TERM: '[LIFETIME_OFFER_TERM]',
  PLAN_END_DATE: '[PLAN_END_DATE]',
  DELETION_DATE: '[DELETION_DATE]',
} as const;

/** Shared CTA labels. Keep these identical everywhere. */
export const CTA = {
  keep: 'Keep my Team Plan',
  continueCancellation: 'Continue cancellation',
  claimOffer: 'Claim offer',
  claimLifetimeOffer: 'Claim lifetime offer',
  continue: 'Continue',
  confirmPause: 'Confirm pause',
  confirmDowngrade: (plan: string) => `Switch to ${plan}`,
  done: 'Done',
  reactivate: 'Reactivate plan',
  exportData: 'Export my data',
  pause: 'Pause subscription',
  lowerPlans: 'Explore lower plans',
} as const;

export const SHELL = {
  headerTitle: 'Billing',
  back: 'Back',
  close: 'Close and keep my plan',
  dialogLabel: 'Cancel Team Plan',
  step: (n: number, total: number) => `Step ${n} of ${total}`,
  working: 'Working…',
  error: 'Something went wrong. Your plan has not changed. Please try again.',
} as const;

export const COMPARISON_STEP = {
  title: 'Are you sure you want to cancel?',
  bodyLead: 'Cancelling moves your account from the ',
  bodyBold: 'Team Plan to the Free Plan.',
  bodyDeleteLead: 'Your account and all survey data are ',
  bodyDeleteBold: 'permanently deleted',
  bodyDeleteTail: (date: string) => ` on ${date}.`,
  daysLeft: (days: number) => ({
    lead: 'You still have ',
    bold: `${days} ${days === 1 ? 'day' : 'days'}`,
    tail: ' left on your current subscription.',
  }),
} as const;

/** "What You Lose" card (Figma 1:254). Rows must match the design exactly. */
export const PLAN_COMPARISON = {
  title: 'What You Lose',
  teamPlan: 'Team Plan',
  freePlan: 'Free Plan',
  included: 'Included',
  notIncluded: 'Not included',
  rows: [
    { label: 'Team Members', team: '3-20', free: '1' },
    { label: 'Responses per year', team: '60,000', free: '10' },
    { label: 'Language Translation', team: true, free: false },
    { label: 'GDPR, HIPAA Compliance', team: true, free: false },
    { label: 'Run Email and Text Campaigns', team: true, free: false },
    { label: '10+ Integrations', team: true, free: false },
    { label: 'Custom Branding for Surveys', team: true, free: false },
    { label: 'Custom Domains', team: '3', free: '0' },
    { label: 'AI Functionalities - Follow up Questions, Analysis', team: true, free: false },
  ] as ReadonlyArray<{ label: string; team: string | boolean; free: string | boolean }>,
} as const;

export const OFFER_STEP = {
  title: 'Stay for less',
  subtitle: "Before you go, here's a better price.",
  eyebrow: 'Your offer',
  usageTitle: "What your team has built",
  usageNote: (date: string) => `All of this is permanently deleted on ${date} if you cancel.`,
} as const;

export const USAGE_LABELS = {
  surveys: 'Surveys created',
  responses: 'Responses collected',
  aiDataAnalysis: 'AI data analyses generated',
  responseReports: 'Response reports generated',
  analyticsReports: 'Analytics reports generated',
  contactLists: 'Contact lists',
  emailCampaigns: 'Email campaigns',
  textCampaigns: 'Text campaigns',
} as const;

export const ALTERNATIVES_STEP = {
  title: 'Need a break instead?',
  subtitle: "You don't have to cancel to save.",
} as const;

export const OPTION_CARDS = {
  pause: {
    title: 'Pause subscription',
    description: 'Take 1, 2 or 3 months off. No charges. Your data stays put.',
  },
  lowerPlans: {
    title: 'Explore lower plans',
    description: 'Keep the essentials for less.',
  },
} as const;

export const SURVEY_STEP = {
  title: 'Why are you leaving?',
  subtitle: 'Takes 10 seconds. Helps us get better.',
  reasonQuestion: '1. Why are you cancelling?',
  reasonRequired: 'Required',
  reasonError: 'Pick a reason to continue.',
  likelihoodQuestion: '2. How likely are you to come back?',
  likelihoodMin: 'Not likely',
  likelihoodMax: 'Very likely',
  commentsQuestion: '3. Anything else? (optional)',
  commentsPlaceholder: 'Type your answer here…',
  reasons: [
    { id: 'not_needed_now', label: "I don't need it at the moment" },
    { id: 'missing_features', label: "It doesn't meet my needs (missing features)" },
    { id: 'hard_to_use', label: "I didn't find it easy to use" },
    { id: 'expensive', label: 'It was too expensive' },
    { id: 'found_alternative', label: 'I found an alternative' },
    { id: 'no_longer_need', label: 'I no longer need it' },
    { id: 'technical_issues', label: 'Too many technical issues (bugs, glitches)' },
    { id: 'not_used_enough', label: "I didn't use it enough" },
    { id: 'other', label: 'Other' },
  ] as ReadonlyArray<{ id: ReasonId; label: string }>,
} as const;

export const LIFETIME_STEP = {
  title: 'One last offer',
  subtitle: 'Lock in this price for as long as you stay.',
  eyebrow: 'Lifetime offer',
  alternativesTitle: 'Or try something lighter',
} as const;

export const PAUSE_STEP = {
  title: 'Pause your subscription',
  subtitle: 'No charges while paused. Your surveys and data stay safe.',
  durationLegend: 'How long?',
  months: (n: number) => `${n} ${n === 1 ? 'month' : 'months'}`,
  resumesOn: (date: string) => `Billing resumes on ${date}`,
  successTitle: 'Subscription paused',
  successBody: (date: string) => `Billing resumes on ${date}. Your surveys and data stay safe until then.`,
} as const;

export const LOWER_PLANS_STEP = {
  title: 'Pick a lower plan',
  subtitle: 'Keep your account and pay less.',
  planLegend: 'Plans',
  compareTitle: (plan: string) => `Team vs ${plan}`,
  successTitle: (plan: string) => `You're moving to ${plan}`,
  successBody: (plan: string, price: string, date: string) =>
    `${plan} starts on ${date} at ${price}. Your Team Plan stays active until then.`,
} as const;

export const COMPACT_COMPARISON_ROWS: ReadonlyArray<{ id: CompactRowId; label: string; team: string }> = [
  { id: 'members', label: 'Team Members', team: '3-20' },
  { id: 'responses', label: 'Responses per year', team: '60,000' },
  { id: 'campaigns', label: 'Email and Text Campaigns', team: 'Included' },
  { id: 'branding', label: 'Custom Branding', team: 'Included' },
  { id: 'ai', label: 'AI Functionalities', team: 'Included' },
];

export const OFFER_APPLIED = {
  title: 'Offer applied',
  priceLine: (price: string, term: string) => `You now pay ${price} ${term}.`,
  body: 'Your Team Plan stays active. Nothing else changes.',
  emailNote: "We've emailed you a receipt.",
} as const;

export const CANCELLED_STEP = {
  title: 'Your Team Plan is cancelled',
  accessUntil: (date: string) => `You keep full Team Plan access until ${date}.`,
  nextTitle: 'What happens next',
  next: (endDate: string, deletionDate: string) => [
    { date: endDate, text: 'Your account moves to the Free Plan. Team features pause.' },
    { date: deletionDate, text: 'Your account and all survey data are permanently deleted.' },
  ],
  exportHint: (deletionDate: string) => `Export your data before ${deletionDate}.`,
  reactivateHint: 'Changed your mind? Reactivate any time before your plan ends.',
  emailNote: "We've emailed you a confirmation.",
} as const;

export const REACTIVATED_STEP = {
  title: 'Welcome back',
  body: 'Your Team Plan is active again. Nothing was lost.',
} as const;
