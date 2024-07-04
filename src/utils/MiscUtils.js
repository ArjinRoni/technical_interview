/**
 * Scales a value from the range [0, 1] to an approximate range of [80, 160]
 * where 0.5 maps exactly to 127.
 *
 * @param {number} value - Input value between 0 and 1
 * @return {number} Scaled value
 */
export function scaleMotionScale(value) {
  // Ensure the input is between 0 and 1
  value = Math.max(0, Math.min(1, value));

  // Define our target points
  const midPoint = 127;
  const lowPoint = 80;
  const highPoint = 160;

  // Calculate the scaled value
  if (value <= 0.5) {
    // Scale from lowPoint to midPoint
    return lowPoint + (midPoint - lowPoint) * (value * 2);
  } else {
    // Scale from midPoint to highPoint
    return midPoint + (highPoint - midPoint) * ((value - 0.5) * 2);
  }
}
