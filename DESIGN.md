# Design System Document: The Scholarly Minimalist

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is a rejection of the "Default Web." It moves away from the sterile, blue-tinted whites of modern SaaS and toward the tactile, enduring warmth of a private library. 

**The Creative North Star: The Digital Curator.**
Our goal is to treat every screen as a curated editorial layout. We prioritize the "pause" between elements as much as the elements themselves. By utilizing a zero-radius philosophy and an absolute rejection of traditional drop shadows, we create a space that feels authoritative yet serene. We break the rigid grid through **intentional asymmetry**: large display type should often be offset, and secondary information should sit in expansive "margins," mimicking the footnotes of a high-end academic journal.

---

## 2. Colors & Surface Architecture
The palette is rooted in organic, mineral tones. It is designed to be high-contrast for legibility but low-fatigue for deep focus.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. To define a new area, use a background shift. A side rail should not be "bordered off"; it should simply exist as a `surface-container-low` block against the `surface` background.

### Surface Hierarchy & Nesting
Depth is achieved through "Tonal Stacking," not elevation.
- **Surface (`#fffbff`):** The base canvas.
- **Surface-Container-Low (`#fef9e9`):** Use for subtle content grouping or secondary sidebars.
- **Surface-Container-High (`#f2eed7`):** Use for active states or "pop-over" elements that need to feel physically closer to the eye.
- **Surface-Container-Highest (`#ede9ce`):** The most prominent grouping level, reserved for critical focal points.

### Signature Textures
While the system is minimalist, it is not "flat." Use a subtle linear gradient on main CTAs: transitioning from `primary` (#5f5e5e) to `primary-dim` (#535252) at a 155-degree angle. This provides a microscopic sense of "ink density" that flat hex codes lack.

---

## 3. Typography: The Editorial Voice
Typography is our primary vehicle for brand expression. We pair the intellectual weight of a Serif with the surgical precision of a Sans-Serif.

- **The Serif (Newsreader):** Used for all `Display`, `Headline`, and `Title-LG` roles. It conveys the "Zen-like, academic" personality. Headlines should use generous tracking-tight (-0.02em) to feel like printed ink.
- **The Sans-Serif (Inter):** Used for `Body`, `Label`, and functional UI components. It provides clarity and a modern counter-balance to the heritage of the serif.

**Hierarchy Strategy:** 
Use `display-lg` (3.5rem) sparingly to anchor a page. Force a "typographic tension" by placing a small `label-md` (All Caps, 0.05em tracking) immediately above a large headline.

---

## 4. Elevation & Depth: The Layering Principle
We do not use light and shadow; we use density and transparency.

- **Tonal Layering:** To create a "card," do not add a shadow. Instead, change the background color to `surface-container-lowest` (#ffffff). The contrast against the parchment `surface` creates a natural, soft lift.
- **Glassmorphism & Depth:** For floating navigation or context menus, use a `surface` color with 80% opacity and a `backdrop-filter: blur(20px)`. This allows the "parchment" to glow through the element, making the UI feel like a single cohesive object rather than disconnected layers.
- **The Ghost Border:** If a boundary is functionally required (e.g., a search input), use the `outline-variant` (#bdbaa1) at 20% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary:** Background `primary` (#5f5e5e), text `on-primary` (#faf7f6). Rectangular (0px radius).
- **Secondary:** Background `transparent`, border 1px `outline` (#84816a) at 40% opacity.
- **Tertiary:** Text-only, `primary` color, with a 1px underline that appears only on hover.

### Input Fields
- **Styling:** No background. A single 1px bottom border using `outline-variant`. 
- **States:** On focus, the bottom border transitions to `primary` (#5f5e5e). Labels use `label-md` and sit 8px above the input line.

### Cards & Lists
- **Rule:** Forbid divider lines. 
- **Execution:** Use 32px or 48px of vertical whitespace to separate list items. If items must be grouped, use a subtle background shift to `surface-container-low`.

### Chips
- **Styling:** Rectangular, `surface-container-high` background, `body-sm` typography. No borders.
- **Selection:** Active chips swap to `primary` background with `on-primary` text.

### Tooltips
- **Styling:** `inverse-surface` (#0f0e08) background with `inverse-on-surface` (#a09d92) text. 0px border radius. These should feel like "ink blocks" on the page.

---

## 6. Do's and Don'ts

### Do:
- **Embrace Asymmetry:** Align a headline to the left but push the body text 1/3 to the right to create "negative air."
- **Use "Ink" Logic:** Treat the `Carbon Ink` (#1A1A1A) as your heaviest element. Use it only for primary reading paths.
- **Respect the 0px Radius:** Every corner must be sharp. This reinforces the "academic" and "structured" personality.

### Don't:
- **Don't use Rounded Corners:** Even a 2px radius breaks the architectural intent of this system.
- **Don't use Standard Shadows:** If you feel an element needs a shadow, it actually needs more whitespace or a subtle background color shift.
- **Don't Crowded the Page:** If you are unsure if there is enough whitespace, double it. The "Zen-like" quality comes from the emptiness.
- **Don't use Pure Black:** Always use `Carbon Ink` (#1A1A1A) to maintain the warmth of the parchment-and-ink relationship.