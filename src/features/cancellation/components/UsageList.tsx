import { USAGE_LABELS } from '../copy';
import type { UsageCounts } from '../types';

export function UsageList({ title, usage }: { title: string; usage: UsageCounts }) {
  const keys = Object.keys(USAGE_LABELS) as (keyof UsageCounts)[];
  return (
    <section className="cf-usage" aria-labelledby="cf-usage-title">
      <h3 className="cf-section-title" id="cf-usage-title">
        {title}
      </h3>
      <dl className="cf-usage__list">
        {keys.map((key) => (
          <div className="cf-usage__row" key={key}>
            <dt>{USAGE_LABELS[key]}</dt>
            <dd>{usage[key].toLocaleString('en-US')}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
