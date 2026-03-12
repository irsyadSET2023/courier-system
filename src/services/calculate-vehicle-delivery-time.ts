import type { CourierPackage, CourierPackageCombination } from "../interfaces";

export function calculateVehicleDeliveryTime(
  maxSpeed: number,
  courierPackagesCombinations: CourierPackageCombination,
): CourierPackage[] {
  const courierPackages = courierPackagesCombinations.combination;

  const sortedCourierPackages = sortCourierPackagesByWeight(courierPackages);

  let totalDeliveryTime = 0;

  const courierPackagesWithRespectiveDeliverTimes = sortedCourierPackages.map(
    (courierPackage) => {
      const deliveryTime = Math.round(courierPackage.distance / maxSpeed);
      totalDeliveryTime += deliveryTime;
      return {
        ...courierPackage,
        deliveryTime,
      };
    },
  );

  return courierPackagesWithRespectiveDeliverTimes;
}

function sortCourierPackagesByWeight(
  courierPackages: CourierPackage[],
): CourierPackage[] {
  return courierPackages.sort((a, b) => b.weight - a.weight);
}
