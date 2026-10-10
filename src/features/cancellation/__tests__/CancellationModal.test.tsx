import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ANALYTICS_EVENTS } from '../analytics';
import type { BillingService } from '../billingService';
import { CancellationModal } from '../CancellationModal';
import { CTA, SHELL, SURVEY_STEP } from '../copy';

function makeService(overrides: Partial<BillingService> = {}): BillingService {
  return {
    claimOffer: vi.fn().mockResolvedValue(undefined),
    claimLifetimeOffer: vi.fn().mockResolvedValue(undefined),
    pauseSubscription: vi.fn().mockResolvedValue(undefined),
    downgradePlan: vi.fn().mockResolvedValue(undefined),
    cancelSubscription: vi.fn().mockResolvedValue(undefined),
    reactivate: vi.fn().mockResolvedValue(undefined),
    exportData: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function setup(firstOfferClaimed = false, service = makeService()) {
  const onClose = vi.fn();
  const track = vi.fn();
  const user = userEvent.setup();
  render(
    <CancellationModal
      open
      firstOfferClaimed={firstOfferClaimed}
      onClose={onClose}
      service={service}
      track={track}
      today={new Date(2026, 9, 10)}
    />,
  );
  return { onClose, track, user, service };
}

const click = (user: ReturnType<typeof userEvent.setup>, name: string) =>
  user.click(screen.getByRole('button', { name }));

describe('CancellationModal', () => {
  it('renders an accessible modal dialog labelled by the step title', () => {
    setup();
    const dialog = screen.getByRole('dialog', { name: 'Are you sure you want to cancel?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('Escape closes with the plan kept and never calls cancel', async () => {
    const { onClose, user, service } = setup();
    await click(user, CTA.continueCancellation);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledWith('kept');
    expect(service.cancelSubscription).not.toHaveBeenCalled();
  });

  it('X closes with the plan kept', async () => {
    const { onClose, user, service } = setup(true);
    await click(user, SHELL.close);
    expect(onClose).toHaveBeenCalledWith('kept');
    expect(service.cancelSubscription).not.toHaveBeenCalled();
  });

  it('back on step 1 closes with the plan kept', async () => {
    const { onClose, user } = setup();
    await click(user, SHELL.back);
    expect(onClose).toHaveBeenCalledWith('kept');
  });

  it('traps focus inside the dialog', async () => {
    const { user } = setup();
    const dialog = screen.getByRole('dialog');
    for (let i = 0; i < 8; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('Flow A: full cancellation sends the survey and tracks every step and CTA', async () => {
    const { onClose, user, service, track } = setup(false);

    await click(user, CTA.continueCancellation); // step 1
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('Surveys created')).toBeInTheDocument();
    expect(screen.getByText('465')).toBeInTheDocument();

    await click(user, CTA.continueCancellation); // step 2
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();

    await click(user, CTA.continue); // no reason yet
    expect(screen.getByRole('alert')).toHaveTextContent(SURVEY_STEP.reasonError);

    await user.click(screen.getByLabelText('Too many technical issues (bugs, glitches)'));
    await user.click(screen.getByRole('radio', { name: '4' }));
    await click(user, CTA.continue);

    expect(screen.getByText('Step 4 of 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pause subscription/ })).toBeInTheDocument();

    await click(user, CTA.continueCancellation);
    await screen.findByText('Your Team Plan is cancelled');
    expect(service.cancelSubscription).toHaveBeenCalledWith({
      reason: 'technical_issues',
      likelihoodToReturn: 4,
      comments: '',
    });
    expect(screen.getByRole('button', { name: CTA.reactivate })).toBeInTheDocument();
    expect(screen.queryByText(/Step 5 of 5/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: SHELL.back })).not.toBeInTheDocument();

    const views = track.mock.calls.filter(([e]) => e === ANALYTICS_EVENTS.stepViewed).map(([, p]) => p.screen);
    expect(views).toEqual(['comparison', 'offer', 'survey', 'lifetime', 'cancelled']);
    const ctas = track.mock.calls.filter(([e]) => e === ANALYTICS_EVENTS.ctaClicked).map(([, p]) => p.cta);
    expect(ctas).toEqual([
      CTA.continueCancellation,
      CTA.continueCancellation,
      CTA.continue,
      CTA.continue,
      CTA.continueCancellation,
    ]);

    await click(user, SHELL.close);
    expect(onClose).toHaveBeenCalledWith('cancelled');
  });

  it('Flow A: claiming the first offer shows the exact price and term', async () => {
    const { user, service, onClose } = setup(false);
    await click(user, CTA.continueCancellation);
    await click(user, CTA.claimOffer);
    await screen.findByText('Offer applied');
    expect(service.claimOffer).toHaveBeenCalledWith('first_offer');
    expect(screen.getByText('You now pay [FIRST_OFFER_PRICE] [FIRST_OFFER_TERM].')).toBeInTheDocument();
    await click(user, CTA.done);
    expect(onClose).toHaveBeenCalledWith('offer_claimed');
  });

  it('Flow B: shows alternatives instead of the first offer, and pause uses a real resume date', async () => {
    const { user, service, onClose } = setup(true);
    await click(user, CTA.continueCancellation);
    expect(screen.queryByRole('button', { name: CTA.claimOffer })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Pause subscription/ }));
    await user.click(screen.getByLabelText('3 months'));
    expect(screen.getByText('Billing resumes on January 10, 2027')).toBeInTheDocument();

    await click(user, CTA.confirmPause);
    await screen.findByText('Subscription paused');
    expect(service.pauseSubscription).toHaveBeenCalledWith(3);
    await click(user, CTA.done);
    expect(onClose).toHaveBeenCalledWith('paused');
  });

  it('Flow B: lifetime step has no pause / lower plans', async () => {
    const { user } = setup(true);
    await click(user, CTA.continueCancellation);
    await click(user, CTA.continueCancellation);
    await user.click(screen.getByLabelText(SURVEY_STEP.reasons[0].label));
    await click(user, CTA.continue);
    expect(screen.getByRole('button', { name: CTA.claimLifetimeOffer })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pause subscription/ })).not.toBeInTheDocument();
  });

  it('a failed API call keeps the plan and shows an error', async () => {
    const service = makeService({ cancelSubscription: vi.fn().mockRejectedValue(new Error('500')) });
    const { user } = setup(true, service);
    await click(user, CTA.continueCancellation);
    await click(user, CTA.continueCancellation);
    await user.click(screen.getByLabelText(SURVEY_STEP.reasons[0].label));
    await click(user, CTA.continue);
    await click(user, CTA.continueCancellation);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(SHELL.error));
    expect(screen.getByText('Step 4 of 5')).toBeInTheDocument();
  });
});
