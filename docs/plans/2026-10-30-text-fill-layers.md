# Text Fill Layers Implementation Plan

**Goal:** Complete the identified text-fill gaps while preserving the unified settings modal and isolated live preview.

**Architecture:** Introduce a validated fill-layer model with legacy migration, and a dedicated fill editor for layer visibility/order, solid/empty/original fills, multi-stop gradients and image placement. Render rich straight glyphs and curved glyphs through shared SVG fill composition so opacity affects fills independently of stroke and background. Persist declarative layers plus exportable SVG; commit draft changes in one undo transaction.

**Tech Stack:** TypeScript, native dialog, SVG, TinyMCE, Playwright.

1. Create `src/text-fill.ts`: model/read/write/validation, gradient and image paint servers, layered glyph composition. Extend `src/text-advanced.ts` and SVG schema in `src/editor.ts` for the new rendering and persisted SVG attributes.
2. Create `src/text-fill-editor.ts` and CSS: topmost-first layer list, add/delete/hide/reorder, solid color, true no-fill, gradient type/angle/center/radius, draggable color stops with alpha, image scale/offset/rotation/fit/repeat, local upload compression and errors.
3. Integrate editor drafts into `src/text-settings.ts`: deep-copy state, reset/cancel isolation, asynchronous image validation without stale applies, one-step undo, old documents preserved.
4. Add meaningful browser tests for composited pixels/alpha, gradient stops and radial geometry, image transform/pattern behavior, per-layer state persistence and undo, hollow strokes, editing/duplication/export, narrow screen layout and keyboard control. Adapt previous fill tests and run focused regressions plus production build.
