# Text typography implementation plan

Goal: apply character formatting to whole selected objects, selected characters, or subsequent typed text according to mode. Add alignment, line height and letter spacing to the text toolbar while retaining native colors/highlight.

1. Add typography controller before existing format handlers. Expand object selection for native character commands; restore collapsed object selection after command. Apply box alignment and line height directly to the box so adjacent paragraphs and position are unchanged.
2. Register layout controls and bounded custom spacing/line-height dialogs with bookmarks, readonly guards and undo transactions. Use native formatters for partial character spacing.
3. Integrate layout group into object and selection context toolbars. Test native toolbar colors, fonts, toggles, partial ranges, caret typing, layout geometry, undo/redo and persisted export.
4. Build and run typography and text-interaction regressions. No remote push in this task.
