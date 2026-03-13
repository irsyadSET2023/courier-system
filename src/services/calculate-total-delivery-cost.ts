import { DeliveryCostException } from "../exceptions/delivery-cost-exception";
import type {
  BaseDeliveryCost,
  CourierDeliveryCost,
  CourierDeliveryCostResult,
  CourierPackage,
} from "../interfaces";
import { getDiscount } from "./get-disccount";

export function calculateTotalDeliveryCost(
  baseDeliveryCost: BaseDeliveryCost,
  courierPackages: CourierPackage[],
): CourierDeliveryCostResult {
  const courierPackagesResults = courierPackages.map((courierPackage) =>
    calculateCourierPackageDeliveryCost(baseDeliveryCost, courierPackage),
  );

  const totalDeliveryCost = courierPackagesResults.reduce(
    (total, courierPackageResult) => {
      return {
        totalDiscount: total.totalDiscount + courierPackageResult.discountValue,
        totalCost: total.totalCost + courierPackageResult.totalDeliveryCost,
      };
    },
    { totalDiscount: 0, totalCost: 0 },
  );

  return {
    totalDeliveryCost: totalDeliveryCost,
    courierDeliveryCosts: courierPackagesResults,
  };
}

function calculateCourierPackageDeliveryCost(
  baseDeliveryCost: BaseDeliveryCost,
  courierPackage: CourierPackage,
): CourierDeliveryCost {
  try {
    const discountCodeName = courierPackage.discountCodeName || null;

    if (!discountCodeName) {
      return {
        packageName: courierPackage.name,
        totalDeliveryCost: calculateDeliveryCost(
          baseDeliveryCost.baseCost,
          courierPackage.weight,
          courierPackage.distance,
        ),
        discountValue: 0,
      };
    }

    const discount = getDiscount(
      discountCodeName,
      courierPackage.weight,
      courierPackage.distance,
      courierPackage.name,
    );

    const totalDeliveryCost = calculateDeliveryCost(
      baseDeliveryCost.baseCost,
      courierPackage.weight,
      courierPackage.distance,
    );

    let totalDiscountValue: number = 0;

    if (discount.discountType === "flat") {
      totalDiscountValue = discount.discountValue;
    } else {
      totalDiscountValue = (totalDeliveryCost * discount.discountValue) / 100;
    }

    const discountedDeliveryCost = totalDeliveryCost - totalDiscountValue;

    return {
      packageName: courierPackage.name,
      totalDeliveryCost: discountedDeliveryCost,
      discountValue: totalDiscountValue,
    };
  } catch (error) {
    throw new DeliveryCostException(
      "Error calculating total delivery cost",
      courierPackage.name,
    ); // Return a default value or handle it as needed
  }
}

function calculateDeliveryCost(
  baseDeliveryCost: number,
  weight: number,
  distance: number,
): number {
  return baseDeliveryCost + weight * 10 + distance * 5;
}
