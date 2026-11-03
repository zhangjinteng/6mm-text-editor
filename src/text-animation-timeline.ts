/** Preserve playback when generated text/background nodes are replaced. */
function animations(box: HTMLElement): Animation[] {
  const name = box.dataset.textAnimation;
  if (!name) return [];
  return ['data-text-source', 'data-text-render', 'data-text-background-render'].flatMap(attribute =>
    box.querySelector<HTMLElement>(`:scope > [${attribute}]`)?.getAnimations().filter(animation =>
      'animationName' in animation && animation.animationName === name) ?? []);
}

export function captureTextPlayback(box: HTMLElement) {
  const animation = animations(box)[0];
  if (!animation) return;
  const time = typeof animation.currentTime === 'number' ? animation.currentTime : 0;
  const now = box.ownerDocument.timeline.currentTime;
  return {
    name: box.dataset.textAnimation,
    paused: animation.playState === 'paused', time,
    start: typeof animation.startTime === 'number' ? animation.startTime : typeof now === 'number' ? now - time : null
  };
}

export function measureTextPlaybackAtRest(box: HTMLElement) {
  // Range measurements include CSS transforms. All supported attention
  // effects have their untransformed pose at time zero.
  for (const animation of animations(box)) animation.currentTime = 0;
}

export function restoreTextPlayback(box: HTMLElement, previous: ReturnType<typeof captureTextPlayback>) {
  const state = previous?.name === box.dataset.textAnimation ? previous : captureTextPlayback(box);
  if (!state) return;
  for (const animation of animations(box)) {
    if (state.paused) {
      if (animation.playState !== 'paused') animation.pause();
      if (animation.currentTime !== state.time) animation.currentTime = state.time;
    } else if (state.start !== null && animation.startTime !== state.start) {
      animation.startTime = state.start;
    }
  }
}
