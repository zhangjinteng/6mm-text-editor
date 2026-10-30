# Text box interactions implementation plan

Goal: separate text object selection from native content editing, with direct movement and six resize handles.

Architecture: an editor-local controller handles pointer and keyboard events before the existing image/danmaku controllers. Existing data-text-draggable wrappers remain the persisted model. Plain text paragraphs/headings are wrapped on first selection; lists/tables remain native. UI and gesture previews live outside serialized content. Commit each gesture as one undo transaction.

1. Implement src/text-box-interactions.ts: selected/editing states, pointer threshold, cancellation, resize preview and commit, lifecycle cleanup. Preserve native input/selection during editing and IME composition.
2. Integrate with text-dragging registration; remove the old text move handle from live dragging while preserving image/danmaku gestures. Add text style controls for collapsed object selection.
3. Add Playwright coverage for single/double click, drag versus text selection, Escape, corner/side handles, cancel, undo/redo and save/reload. Run type checks and relevant existing object tests.
4. Document interaction scope and limitations. Do not push or change remote repositories as part of this request.
