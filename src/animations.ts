import type { Editor } from 'tinymce';
import { selectionHasLockedText } from './text-box-state';
import { openAnimationPicker, type AnimationPlayback } from './animation-picker';
import license from 'animate.css/LICENSE?raw';
import bounce from 'animate.css/source/attention_seekers/bounce.css?raw';
import flash from 'animate.css/source/attention_seekers/flash.css?raw';
import pulse from 'animate.css/source/attention_seekers/pulse.css?raw';
import rubberBand from 'animate.css/source/attention_seekers/rubberBand.css?raw';
import shakeX from 'animate.css/source/attention_seekers/shakeX.css?raw';
import shakeY from 'animate.css/source/attention_seekers/shakeY.css?raw';
import headShake from 'animate.css/source/attention_seekers/headShake.css?raw';
import swing from 'animate.css/source/attention_seekers/swing.css?raw';
import tada from 'animate.css/source/attention_seekers/tada.css?raw';
import wobble from 'animate.css/source/attention_seekers/wobble.css?raw';
import jello from 'animate.css/source/attention_seekers/jello.css?raw';
import heartBeat from 'animate.css/source/attention_seekers/heartBeat.css?raw';

export const textAnimations = { bounce, flash, pulse, rubberBand, shakeX, shakeY, headShake, swing, tada, wobble, jello, heartBeat };
type AnimationName = keyof typeof textAnimations;

// Keep the official keyframes and per-effect timing, scoped to persisted text attributes.
export const animationStyles = `
/* ${license} */
[data-text-animation] {
  --animate-duration: 1s;
  display: inline-block;
  animation-duration: var(--animate-duration);
  animation-fill-mode: both;
}
${Object.entries(textAnimations).map(([name, css]) =>
  css.replaceAll(`.${name}`, `[data-text-animation="${name}"]`)).join('\n')}
@media print, (prefers-reduced-motion: reduce) {
  [data-text-animation] { animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
}
`;

export function registerTextAnimations(editor: Editor): void {
  let closePicker: (() => void) | undefined;
  let disposing = false;
  editor.on('remove', () => { disposing = true; closePicker?.(); });
  editor.on('init', () => {
    editor.formatter.register('textanimation', {
      inline: 'span',
      attributes: {
        'data-text-animation': '%value', 'data-animation-duration': '%duration',
        'data-animation-loop': '%loop', 'data-animation-total': '%total'
      },
      styles: { animationDuration: '%duration', animationIterationCount: '%iterations' },
      onmatch: (node: Node) => node.nodeType === 1 && (node as Element).hasAttribute('data-text-animation'),
      remove_similar: true
    });
  });

  editor.ui.registry.addButton('textanimation', {
    text: '动画', tooltip: '文字动画',
    onAction: () => {
      if (editor.mode.isReadOnly() || selectionHasLockedText(editor)) return;
      if (closePicker) { closePicker(); return; }
      const bookmark = editor.selection.getBookmark(2, true);
      const node = editor.dom.getParent(editor.selection.getNode(), '[data-text-animation]');
      const selected = node?.getAttribute('data-text-animation') as AnimationName | undefined;
      const playback: AnimationPlayback = {
        duration: parseFloat(node?.getAttribute('data-animation-duration') || '1'),
        loop: node?.getAttribute('data-animation-loop') === 'true',
        total: Number(node?.getAttribute('data-animation-total') || 0)
      };
      const anchor = editor.getContainer().ownerDocument.querySelector<HTMLElement>('.tox-pop [data-mce-name="textanimation"]');
      if (!anchor) return;
      closePicker = openAnimationPicker(anchor, Object.keys(textAnimations), selected, playback, (name, settings) => {
        if (editor.mode.isReadOnly() || selectionHasLockedText(editor)) return;
        editor.focus();
        editor.selection.moveToBookmark(bookmark);
        editor.undoManager.transact(() => {
          editor.formatter.remove('textanimation');
          if (name) editor.formatter.apply('textanimation', {
            value: name, duration: `${settings.duration}s`, loop: String(settings.loop), total: String(settings.total),
            iterations: settings.loop ? (settings.total > 0 ? String(settings.total / settings.duration) : 'infinite') : '1'
          });
        });
        for (const element of editor.getBody().querySelectorAll<HTMLElement>('[data-text-animation]')) {
          if (editor.selection.getRng().intersectsNode(element)) {
            element.getAnimations().forEach((animation) => { animation.cancel(); animation.play(); });
          }
        }
        editor.nodeChanged();
      }, (restoreFocus) => {
        closePicker = undefined;
        if (restoreFocus && !disposing && !editor.removed) {
          editor.focus();
          editor.selection.moveToBookmark(bookmark);
          editor.nodeChanged();
        }
      }, animationStyles);
    }
  });
}
