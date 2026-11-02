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
export type AnimationName = keyof typeof textAnimations;

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
  css.replaceAll(`.${name}`, `[data-text-animation="${name}"]:not([data-text-draggable]), [data-text-animation="${name}"][data-text-draggable] > :is([data-text-source], [data-text-render], [data-text-background-render])`)).join('\n')}
/* The positioning box stays still while its source and generated layers animate together. */
[data-text-draggable][data-text-animation] > :is([data-text-source], [data-text-render], [data-text-background-render]) {
  --animate-duration: inherit;
  animation-duration: inherit;
  animation-iteration-count: inherit;
  animation-fill-mode: both;
}
@media print, (prefers-reduced-motion: reduce) {
  [data-text-animation], [data-text-draggable][data-text-animation] > :is([data-text-source], [data-text-render], [data-text-background-render]) { animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
}
`;

export interface TextAnimation { name: AnimationName | ''; duration: number; loop: boolean; total: number }
export const defaultAnimation: TextAnimation = { name: '', duration: 1, loop: false, total: 0 };
export function readAnimation(box: HTMLElement, kind: 'textAnimation' | 'imageAnimation' = 'textAnimation'): TextAnimation {
  const selector = kind === 'textAnimation' ? '[data-text-animation]' : '[data-image-animation]';
  const node = box.matches(selector) ? box : box.querySelector<HTMLElement>(selector);
  if (!node || !Object.hasOwn(textAnimations, node.dataset[kind] ?? '')) return { ...defaultAnimation };
  const duration = parseFloat(node.dataset.animationDuration || node.style.animationDuration || '1');
  const iterations = node.style.animationIterationCount;
  const total = Number(node.dataset.animationTotal ?? (iterations && iterations !== 'infinite' ? Number(iterations) * duration : 0));
  return { name: node.dataset[kind] as AnimationName, duration, loop: node.dataset.animationLoop === 'true' || (!node.dataset.animationLoop && (iterations === 'infinite' || Number(iterations) > 1)), total };
}
export function validateAnimation(value: TextAnimation): string {
  if (value.name && !Object.hasOwn(textAnimations, value.name)) return '请选择有效的动画效果。';
  if (!Number.isFinite(value.duration) || value.duration < .1 || value.duration > 60) return '每轮时长请输入 0.1—60 秒。';
  if (!Number.isFinite(value.total) || value.total < 0 || value.total > 3600) return '循环总时长请输入 0—3600 秒。';
  return '';
}
export function writeAnimation(box: HTMLElement, value: TextAnimation, kind: 'textAnimation' | 'imageAnimation' = 'textAnimation') {
  // Replace legacy inline animations without touching their rich text formatting.
  for (const node of [box, ...box.querySelectorAll<HTMLElement>(kind === 'textAnimation' ? '[data-text-animation]' : '[data-image-animation]')]) {
    for (const key of [kind, 'animationDuration', 'animationLoop', 'animationTotal']) delete node.dataset[key];
    for (const key of ['animation', 'animation-name', 'animation-duration', 'animation-iteration-count', 'animation-fill-mode']) node.style.removeProperty(key);
    node.removeAttribute('data-mce-style');
  }
  if (!value.name) return;
  Object.assign(box.dataset, { [kind]: value.name, animationDuration: `${value.duration}s`, animationLoop: String(value.loop), animationTotal: String(value.total) });
  box.style.animationDuration = `${value.duration}s`;
  box.style.animationIterationCount = value.loop ? (value.total > 0 ? String(value.total / value.duration) : 'infinite') : '1';
}
