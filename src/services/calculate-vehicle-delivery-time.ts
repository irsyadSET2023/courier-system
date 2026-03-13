import type {
  BatchDeliveryCourierPackage,
  CourierPackage,
  CourierPackageCombination,
} from "../interfaces";

export function calculateVehicleDeliveryTime(
  maxSpeed: number,
  courierPackagesCombinations: CourierPackageCombination,
): BatchDeliveryCourierPackage {
  const courierPackages = courierPackagesCombinations.combination;

  //   const sortedCourierPackages = sortCourierPackagesByWeight(courierPackages);

  const courierPackagesWithRespectiveDeliverTimes = courierPackages.map(
    (courierPackage) => {
      const courierPackageDeliveryTime = Math.round(
        courierPackage.distance / maxSpeed,
      );
      return {
        ...courierPackage,
        deliveryTime: courierPackageDeliveryTime,
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
    totalDeliveryTime: backAndForthDeliveryTime,
  };
}

// function sortCourierPackagesByWeight(
//   courierPackages: CourierPackage[],
// ): CourierPackage[] {
//   return courierPackages.sort((a, b) => b.weight - a.weight);
// }
