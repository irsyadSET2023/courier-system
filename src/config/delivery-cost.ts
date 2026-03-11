export const deliveryCostConfig = {
  weightMultiplier: process.env.WEIGHT_MULTIPLIER
    ? parseFloat(process.env.WEIGHT_MULTIPLIER)
    : 10,
  distanceMultiplier: process.env.DISTANCE_MULTIPLIER
    ? parseFloat(process.env.DISTANCE_MULTIPLIER)
    : 5,
};
