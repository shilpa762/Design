import type { OfferDetails } from '../types';

interface OfferCardProps {
  eyebrow: string;
  offer: OfferDetails;
}

/** Offer summary. States the exact price and term; no timers or urgency. */
export function OfferCard({ eyebrow, offer }: OfferCardProps) {
  return (
    <section className="cf-offer" aria-labelledby={`cf-offer-${offer.id}`}>
      <p className="cf-offer__eyebrow">{eyebrow}</p>
      <h3 className="cf-offer__title" id={`cf-offer-${offer.id}`}>
        {offer.title}
      </h3>
      <p className="cf-offer__price">
        <strong>{offer.price}</strong> {offer.term}
      </p>
    </section>
  );
}
