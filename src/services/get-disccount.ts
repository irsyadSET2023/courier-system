import { getDiscountCodes } from "../databases/load-database";
import { InvalidDiscountCodeException } from "../exceptions/delivery-cost-exception";
import type { DiscountCode, DiscountValueAndType } from "../interfaces";

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
) {
  const discountCodeMinimumDistance = discountCode.minimumDistance;
  const discountCodeMaximumDistance = discountCode.maximumDistance;

  if (!discountCodeMinimumDistance) {
    if (packageDistance <= discountCodeMaximumDistance) {
      return true;
    }
    return false;
  }

  if (
    packageDistance >= discountCodeMinimumDistance &&
    packageDistance <= discountCodeMaximumDistance
  ) {
    return true;
  }
  return false;
}

function checkWeightValidity(
  discountCode: DiscountCode,
  packageWeight: number,
) {
  const discountCodeMinimumWeight = discountCode.minimumWeight;
  const discountCodeMaximumWeight = discountCode.maximumWeight;

  if (!discountCodeMinimumWeight) {
    if (packageWeight <= discountCodeMaximumWeight) {
      return true;
    }
    return false;
  }

  if (
    packageWeight >= discountCodeMinimumWeight &&
    packageWeight <= discountCodeMaximumWeight
  ) {
    return true;
  }
  return false;
}
