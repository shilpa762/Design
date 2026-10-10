import {
  cancelReducer,
  canOpenAlternatives,
  initialState,
  stepNumber,
  type CancelEvent,
  type CancelState,
} from '../cancelMachine';
import type { SurveyAnswers } from '../types';

const answers: SurveyAnswers = { reason: 'expensive', likelihoodToReturn: 3, comments: '' };

const run = (state: CancelState, ...events: CancelEvent[]) => events.reduce(cancelReducer, state);

const flowA = () => initialState(false);
const flowB = () => initialState(true);

describe('initial state', () => {
  it('selects Flow A when the first offer is unclaimed', () => {
    expect(flowA()).toMatchObject({ flow: 'A', screen: 'comparison', outcome: null });
  });

  it('selects Flow B when the first offer was already claimed', () => {
    expect(flowB()).toMatchObject({ flow: 'B', screen: 'comparison', outcome: null });
  });
});

describe('Flow A: first-time cancellation', () => {
  it('walks comparison -> offer -> survey -> lifetime -> cancelled', () => {
    let s = flowA();
    s = cancelReducer(s, { type: 'CONTINUE' });
    expect(s.screen).toBe('offer');
    s = cancelReducer(s, { type: 'CONTINUE' });
    expect(s.screen).toBe('survey');
    s = cancelReducer(s, { type: 'SURVEY_SUBMITTED', answers });
    expect(s).toMatchObject({ screen: 'lifetime', survey: answers });
    s = cancelReducer(s, { type: 'CANCELLED' });
    expect(s.screen).toBe('cancelled');
    s = cancelReducer(s, { type: 'CLOSE' });
    expect(s).toMatchObject({ screen: 'closed', outcome: 'cancelled' });
  });

  it('numbers steps 1-5', () => {
    const screens = [
      flowA(),
      run(flowA(), { type: 'CONTINUE' }),
      run(flowA(), { type: 'CONTINUE' }, { type: 'CONTINUE' }),
      run(flowA(), { type: 'CONTINUE' }, { type: 'CONTINUE' }, { type: 'SURVEY_SUBMITTED', answers }),
      run(
        flowA(),
        { type: 'CONTINUE' },
        { type: 'CONTINUE' },
        { type: 'SURVEY_SUBMITTED', answers },
        { type: 'CANCELLED' },
      ),
    ];
    expect(screens.map(stepNumber)).toEqual([1, 2, 3, 4, 5]);
  });

  it('claiming the first offer shows offer applied and closes as offer_claimed', () => {
    let s = run(flowA(), { type: 'CONTINUE' }, { type: 'OFFER_CLAIMED', offer: 'first' });
    expect(s).toMatchObject({ screen: 'offerApplied', appliedOffer: 'first' });
    expect(stepNumber(s)).toBeNull();
    s = cancelReducer(s, { type: 'DONE' });
    expect(s.outcome).toBe('offer_claimed');
  });

  it('claiming the lifetime offer closes as lifetime_claimed', () => {
    const s = run(
      flowA(),
      { type: 'CONTINUE' },
      { type: 'CONTINUE' },
      { type: 'SURVEY_SUBMITTED', answers },
      { type: 'OFFER_CLAIMED', offer: 'lifetime' },
      { type: 'DONE' },
    );
    expect(s.outcome).toBe('lifetime_claimed');
  });

  it('offers pause and lower plans on the lifetime step only', () => {
    const lifetime = run(flowA(), { type: 'CONTINUE' }, { type: 'CONTINUE' }, { type: 'SURVEY_SUBMITTED', answers });
    expect(canOpenAlternatives(lifetime)).toBe(true);
    expect(canOpenAlternatives(run(flowA(), { type: 'CONTINUE' }))).toBe(false);

    const pause = cancelReducer(lifetime, { type: 'OPEN_PAUSE' });
    expect(pause).toMatchObject({ screen: 'pause', returnTo: 'lifetime' });
    expect(cancelReducer(pause, { type: 'BACK' }).screen).toBe('lifetime');

    const paused = cancelReducer(pause, { type: 'PAUSED', months: 2 });
    expect(paused).toMatchObject({ screen: 'pauseSuccess', pauseMonths: 2 });
    expect(cancelReducer(paused, { type: 'DONE' }).outcome).toBe('paused');

    const lower = cancelReducer(lifetime, { type: 'OPEN_LOWER_PLANS' });
    expect(lower).toMatchObject({ screen: 'lowerPlans', returnTo: 'lifetime' });
    const downgraded = cancelReducer(lower, { type: 'DOWNGRADED', planId: 'standard' });
    expect(downgraded).toMatchObject({ screen: 'lowerPlansSuccess', downgradedTo: 'standard' });
    expect(cancelReducer(downgraded, { type: 'CLOSE' }).outcome).toBe('downgraded');
  });

  it('back walks one step at a time', () => {
    const lifetime = run(flowA(), { type: 'CONTINUE' }, { type: 'CONTINUE' }, { type: 'SURVEY_SUBMITTED', answers });
    expect(run(lifetime, { type: 'BACK' }).screen).toBe('survey');
    expect(run(lifetime, { type: 'BACK' }, { type: 'BACK' }).screen).toBe('offer');
    expect(run(lifetime, { type: 'BACK' }, { type: 'BACK' }, { type: 'BACK' }).screen).toBe('comparison');
  });

  it('reactivation after cancelling closes as reactivated', () => {
    const s = run(
      flowA(),
      { type: 'CONTINUE' },
      { type: 'CONTINUE' },
      { type: 'SURVEY_SUBMITTED', answers },
      { type: 'CANCELLED' },
      { type: 'REACTIVATED' },
    );
    expect(s.screen).toBe('reactivated');
    expect(cancelReducer(s, { type: 'DONE' }).outcome).toBe('reactivated');
  });
});

describe('Flow B: first offer already claimed', () => {
  it('walks comparison -> alternatives -> survey -> lifetime -> cancelled', () => {
    let s = flowB();
    s = cancelReducer(s, { type: 'CONTINUE' });
    expect(s.screen).toBe('alternatives');
    expect(stepNumber(s)).toBe(2);
    s = cancelReducer(s, { type: 'CONTINUE' });
    expect(s.screen).toBe('survey');
    s = cancelReducer(s, { type: 'SURVEY_SUBMITTED', answers });
    expect(s.screen).toBe('lifetime');
    expect(stepNumber(s)).toBe(4);
    s = cancelReducer(s, { type: 'CANCELLED' });
    expect(s.screen).toBe('cancelled');
    expect(stepNumber(s)).toBe(5);
  });

  it('never shows the first offer', () => {
    const alternatives = run(flowB(), { type: 'CONTINUE' });
    expect(cancelReducer(alternatives, { type: 'OFFER_CLAIMED', offer: 'first' })).toBe(alternatives);
  });

  it('opens pause and lower plans from alternatives and returns there', () => {
    const alternatives = run(flowB(), { type: 'CONTINUE' });
    const pause = cancelReducer(alternatives, { type: 'OPEN_PAUSE' });
    expect(pause).toMatchObject({ screen: 'pause', returnTo: 'alternatives' });
    expect(cancelReducer(pause, { type: 'BACK' }).screen).toBe('alternatives');

    const lower = cancelReducer(alternatives, { type: 'OPEN_LOWER_PLANS' });
    expect(cancelReducer(lower, { type: 'BACK' }).screen).toBe('alternatives');
  });

  it('shows the lifetime offer only, without pause / lower plans', () => {
    const lifetime = run(flowB(), { type: 'CONTINUE' }, { type: 'CONTINUE' }, { type: 'SURVEY_SUBMITTED', answers });
    expect(canOpenAlternatives(lifetime)).toBe(false);
    expect(cancelReducer(lifetime, { type: 'OPEN_PAUSE' })).toBe(lifetime);
    expect(cancelReducer(lifetime, { type: 'OPEN_LOWER_PLANS' })).toBe(lifetime);
    expect(cancelReducer(lifetime, { type: 'OFFER_CLAIMED', offer: 'lifetime' }).screen).toBe('offerApplied');
  });
});

describe('closing never cancels', () => {
  /** Every screen reachable before a successful cancellation, in both flows. */
  function reachableBeforeCancel(): CancelState[] {
    const states: CancelState[] = [];
    for (const start of [flowA(), flowB()]) {
      const toSurvey = run(start, { type: 'CONTINUE' }, { type: 'CONTINUE' });
      const lifetime = cancelReducer(toSurvey, { type: 'SURVEY_SUBMITTED', answers });
      const second = run(start, { type: 'CONTINUE' });
      const altSource = start.flow === 'A' ? lifetime : second;
      states.push(
        start,
        second,
        toSurvey,
        lifetime,
        cancelReducer(altSource, { type: 'OPEN_PAUSE' }),
        cancelReducer(altSource, { type: 'OPEN_LOWER_PLANS' }),
      );
    }
    return states;
  }

  it.each(['CLOSE', 'KEEP', 'BACK'] as const)('%s never yields a cancelled outcome', (type) => {
    for (const state of reachableBeforeCancel()) {
      const next = cancelReducer(state, { type });
      expect(next.screen).not.toBe('cancelled');
      if (next.screen === 'closed') expect(next.outcome).toBe('kept');
    }
  });

  it('X / Escape on any step closes with the plan kept', () => {
    for (const state of reachableBeforeCancel()) {
      expect(cancelReducer(state, { type: 'CLOSE' })).toMatchObject({ screen: 'closed', outcome: 'kept' });
    }
  });

  it('back on step 1 closes with the plan kept', () => {
    expect(cancelReducer(flowA(), { type: 'BACK' })).toMatchObject({ screen: 'closed', outcome: 'kept' });
    expect(cancelReducer(flowB(), { type: 'BACK' })).toMatchObject({ screen: 'closed', outcome: 'kept' });
  });

  it('keep my Team Plan closes as kept', () => {
    expect(cancelReducer(flowA(), { type: 'KEEP' }).outcome).toBe('kept');
    expect(cancelReducer(run(flowB(), { type: 'CONTINUE' }), { type: 'KEEP' }).outcome).toBe('kept');
  });
});

describe('guards', () => {
  it('only reaches cancelled from the lifetime step', () => {
    const notLifetime = [flowA(), run(flowA(), { type: 'CONTINUE' }), run(flowB(), { type: 'CONTINUE' })];
    for (const s of notLifetime) expect(cancelReducer(s, { type: 'CANCELLED' })).toBe(s);
  });

  it('does not skip the survey with CONTINUE', () => {
    const survey = run(flowA(), { type: 'CONTINUE' }, { type: 'CONTINUE' });
    expect(cancelReducer(survey, { type: 'CONTINUE' })).toBe(survey);
  });

  it('does not cancel from the lifetime step with CONTINUE alone', () => {
    const lifetime = run(flowA(), { type: 'CONTINUE' }, { type: 'CONTINUE' }, { type: 'SURVEY_SUBMITTED', answers });
    expect(cancelReducer(lifetime, { type: 'CONTINUE' })).toBe(lifetime);
  });

  it('ignores events once closed', () => {
    const closed = cancelReducer(flowA(), { type: 'CLOSE' });
    expect(cancelReducer(closed, { type: 'CONTINUE' })).toBe(closed);
    expect(cancelReducer(closed, { type: 'CANCELLED' })).toBe(closed);
  });

  it('ignores result events on the wrong screen', () => {
    const s = flowA();
    expect(cancelReducer(s, { type: 'PAUSED', months: 1 })).toBe(s);
    expect(cancelReducer(s, { type: 'DOWNGRADED', planId: 'standard' })).toBe(s);
    expect(cancelReducer(s, { type: 'REACTIVATED' })).toBe(s);
    expect(cancelReducer(s, { type: 'SURVEY_SUBMITTED', answers })).toBe(s);
  });
});
