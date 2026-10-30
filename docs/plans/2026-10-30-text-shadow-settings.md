# Text Shadow Settings Implementation Plan

**Goal:** Complete the identified basic-shadow interaction gaps while retaining the unified settings modal and isolated live preview.

**Architecture:** Add a validated persisted shadow declaration independent from its visible CSS, with migration from legacy text-shadow. A dedicated shadow editor supplies status/swatch/settings/visibility/delete/add, independent opacity, polar distance/angle controls, an accessible pointer direction dial, and synchronized optional X/Y controls. The same draft writes preview and document; existing CSS/SVG shadow rendering and atomic undo remain in use.

**Tech Stack:** TypeScript, native dialog, CSS/SVG, TinyMCE, Playwright.

1. Create `src/text-shadow.ts`: shadow model, color/alpha normalization, Cartesian/polar conversion, legacy read, validation, persisted write and CSS output.
2. Create `src/text-shadow-editor.ts` with status row, collapsible basic settings, opacity/distance/angle/blur, direction panel (pointer and keyboard), optional linked X/Y, add/delete and hide/restore semantics; extend the existing dialog CSS.
3. Integrate shadow drafts into `src/text-settings.ts`, including reset/disposal/validation; observe persisted metadata in `src/text-advanced.ts`. Keep existing rendering and serializer support.
4. Add browser tests for legacy migration, independent alpha and pixels, dial direction, numeric synchronization, invalid input, hide/save/reload/show, delete/add defaults, cancellation/reset/undo, curve/fill/duplicate/export and narrow layout. Adapt prior tests to the new UI. Run focused regressions and production build, inspect screenshots.
