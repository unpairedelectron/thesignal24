---
name: awesome-design-md
description: Library of ~80 DESIGN.md design-system documents (tokens, typography, color, spacing, component rules) analyzed from well-known sites such as Stripe, Linear, Vercel, Apple, Notion, Figma and x.ai. Use when the user wants a UI to look or feel like a named site or brand, asks for a design system / DESIGN.md, or wants a consistent visual language for a page they are building.
---

# Awesome DESIGN.md

Source: https://github.com/VoltAgent/awesome-design-md (MIT, see `LICENSE`).

Each folder in `design-md/<site>/` holds a `DESIGN.md` (the design system the agent should follow)
and a `README.md` (short summary). List available sites with:

```bash
ls .claude/skills/awesome-design-md/design-md
```

## How to use

1. Pick the site whose design language matches the request (ask the user if it is unclear).
   Read `design-md/<site>/README.md` for a quick summary, then `design-md/<site>/DESIGN.md` in full.
2. If the user wants the system adopted for the project, copy that `DESIGN.md` to the project root
   (or the relevant app folder) so it stays the reference for later work.
3. Build the UI following the DESIGN.md: its color tokens, type scale, spacing, radii, elevation,
   component patterns and do/don't rules. Treat it as the design contract.
4. Use the design *language* only. Never copy a brand's logo, name, trademarks or proprietary
   assets, and never present the result as that company's site.
