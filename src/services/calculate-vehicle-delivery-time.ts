import type {
  BatchDeliveryCourierPackage,
  CourierPackageCombination,
} from "../interfaces";

export function calculateVehicleDeliveryTime(
  maxSpeed: number,
  courierPackagesCombinations: CourierPackageCombination,
  initialVehicleDeliveryTime: number = 0,
): BatchDeliveryCourierPackage {
  const courierPackages = courierPackagesCombinations.combination;

  //   const sortedCourierPackages = sortCourierPackagesByWeight(courierPackages);

  const courierPackagesWithRespectiveDeliverTimes = courierPackages.map(
    (courierPackage) => {
      const courierPackageDeliveryTime =
        Math.floor((courierPackage.distance / maxSpeed) * 100) / 100;
      return {
        ...courierPackage,
        deliveryTime:
          Math.floor(
            (courierPackageDeliveryTime + initialVehicleDeliveryTime) * 100,
          ) / 100,
      };
    },
  );

  const higherPackageDeliveryTime = Math.max(
    ...courierPackagesWithRespectiveDeliverTimes.map(
      (courierPackage) => courierPackage.deliveryTime || 0,
    ),
  );

  //Going out and coming back to the warehouse, so multiply by 2
  const backAndForthDeliveryTime =
    Math.floor(higherPackageDeliveryTime * 2 * 100) / 100;

  return {
    courierPackages: courierPackagesWithRespectiveDeliverTimes,
    totalDeliveryTime:
      Math.floor(
        (backAndForthDeliveryTime + initialVehicleDeliveryTime) * 100,
      ) / 100,
  };
}

// function sortCourierPackagesByWeight(
//   courierPackages: CourierPackage[],
// ): CourierPackage[] {
//   return courierPackages.sort((a, b) => b.weight - a.weight);
// }
