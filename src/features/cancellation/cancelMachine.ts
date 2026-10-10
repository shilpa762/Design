import type { Flow, Outcome, PauseMonths, SurveyAnswers } from './types';

/**
 * Cancellation flow state machine.
 *
 * Pure reducer: user intents (CONTINUE, BACK, KEEP, CLOSE, OPEN_*) and API
 * results (OFFER_CLAIMED, PAUSED, DOWNGRADED, CANCELLED, REACTIVATED) are both
 * events. The modal performs the API call and only dispatches the result event
 * once it succeeds, so the machine never reaches `cancelled` without a
 * successful cancelSubscription call.
 *
 * Invariant: CLOSE, KEEP and BACK can never produce the `cancelled` outcome
 * unless the subscription was already cancelled.
 */

export type StepScreen = 'comparison' | 'offer' | 'alternatives' | 'survey' | 'lifetime';

export type Screen =
  | StepScreen
  | 'cancelled'
  | 'reactivated'
  | 'pause'
  | 'pauseSuccess'
  | 'lowerPlans'
  | 'lowerPlansSuccess'
  | 'offerApplied'
  | 'closed';

export type AppliedOffer = 'first' | 'lifetime';

export interface CancelState {
  flow: Flow;
  screen: Screen;
  /** Step screen a side screen (pause / lower plans) was opened from. */
  returnTo: StepScreen | null;
  appliedOffer: AppliedOffer | null;
  pauseMonths: PauseMonths | null;
  downgradedTo: string | null;
  survey: SurveyAnswers | null;
  outcome: Outcome | null;
}

export type CancelEvent =
  | { type: 'CONTINUE' }
  | { type: 'BACK' }
  | { type: 'KEEP' }
  | { type: 'CLOSE' }
  | { type: 'DONE' }
  | { type: 'SURVEY_SUBMITTED'; answers: SurveyAnswers }
  | { type: 'OPEN_PAUSE' }
  | { type: 'OPEN_LOWER_PLANS' }
  | { type: 'OFFER_CLAIMED'; offer: AppliedOffer }
  | { type: 'PAUSED'; months: PauseMonths }
  | { type: 'DOWNGRADED'; planId: string }
  | { type: 'CANCELLED' }
  | { type: 'REACTIVATED' };

export const FLOW_STEPS: Record<Flow, readonly StepScreen[]> = {
  A: ['comparison', 'offer', 'survey', 'lifetime'],
  B: ['comparison', 'alternatives', 'survey', 'lifetime'],
};

export const TOTAL_STEPS = 5;

export function initialState(firstOfferClaimed: boolean): CancelState {
  return {
    flow: firstOfferClaimed ? 'B' : 'A',
    screen: 'comparison',
    returnTo: null,
    appliedOffer: null,
    pauseMonths: null,
    downgradedTo: null,
    survey: null,
    outcome: null,
  };
}

/** 1-based step number for the step indicator, or null for side/success screens. */
export function stepNumber(state: Pick<CancelState, 'flow' | 'screen'>): number | null {
  if (state.screen === 'cancelled') return TOTAL_STEPS;
  const index = (FLOW_STEPS[state.flow] as readonly string[]).indexOf(state.screen);
  return index === -1 ? null : index + 1;
}

/** Whether the pause / lower-plan alternatives are offered on this screen. */
export function canOpenAlternatives(state: Pick<CancelState, 'flow' | 'screen'>): boolean {
  return state.screen === 'alternatives' || (state.flow === 'A' && state.screen === 'lifetime');
}

function isStepScreen(screen: Screen): screen is StepScreen {
  return (
    screen === 'comparison' ||
    screen === 'offer' ||
    screen === 'alternatives' ||
    screen === 'survey' ||
    screen === 'lifetime'
  );
}

/** Outcome reported when the modal closes from the given state. */
export function outcomeFor(state: CancelState): Outcome {
  switch (state.screen) {
    case 'offerApplied':
      return state.appliedOffer === 'lifetime' ? 'lifetime_claimed' : 'offer_claimed';
    case 'pauseSuccess':
      return 'paused';
    case 'lowerPlansSuccess':
      return 'downgraded';
    case 'cancelled':
      return 'cancelled';
    case 'reactivated':
      return 'reactivated';
    default:
      return 'kept';
  }
}

function close(state: CancelState): CancelState {
  return { ...state, screen: 'closed', outcome: outcomeFor(state) };
}

export function cancelReducer(state: CancelState, event: CancelEvent): CancelState {
  if (state.screen === 'closed') return state;

  const steps = FLOW_STEPS[state.flow];

  switch (event.type) {
    case 'CLOSE':
    case 'DONE':
      return close(state);

    case 'KEEP':
      if (isStepScreen(state.screen) || state.screen === 'pause' || state.screen === 'lowerPlans') {
        return { ...state, screen: 'closed', outcome: 'kept' };
      }
      return state;

    case 'BACK': {
      if (state.screen === 'pause' || state.screen === 'lowerPlans') {
        return { ...state, screen: state.returnTo ?? 'comparison', returnTo: null };
      }
      if (!isStepScreen(state.screen)) return state;
      const index = steps.indexOf(state.screen);
      // Back from step 1 leaves the flow with the plan untouched.
      if (index <= 0) return { ...state, screen: 'closed', outcome: 'kept' };
      return { ...state, screen: steps[index - 1] };
    }

    case 'CONTINUE': {
      // Survey and lifetime advance only through SURVEY_SUBMITTED / CANCELLED.
      if (state.screen === 'comparison' || state.screen === 'offer' || state.screen === 'alternatives') {
        return { ...state, screen: steps[steps.indexOf(state.screen) + 1] };
      }
      return state;
    }

    case 'SURVEY_SUBMITTED':
      if (state.screen !== 'survey') return state;
      return { ...state, screen: 'lifetime', survey: event.answers };

    case 'OPEN_PAUSE':
    case 'OPEN_LOWER_PLANS':
      if (!canOpenAlternatives(state) || !isStepScreen(state.screen)) return state;
      return {
        ...state,
        screen: event.type === 'OPEN_PAUSE' ? 'pause' : 'lowerPlans',
        returnTo: state.screen,
      };

    case 'OFFER_CLAIMED':
      if (event.offer === 'first' && state.screen === 'offer') {
        return { ...state, screen: 'offerApplied', appliedOffer: 'first' };
      }
      if (event.offer === 'lifetime' && state.screen === 'lifetime') {
        return { ...state, screen: 'offerApplied', appliedOffer: 'lifetime' };
      }
      return state;

    case 'PAUSED':
      if (state.screen !== 'pause') return state;
      return { ...state, screen: 'pauseSuccess', pauseMonths: event.months };

    case 'DOWNGRADED':
      if (state.screen !== 'lowerPlans') return state;
      return { ...state, screen: 'lowerPlansSuccess', downgradedTo: event.planId };

    case 'CANCELLED':
      if (state.screen !== 'lifetime') return state;
      return { ...state, screen: 'cancelled' };

    case 'REACTIVATED':
      if (state.screen !== 'cancelled') return state;
      return { ...state, screen: 'reactivated' };

    default:
      return state;
  }
}
