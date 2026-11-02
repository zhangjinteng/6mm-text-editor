/** Project pointer movement onto the original corner diagonal, keeping scale continuous.
 * Choosing a new dominant axis on each event makes wide/tall objects jump at the crossover.
 * dx/dy must be in the object's unrotated coordinate system.
 */
export function cornerResizeScale(width: number, height: number, dx: number, dy: number, corner: string, minimum: number): number {
  const x = corner.includes('w') ? -dx : dx;
  const y = corner.includes('n') ? -dy : dy;
  return Math.max(minimum, 1 + (x * width + y * height) / (width * width + height * height));
}
