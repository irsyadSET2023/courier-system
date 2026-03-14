import { describe, expect, test } from "bun:test";
import { calculateVehicleDeliveryTime } from "../calculate-vehicle-delivery-time";
import type {
  CourierPackage,
  CourierPackageCombination,
} from "../../interfaces";

function makeCombination(
  packages: CourierPackage[],
): CourierPackageCombination {
  return {
    combination: packages,
    totalWeight: packages.reduce((sum, p) => sum + p.weight, 0),
    totalNumberOfPackages: packages.length,
  };
}

describe("calculateVehicleDeliveryTime", () => {
  const maxSpeed = 70;

  test("should calculate delivery time for a single package", () => {
    const combination = makeCombination([
      { name: "PKG1", weight: 50, distance: 100, discountCodeName: null },
    ]);

    const result = calculateVehicleDeliveryTime(maxSpeed, combination);

    // deliveryTime = floor(100/70 * 100) / 100 = floor(142.85) / 100 = 1.42
    expect(result.courierPackages[0]!.deliveryTime).toBe(1.42);
    // backAndForth = floor(1.42 * 2 * 100) / 100 = floor(284) / 100 = 2.84
    expect(result.totalDeliveryTime).toBe(2.84);
  });

  test("should calculate delivery time for multiple packages and use highest", () => {
    const combination = makeCombination([
      { name: "PKG1", weight: 50, distance: 100, discountCodeName: null },
      { name: "PKG2", weight: 75, distance: 200, discountCodeName: null },
    ]);

    const result = calculateVehicleDeliveryTime(maxSpeed, combination);

    // PKG1: floor(100/70 * 100) / 100 = 1.42
    // PKG2: floor(200/70 * 100) / 100 = floor(285.71) / 100 = 2.85
    expect(result.courierPackages[0]!.deliveryTime).toBe(1.42);
    expect(result.courierPackages[1]!.deliveryTime).toBe(2.85);
    // backAndForth based on highest (2.85): floor(2.85 * 2 * 100) / 100 = floor(570) / 100 = 5.7
    expect(result.totalDeliveryTime).toBe(5.7);
  });

  test("should add initialVehicleDeliveryTime to each package delivery time", () => {
    const combination = makeCombination([
      { name: "PKG1", weight: 50, distance: 70, discountCodeName: null },
    ]);

    const initialTime = 2;
    const result = calculateVehicleDeliveryTime(
      maxSpeed,
      combination,
      initialTime,
    );

    // deliveryTime = floor(70/70 * 100) / 100 = 1.0
    // with initial: floor((1.0 + 2) * 100) / 100 = 3.0
    expect(result.courierPackages[0]!.deliveryTime).toBe(3);
  });

  test("should default initialVehicleDeliveryTime to 0", () => {
    const combination = makeCombination([
      { name: "PKG1", weight: 50, distance: 70, discountCodeName: null },
    ]);

    const result = calculateVehicleDeliveryTime(maxSpeed, combination);

    // distance/speed = 70/70 = 1.0
    expect(result.courierPackages[0]!.deliveryTime).toBe(1);
    // backAndForth = 1 * 2 = 2, totalDeliveryTime = 2 + 0 = 2
    expect(result.totalDeliveryTime).toBe(2);
  });

  test("should floor delivery times to 2 decimal places", () => {
    const combination = makeCombination([
      { name: "PKG1", weight: 50, distance: 30, discountCodeName: null },
    ]);

    const result = calculateVehicleDeliveryTime(maxSpeed, combination);

    // 30/70 = 0.42857... => floor to 0.42
    expect(result.courierPackages[0]!.deliveryTime).toBe(0.42);

    const totalTime = result.totalDeliveryTime;
    expect(totalTime).toBe(Math.floor(totalTime * 100) / 100);
  });

  test("should handle packages with equal distances", () => {
    const combination = makeCombination([
      { name: "PKG1", weight: 30, distance: 140, discountCodeName: null },
      { name: "PKG2", weight: 40, distance: 140, discountCodeName: null },
    ]);

    const result = calculateVehicleDeliveryTime(maxSpeed, combination);

    expect(result.courierPackages[0]!.deliveryTime).toBe(
      result.courierPackages[1]!.deliveryTime,
    );
  });

  test("should return correct structure", () => {
    const combination = makeCombination([
      { name: "PKG1", weight: 50, distance: 100, discountCodeName: null },
    ]);

    const result = calculateVehicleDeliveryTime(maxSpeed, combination);

    expect(result).toHaveProperty("courierPackages");
    expect(result).toHaveProperty("totalDeliveryTime");
    expect(result.courierPackages).toBeArray();
    expect(typeof result.totalDeliveryTime).toBe("number");
  });
});
