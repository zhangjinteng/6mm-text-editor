import { readAnimation, writeAnimation, textAnimations, type TextAnimation } from './animations';

export const imageAnimationStyles = `
[data-image-animation] { --animate-duration: 1s; animation-duration: var(--animate-duration); animation-fill-mode: both; }
${Object.entries(textAnimations).map(([name, css]) => css
  .replaceAll(`@keyframes ${name}`, `@keyframes image-${name}`)
  .replaceAll(`animation-name: ${name}`, `animation-name: image-${name}`)
  .replaceAll(`.${name}`, `[data-image-animation="${name}"]`)
  .replaceAll('opacity: 1;', 'opacity: var(--image-animation-opacity, 1);')).join('\n')}
@media print, (prefers-reduced-motion: reduce) {
  [data-image-animation] { animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
}`;

export const readImageAnimation = (image: HTMLElement) => readAnimation(image, 'imageAnimation');
export const writeImageAnimation = (image: HTMLElement, value: TextAnimation) => writeAnimation(image, value, 'imageAnimation');

/** Measure the layout pose so animation does not change drag, resize or alignment coordinates. */
export function imageLayoutRect(image: HTMLElement): DOMRect {
  const animations = image.getAnimations().filter(animation =>
    'animationName' in animation && String(animation.animationName).startsWith('image-'));
  const states = animations.map(animation => ({ animation, time: animation.currentTime, start: animation.startTime, playing: animation.playState === 'running' }));
  try {
    for (const { animation } of states) animation.currentTime = 0;
    return image.getBoundingClientRect();
  } finally {
    for (const { animation, time, start, playing } of states) {
      if (playing && start !== null) animation.startTime = start;
      else animation.currentTime = time;
    }
  }
}

/** Keep the separately rendered contour/effects on the same animation timeline as the image. */
export function syncImageAnimation(image: HTMLElement, layer: HTMLElement) {
  const value = readImageAnimation(image);
  if (JSON.stringify(value) !== JSON.stringify(readImageAnimation(layer))) writeImageAnimation(layer, value);
  const opacity = image.style.getPropertyValue('--image-animation-opacity') || image.style.opacity || '1';
  if (layer.style.getPropertyValue('--image-animation-opacity') !== opacity) layer.style.setProperty('--image-animation-opacity', opacity);
  if (!value.name) return;
  const original = image.getAnimations().find(animation => 'animationName' in animation && animation.animationName === `image-${value.name}`);
  const mirror = layer.getAnimations().find(animation => 'animationName' in animation && animation.animationName === `image-${value.name}`);
  if (original && mirror && original.startTime !== null && mirror.startTime !== original.startTime) mirror.startTime = original.startTime;
}
