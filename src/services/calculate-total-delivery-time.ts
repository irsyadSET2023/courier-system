import type {
  CourierPackage,
  CourierPackageCombination,
  DeliveryCapacity,
  VehicleDeliveryStatus,
} from "../interfaces";
import { calculateVehicleDeliveryTime } from "./calculate-vehicle-delivery-time";

export function calculateTotalDeliveryTime(
  deliveryCapacity: DeliveryCapacity | null,
  courierPackagesMaster: CourierPackage[],
) {
  const courierPackageCombinationsToBeDelivered = getMostSuitableCombination(
    deliveryCapacity!,
    courierPackagesMaster,
  );

  const vehicleDeliveriesStatus = distiributePackagesToVehicles(
    courierPackageCombinationsToBeDelivered,
    deliveryCapacity!,
  );
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
      deliveryCapacity!,
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

  const optimalCombination = mappedCombinations.find(
    (mappedCombination) =>
      mappedCombination.totalNumberOfPackages === maxPackages &&
      mappedCombination.totalWeight === maxWeight,
  )!;
  return optimalCombination;
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

function distiributePackagesToVehicles(
  courierPackageCombination: CourierPackageCombination,
  deliveryCapacity: DeliveryCapacity,
) {
  const totalNumberOfVehicles = deliveryCapacity.numberOfVehicles;
  const vehicleDeliveriesStatus = initializeVehicleDeliveriesStatus(
    totalNumberOfVehicles,
  );
  const courierPackages = courierPackageCombination.combination;

  vehicleDeliveriesStatus.forEach((vehicleDeliveryStatus) => {});
}

function vehicleSendPackages(
  courierPackageCombination: CourierPackageCombination,
  deliveryCapacity: DeliveryCapacity,
) {
  const vehicleDeliveryTime = calculateVehicleDeliveryTime(
    deliveryCapacity.maxSpeed,
    courierPackageCombination,
  );

  return vehicleDeliveryTime;
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
