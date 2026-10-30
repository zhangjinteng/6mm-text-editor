# Unified Text Settings Implementation Plan

**Goal:** Merge appearance, fill and curve into one text settings dialog with a live preview and a direct text toolbar button.

**Architecture:** Add a native modal matching image settings, with three tabs and an isolated preview frame. Reuse the existing advanced text renderer and persisted CSS/data attributes. Keep a local draft; apply changed effects together in one undo transaction. Existing effect button registrations open the matching tab of the same modal.

**Tech Stack:** TypeScript, TinyMCE, CSS, Playwright.

1. Extract effect read/apply logic into `src/text-settings.ts`; create a responsive preview dialog and tab keyboard navigation. Validate numbers, colors and image URLs; preserve texture compression.
2. Remove the three old dialogs from `src/text-object-tools.ts` and `src/text-advanced.ts`. Add `textsettings` to both text toolbars, and simplify the object group to copy/lock.
3. Add browser coverage for draft isolation, combined apply/undo, reopen/reset/cancel, image fill, locking and narrow screens. Migrate existing effect tests to the unified dialog.
4. Run TypeScript/build and focused browser regressions; inspect desktop and narrow screen screenshots.
