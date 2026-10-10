import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CancellationModal } from './features/cancellation/CancellationModal';
import type { Outcome } from './features/cancellation/types';
import './styles/tokens.css';
import './styles/demo.css';

/** Demo billing page. ?flow=B selects Flow B, ?open=1 opens the modal on load. */
function DemoBillingPage() {
  const params = new URLSearchParams(window.location.search);
  const [firstOfferClaimed, setFirstOfferClaimed] = useState(params.get('flow') === 'B');
  const [open, setOpen] = useState(params.get('open') === '1');
  const [lastOutcome, setLastOutcome] = useState<Outcome | null>(null);

  return (
    <main className="demo">
      <h1>Billing</h1>
      <label className="demo__toggle">
        <input
          type="checkbox"
          checked={firstOfferClaimed}
          onChange={(e) => setFirstOfferClaimed(e.target.checked)}
        />
        First offer already claimed (Flow B)
      </label>
      <button type="button" className="cf-btn cf-btn--secondary" onClick={() => setOpen(true)}>
        Cancel
      </button>
      {lastOutcome && <p>Last outcome: {lastOutcome}</p>}
      <CancellationModal
        open={open}
        firstOfferClaimed={firstOfferClaimed}
        onClose={(outcome) => {
          setOpen(false);
          setLastOutcome(outcome);
        }}
      />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DemoBillingPage />
  </StrictMode>,
);
