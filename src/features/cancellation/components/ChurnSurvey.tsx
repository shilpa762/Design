import { useId, useState } from 'react';
import { CTA, SURVEY_STEP as S } from '../copy';
import type { ReasonId, SurveyAnswers } from '../types';
import { Button, StepLayout } from './ui';

interface ChurnSurveyProps {
  onSubmit: (answers: SurveyAnswers) => void;
  /** Continue pressed without a reason (for analytics). */
  onInvalid?: () => void;
}

export function ChurnSurvey({ onSubmit, onInvalid }: ChurnSurveyProps) {
  const [reason, setReason] = useState<ReasonId | null>(null);
  const [likelihood, setLikelihood] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [showError, setShowError] = useState(false);
  const id = useId();

  const submit = () => {
    if (!reason) {
      onInvalid?.();
      setShowError(true);
      document.getElementById(`${id}-reason-${S.reasons[0].id}`)?.focus();
      return;
    }
    onSubmit({ reason, likelihoodToReturn: likelihood, comments: comments.trim() });
  };

  return (
    <StepLayout
      title={S.title}
      subtitle={S.subtitle}
      footer={
        <Button variant="primary" onClick={submit} aria-describedby={showError ? `${id}-error` : undefined}>
          {CTA.continue}
        </Button>
      }
    >
      <form className="cf-survey" onSubmit={(e) => (e.preventDefault(), submit())}>
        <fieldset className="cf-fieldset" aria-required="true" aria-invalid={showError && !reason}>
          <legend className="cf-question">
            {S.reasonQuestion} <span className="cf-visually-hidden">({S.reasonRequired})</span>
          </legend>
          {showError && !reason && (
            <p className="cf-field-error" id={`${id}-error`} role="alert">
              {S.reasonError}
            </p>
          )}
          <div className="cf-choices">
            {S.reasons.map((r) => (
              <label className="cf-choice" key={r.id}>
                <input
                  type="radio"
                  name={`${id}-reason`}
                  id={`${id}-reason-${r.id}`}
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="cf-fieldset">
          <legend className="cf-question">{S.likelihoodQuestion}</legend>
          <div className="cf-scale">
            <span className="cf-scale__end" id={`${id}-min`}>
              {S.likelihoodMin}
            </span>
            <div className="cf-scale__options">
              {[1, 2, 3, 4, 5].map((n) => (
                <label className="cf-scale__option" key={n}>
                  <input
                    type="radio"
                    name={`${id}-likelihood`}
                    value={n}
                    checked={likelihood === n}
                    onChange={() => setLikelihood(n)}
                    aria-describedby={n === 1 ? `${id}-min` : n === 5 ? `${id}-max` : undefined}
                  />
                  <span>{n}</span>
                </label>
              ))}
            </div>
            <span className="cf-scale__end" id={`${id}-max`}>
              {S.likelihoodMax}
            </span>
          </div>
        </fieldset>

        <div className="cf-fieldset">
          <label className="cf-question" htmlFor={`${id}-comments`}>
            {S.commentsQuestion}
          </label>
          <textarea
            id={`${id}-comments`}
            className="cf-textarea"
            rows={3}
            placeholder={S.commentsPlaceholder}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
      </form>
    </StepLayout>
  );
}
