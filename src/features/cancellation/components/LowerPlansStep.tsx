import { useId, useState } from 'react';
import { COMPACT_COMPARISON_ROWS, CTA, LOWER_PLANS_STEP as L, PLAN_COMPARISON } from '../copy';
import type { LowerPlan } from '../types';
import { Button, StepLayout } from './ui';

interface LowerPlansStepProps {
  plans: LowerPlan[];
  onConfirm: (plan: LowerPlan) => void;
  onBack: () => void;
}

export function LowerPlansStep({ plans, onConfirm, onBack }: LowerPlansStepProps) {
  const [selectedId, setSelectedId] = useState(plans[0]?.id);
  const id = useId();
  const selected = plans.find((p) => p.id === selectedId) ?? plans[0];

  return (
    <StepLayout
      title={L.title}
      subtitle={L.subtitle}
      footer={
        <>
          <Button variant="primary" onClick={() => selected && onConfirm(selected)} disabled={!selected}>
            {CTA.confirmDowngrade(selected?.name ?? '')}
          </Button>
          <Button variant="secondary" onClick={onBack}>
            {CTA.continueCancellation}
          </Button>
        </>
      }
    >
      <fieldset className="cf-fieldset">
        <legend className="cf-question">{L.planLegend}</legend>
        <div className="cf-choices">
          {plans.map((plan) => (
            <label className="cf-choice cf-choice--plan" key={plan.id}>
              <input
                type="radio"
                name={`${id}-plan`}
                value={plan.id}
                checked={selectedId === plan.id}
                onChange={() => setSelectedId(plan.id)}
              />
              <span className="cf-choice__name">{plan.name}</span>
              <span className="cf-choice__price">{plan.price}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {selected && (
        <>
          <h3 className="cf-question cf-mini-compare__title" id={`${id}-compare`}>
            {L.compareTitle(selected.name)}
          </h3>
          <table className="cf-mini-compare" aria-labelledby={`${id}-compare`}>
            <thead>
              <tr>
                <td />
                <th scope="col">{PLAN_COMPARISON.teamPlan}</th>
                <th scope="col">{selected.name}</th>
              </tr>
            </thead>
            <tbody>
              {COMPACT_COMPARISON_ROWS.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.label}</th>
                  <td>{row.team}</td>
                  <td>{selected.limits[row.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </StepLayout>
  );
}
