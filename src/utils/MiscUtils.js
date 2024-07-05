export const MOTION_SCALE_MIDPOINT = 90;
export const MOTION_SCALE_LOWPOINT = 40;
export const MOTION_SCALE_HIGHPOINT = 140;

/**
 * Scales a value from the range [0, 1] to an approximate range of [40, 100]
 * where 0.5 maps exactly to 70.
 *
 * @param {number} value - Input value between 0 and 1
 * @return {number} Scaled value
 */
export function scaleMotionScale(value, shotType) {
  // Set up coefficient based on shot type
  let coefficient = null;
  if (shotType === 'Close Up') {
    coefficient = 0.75;
  } else if (shotType === 'Medium Shot') {
    coefficient = 1.0;
  } else if (shotType === 'Wide Shot') {
    coefficient = 1.25;
  }

  // Ensure the input is between 0 and 1
  value = Math.max(0, Math.min(1, value));

  // Define our target points
  const midPoint = MOTION_SCALE_MIDPOINT;
  const lowPoint = MOTION_SCALE_LOWPOINT;
  const highPoint = MOTION_SCALE_HIGHPOINT;

  // Calculate the scaled value
  if (value <= 0.5) {
    // Scale from lowPoint to midPoint
    return Math.floor((lowPoint + (midPoint - lowPoint) * (value * 2)) * coefficient);
  } else {
    // Scale from midPoint to highPoint
    return Math.floor((midPoint + (highPoint - midPoint) * ((value - 0.5) * 2)) * coefficient);
  }
}

/**
 * Descales a value from the approximate range of [30, 125] back to the range [0, 1]
 * where 70 maps exactly to 0.5 for 'Medium Shot'.
 *
 * @param {number} scaledValue - Input value between 30 and 125
 * @param {string} shotType - The type of shot ('Close Up', 'Medium Shot', or 'Wide Shot')
 * @return {number} Descaled value between 0 and 1
 */
export function descaleMotionScale(scaledValue, shotType) {
  // Set up coefficient based on shot type
  let coefficient = 1.0;
  if (shotType === 'Close Up') {
    coefficient = 0.75;
  } else if (shotType === 'Medium Shot') {
    coefficient = 1.0;
  } else if (shotType === 'Wide Shot') {
    coefficient = 1.25;
  }

  // Remove the coefficient effect
  const uncoeffedValue = scaledValue / coefficient;

  // Define our target points
  const midPoint = MOTION_SCALE_MIDPOINT;
  const lowPoint = MOTION_SCALE_LOWPOINT;
  const highPoint = MOTION_SCALE_HIGHPOINT;

  // Descale the value
  if (uncoeffedValue <= midPoint) {
    // Descale from lowPoint to midPoint
    return Math.max(0, Math.min(0.5, (uncoeffedValue - lowPoint) / (2 * (midPoint - lowPoint))));
  } else {
    // Descale from midPoint to highPoint
    return Math.max(
      0.5,
      Math.min(1, 0.5 + (uncoeffedValue - midPoint) / (2 * (highPoint - midPoint))),
    );
  }
}
