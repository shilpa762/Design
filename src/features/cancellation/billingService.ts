import type { PauseMonths, SurveyAnswers } from './types';

/**
 * Billing API for the cancellation flow. Every call is a stub.
 * Each must reject on failure so the modal can show an error and leave the plan unchanged.
 */

const stub = () => Promise.resolve();

export const billingService = {
  /** TODO: POST /billing/offers/:offerId/claim. Applies the first retention offer. */
  claimOffer(_offerId: string): Promise<void> {
    return stub();
  },

  /** TODO: POST /billing/offers/:offerId/claim. Applies the lifetime offer. */
  claimLifetimeOffer(_offerId: string): Promise<void> {
    return stub();
  },

  /** TODO: POST /billing/subscription/pause { months }. */
  pauseSubscription(_months: PauseMonths): Promise<void> {
    return stub();
  },

  /** TODO: POST /billing/subscription/plan { planId }. Takes effect at period end. */
  downgradePlan(_planId: string): Promise<void> {
    return stub();
  },

  /** TODO: POST /billing/subscription/cancel { survey }. Cancels at period end and stores the churn survey. */
  cancelSubscription(_survey: SurveyAnswers | null): Promise<void> {
    return stub();
  },

  /** TODO: POST /billing/subscription/reactivate. Undoes a pending cancellation. */
  reactivate(): Promise<void> {
    return stub();
  },

  /** TODO: Start the data export job, or navigate to Settings > Export. */
  exportData(): Promise<void> {
    return stub();
  },
};

export type BillingService = typeof billingService;
