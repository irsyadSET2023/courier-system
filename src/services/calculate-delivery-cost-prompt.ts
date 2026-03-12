import { sleep } from "bun";
import { handlePromptError, restartPrompt } from "../utils";
import { startCourierSystem } from "../terminal-prompt";
import type { BaseDeliveryCost, CourierPackage } from "../interfaces";
import { calculateTotalDeliveryCost } from "./calculate-total-delivery-cost";
import { calculateTotalDeliveryTime } from "./calculate-total-delivery-time";

let maximumWeightInput: string | null = null;
let maximumWeight: number | undefined = undefined;
export async function calculateDeliveryCostPrompt() {
  try {
    console.log("Great! Let's get started.");
    let baseDeliveryCostInput = prompt("Please enter the base delivery cost:");
    let numberOfPackagesInput = prompt("Please enter the number of packages:");

    let includeDeliveryTime = prompt(
      "Would you like to include delivery time calculation as well? (yes/no):",
    );

    if (includeDeliveryTime?.toLowerCase() === "yes") {
      maximumWeightInput = prompt(
        "Please enter the maximum weight for delivery time calculation (or leave blank if no limit):",
      );
    }

    if (baseDeliveryCostInput && numberOfPackagesInput) {
      const baseDeliveryCost = parseFloat(baseDeliveryCostInput);
      const numberOfPackages = parseInt(numberOfPackagesInput, 10);
      maximumWeight = maximumWeightInput
        ? parseFloat(maximumWeightInput)
        : undefined;

      if (isNaN(baseDeliveryCost) || isNaN(numberOfPackages)) {
        console.error(
          "Please enter valid numbers for the base delivery cost and the number of packages. Program will restart shortly...",
        );
        await handlePromptError(startCourierSystem);
      }

      const baseDeliveryCostObject: BaseDeliveryCost = {
        baseCost: baseDeliveryCost,
        numberOfPackages,
        maximumWeight,
      };

      const parsedCourierPackages: CourierPackage[] =
        await parseCourierPackageInput(numberOfPackages);

      calculateTotalDeliveryTime(null, parsedCourierPackages);

      //   const courierDeliveryCostResults = calculateTotalDeliveryCost(
      //     baseDeliveryCostObject,
      //     parsedCourierPackages,
      //   );

      //   console.log("Here are the delivery cost results for each package:");
      //   courierDeliveryCostResults.courierDeliveryCosts.forEach(
      //     (courierDeliveryCost) => {
      //       console.log(
      //         `Package ${courierDeliveryCost.packageName}: Total Delivery Cost = ${courierDeliveryCost.totalDeliveryCost}, Discount Applied = ${courierDeliveryCost.discountValue}`,
      //       );
      //     },
      //   );

      //   console.log(
      //     `Total Delivery Cost for all packages: ${courierDeliveryCostResults.totalDeliveryCost.totalCost}\nTotal Discount Applied for all packages: ${courierDeliveryCostResults.totalDeliveryCost.totalDiscount}`,
      //   );
    } else {
      console.error(
        "Both fields are required. Program will restart shortly...",
      );
      await handlePromptError(startCourierSystem);
    }
  } catch (error) {
    console.error(
      "Error occurred while processing your input. Program will restart shortly...",
    );
    await handlePromptError(startCourierSystem);
  }
}

// Main function
export async function parseCourierPackageInput(
  numberOfPackages: number,
): Promise<CourierPackage[]> {
  const courierPackages: CourierPackage[] = [];

  try {
    for (let i = 0; i < numberOfPackages; i++) {
      const packageName = await promptPackageName(i);
      const weight = await promptPackageWeight(i, packageName!);
      const distance = await promptPackageDistance(i, packageName!);
      const discountCodeName = promptDiscountCode(i);

      courierPackages.push({
        name: packageName!,
        weight,
        distance,
        discountCodeName: discountCodeName || null,
      });
    }

    return courierPackages;
  } catch (error) {
    console.error(
      "Error occurred while processing your input. Program will restart shortly...",
    );
    await handlePromptError(startCourierSystem);
    return [];
  }
}

// Helper: Prompt package name
async function promptPackageName(index: number): Promise<string | null> {
  const name = prompt(`Please enter the name for package ${index + 1}:`);
  if (!name) {
    console.error("Package name cannot be empty.");
    await handlePromptError(startCourierSystem);
    return null;
  }
  return name;
}

// Helper: Prompt package weight with retries
async function promptPackageWeight(
  index: number,
  packageName: string,
): Promise<number> {
  let weight: number | null = null;

  do {
    const weightInput = prompt(
      `Please enter the weight for package ${index + 1} (${packageName}):`,
    );
    weight = parseFloat(weightInput ?? "");

    if (isNaN(weight) || weight <= 0) {
      console.error("Weight must be a valid number greater than 0.");
      weight = null;
      continue;
    }

    if (checkIfCourierPackagesExceedMaximumWeight(weight)) {
      console.error(
        `The weight exceeds the maximum weight limit of ${maximumWeight} kg.`,
      );
      weight = null;
    }
  } while (weight === null);

  return weight;
}

// Helper: Prompt package distance with retries
async function promptPackageDistance(
  index: number,
  packageName: string,
): Promise<number> {
  let distance: number | null = null;

  do {
    const distanceInput = prompt(
      `Please enter the distance for package ${index + 1} (${packageName}):`,
    );
    distance = parseFloat(distanceInput ?? "");

    if (isNaN(distance) || distance <= 0) {
      console.error("Distance must be a valid number greater than 0.");
      distance = null;
    }
  } while (distance === null);

  return distance;
}

// Helper: Prompt optional discount code
function promptDiscountCode(index: number): string | null {
  return prompt(
    `Please enter the discount code name for package ${index + 1} (or leave blank if none):`,
  );
}

function checkIfCourierPackagesExceedMaximumWeight(
  newPackageWeight: number,
): boolean {
  if (maximumWeight === undefined) return false;

  const totalWeight = newPackageWeight;
  return totalWeight > maximumWeight;
}
