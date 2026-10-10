import {
  ALTERNATIVES_STEP,
  COMPARISON_STEP,
  CTA,
  LIFETIME_STEP,
  OFFER_STEP,
  OPTION_CARDS,
} from '../copy';
import type { OfferDetails, UsageCounts } from '../types';
import { OfferCard } from './OfferCard';
import { OptionCard } from './OptionCard';
import { PlanComparisonCard } from './PlanComparisonCard';
import { UsageList } from './UsageList';
import { Banner, Button, StepLayout } from './ui';

interface KeepOrContinue {
  onKeep: () => void;
  onContinue: () => void;
}

export function ComparisonStep({
  daysLeft,
  deletionDate,
  onKeep,
  onContinue,
}: KeepOrContinue & { daysLeft: number; deletionDate: string }) {
  const days = COMPARISON_STEP.daysLeft(daysLeft);
  return (
    <StepLayout
      title={COMPARISON_STEP.title}
      subtitle={
        <>
          <p>
            {COMPARISON_STEP.bodyLead}
            <strong>{COMPARISON_STEP.bodyBold}</strong>
          </p>
          <p>
            {COMPARISON_STEP.bodyDeleteLead}
            <strong>{COMPARISON_STEP.bodyDeleteBold}</strong>
            {COMPARISON_STEP.bodyDeleteTail(deletionDate)}
          </p>
        </>
      }
      footer={
        <>
          <Button variant="primary" onClick={onKeep}>
            {CTA.keep}
          </Button>
          <Button variant="secondary" onClick={onContinue}>
            {CTA.continueCancellation}
          </Button>
        </>
      }
    >
      <Banner>
        {days.lead}
        <strong>{days.bold}</strong>
        {days.tail}
      </Banner>
      <PlanComparisonCard />
    </StepLayout>
  );
}

export function OfferStep({
  offer,
  usage,
  deletionDate,
  onClaim,
  onContinue,
}: Omit<KeepOrContinue, 'onKeep'> & {
  offer: OfferDetails;
  usage: UsageCounts;
  deletionDate: string;
  onClaim: () => void;
}) {
  return (
    <StepLayout
      title={OFFER_STEP.title}
      subtitle={OFFER_STEP.subtitle}
      footer={
        <>
          <Button variant="primary" onClick={onClaim}>
            {CTA.claimOffer}
          </Button>
          <Button variant="secondary" onClick={onContinue}>
            {CTA.continueCancellation}
          </Button>
        </>
      }
    >
      <OfferCard eyebrow={OFFER_STEP.eyebrow} offer={offer} />
      <UsageList title={OFFER_STEP.usageTitle} usage={usage} />
      <p className="cf-note">{OFFER_STEP.usageNote(deletionDate)}</p>
    </StepLayout>
  );
}

function Alternatives({ onPause, onLowerPlans }: { onPause: () => void; onLowerPlans: () => void }) {
  return (
    <div className="cf-options">
      <OptionCard {...OPTION_CARDS.pause} onClick={onPause} />
      <OptionCard {...OPTION_CARDS.lowerPlans} onClick={onLowerPlans} />
    </div>
  );
}

export function AlternativesStep({
  onKeep,
  onContinue,
  onPause,
  onLowerPlans,
}: KeepOrContinue & { onPause: () => void; onLowerPlans: () => void }) {
  return (
    <StepLayout
      title={ALTERNATIVES_STEP.title}
      subtitle={ALTERNATIVES_STEP.subtitle}
      footer={
        <>
          <Button variant="primary" onClick={onKeep}>
            {CTA.keep}
          </Button>
          <Button variant="secondary" onClick={onContinue}>
            {CTA.continueCancellation}
          </Button>
        </>
      }
    >
      <Alternatives onPause={onPause} onLowerPlans={onLowerPlans} />
    </StepLayout>
  );
}

export function LifetimeStep({
  offer,
  showAlternatives,
  onClaim,
  onContinue,
  onPause,
  onLowerPlans,
}: Omit<KeepOrContinue, 'onKeep'> & {
  offer: OfferDetails;
  showAlternatives: boolean;
  onClaim: () => void;
  onPause: () => void;
  onLowerPlans: () => void;
}) {
  return (
    <StepLayout
      title={LIFETIME_STEP.title}
      subtitle={LIFETIME_STEP.subtitle}
      footer={
        <>
          <Button variant="primary" onClick={onClaim}>
            {CTA.claimLifetimeOffer}
          </Button>
          <Button variant="secondary" onClick={onContinue}>
            {CTA.continueCancellation}
          </Button>
        </>
      }
    >
      <OfferCard eyebrow={LIFETIME_STEP.eyebrow} offer={offer} />
      {showAlternatives && (
        <section aria-labelledby="cf-alt-title">
          <h3 className="cf-section-title" id="cf-alt-title">
            {LIFETIME_STEP.alternativesTitle}
          </h3>
          <Alternatives onPause={onPause} onLowerPlans={onLowerPlans} />
        </section>
      )}
    </StepLayout>
  );
}

/** Generic success screen (offer applied, paused, downgraded, reactivated). */
export function ResultStep({
  title,
  lines,
  onDone,
}: {
  title: string;
  lines: string[];
  onDone: () => void;
}) {
  return (
    <StepLayout
      title={title}
      footer={
        <Button variant="primary" onClick={onDone}>
          {CTA.done}
        </Button>
      }
    >
      <div className="cf-result">
        {lines.map((line, i) =>
          i === 0 ? (
            <p className="cf-banner" key={line}>
              {line}
            </p>
          ) : (
            <p className="cf-note" key={line}>
              {line}
            </p>
          ),
        )}
      </div>
    </StepLayout>
  );
}
