import { useFlowUi } from './ui';

interface OptionCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

/** Secondary alternative (pause / lower plans). Whole card is one button. */
export function OptionCard({ title, description, onClick }: OptionCardProps) {
  const { busy } = useFlowUi();
  return (
    <button type="button" className="cf-option" onClick={onClick} disabled={busy}>
      <span className="cf-option__title">{title}</span>
      <span className="cf-option__desc">{description}</span>
      <span className="cf-option__chevron" aria-hidden="true">
        ›
      </span>
    </button>
  );
}
