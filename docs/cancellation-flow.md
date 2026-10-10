# Team Plan cancellation flow

`src/features/cancellation/CancellationModal.tsx` is a single modal opened from **Billing > Cancel**.
`firstOfferClaimed` selects the flow:

| Step | Flow A (`firstOfferClaimed={false}`) | Flow B (`firstOfferClaimed={true}`) |
| --- | --- | --- |
| 1 | Plan comparison | Plan comparison |
| 2 | First offer + usage counts | Alternatives (pause / lower plans) |
| 3 | Churn survey | Churn survey |
| 4 | Lifetime offer + pause / lower plans | Lifetime offer only |
| 5 | Cancelled | Cancelled |

The side screens are pause, lower plans and offer applied. A reactivated screen follows "Reactivate plan".

## Files

| File | What it holds |
| --- | --- |
| `cancelMachine.ts` | Pure reducer state machine. API results are events, so `cancelled` is only reachable after `cancelSubscription` resolves. |
| `copy.ts` | All copy. Values in `[BRACKETS]` are placeholders. |
| `billingService.ts` | Stubs with TODOs: `claimOffer`, `claimLifetimeOffer`, `pauseSubscription`, `downgradePlan`, `cancelSubscription`, `reactivate` (plus `exportData`). |
| `analytics.ts` | `cancel_flow_step_viewed` on every screen and `cancel_flow_cta_clicked` on every CTA. Each event carries `flow`, `screen` and `cta`. |
| `useFocusTrap.ts` | Tab cycling, Escape, and focus restored to the opener on close. |
| `defaults.ts` | Fallback data, including the usage counts from the current loss screen. |
| `components/` | `PlanComparisonCard`, `OfferCard`, `ChurnSurvey`, `PauseStep`, `LowerPlansStep`, `CancelledStep`, plus the shared `ui.tsx` and the simple steps in `FlowSteps.tsx`. |

The `onClose(outcome)` callback receives one of `kept | offer_claimed | lifetime_claimed | paused | downgraded | cancelled | reactivated`.
X, Escape, "Keep my Team Plan" and Back on step 1 always report `kept`.

## Figma -> token map

The repo had no `design-system.md` or token file, so `src/styles/tokens.css` holds only values that appear in the reference frames. No colours or fonts were added.
The only Figma variable defined is `New Gradient 1: #FFFFFF`.

| Figma value | Where in Figma | Token |
| --- | --- | --- |
| `#171717` | Text, primary button | `--bs-color-ink` |
| `#000000` | Secondary button border, banner text | `--bs-color-black` |
| `#FFFFFF` (`New Gradient 1`) | Modal, card | `--bs-color-white` |
| `#5F5F5C` | Free Plan values, ✕ | `--bs-color-text-secondary` |
| `#FF4433` (`#F43`) | Team Plan column, checks | `--bs-color-accent` |
| `rgb(255,45,23)` | Panel gradient end | `--bs-color-accent-strong` |
| `#FFE9E7` | Days-left banner | `--bs-color-banner-bg` |
| `#ECE7FE` | Comparison card border | `--bs-color-card-border` |
| `rgba(23,23,23,.2)` | Row dividers | `--bs-color-divider` |
| `rgba(23,23,23,.4)` | Back button border | `--bs-color-border-strong` |
| `rgba(23,23,23,.5)` | Close button border | `--bs-color-border-close` |
| `rgba(23,23,23,.4)` | Page overlay | `--bs-color-overlay` |
| Segoe UI | Shell, headings, buttons | `--bs-font-ui` |
| Inter | Comparison row labels | `--bs-font-table` |
| Manrope | ✕ glyphs | `--bs-font-symbol` |
| 6 / 4.8 / 8 / 12 / 16 / 20 / 26 px | Modal / panel / back / button / banner / card / close | `--bs-radius-*` |
| `0 10px 10px rgba(0,0,0,.2)` | Card drop shadow | `--bs-shadow-card` |
| Rectangle 3814 gradient | Right panel | `--bs-gradient-panel` |

## Accessibility decisions

- **Contrast.** `#F43` on white is 3.4:1, which fails 4.5:1 for the 14–16px bold "Team Plan" text. With product sign-off, the Team Plan header and values in the comparison card use ink (`#171717`, 17.9:1). The red check icons stay, since icons need only 3:1.
- `#8F8F8C` is in the card frame (an empty text layer) but is not used for any text (3.2:1).
- Text on the banner is black on `#FFE9E7` (18.1:1). Secondary text is `#5F5F5C` on white (6.4:1).
- The modal is `role="dialog"` + `aria-modal` and is labelled by the step title. Focus moves to the title on every screen change, is trapped while the modal is open, and returns to the opener afterwards.
- Every control shows a visible 2px ink focus ring. Reasons, likelihood, pause duration and plan pickers are native radio groups, so arrow keys work.

## Visual differences vs the Figma frames

Checked by screenshotting the build at 1440×1024 (Chromium) against nodes `1:3` and `1:254`.

1. **Step indicator.** "Step N of 5" sits at the right of the header row. It isn't in the frame; the brief requires it. Putting it in the header keeps the title at the frame's y-position.
2. **Body copy on step 1.** The text now ends "permanently deleted on [DELETION_DATE]." (real date, and the "After that ," typo is gone). It wraps to 3 lines instead of 2, so at 1024px the last comparison row scrolls under the sticky footer. The footer stays pinned and the body scrolls.
3. **Comparison card colour.** The Team Plan header and values are ink instead of `#F43` (the contrast fix above). Everything else in the card matches: rows, order, 48px rows, 50px header, 356/80/80 columns, 27px insets, 20px radius, `#ECE7FE` border.
4. **Check icon.** This is an inline SVG with the same 16×12 box and colour. The exported Figma vector couldn't be downloaded because figma.com is blocked from the build container. Swap in the exported asset when available.
5. **Fonts.** Segoe UI, Inter and Manrope are referenced but not bundled (no new font loading). The screenshots fell back to the Linux system sans, so glyph widths differ slightly. On Windows, Segoe UI matches.
6. **Footer button x-position.** Buttons align with the content column at x=212; the frame has them at x=220. Button height and radius match (42px, 12px). The gap is 12px.
7. **Button label.** "Continue Cancellation" is now "Continue cancellation", per the brief's label rules.
8. **Tinted panel.** It uses the exact gradient stops from the frame. Browsers render it white down to about 65% height, while Figma's render shows a faint tint from the top. Empty by default; pass `illustration` to fill it.
9. **Shadow.** The card shadow uses `box-shadow` with the same values instead of `filter: drop-shadow`, so the scroll container doesn't clip it.
10. **Responsive.** Below 900px the panel hides and the modal goes full-screen, single column. The frame only covers desktop.
11. **No frame in the new style.** The offer, survey, lifetime, pause, lower-plan, offer-applied and cancelled screens have no frame in the new style. They reuse the shell, banner, card, divider rows and buttons from the two reference frames, so design should review them.

## Placeholders still open

These stay as placeholders until billing or product fills them:
- `[FIRST_OFFER]`, `[LIFETIME_OFFER]`, `[PLAN_END_DATE]`, `[DELETION_DATE]`
- Exact offer price and term: `[FIRST_OFFER_PRICE]`, `[FIRST_OFFER_TERM]`, `[LIFETIME_OFFER_PRICE]`, `[LIFETIME_OFFER_TERM]`
- Standard plan price and limits: `[STANDARD_*]`

Pass real `Date`s for `planEndDate` and `deletionDate` and they render as "July 10, 2026". The pause resume date is always computed as a real date.

## Running

```bash
npm install
npm run dev        # demo billing page; ?open=1 opens the modal, &flow=B for Flow B
npm test           # state machine + modal tests
npm run typecheck
```

## Screenshots

`docs/screenshots/` holds Chromium renders at 1440×1024 (and 390×844 for `M1-comparison-mobile.png`):
`A*` are Flow A steps, `B*` are Flow B steps, and `S-*` are side screens.
