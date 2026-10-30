# Halloween 2026 newsletter

Email-safe HTML for the Figma frame **Option 1** (`1480:1687`) in
*BlockSurvey – Inside Product Conversion designs*.

- 600px table layout with inline styles, so it works in Gmail, Outlook (including a VML button), and Apple Mail.
- Space Grotesk and Inter load from Google Fonts where the client supports web fonts. Other clients fall back to Arial.
- Collapses to full width on mobile (≤620px).

## Images to export from Figma

Put these files in `images/`, or upload them to your ESP/CDN and swap the `src` paths for absolute URLs. Email clients need absolute URLs.

| File                         | Figma node | Export settings |
|------------------------------|------------|-----------------|
| `images/header.jpg`          | `1480:1688` (header frame) | JPG, 2x (shown at 600×222) |
| `images/icon-x.png`          | `1480:1734` (Link - X) | PNG, 2x (shown at 38×38) |
| `images/icon-facebook.png`   | `1480:1737` (Link - Facebook) | PNG, 2x |
| `images/icon-linkedin.png`   | `1480:1740` (Link - LinkedIn) | PNG, 2x |
| `images/icon-youtube.png`    | `1480:1744` (Link - YouTube) | PNG, 2x |

The footer background is a CSS gradient on a solid `#1c1514` fallback. The 10% texture from the design is left out.

## Before sending

- Check the CTA link (`https://blocksurvey.io/pricing`) and the social profile URLs.
- Add your ESP's unsubscribe/footer merge tags if it doesn't insert them automatically.
