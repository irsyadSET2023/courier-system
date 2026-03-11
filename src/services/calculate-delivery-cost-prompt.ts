import { sleep } from "bun";
import { handlePromptError, restartPrompt } from "../utils";
import { startCourierSystem } from "../terminal-prompt";
import type { BaseDeliveryCost, CourierPackage } from "../interfaces";
import { calculateTotalDeliveryCost } from "./calculate-total-delivery-cost";

export async function calculateDeliveryCostPrompt() {
  try {
    console.log("Great! Let's get started.");
    let baseDeliveryCostInput = prompt("Please enter the base delivery cost:");
    let numberOfPackagesInput = prompt("Please enter the number of packages:");

    if (baseDeliveryCostInput && numberOfPackagesInput) {
      const baseDeliveryCost = parseFloat(baseDeliveryCostInput);
      const numberOfPackages = parseInt(numberOfPackagesInput, 10);

      if (isNaN(baseDeliveryCost) || isNaN(numberOfPackages)) {
        console.error(
          "Please enter valid numbers for the base delivery cost and the number of packages. Program will restart shortly...",
        );
        await handlePromptError(startCourierSystem);
      }

      const baseDeliveryCostObject: BaseDeliveryCost = {
        baseCost: baseDeliveryCost,
        numberOfPackages,
      };

      const parsedCourierPackages: CourierPackage[] =
        await parseCourierPackageInput(numberOfPackages);

      const courierDeliveryCostResults = calculateTotalDeliveryCost(
        baseDeliveryCostObject,
        parsedCourierPackages,
      );

      console.log("Here are the delivery cost results for each package:");
      courierDeliveryCostResults.courierDeliveryCosts.forEach(
        (courierDeliveryCost) => {
          console.log(
            `Package ${courierDeliveryCost.packageName}: Total Delivery Cost = ${courierDeliveryCost.totalDeliveryCost}, Discount Applied = ${courierDeliveryCost.discountValue}`,
          );
        },
      );

      console.log(
        `Total Delivery Cost for all packages: ${courierDeliveryCostResults.totalDeliveryCost.totalCost}\nTotal Discount Applied for all packages: ${courierDeliveryCostResults.totalDeliveryCost.totalDiscount}`,
      );
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

async function parseCourierPackageInput(
  numberOfPackages: number,
): Promise<CourierPackage[]> {
  const courierPackages = [];

  try {
    for (let i = 0; i < numberOfPackages; i++) {
      const packageName = prompt(`Please enter the name for package ${i + 1}:`);
      const weightInput = prompt(
        `Please enter the weight for package ${i + 1}:`,
      );
      const distanceInput = prompt(
        `Please enter the distance for package ${i + 1}:`,
      );
      const discountCodeName = prompt(
        `Please enter the discount code name for package ${i + 1} (or leave blank if none):`,
      );

      if (!packageName || !weightInput || !distanceInput) {
        await handlePromptError(startCourierSystem);
        return [];
      }

      courierPackages.push({
        name: packageName as string,
        weight: parseFloat(weightInput!),
        distance: parseFloat(distanceInput!),
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
