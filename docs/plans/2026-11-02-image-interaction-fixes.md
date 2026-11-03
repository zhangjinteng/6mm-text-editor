# Image interaction fixes implementation plan

**Goal:** Repair the four confirmed image interaction issues from the audit.
**Architecture:** Keep gesture previews in temporary styles, share image resize preferences between the settings panel and canvas handles, and retain image selection during custom pointer dragging. Preserve existing user changes.
**Tech Stack:** Vue 3, TypeScript, TinyMCE, Playwright.

1. Add failing pointer-interaction regressions in `tests/image-interaction-fixes.spec.ts`: effect alignment during drag/NW resize, unlocked aspect ratio and persistence, small-image shrinking, active sidebar tab throughout gestures.
2. In `src/live/drag.ts` and `src/object-selection.ts`, apply temporary translation to the associated effect layer without serializing the preview; prevent native image selection drift while custom dragging.
3. In `src/image-settings.ts` and `src/object-selection.ts`, persist keepRatio in image settings, respect it for corner resizing, and use the image input minimum (1 px) while retaining the danmaku minimum (32 px).
4. Run the new tests, image-selection/clipboard/configuration/effects/animation/rotation/crop tests and shared resize tests. Verify production build.
5. Re-run audit interaction probes against the repaired behavior and retain the original bug report as historical evidence.
