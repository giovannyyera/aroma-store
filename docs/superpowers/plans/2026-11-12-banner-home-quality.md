# Home Banner Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the low-resolution, excessively cropped home banner with a sharp high-resolution asset and responsive, undistorted rendering.

**Architecture:** A dedicated image element will fill the existing hero container behind the overlay, using proportional `object-fit: cover` rendering and breakpoint-specific focal positions. A new high-resolution image derived from the existing photograph removes the 687 px source-resolution bottleneck while preserving the current visual identity.

**Tech Stack:** Angular 22 templates, component CSS, responsive HTML image rendering, raster image asset

**Spec:** `docs/superpowers/specs/2026-11-12-banner-home-quality-design.md`

## Global Constraints

- Preserve the current photograph's appearance and composition.
- Do not change banner copy, colors, typography, navigation, or other page images.
- Never distort the image.
- Maintain readable, non-overflowing content on desktop, tablet, and mobile.

## Review Focus

- Full HD desktop: source resolution must be sufficient and the image must not appear pixelated.
- Ultrawide desktop: crop must remain intentional without stretching.
- Tablet: products and overlaid copy must remain visible.
- Narrow mobile: content must not overflow and the focal point must stay useful.
- Slow image load: the overlay and page layout must retain stable dimensions.

---

### Task 1: High-resolution responsive hero

**Files:**
- Create: `frontend/public/banner-hero.png`
- Modify: `frontend/src/app/pages/home/home.html:91-114`
- Modify: `frontend/src/app/pages/home/home.css:269-438`

**Interfaces:**
- Consumes: existing `frontend/public/banner.png` reference photograph and `.home-hero`/`.hero-overlay` structure
- Produces: `.hero-image` decorative image layer and responsive hero layout

- [ ] **Step 1: Capture the failing asset-size check**

Run a read-only image-dimension check against `frontend/public/banner.png` and confirm its width is `687`, below the `1920` desktop target.

- [ ] **Step 2: Create the replacement asset**

Generate `frontend/public/banner-hero.png` from the existing photograph at a minimum width of `1920` px, preserving the products, hands, wood surface, colors, and photographic character without adding or changing brand text.

- [ ] **Step 3: Verify the replacement asset**

Run the image-dimension check against `frontend/public/banner-hero.png`.

Expected: width is at least `1920` px, height is proportional, and the file opens successfully.

- [ ] **Step 4: Add the responsive image layer**

In `home.html`, remove the inline `background-image`; add `<img class="hero-image" src="banner-hero.png" alt="" aria-hidden="true" fetchpriority="high">` as the first child of `.home-hero`.

- [ ] **Step 5: Apply proportional responsive styling**

In `home.css`, keep `.home-hero` as the positioned clipping container; set `.hero-image` to absolute full coverage with `width/height: 100%`, `object-fit: cover`, and breakpoint-specific `object-position`; keep `.hero-overlay` positioned above it. Use a fluid hero height bounded by the existing desktop/tablet/mobile minimums so layout does not jump or distort.

- [ ] **Step 6: Add static regression assertions**

Check that the template has no inline `background-image`, the image has empty alternative text plus `aria-hidden`, and CSS contains `object-fit: cover` without image transforms or fixed pixel width.

- [ ] **Step 7: Build and visually inspect**

Run: `npm run build` from `frontend`

Expected: Angular build exits successfully. Inspect desktop, tablet, and mobile viewport screenshots for sharpness, crop, stable layout, readable text, and no overflow.

- [ ] **Step 8: Commit**

```bash
git add frontend/public/banner-hero.png frontend/src/app/pages/home/home.html frontend/src/app/pages/home/home.css
git commit -m "fix: improve responsive home banner quality"
```
