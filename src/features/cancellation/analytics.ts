import type { Flow } from './types';

export const ANALYTICS_EVENTS = {
  stepViewed: 'cancel_flow_step_viewed',
  ctaClicked: 'cancel_flow_cta_clicked',
} as const;

export type AnalyticsProps = Record<string, string | number | boolean | null>;
export type TrackFn = (event: string, props: AnalyticsProps) => void;

/** TODO: forward to the product analytics client (PostHog). */
export const defaultTrack: TrackFn = (event, props) => {
  if (import.meta.env.DEV) console.debug('[analytics]', event, props);
};

export function stepViewed(track: TrackFn, flow: Flow, screen: string, step: number | null) {
  track(ANALYTICS_EVENTS.stepViewed, { flow, screen, step });
}

export function ctaClicked(track: TrackFn, flow: Flow, screen: string, cta: string, extra: AnalyticsProps = {}) {
  track(ANALYTICS_EVENTS.ctaClicked, { flow, screen, cta, ...extra });
}
