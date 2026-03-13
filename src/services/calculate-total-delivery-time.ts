import type {
  CourierPackage,
  CourierPackageCombination,
  DeliveryCapacity,
  VehicleDeliveryStatus,
} from "../interfaces";
import { deliveryCostConfig } from "../config/delivery-time";
import { calculateVehicleDeliveryTime } from "./calculate-vehicle-delivery-time";

export function calculateTotalDeliveryTime(
  deliveryCapacity: DeliveryCapacity,
  courierPackagesMaster: CourierPackage[],
): CourierPackage[] {
  const courierPackageWithDeliveryTime =
    calculateEveryCourierPackageDeliveryTime(
      deliveryCapacity!,
      courierPackagesMaster,
    );

  return courierPackageWithDeliveryTime;
}

function getMostSuitableCombination(
  deliveryCapacity: DeliveryCapacity,
  courierPackagesMaster: CourierPackage[],
): CourierPackageCombination {
  const possibleDeliveryPackageCombinations =
    generatePossibleDeliveryPackageCombinations(courierPackagesMaster);

  const mappedDeliveryPackageCombinations = mapDeliveryPackageCombinations(
    possibleDeliveryPackageCombinations,
  );

  const filteredDeliveryPackageCombinations =
    removeCombinationsExceedingCapacity(
      mappedDeliveryPackageCombinations,
      deliveryCapacity,
    );

  const optimalCombination = getOptimalCombination(
    filteredDeliveryPackageCombinations,
  );

  return optimalCombination;
}

function generatePossibleDeliveryPackageCombinations(
  courierPackages: CourierPackage[],
): CourierPackage[][] {
  const results: CourierPackage[][] = [];

  function combine(start: number, courierPackage: CourierPackage[]) {
    if (courierPackage.length > 0) results.push([...courierPackage]);

    for (let i = start; i < courierPackages.length; i++) {
      const pkg = courierPackages[i];
      if (!pkg) continue;

      courierPackage.push(pkg);
      combine(i + 1, courierPackage);
      courierPackage.pop();
    }
  }

  combine(0, []);

  return results.sort((a, b) => a.length - b.length);
}

function mapDeliveryPackageCombinations(
  courierPackageCombinations: CourierPackage[][],
): CourierPackageCombination[] {
  return courierPackageCombinations.map((courierPackageCombination) => {
    const totalWeight = courierPackageCombination.reduce(
      (sum, pkg) => sum + pkg.weight,
      0,
    );
    const totalNumberOfPackages = courierPackageCombination.length;
    return {
      combination: courierPackageCombination,
      totalWeight,
      totalNumberOfPackages,
    };
  });
}

function removeCombinationsExceedingCapacity(
  mappedCombinations: CourierPackageCombination[],
  deliveryCapacity: DeliveryCapacity,
): CourierPackageCombination[] {
  return mappedCombinations.filter(
    (mappedCombination) =>
      mappedCombination.totalNumberOfPackages <=
        deliveryCapacity.numberOfVehicles &&
      mappedCombination.totalWeight <= deliveryCapacity.maxCarryWeight,
  );
}

function getOptimalCombination(
  mappedCombinations: CourierPackageCombination[],
): CourierPackageCombination {
  const maxPackages = getHighestNumberOfPackagesPerDelivery(mappedCombinations);
  const maxWeight = getHighestWeightPerDelivery(mappedCombinations);

  const optimalCombinations = mappedCombinations.filter(
    (mappedCombination) =>
      mappedCombination.totalNumberOfPackages === maxPackages &&
      mappedCombination.totalWeight === maxWeight,
  );

  if (optimalCombinations.length === 1) {
    return optimalCombinations[0]!;
  }

  return resolveOptimalCombinationTie(optimalCombinations);
}

export function resolveOptimalCombinationTie(
  tiedCombinations: CourierPackageCombination[],
): CourierPackageCombination {
  const preferShorter =
    deliveryCostConfig.preferShorterDistance === true ||
    deliveryCostConfig.preferShorterDistance === "true";

  const sorted = [...tiedCombinations].sort((a, b) => {
    const distanceA = a.combination.reduce((sum, pkg) => sum + pkg.distance, 0);
    const distanceB = b.combination.reduce((sum, pkg) => sum + pkg.distance, 0);
    return preferShorter ? distanceA - distanceB : distanceB - distanceA;
  });

  return sorted[0]!;
}

function getHighestNumberOfPackagesPerDelivery(
  mappedCombinations: CourierPackageCombination[],
): number {
  return Math.max(
    ...mappedCombinations.map(
      (mappedCombination) => mappedCombination.totalNumberOfPackages,
    ),
  );
}

function getHighestWeightPerDelivery(
  mappedCombinations: CourierPackageCombination[],
): number {
  return Math.max(
    ...mappedCombinations.map(
      (mappedCombination) => mappedCombination.totalWeight,
    ),
  );
}

function calculateEveryCourierPackageDeliveryTime(
  deliveryCapacity: DeliveryCapacity,
  courierPackageMaster: CourierPackage[],
) {
  const totalNumberOfVehicles = deliveryCapacity.numberOfVehicles;
  const vehicleDeliveriesStatus = initializeVehicleDeliveriesStatus(
    totalNumberOfVehicles,
  );

  const courierPackagesWithDeliveryTime = [];

  while (courierPackageMaster.length > 0) {
    const courierPackageCombination = getMostSuitableCombination(
      deliveryCapacity,
      courierPackageMaster,
    );

    const vehicleForNextDelivery = getVehicleForNextDelivery(
      vehicleDeliveriesStatus,
    );

    const courierPackagesWithTotalDeliveryTime = calculateVehicleDeliveryTime(
      deliveryCapacity.maxSpeed,
      courierPackageCombination,
      vehicleForNextDelivery.totalDeliveryTime,
    );

    courierPackagesWithTotalDeliveryTime.totalDeliveryTime =
      Math.floor(
        (courierPackagesWithTotalDeliveryTime.totalDeliveryTime +
          vehicleForNextDelivery.totalDeliveryTime) *
          100,
      ) / 100;

    vehicleForNextDelivery.courierPackages =
      courierPackagesWithTotalDeliveryTime.courierPackages;

    vehicleForNextDelivery.totalDeliveryTime =
      courierPackagesWithTotalDeliveryTime.totalDeliveryTime;

    removeDeliveredPackagesFromMaster(
      courierPackageMaster,
      courierPackageCombination.combination,
    );

    courierPackagesWithDeliveryTime.push(
      ...courierPackagesWithTotalDeliveryTime.courierPackages,
    );
  }

  return courierPackagesWithDeliveryTime;
}

function initializeVehicleDeliveriesStatus(
  numberOfVehicles: number,
): VehicleDeliveryStatus[] {
  const vehicleDeliveriesStatus = [];

  for (let i = 0; i < numberOfVehicles; i++) {
    vehicleDeliveriesStatus.push({
      vehicleIndex: i + 1,
      totalDeliveryTime: 0,
      courierPackages: null,
    });
  }

  return vehicleDeliveriesStatus;
}

function getVehicleForNextDelivery(
  vehicleDeliveriesStatus: VehicleDeliveryStatus[],
): VehicleDeliveryStatus {
  const vehicleWithShortestDeliveryTime = vehicleDeliveriesStatus.reduce(
    (shortest, vehicleDeliveryStatus) => {
      if (
        vehicleDeliveryStatus.totalDeliveryTime < shortest!.totalDeliveryTime
      ) {
        return vehicleDeliveryStatus;
      }
      return shortest;
    },
    vehicleDeliveriesStatus[0],
  );

  return vehicleWithShortestDeliveryTime!;
}

function removeDeliveredPackagesFromMaster(
  courierPackageMaster: CourierPackage[],
  deliveredPackages: CourierPackage[],
) {
  deliveredPackages.forEach((deliveredPackage) => {
    const index = courierPackageMaster.findIndex(
      (pkg) => pkg.name === deliveredPackage.name,
    );
    if (index !== -1) {
      courierPackageMaster.splice(index, 1);
    }
  });
}
