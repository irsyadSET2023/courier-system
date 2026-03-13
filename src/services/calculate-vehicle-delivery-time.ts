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
        Math.round((courierPackage.distance / maxSpeed) * 100) / 100;
      return {
        ...courierPackage,
        deliveryTime: courierPackageDeliveryTime + initialVehicleDeliveryTime,
      };
    },
  );

  const higherPackageDeliveryTime = Math.max(
    ...courierPackagesWithRespectiveDeliverTimes.map(
      (courierPackage) => courierPackage.deliveryTime || 0,
    ),
  );

  //Going out and coming back to the warehouse, so multiply by 2
  const backAndForthDeliveryTime = higherPackageDeliveryTime * 2;

  return {
    courierPackages: courierPackagesWithRespectiveDeliverTimes,
    totalDeliveryTime: backAndForthDeliveryTime + initialVehicleDeliveryTime,
  };
}

// function sortCourierPackagesByWeight(
//   courierPackages: CourierPackage[],
// ): CourierPackage[] {
//   return courierPackages.sort((a, b) => b.weight - a.weight);
// }
