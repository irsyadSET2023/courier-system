import { describe, expect, test } from "bun:test";
import {
  calculateTotalDeliveryTime,
  isSinglePackageSameWeightTie,
  resolveSinglePackageTieByDistance,
} from "../calculate-total-delivery-time";
import type {
  CourierPackage,
  CourierPackageCombination,
  DeliveryCapacity,
} from "../../interfaces";

describe("calculateTotalDeliveryTime", () => {
  const deliveryCapacity: DeliveryCapacity = {
    numberOfVehicles: 2,
    maxSpeed: 70,
    maxCarryWeight: 200,
  };

  test("should calculate delivery time for a single package", () => {
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 50, distance: 30, discountCodeName: null },
    ];

    const result = calculateTotalDeliveryTime(deliveryCapacity, [...packages]);

    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("PKG1");
    expect(result[0]!.deliveryTime).toBeDefined();
    // distance/maxSpeed = 30/70 = 0.42 (floored to 2dp)
    expect(result[0]!.deliveryTime).toBe(Math.floor((30 / 70) * 100) / 100);
  });

  test("should calculate delivery time for multiple packages in one batch", () => {
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 50, distance: 30, discountCodeName: null },
      { name: "PKG2", weight: 75, distance: 125, discountCodeName: null },
    ];

    const result = calculateTotalDeliveryTime(deliveryCapacity, [...packages]);

    expect(result).toHaveLength(2);
    result.forEach((pkg) => {
      expect(pkg.deliveryTime).toBeDefined();
      expect(typeof pkg.deliveryTime).toBe("number");
    });
  });

  test("should split packages across multiple batches when weight exceeds capacity", () => {
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 150, distance: 100, discountCodeName: null },
      { name: "PKG2", weight: 150, distance: 50, discountCodeName: null },
    ];

    // Each package is 150kg, capacity is 200kg, so they can't go together
    const result = calculateTotalDeliveryTime(deliveryCapacity, [
      ...packages.map((p) => ({ ...p })),
    ]);

    expect(result).toHaveLength(2);
    // Both should have delivery times
    expect(result[0]!.deliveryTime).toBeDefined();
    expect(result[1]!.deliveryTime).toBeDefined();
  });

  test("should return delivery times floored to 2 decimal places", () => {
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 50, distance: 100, discountCodeName: null },
    ];

    const result = calculateTotalDeliveryTime(deliveryCapacity, [...packages]);

    const deliveryTime = result[0]!.deliveryTime!;
    // Check it has at most 2 decimal places
    expect(deliveryTime).toBe(Math.floor(deliveryTime * 100) / 100);
  });

  test("should handle packages that fit exactly at max carry weight", () => {
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 100, distance: 70, discountCodeName: null },
      { name: "PKG2", weight: 100, distance: 140, discountCodeName: null },
    ];

    // Total weight = 200 = maxCarryWeight, should fit in one batch
    const result = calculateTotalDeliveryTime(deliveryCapacity, [
      ...packages.map((p) => ({ ...p })),
    ]);

    expect(result).toHaveLength(2);
  });

  test("should return empty array for empty package list", () => {
    const result = calculateTotalDeliveryTime(deliveryCapacity, []);
    expect(result).toHaveLength(0);
  });

  test("should assign later batches a higher delivery time due to vehicle return", () => {
    // Force 3 packages that can't all fit in one batch (only 2 vehicles, 200kg max)
    const capacity: DeliveryCapacity = {
      numberOfVehicles: 2,
      maxSpeed: 70,
      maxCarryWeight: 200,
    };

    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 110, distance: 70, discountCodeName: null },
      { name: "PKG2", weight: 110, distance: 70, discountCodeName: null },
      { name: "PKG3", weight: 110, distance: 70, discountCodeName: null },
    ];

    const result = calculateTotalDeliveryTime(capacity, [
      ...packages.map((p) => ({ ...p })),
    ]);

    expect(result).toHaveLength(3);

    // The package in the second batch should have a higher delivery time
    // because the vehicle had to return first
    const deliveryTimes = result.map((r) => r.deliveryTime!);
    const maxTime = Math.max(...deliveryTimes);
    const minTime = Math.min(...deliveryTimes);
    expect(maxTime).toBeGreaterThan(minTime);
  });

  test("should prefer shorter distance package when remaining single packages have same weight", () => {
    // 3 packages: first one is different weight and gets sent first.
    // Remaining two have same weight and only one fits per vehicle — triggers the tie-breaker.
    const capacity: DeliveryCapacity = {
      numberOfVehicles: 2,
      maxSpeed: 70,
      maxCarryWeight: 100,
    };

    const packages: CourierPackage[] = [
      { name: "PKG_LIGHT", weight: 50, distance: 70, discountCodeName: null },
      { name: "PKG_FAR", weight: 100, distance: 200, discountCodeName: null },
      { name: "PKG_NEAR", weight: 100, distance: 50, discountCodeName: null },
    ];

    // PKG_LIGHT + one of the 100kg packages can go first batch (150kg <= capacity? no, 100kg max)
    // Actually with 100kg max, only one package at a time since each is >= 50kg and combinations are limited
    // After PKG_LIGHT is sent, PKG_FAR and PKG_NEAR remain with same weight
    // With preferShorterDistance = true (default), PKG_NEAR should be picked before PKG_FAR
    const result = calculateTotalDeliveryTime(capacity, [
      ...packages.map((p) => ({ ...p })),
    ]);

    expect(result).toHaveLength(3);

    // Among the two 100kg packages, the nearer one should be delivered before the farther one
    const pkg100Results = result.filter(
      (p) => p.name === "PKG_NEAR" || p.name === "PKG_FAR",
    );
    const nearPkg = pkg100Results.find((p) => p.name === "PKG_NEAR")!;
    const farPkg = pkg100Results.find((p) => p.name === "PKG_FAR")!;
    expect(nearPkg.deliveryTime!).toBeLessThan(farPkg.deliveryTime!);
  });
});

describe("isSinglePackageSameWeightTie", () => {
  function makeCombination(
    packages: CourierPackage[],
  ): CourierPackageCombination {
    return {
      combination: packages,
      totalWeight: packages.reduce((sum, p) => sum + p.weight, 0),
      totalNumberOfPackages: packages.length,
    };
  }

  test("should return true when all combinations are single packages with same weight", () => {
    const combA = makeCombination([
      { name: "PKG1", weight: 100, distance: 200, discountCodeName: null },
    ]);
    const combB = makeCombination([
      { name: "PKG2", weight: 100, distance: 50, discountCodeName: null },
    ]);

    expect(isSinglePackageSameWeightTie([combA, combB])).toBe(true);
  });

  test("should return false when combinations have different weights", () => {
    const combA = makeCombination([
      { name: "PKG1", weight: 100, distance: 200, discountCodeName: null },
    ]);
    const combB = makeCombination([
      { name: "PKG2", weight: 80, distance: 50, discountCodeName: null },
    ]);

    expect(isSinglePackageSameWeightTie([combA, combB])).toBe(false);
  });

  test("should return false when combinations have multiple packages", () => {
    const combA = makeCombination([
      { name: "PKG1", weight: 50, distance: 200, discountCodeName: null },
      { name: "PKG2", weight: 50, distance: 100, discountCodeName: null },
    ]);
    const combB = makeCombination([
      { name: "PKG3", weight: 50, distance: 50, discountCodeName: null },
      { name: "PKG4", weight: 50, distance: 30, discountCodeName: null },
    ]);

    expect(isSinglePackageSameWeightTie([combA, combB])).toBe(false);
  });

  test("should return false when only one combination exists", () => {
    const combA = makeCombination([
      { name: "PKG1", weight: 100, distance: 200, discountCodeName: null },
    ]);

    expect(isSinglePackageSameWeightTie([combA])).toBe(false);
  });
});

describe("resolveSinglePackageTieByDistance", () => {
  function makeCombination(
    packages: CourierPackage[],
  ): CourierPackageCombination {
    return {
      combination: packages,
      totalWeight: packages.reduce((sum, p) => sum + p.weight, 0),
      totalNumberOfPackages: packages.length,
    };
  }

  test("should pick package with shorter distance when preferShorterDistance is true", () => {
    const combA = makeCombination([
      { name: "PKG_FAR", weight: 100, distance: 200, discountCodeName: null },
    ]);
    const combB = makeCombination([
      { name: "PKG_NEAR", weight: 100, distance: 50, discountCodeName: null },
    ]);

    // Default config has preferShorterDistance = true
    const result = resolveSinglePackageTieByDistance([combA, combB]);
    expect(result.combination[0]!.name).toBe("PKG_NEAR");
  });

  test("should return the only combination when just one exists", () => {
    const comb = makeCombination([
      { name: "PKG1", weight: 100, distance: 50, discountCodeName: null },
    ]);

    const result = resolveSinglePackageTieByDistance([comb]);
    expect(result.combination[0]!.name).toBe("PKG1");
  });

  test("should handle packages with equal distance", () => {
    const combA = makeCombination([
      { name: "PKG1", weight: 100, distance: 100, discountCodeName: null },
    ]);
    const combB = makeCombination([
      { name: "PKG2", weight: 100, distance: 100, discountCodeName: null },
    ]);

    const result = resolveSinglePackageTieByDistance([combA, combB]);
    expect(result).toBeDefined();
    expect(result.combination).toHaveLength(1);
  });

  test("should correctly sort among multiple tied combinations", () => {
    const combA = makeCombination([
      { name: "PKG_FAR", weight: 100, distance: 300, discountCodeName: null },
    ]);
    const combB = makeCombination([
      { name: "PKG_MID", weight: 100, distance: 150, discountCodeName: null },
    ]);
    const combC = makeCombination([
      { name: "PKG_NEAR", weight: 100, distance: 50, discountCodeName: null },
    ]);

    const result = resolveSinglePackageTieByDistance([combA, combB, combC]);
    expect(result.combination[0]!.name).toBe("PKG_NEAR");
  });
});
