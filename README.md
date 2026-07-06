# FAISAL — Digital Growth Architect Portfolio

> **Elevating Your Brand: Expert SEO, WordPress Web Design and Creative Graphics**

A premium, dark-themed portfolio website for FAISAL (@metamehar) — a Pakistan-based Digital Growth Architect with 5+ years of experience in SEO, WordPress web design, Canva design, and brand identity. Serves clients worldwide in 5 languages: English, German, Urdu, Spanish, and French.

![FAISAL Portfolio](https://img.shields.io/badge/FAISAL-Digital%20Growth%20Architect-f85d80?style=for-the-badge)

---

## Features

### Core Pages
- **Home** — Hero slider, about section, services grid, portfolio teaser, stats, testimonials, blog teaser, cost calculator CTA
- **About** — Bio, core principles, languages & reach section
- **Portfolio** — 5 case studies with filterable categories (WordPress / SEO & Brand)
- **Blog** — 8 articles with live search and category filtering (Design / WordPress / SEO)
- **Contact** — Contact form, Pakistan location map, social links

### Premium Enhancements
- **AI Brand Concierge ("Mehar")** — A Siri-style glowing orb launcher that opens a glassmorphic chat panel. Powered by an LLM with a comprehensive system prompt encoding FAISAL's services, portfolio, and brand voice. Every response includes a "Pro Tip" callout.
- **Live Project Cost Calculator** — A premium modal that uses an LLM to generate market-aware cost estimates based on 2026 freelance and agency rates across 7 regions (Pakistan, India, US, EU, UK, GCC, Global). Returns price range, breakdown, timeline, and live market trends.
- **Real-time Visitor Counter** — An honest social proof badge that only shows when 2+ real visitors are browsing the site (no fake numbers).
- **Reading Progress Bar** — A gradient bar at the top of the viewport that fills as you scroll.
- **Premium Mobile Bottom Navigation** — A transparent glassmorphic floating nav bar replacing the hamburger menu on mobile (Home / Work / About / Blog / Talk).
- **Mouse-tracking Glow** — Service cards have a radial gradient that follows the cursor.
- **Scroll Reveal Animations** — Sections fade in as you scroll into view.
- **Responsive Design** — Fully optimized for mobile (375px), tablet, and desktop (1440px+).

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no framework needed for the static site)
- **Backend**: Next.js 16 (App Router) with TypeScript — used for the AI assistant and cost calculator API routes
- **AI**: LLM-powered chat and cost estimation (works with any OpenAI-compatible API endpoint)
- **Styling**: Custom CSS with CSS custom properties (no Tailwind on the static site)
- **Fonts**: Inter (system fallback: Segoe UI, Arial)

---

## Project Structure

```
├── public/                     # Static website files (the actual portfolio)
│   ├── index.html              # Home page
│   ├── about.html              # About page
│   ├── portfolio.html          # Portfolio page
│   ├── blog.html               # Blog page
│   ├── contact.html            # Contact page
│   ├── styles.css              # Main stylesheet (2330 lines)
│   ├── main.js                 # Main JavaScript (slider, filters, forms, card clicks)
│   ├── assistant.css           # AI assistant widget styles (Siri orb + glassmorphic panel)
│   ├── assistant.js            # AI assistant widget logic
│   ├── calculator.css          # Cost calculator modal styles
│   ├── calculator.js           # Cost calculator modal logic
│   ├── bottom-nav.css          # Mobile bottom navigation styles
│   ├── bottom-nav.js           # Mobile bottom navigation logic
│   ├── premium-extras.css      # Progress bar + social proof badge styles
│   └── premium-extras.js       # Progress bar + real visitor counter logic
│
├── src/
│   └── app/
│       ├── page.tsx            # Redirects / to /index.html
│       └── api/
│           ├── chat/route.ts           # AI assistant backend (LLM with Pro Tip)
│           ├── estimate-cost/route.ts  # Cost calculator backend (LLM with market data)
│           └── visitors/route.ts       # Real-time visitor counter
│
├── package.json                # Next.js project config
├── next.config.ts              # Next.js configuration
└── README.md                   # This file
```

---

## Getting Started

### Option 1: Run the full Next.js app (with AI assistant + calculator)

```bash
# 1. Install dependencies
bun install  # or npm install

# 2. Start the dev server
bun run dev  # or npm run dev

# 3. Open http://localhost:3000
```

**Note on AI features**: The AI assistant ("Mehar") and cost calculator are powered by an LLM. In development they work out of the box; for production deployment, configure your API credentials via environment variables. Without valid credentials, the assistant shows a friendly error message but the rest of the site works normally.

### Option 2: Host the static site only (no backend)

The static files in `public/` can be hosted on any static host (GitHub Pages, Netlify, Vercel, etc.). Note that without the Next.js backend, the AI assistant and cost calculator will show friendly error messages instead of working responses.

---

## Services Offered

1. **SEO & Digital Marketing** — Technical SEO, on-page optimization, keyword strategy, link-building
2. **WordPress Web Design** — Fast, secure, conversion-focused WordPress sites with Elementor and custom themes
3. **Brand Identity Systems** — Logos, color palettes, typography, and visual guidelines
4. **Canva Graphic Design** — Social media posts, ad creatives, presentations, marketing collateral

---

## Contact

- **Website**: [metamehar portfolio](https://github.com/metamehar/portfolio)
- **Email**: hello@metamehar.com
- **Phone**: +92 300 000 0000
- **Location**: Pakistan (remote, serving clients worldwide)
- **Languages**: English, German, Urdu, Spanish, French

---

## License

© 2026 FAISAL (@metamehar). All rights reserved.

This is a personal portfolio website. The code is shared for reference and portfolio purposes. Please don't reuse the design, copy, or branding without permission.
