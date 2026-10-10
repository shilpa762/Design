import { useId, useState } from 'react';
import { CTA, PAUSE_STEP as P } from '../copy';
import { addMonths, formatDate } from '../dates';
import type { PauseMonths } from '../types';
import { Button, StepLayout } from './ui';

const DURATIONS: PauseMonths[] = [1, 2, 3];

interface PauseStepProps {
  today: Date;
  onConfirm: (months: PauseMonths) => void;
  onBack: () => void;
}

export function PauseStep({ today, onConfirm, onBack }: PauseStepProps) {
  const [months, setMonths] = useState<PauseMonths>(1);
  const id = useId();
  const resumeDate = formatDate(addMonths(today, months));

  return (
    <StepLayout
      title={P.title}
      subtitle={P.subtitle}
      footer={
        <>
          <Button variant="primary" onClick={() => onConfirm(months)}>
            {CTA.confirmPause}
          </Button>
          <Button variant="secondary" onClick={onBack}>
            {CTA.continueCancellation}
          </Button>
        </>
      }
    >
      <fieldset className="cf-fieldset">
        <legend className="cf-question">{P.durationLegend}</legend>
        <div className="cf-segments">
          {DURATIONS.map((m) => (
            <label className="cf-choice cf-choice--segment" key={m}>
              <input
                type="radio"
                name={`${id}-months`}
                value={m}
                checked={months === m}
                onChange={() => setMonths(m)}
              />
              <span>{P.months(m)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="cf-banner" aria-live="polite">
        {P.resumesOn(resumeDate)}
      </p>
    </StepLayout>
  );
}
