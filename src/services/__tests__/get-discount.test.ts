import { describe, expect, test } from "bun:test";
import { getDiscount } from "../get-disccount";

/**
 * Discount codes from data/discount-codes.json:
 *
 * OFR001: 10% off, weight 70-200 (inclusive), distance 0-200 (max exclusive)
 * OFR002: 7% off, weight 100-250 (inclusive), distance 50-150 (inclusive)
 * OFR003: 5% off, weight 10-150 (inclusive), distance 50-250 (inclusive)
 */

describe("getDiscount", () => {
  test("should return zero discount when discountCodeName is null", () => {
    const result = getDiscount(null, 100, 100, "PKG1");
    expect(result.discountType).toBe("");
    expect(result.discountValue).toBe(0);
  });

  test("should return zero discount for non-existent discount code", () => {
    const result = getDiscount("NONEXISTENT", 100, 100, "PKG1");
    expect(result.discountType).toBe("");
    expect(result.discountValue).toBe(0);
  });

  // --- OFR001: 10%, weight 70-200, distance 0 to <200 ---

  test("OFR001 - should apply discount when within valid range", () => {
    const result = getDiscount("OFR001", 100, 100, "PKG1");
    expect(result.discountType).toBe("percentage");
    expect(result.discountValue).toBe(10);
  });

  test("OFR001 - should apply discount at minimum weight boundary (inclusive)", () => {
    const result = getDiscount("OFR001", 70, 100, "PKG1");
    expect(result.discountValue).toBe(10);
  });

  test("OFR001 - should apply discount at maximum weight boundary (inclusive)", () => {
    const result = getDiscount("OFR001", 200, 100, "PKG1");
    expect(result.discountValue).toBe(10);
  });

  test("OFR001 - should not apply discount when weight is below minimum", () => {
    const result = getDiscount("OFR001", 69, 100, "PKG1");
    expect(result.discountValue).toBe(0);
  });

  test("OFR001 - should not apply discount when weight exceeds maximum", () => {
    const result = getDiscount("OFR001", 201, 100, "PKG1");
    expect(result.discountValue).toBe(0);
  });

  test("OFR001 - should not apply discount when distance equals max (exclusive)", () => {
    // maximumDistance = 200, includeMaximumDistance = false
    const result = getDiscount("OFR001", 100, 200, "PKG1");
    expect(result.discountValue).toBe(0);
  });

  test("OFR001 - should apply discount when distance is just below max", () => {
    const result = getDiscount("OFR001", 100, 199, "PKG1");
    expect(result.discountValue).toBe(10);
  });

  test("OFR001 - should apply discount at minimum distance boundary (inclusive)", () => {
    const result = getDiscount("OFR001", 100, 0, "PKG1");
    expect(result.discountValue).toBe(10);
  });

  // --- OFR002: 7%, weight 100-250, distance 50-150 (all inclusive) ---

  test("OFR002 - should apply discount when within valid range", () => {
    const result = getDiscount("OFR002", 150, 100, "PKG1");
    expect(result.discountType).toBe("percentage");
    expect(result.discountValue).toBe(7);
  });

  test("OFR002 - should apply discount at boundary values (inclusive)", () => {
    const result = getDiscount("OFR002", 100, 50, "PKG1");
    expect(result.discountValue).toBe(7);
  });

  test("OFR002 - should apply discount at max boundary values (inclusive)", () => {
    const result = getDiscount("OFR002", 250, 150, "PKG1");
    expect(result.discountValue).toBe(7);
  });

  test("OFR002 - should not apply discount when weight is below minimum", () => {
    const result = getDiscount("OFR002", 99, 100, "PKG1");
    expect(result.discountValue).toBe(0);
  });

  test("OFR002 - should not apply discount when distance exceeds maximum", () => {
    const result = getDiscount("OFR002", 150, 151, "PKG1");
    expect(result.discountValue).toBe(0);
  });

  // --- OFR003: 5%, weight 10-150, distance 50-250 (all inclusive) ---

  test("OFR003 - should apply discount when within valid range", () => {
    const result = getDiscount("OFR003", 50, 100, "PKG1");
    expect(result.discountType).toBe("percentage");
    expect(result.discountValue).toBe(5);
  });

  test("OFR003 - should apply discount at boundary values", () => {
    const result = getDiscount("OFR003", 10, 50, "PKG1");
    expect(result.discountValue).toBe(5);
  });

  test("OFR003 - should not apply discount when distance is below minimum", () => {
    const result = getDiscount("OFR003", 50, 49, "PKG1");
    expect(result.discountValue).toBe(0);
  });

  test("OFR003 - should not apply discount when weight exceeds maximum", () => {
    const result = getDiscount("OFR003", 151, 100, "PKG1");
    expect(result.discountValue).toBe(0);
  });
});
