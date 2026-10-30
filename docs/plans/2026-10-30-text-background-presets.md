# Text Background Presets Implementation Plan

**Goal:** Complete the identified background gaps with a selectable shape library, independent geometry/opacity and retained visibility state inside the existing settings dialog and live preview.

**Architecture:** Persist a validated background declaration separately from generated SVG and original text layout. Render an absolute, noninteractive background layer behind the source/advanced glyph renderer, using measured DOM line rectangles for whole-box, per-line and joined-line backgrounds. Preserve legacy layout padding during migration. Add a dedicated preset/editor panel, one-step draft commit, cancellation/reset, and standalone export CSS.

**Tech Stack:** TypeScript, SVG, native dialog, TinyMCE, Playwright.

1. Add `src/text-background.ts`: model, presets, validation/migration, shared shape paths, line measurement, joined contour and background SVG rendering. Keep layout unchanged and preserve valid geometry while editor is hidden.
2. Add `src/text-background-editor.ts`: visual preset library with current selection, none/add/hide/delete, color/opacity, shape and line layout, independent X/Y expansion, radius, scale and offsets. Reuse dialog styling and keyboard navigation.
3. Integrate draft state and render lifecycle in text settings/advanced text. Export positioning styles, exclude generated backgrounds from text editing/resizing logic, and keep clear-format focused on source content.
4. Adapt background assertions and add browser tests for shape geometry/pixels, preset selection, independent expansion without rewrap, per-line/connected paths, visibility persistence, legacy migration, reset/cancel/undo, editing/resizing/duplication and static HTML export. Verify narrow layout and run focused regressions plus production build.
