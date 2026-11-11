# RunSun English Website V2 — review deployment

This branch publishes the English redesign supplied in the November 11, 2026 ZIP. The Japanese site and main branch are unchanged.

## Included
- Homepage repositioned around NVIDIA GPU Cloud and Dedicated AI Factories.
- Current GPU cards, deployment options, Enterprise Sovereign AI and indicative pricing.
- Independent Vera Rubin architecture guide and future-capacity roadmap.
- Mobile pricing cards and slideshow pause controls.
- Existing image assets reused without changes.

## Deployment adjustments
- The original, unchanged CSS is retained as `site-en/style-base.css`; `site-en/style.css` imports it and adds the exact V2 overrides. This preserves the redesign while reusing the original Git object.
- Two contact links in the Rubin guide now point to `index.html#contact`.
- No dependency installation, build service, secrets or changes to the Japanese site are required.

## Internal review before production use
Confirm NVIDIA partner marks, actual GPU configurations, regional stock and delivery dates, pricing and contractual minimums, and available service features. The inquiry form composes an email; it is not a CRM submission. Approved privacy, security, SLA and data-processing terms should be published before the corporate production launch.

## Preview
The English entry point is `site-en/index.html`. The guide is `site-en/rubin-guide.html`.
