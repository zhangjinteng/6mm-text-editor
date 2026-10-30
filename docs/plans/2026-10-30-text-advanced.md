# Advanced text implementation plan

Goal: persisted gradient/image text fills and adjustable upward/downward curved text, undoable and editable.

Architecture: keep original rich text in a data-text-source span. CSS background clipping renders ordinary filled text; a generated contenteditable=false SVG textPath sibling renders curved text. Original text/formatting remains editable when double clicking. Persist safe declarative attributes and static SVG so preview/HTML export need no script. Regenerate after input, formatting, resize, undo, duplication or restore; prevent generated UI from entering native character formatting scope.

1. Add safe SVG/paint renderer and accessible fill/curve dialogs with numeric/color/URL checks; embed local raster images and validate image load before apply. Apply once per undo transaction. Extend editor schema only for generated SVG element/attribute types.
2. Connect object toolbar, edit-mode switching, duplication ID rebuilding, formatting scope, resizing and shared export styles. Respect locks/read-only. Preserve source markup on disable.
3. Test gradient/image clipping, both curve directions, editable source, locked rejection, undo/redo, duplication IDs, resize, save/reload and static preview/export. Inspect screenshots and build.

Limit: curve layout is a single line using the first character's font/style (original rich styles and line breaks are retained for editing and ordinary text). Fill applies to the entire box. No arbitrary SVG uploads or scripts.
