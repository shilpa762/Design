import { PLAN_COMPARISON as C } from '../copy';
import { CheckIcon } from './ui';

function Cell({ value, plan }: { value: string | boolean; plan: 'team' | 'free' }) {
  if (value === true) return <CheckIcon label={C.included} />;
  if (value === false)
    return (
      <span className="cf-compare__cross" role="img" aria-label={C.notIncluded}>
        ✕
      </span>
    );
  return <span className={`cf-compare__value cf-compare__value--${plan}`}>{value}</span>;
}

/** "What You Lose" Team vs Free table. Built 1:1 from Figma node 1:254. */
export function PlanComparisonCard() {
  return (
    <div className="cf-compare" data-figma-node="1:254">
      <table className="cf-compare__table">
        <thead>
          <tr>
            <th scope="col" className="cf-compare__title">
              {C.title}
            </th>
            <th scope="col" className="cf-compare__plan cf-compare__plan--team">
              {C.teamPlan}
            </th>
            <th scope="col" className="cf-compare__plan">
              {C.freePlan}
            </th>
          </tr>
        </thead>
        <tbody>
          {C.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="cf-compare__label">
                {row.label}
              </th>
              <td>
                <Cell value={row.team} plan="team" />
              </td>
              <td>
                <Cell value={row.free} plan="free" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
