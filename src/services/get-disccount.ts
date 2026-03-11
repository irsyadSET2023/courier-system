import { getDiscountCodes } from "../databases/load-database";
import { InvalidDiscountCodeException } from "../exceptions/delivery-cost-exception";
import type {
  DiscountCode,
  DiscountValueAndType,
  RangeRule,
} from "../interfaces";

export function getDiscount(
  discountCodeName: string | null,
  packageWeight: number,
  packageDistance: number,
  packageName: string,
): DiscountValueAndType {
  try {
    if (!discountCodeName) {
      return { discountType: "", discountValue: 0 };
    }

    const discountCodes = getDiscountCodes();

    const discountCode = discountCodes.find(
      (discountCode) => discountCode.name === discountCodeName,
    );

    if (!discountCode) {
      return { discountType: "", discountValue: 0 };
    }

    const isDistanceValid = checkDistanceValidity(
      discountCode,
      packageDistance,
    );
    const isWeightValid = checkWeightValidity(discountCode, packageWeight);

    if (isDistanceValid && isWeightValid) {
      return {
        discountType: discountCode.discountType,
        discountValue: discountCode.discountValue,
      };
    } else {
      return { discountType: "", discountValue: 0 };
    }
  } catch (error) {
    throw new InvalidDiscountCodeException(
      `Error checking discount validity for package ${packageName}`,
      packageName,
    );
  }
}

function checkDistanceValidity(
  discountCode: DiscountCode,
  packageDistance: number,
): boolean {
  return checkRange(packageDistance, {
    min: discountCode.minimumDistance,
    max: discountCode.maximumDistance,
    includeMin: discountCode.includeMinimumDistance,
    includeMax: discountCode.includeMaximumDistance,
  });

  // if (!discountCodeMinimumDistance) {
  //   if (packageDistance <= discountCodeMaximumDistance) {
  //     return true;
  //   }
  //   return false;
  // }

  // if (
  //   packageDistance >= discountCodeMinimumDistance &&
  //   packageDistance <= discountCodeMaximumDistance
  // ) {
  //   return true;
  // }
  // return false;
}

function checkWeightValidity(
  discountCode: DiscountCode,
  packageWeight: number,
): boolean {
  return checkRange(packageWeight, {
    min: discountCode.minimumWeight,
    max: discountCode.maximumWeight,
    includeMin: discountCode.includeMinimumWeight,
    includeMax: discountCode.includeMaximumWeight,
  });
}

/**
 * Generic range validator
 */
function checkRange(value: number, rule: RangeRule): boolean {
  if (rule.min !== undefined) {
    const minCheck = rule.includeMin ? value >= rule.min : value > rule.min;
    if (!minCheck) return false;
  }

  if (rule.max !== undefined) {
    const maxCheck = rule.includeMax ? value <= rule.max : value < rule.max;
    if (!maxCheck) return false;
  }

  return true;
}
