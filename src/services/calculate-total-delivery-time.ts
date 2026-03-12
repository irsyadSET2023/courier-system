import type {
  CourierPackage,
  CourierPackageCombination,
  DeliveryCapacity,
  VehicleDeliveryStatus,
} from "../interfaces";

export function calculateTotalDeliveryTime(
  deliveryCapacity: DeliveryCapacity | null,
  courierPackages: CourierPackage[],
) {
  //   const totalPackages = courierPackages.length;
  const possibleDeliveryPackageCombinations =
    generatePossibleDeliveryPackageCombinations(courierPackages);
  const mappedDeliveryPackageCombinations = mapDeliveryPackageCombinations(
    possibleDeliveryPackageCombinations,
  );

  const filteredDeliveryPackageCombinations =
    removeCombinationsExceedingCapacity(
      mappedDeliveryPackageCombinations,
      deliveryCapacity!,
    );

  const optimalCombinations = getOptimalCombinations(
    filteredDeliveryPackageCombinations,
  );
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
  combinations: CourierPackage[][],
): CourierPackageCombination[] {
  return combinations.map((combination) => {
    const totalWeight = combination.reduce((sum, pkg) => sum + pkg.weight, 0);
    const totalNumberOfPackages = combination.length;
    return { combination, totalWeight, totalNumberOfPackages };
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

function getOptimalCombinations(
  mappedCombinations: CourierPackageCombination[],
): CourierPackageCombination[] {
  const maxPackages = getHighestNumberOfPackagesPerDelivery(mappedCombinations);
  const maxWeight = getHighestWeightPerDelivery(mappedCombinations);

  return mappedCombinations.filter(
    (mappedCombination) =>
      mappedCombination.totalNumberOfPackages === maxPackages &&
      mappedCombination.totalWeight === maxWeight,
  );
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
  courierPackageCombinations: CourierPackageCombination[],
  deliveryCapacity: DeliveryCapacity,
) {
  const totalNumberOfVehicles = deliveryCapacity.numberOfVehicles;
}

function initializeVehicleDeliveriesStatus(
  numberOfVehicles: number,
): VehicleDeliveryStatus[] {
  const vehicleDeliveries = [];

  for (let i = 0; i < numberOfVehicles; i++) {
    vehicleDeliveries.push({
      vehicleNumber: `Vehicle ${i + 1}`,
      totalDeliveryTime: 0,
      courierPackages: null,
    });
  }

  return vehicleDeliveries;
}
