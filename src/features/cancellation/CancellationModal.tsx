import { useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { ctaClicked, defaultTrack, stepViewed, type AnalyticsProps, type TrackFn } from './analytics';
import { billingService as defaultService, type BillingService } from './billingService';
import {
  cancelReducer,
  initialState,
  stepNumber,
  TOTAL_STEPS,
  type CancelEvent,
  type CancelState,
} from './cancelMachine';
import { CancelledStep } from './components/CancelledStep';
import { ChurnSurvey } from './components/ChurnSurvey';
import { AlternativesStep, ComparisonStep, LifetimeStep, OfferStep, ResultStep } from './components/FlowSteps';
import { LowerPlansStep } from './components/LowerPlansStep';
import { PauseStep } from './components/PauseStep';
import { BackIcon, CloseIcon, FlowUiContext } from './components/ui';
import {
  CTA,
  LOWER_PLANS_STEP,
  OFFER_APPLIED,
  PAUSE_STEP,
  PLACEHOLDERS,
  REACTIVATED_STEP,
  SHELL,
} from './copy';
import { addMonths, formatDate } from './dates';
import { DEFAULT_FIRST_OFFER, DEFAULT_LIFETIME_OFFER, DEFAULT_LOWER_PLANS, DEFAULT_USAGE } from './defaults';
import type { LowerPlan, OfferDetails, Outcome, UsageCounts } from './types';
import { useFocusTrap } from './useFocusTrap';
import './cancellation.css';

export interface CancellationModalProps {
  open: boolean;
  /** true selects Flow B (first offer already claimed), false selects Flow A. */
  firstOfferClaimed: boolean;
  /** Called once when the modal closes. Only `cancelled` means the plan was cancelled. */
  onClose: (outcome: Outcome) => void;
  daysLeft?: number;
  planEndDate?: Date | string;
  deletionDate?: Date | string;
  usage?: UsageCounts;
  firstOffer?: OfferDetails;
  lifetimeOffer?: OfferDetails;
  lowerPlans?: LowerPlan[];
  /** Optional art for the tinted right-hand panel. */
  illustration?: ReactNode;
  /** Injectable for tests. */
  today?: Date;
  service?: BillingService;
  track?: TrackFn;
}

export function CancellationModal(props: CancellationModalProps) {
  if (!props.open) return null;
  // Mount fresh on every open so the flow always starts at step 1.
  return <CancellationDialog {...props} />;
}

function CancellationDialog({
  firstOfferClaimed,
  onClose,
  daysLeft = 11,
  planEndDate = PLACEHOLDERS.PLAN_END_DATE,
  deletionDate = PLACEHOLDERS.DELETION_DATE,
  usage = DEFAULT_USAGE,
  firstOffer = DEFAULT_FIRST_OFFER,
  lifetimeOffer = DEFAULT_LIFETIME_OFFER,
  lowerPlans = DEFAULT_LOWER_PLANS,
  illustration,
  today,
  service = defaultService,
  track = defaultTrack,
}: CancellationModalProps) {
  const [state, dispatch] = useReducer(cancelReducer, firstOfferClaimed, initialState);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<CancelState>(state);
  stateRef.current = state;

  const step = stepNumber(state);
  const endDate = formatDate(planEndDate);
  const deleteDate = formatDate(deletionDate);
  const now = today ?? new Date();

  const cta = useCallback(
    (name: string, extra?: AnalyticsProps) =>
      ctaClicked(track, stateRef.current.flow, stateRef.current.screen, name, extra),
    [track],
  );

  const send = useCallback((event: CancelEvent) => {
    setError(null);
    dispatch(event);
  }, []);

  /** Runs an API call; the success event is only dispatched if it resolves. */
  const run = useCallback(async (call: () => Promise<void>, onSuccess?: CancelEvent) => {
    setBusy(true);
    setError(null);
    try {
      await call();
      if (onSuccess) dispatch(onSuccess);
    } catch {
      setError(SHELL.error);
    } finally {
      setBusy(false);
    }
  }, []);

  const requestClose = useCallback(() => {
    cta('close');
    send({ type: 'CLOSE' });
  }, [cta, send]);

  // Escape + focus trap. Escape never cancels: it maps to CLOSE.
  useFocusTrap(dialogRef, true, requestClose);

  // Analytics + focus the heading on every screen change.
  useEffect(() => {
    if (state.screen === 'closed') return;
    stepViewed(track, state.flow, state.screen, stepNumber(state));
    dialogRef.current?.querySelector<HTMLElement>('#cf-title')?.focus();
  }, [state.screen]);

  useEffect(() => {
    if (state.screen === 'closed' && state.outcome) onClose(state.outcome);
  }, [state.screen, state.outcome, onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (state.screen === 'closed') return null;

  const onKeep = () => (cta(CTA.keep), send({ type: 'KEEP' }));
  const onContinue = () => (cta(CTA.continueCancellation), send({ type: 'CONTINUE' }));
  const onPause = () => (cta(CTA.pause), send({ type: 'OPEN_PAUSE' }));
  const onLowerPlans = () => (cta(CTA.lowerPlans), send({ type: 'OPEN_LOWER_PLANS' }));
  const onBackToFlow = () => (cta(CTA.continueCancellation), send({ type: 'BACK' }));
  const onDone = () => (cta(CTA.done), send({ type: 'DONE' }));

  // Indicator on steps 1-4 only; step 5 (cancelled) is the end state.
  const showStepIndicator = step !== null && step < TOTAL_STEPS;
  const showBack =
    (step !== null && state.screen !== 'cancelled') || state.screen === 'pause' || state.screen === 'lowerPlans';

  const appliedOffer = state.appliedOffer === 'lifetime' ? lifetimeOffer : firstOffer;
  const downgradedPlan = lowerPlans.find((p) => p.id === state.downgradedTo);

  let content: ReactNode;
  switch (state.screen) {
    case 'comparison':
      content = (
        <ComparisonStep daysLeft={daysLeft} deletionDate={deleteDate} onKeep={onKeep} onContinue={onContinue} />
      );
      break;
    case 'offer':
      content = (
        <OfferStep
          offer={firstOffer}
          usage={usage}
          deletionDate={deleteDate}
          onContinue={onContinue}
          onClaim={() => {
            cta(CTA.claimOffer, { offer_id: firstOffer.id });
            run(() => service.claimOffer(firstOffer.id), { type: 'OFFER_CLAIMED', offer: 'first' });
          }}
        />
      );
      break;
    case 'alternatives':
      content = (
        <AlternativesStep
          onKeep={onKeep}
          onContinue={onContinue}
          onPause={onPause}
          onLowerPlans={onLowerPlans}
        />
      );
      break;
    case 'survey':
      content = (
        <ChurnSurvey
          onInvalid={() => cta(CTA.continue, { valid: false })}
          onSubmit={(answers) => {
            cta(CTA.continue, { valid: true, reason: answers.reason, likelihood: answers.likelihoodToReturn });
            send({ type: 'SURVEY_SUBMITTED', answers });
          }}
        />
      );
      break;
    case 'lifetime':
      content = (
        <LifetimeStep
          offer={lifetimeOffer}
          showAlternatives={state.flow === 'A'}
          onPause={onPause}
          onLowerPlans={onLowerPlans}
          onClaim={() => {
            cta(CTA.claimLifetimeOffer, { offer_id: lifetimeOffer.id });
            run(() => service.claimLifetimeOffer(lifetimeOffer.id), { type: 'OFFER_CLAIMED', offer: 'lifetime' });
          }}
          onContinue={() => {
            cta(CTA.continueCancellation);
            run(() => service.cancelSubscription(state.survey), { type: 'CANCELLED' });
          }}
        />
      );
      break;
    case 'pause':
      content = (
        <PauseStep
          today={now}
          onBack={onBackToFlow}
          onConfirm={(months) => {
            cta(CTA.confirmPause, { months });
            run(() => service.pauseSubscription(months), { type: 'PAUSED', months });
          }}
        />
      );
      break;
    case 'pauseSuccess':
      content = (
        <ResultStep
          title={PAUSE_STEP.successTitle}
          lines={[PAUSE_STEP.successBody(formatDate(addMonths(now, state.pauseMonths ?? 1)))]}
          onDone={onDone}
        />
      );
      break;
    case 'lowerPlans':
      content = (
        <LowerPlansStep
          plans={lowerPlans}
          onBack={onBackToFlow}
          onConfirm={(plan) => {
            cta(CTA.confirmDowngrade(plan.name), { plan_id: plan.id });
            run(() => service.downgradePlan(plan.id), { type: 'DOWNGRADED', planId: plan.id });
          }}
        />
      );
      break;
    case 'lowerPlansSuccess':
      content = (
        <ResultStep
          title={LOWER_PLANS_STEP.successTitle(downgradedPlan?.name ?? '')}
          lines={[LOWER_PLANS_STEP.successBody(downgradedPlan?.name ?? '', downgradedPlan?.price ?? '', endDate)]}
          onDone={onDone}
        />
      );
      break;
    case 'offerApplied':
      content = (
        <ResultStep
          title={OFFER_APPLIED.title}
          lines={[OFFER_APPLIED.priceLine(appliedOffer.price, appliedOffer.term), OFFER_APPLIED.body, OFFER_APPLIED.emailNote]}
          onDone={onDone}
        />
      );
      break;
    case 'cancelled':
      content = (
        <CancelledStep
          planEndDate={endDate}
          deletionDate={deleteDate}
          onReactivate={() => {
            cta(CTA.reactivate);
            run(() => service.reactivate(), { type: 'REACTIVATED' });
          }}
          onExport={() => {
            cta(CTA.exportData);
            run(() => service.exportData());
          }}
        />
      );
      break;
    case 'reactivated':
      content = <ResultStep title={REACTIVATED_STEP.title} lines={[REACTIVATED_STEP.body]} onDone={onDone} />;
      break;
  }

  return (
    <div className="cf-overlay">
      <div
        ref={dialogRef}
        className="cf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cf-title"
        data-screen={state.screen}
        data-flow={state.flow}
      >
        <div className="cf-main">
          <div className="cf-header">
            {showBack && (
              <button
                type="button"
                className="cf-icon-btn cf-back"
                aria-label={SHELL.back}
                onClick={() => (cta('back'), send({ type: 'BACK' }))}
                disabled={busy}
              >
                <BackIcon />
              </button>
            )}
            <span className="cf-header__title">{SHELL.headerTitle}</span>
            {showStepIndicator && (
              <span className="cf-step" aria-live="polite">
                {SHELL.step(step, TOTAL_STEPS)}
              </span>
            )}
          </div>
          <FlowUiContext.Provider value={{ busy, error }}>{content}</FlowUiContext.Provider>
        </div>
        <aside className="cf-panel" aria-hidden="true">
          {illustration}
        </aside>
        <button type="button" className="cf-icon-btn cf-close" aria-label={SHELL.close} onClick={requestClose}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
