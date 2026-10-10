import { CANCELLED_STEP as C, CTA } from '../copy';
import { Banner, Button, StepLayout } from './ui';

interface CancelledStepProps {
  planEndDate: string;
  deletionDate: string;
  onReactivate: () => void;
  onExport: () => void;
}

export function CancelledStep({ planEndDate, deletionDate, onReactivate, onExport }: CancelledStepProps) {
  return (
    <StepLayout
      title={C.title}
      subtitle={C.accessUntil(planEndDate)}
      footer={
        <>
          <Button variant="primary" onClick={onReactivate}>
            {CTA.reactivate}
          </Button>
          <Button variant="secondary" onClick={onExport}>
            {CTA.exportData}
          </Button>
        </>
      }
    >
      <Banner>{C.reactivateHint}</Banner>
      <section aria-labelledby="cf-next-title">
        <h3 className="cf-section-title" id="cf-next-title">
          {C.nextTitle}
        </h3>
        <ol className="cf-timeline">
          {C.next(planEndDate, deletionDate).map((item) => (
            <li key={item.text}>
              <strong>{item.date}</strong>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
      </section>
      <p className="cf-note">{C.exportHint(deletionDate)}</p>
      <p className="cf-note">{C.emailNote}</p>
    </StepLayout>
  );
}
