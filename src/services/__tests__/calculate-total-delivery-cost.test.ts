import { describe, expect, test } from "bun:test";
import { calculateTotalDeliveryCost } from "../calculate-total-delivery-cost";
import type {
  BaseDeliveryCost,
  CourierPackage,
} from "../../interfaces";

describe("calculateTotalDeliveryCost", () => {
  const baseDeliveryCost: BaseDeliveryCost = {
    baseCost: 100,
    numberOfPackages: 3,
  };

  test("should calculate delivery cost for a single package without discount", () => {
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 5, distance: 5, discountCodeName: null },
    ];

    const result = calculateTotalDeliveryCost(
      { ...baseDeliveryCost, numberOfPackages: 1 },
      packages,
    );

    // baseCost + weight*10 + distance*5 = 100 + 50 + 25 = 175
    expect(result.courierDeliveryCosts).toHaveLength(1);
    expect(result.courierDeliveryCosts[0]!.packageName).toBe("PKG1");
    expect(result.courierDeliveryCosts[0]!.totalDeliveryCost).toBe(175);
    expect(result.courierDeliveryCosts[0]!.discountValue).toBe(0);
    expect(result.totalDeliveryCost.totalCost).toBe(175);
    expect(result.totalDeliveryCost.totalDiscount).toBe(0);
  });

  test("should calculate delivery cost for multiple packages without discount", () => {
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 5, distance: 5, discountCodeName: null },
      { name: "PKG2", weight: 15, distance: 5, discountCodeName: null },
    ];

    const result = calculateTotalDeliveryCost(
      { ...baseDeliveryCost, numberOfPackages: 2 },
      packages,
    );

    // PKG1: 100 + 50 + 25 = 175
    // PKG2: 100 + 150 + 25 = 275
    expect(result.courierDeliveryCosts).toHaveLength(2);
    expect(result.courierDeliveryCosts[0]!.totalDeliveryCost).toBe(175);
    expect(result.courierDeliveryCosts[1]!.totalDeliveryCost).toBe(275);
    expect(result.totalDeliveryCost.totalCost).toBe(450);
    expect(result.totalDeliveryCost.totalDiscount).toBe(0);
  });

  test("should apply percentage discount when discount code is valid", () => {
    // OFR003: 5% discount, weight 10-150, distance 50-250 (all inclusive)
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 10, distance: 100, discountCodeName: "OFR003" },
    ];

    const result = calculateTotalDeliveryCost(
      { ...baseDeliveryCost, numberOfPackages: 1 },
      packages,
    );

    // baseCost + weight*10 + distance*5 = 100 + 100 + 500 = 700
    // 5% of 700 = 35 discount => 700 - 35 = 665
    expect(result.courierDeliveryCosts[0]!.totalDeliveryCost).toBe(665);
    expect(result.courierDeliveryCosts[0]!.discountValue).toBe(35);
  });

  test("should not apply discount when package does not meet weight criteria", () => {
    // OFR001: 10% discount, weight 70-200, distance 0 to <200
    // Weight 5 is below minimum weight of 70
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 5, distance: 100, discountCodeName: "OFR001" },
    ];

    const result = calculateTotalDeliveryCost(
      { ...baseDeliveryCost, numberOfPackages: 1 },
      packages,
    );

    // 100 + 50 + 500 = 650, no discount applied
    expect(result.courierDeliveryCosts[0]!.totalDeliveryCost).toBe(650);
    expect(result.courierDeliveryCosts[0]!.discountValue).toBe(0);
  });

  test("should not apply discount when package does not meet distance criteria", () => {
    // OFR002: 7% discount, weight 100-250, distance 50-150
    // Distance 200 exceeds maximum distance of 150
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 100, distance: 200, discountCodeName: "OFR002" },
    ];

    const result = calculateTotalDeliveryCost(
      { ...baseDeliveryCost, numberOfPackages: 1 },
      packages,
    );

    // 100 + 1000 + 1000 = 2100, no discount
    expect(result.courierDeliveryCosts[0]!.totalDeliveryCost).toBe(2100);
    expect(result.courierDeliveryCosts[0]!.discountValue).toBe(0);
  });

  test("should return zero discount for an invalid discount code", () => {
    const packages: CourierPackage[] = [
      {
        name: "PKG1",
        weight: 50,
        distance: 100,
        discountCodeName: "INVALID_CODE",
      },
    ];

    const result = calculateTotalDeliveryCost(
      { ...baseDeliveryCost, numberOfPackages: 1 },
      packages,
    );

    // 100 + 500 + 500 = 1100, no discount
    expect(result.courierDeliveryCosts[0]!.totalDeliveryCost).toBe(1100);
    expect(result.courierDeliveryCosts[0]!.discountValue).toBe(0);
  });

  test("should handle empty package list", () => {
    const result = calculateTotalDeliveryCost(baseDeliveryCost, []);

    expect(result.courierDeliveryCosts).toHaveLength(0);
    expect(result.totalDeliveryCost.totalCost).toBe(0);
    expect(result.totalDeliveryCost.totalDiscount).toBe(0);
  });

  test("should correctly sum totals across multiple packages with mixed discounts", () => {
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 5, distance: 5, discountCodeName: null },
      { name: "PKG2", weight: 15, distance: 5, discountCodeName: "OFR003" },
      { name: "PKG3", weight: 10, distance: 100, discountCodeName: "OFR003" },
    ];

    const result = calculateTotalDeliveryCost(
      { ...baseDeliveryCost, numberOfPackages: 3 },
      packages,
    );

    // PKG1: 100 + 50 + 25 = 175 (no discount)
    // PKG2: 100 + 150 + 25 = 275 (OFR003: weight 15 is in 10-150, distance 5 is NOT in 50-250 => no discount)
    // PKG3: 100 + 100 + 500 = 700 (OFR003: weight 10, distance 100 => 5% = 35 discount => 665)
    expect(result.courierDeliveryCosts[0]!.totalDeliveryCost).toBe(175);
    expect(result.courierDeliveryCosts[1]!.totalDeliveryCost).toBe(275);
    expect(result.courierDeliveryCosts[2]!.totalDeliveryCost).toBe(665);
    expect(result.totalDeliveryCost.totalCost).toBe(175 + 275 + 665);
    expect(result.totalDeliveryCost.totalDiscount).toBe(35);
  });

  test("should use different base costs correctly", () => {
    const packages: CourierPackage[] = [
      { name: "PKG1", weight: 10, distance: 10, discountCodeName: null },
    ];

    const result = calculateTotalDeliveryCost(
      { baseCost: 50, numberOfPackages: 1 },
      packages,
    );

    // 50 + 100 + 50 = 200
    expect(result.courierDeliveryCosts[0]!.totalDeliveryCost).toBe(200);
  });
});
