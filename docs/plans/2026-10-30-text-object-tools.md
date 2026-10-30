# Text object tools implementation plan

Goal: add duplicate, persisted lock, layers and object-level opacity/background/stroke/shadow controls without disturbing character formatting.

1. Share selected text object state with toolbar commands. Add persistent data-text-locked and contenteditable=false. Gate pointer gestures, typing/cut/paste/drop, formatting and layer commands; keep selection, copy, undo/redo and unlock available.
2. Add duplicate with unique IDs removed, inherited text/format preserved, fixed offset and one undo entry. Reuse the single existing layersettings menu.
3. Add native accessible tabbed appearance dialog. Validate bounded numeric values and colors before writing; apply only changed sections. Preserve position/width; scope effects to the box and retain preview/export CSS.
4. Test lock/unlock after reload, duplicate isolation, each appearance setting, cancel/invalid values, undo/redo, layer order and preview. Run typography/interaction regressions and build. Do not push.
