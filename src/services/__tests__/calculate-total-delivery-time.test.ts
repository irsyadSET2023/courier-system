import { describe, expect, test } from "bun:test";
import { calculateTotalDeliveryTime } from "../calculate-total-delivery-time";
import type { CourierPackage, DeliveryCapacity } from "../../interfaces";

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
});
