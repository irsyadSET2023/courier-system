import { calculateTotalDeliveryCost } from "./services/calculate-total-delivery-cost";
import { calculateTotalDeliveryTime } from "./services/calculate-total-delivery-time";
import type {
  BaseDeliveryCost,
  CourierPackage,
  DeliveryCapacity,
} from "./interfaces";
import { handlePromptError, restartPrompt } from "./utils";

export async function startCourierSystem() {
  try {
    const isReady = prompt(
      "Hi Kiki! Welcome to the Courier System. Are you ready to calculate delivery costs? (yes/no):",
    );

    if (isReady?.toLowerCase() === "yes") {
      await runCourierPrompt();
    } else {
      prompt(
        "No worries! Take your time. When you're ready, just press Enter to calculate the delivery costs.",
      );
      restartPrompt(startCourierSystem);
    }
  } catch (error) {
    console.error("An error occurred while processing your input:");
    await handlePromptError(startCourierSystem);
  }
}

async function runCourierPrompt() {
  try {
    console.log("Great! Let's get started.");
    console.log("What would you like to calculate?");
    console.log("1. Delivery Cost");
    console.log("2. Delivery Time");
    console.log("3. Both");

    const choice = prompt("Please enter your choice (1/2/3):");

    if (!choice || !["1", "2", "3"].includes(choice)) {
      console.error(
        "Invalid choice. Please enter 1, 2, or 3. Program will restart shortly...",
      );
      await handlePromptError(startCourierSystem);
      return;
    }

    const wantsCost = choice === "1" || choice === "3";
    const wantsTime = choice === "2" || choice === "3";

    const baseDeliveryCostInput = wantsCost
      ? prompt("Please enter the base delivery cost (RM):")
      : null;
    const numberOfPackagesInput = prompt(
      "Please enter the number of packages:",
    );

    if ((wantsCost && !baseDeliveryCostInput) || !numberOfPackagesInput) {
      console.error(
        "All required fields must be filled. Program will restart shortly...",
      );
      await handlePromptError(startCourierSystem);
      return;
    }

    const baseCost = wantsCost ? parseFloat(baseDeliveryCostInput!) : 0;
    const numberOfPackages = parseInt(numberOfPackagesInput!, 10);

    if ((wantsCost && isNaN(baseCost)) || isNaN(numberOfPackages)) {
      console.error(
        "Please enter valid numbers. Program will restart shortly...",
      );
      await handlePromptError(startCourierSystem);
      return;
    }

    let deliveryCapacity: DeliveryCapacity | null = null;
    let maximumWeight: number | undefined = undefined;

    if (wantsTime) {
      deliveryCapacity = promptDeliveryCapacity();
      if (!deliveryCapacity) {
        await handlePromptError(startCourierSystem);
        return;
      }
      maximumWeight = deliveryCapacity.maxCarryWeight;
    }

    const baseDeliveryCost: BaseDeliveryCost = {
      baseCost,
      numberOfPackages,
      maximumWeight,
    };

    // Collect package details
    const courierPackages = collectPackageInputs(
      numberOfPackages,
      maximumWeight,
    );

    // Calculate delivery cost
    if (wantsCost) {
      const courierDeliveryCostResults = calculateTotalDeliveryCost(
        baseDeliveryCost,
        courierPackages,
      );

      console.log("\nHere are the delivery cost results for each package:");
      courierDeliveryCostResults.courierDeliveryCosts.forEach(
        (courierDeliveryCost) => {
          console.log(
            `Package ${courierDeliveryCost.packageName}: Total Delivery Cost = ${courierDeliveryCost.totalDeliveryCost}, Discount Applied = ${courierDeliveryCost.discountValue}`,
          );
        },
      );
      console.log(
        `\nTotal Delivery Cost for all packages: ${courierDeliveryCostResults.totalDeliveryCost.totalCost}\nTotal Discount Applied for all packages: ${courierDeliveryCostResults.totalDeliveryCost.totalDiscount}`,
      );
    }

    // Calculate delivery time
    if (wantsTime && deliveryCapacity) {
      const packagesWithDeliveryTime = calculateTotalDeliveryTime(
        deliveryCapacity,
        // Pass a copy so the original isn't mutated
        courierPackages.map((pkg) => ({ ...pkg })),
      );

      console.log("\nDelivery time results for each package:");
      packagesWithDeliveryTime.forEach((pkg) => {
        console.log(
          `Package ${pkg.name}: Estimated Delivery Time = ${pkg.deliveryTime} hours`,
        );
      });
    }
  } catch (error) {
    console.error(
      "Error occurred while processing your input. Program will restart shortly...",
    );
    await handlePromptError(startCourierSystem);
  }
}

function promptDeliveryCapacity(): DeliveryCapacity | null {
  const vehiclesInput = prompt("Please enter the number of vehicles:");
  const speedInput = prompt(
    "Please enter the maximum speed (km/h) for vehicles:",
  );
  const maxWeightInput = prompt(
    "Please enter the maximum carry weight per vehicle (kg):",
  );

  const numberOfVehicles = parseInt(vehiclesInput ?? "", 10);
  const maxSpeed = parseFloat(speedInput ?? "");
  const maxCarryWeight = parseFloat(maxWeightInput ?? "");

  if (isNaN(numberOfVehicles) || isNaN(maxSpeed) || isNaN(maxCarryWeight)) {
    console.error(
      "Please enter valid numbers for vehicle details. Program will restart shortly...",
    );
    return null;
  }

  return { numberOfVehicles, maxSpeed, maxCarryWeight };
}

function collectPackageInputs(
  numberOfPackages: number,
  maximumWeight?: number,
): CourierPackage[] {
  const courierPackages: CourierPackage[] = [];

  for (let i = 0; i < numberOfPackages; i++) {
    const name = prompt(`Please enter the name for package ${i + 1}:`);
    if (!name) {
      console.error("Package name cannot be empty. Skipping package.");
      continue;
    }

    let weight: number | null = null;
    do {
      const weightInput = prompt(
        `Please enter the weight for package ${i + 1} (${name}):`,
      );
      weight = parseFloat(weightInput ?? "");

      if (isNaN(weight) || weight <= 0) {
        console.error("Weight must be a valid number greater than 0.");
        weight = null;
        continue;
      }

      if (maximumWeight !== undefined && weight > maximumWeight) {
        console.error(
          `The weight exceeds the maximum weight limit of ${maximumWeight} kg.`,
        );
        weight = null;
      }
    } while (weight === null);

    let distance: number | null = null;
    do {
      const distanceInput = prompt(
        `Please enter the distance for package ${i + 1} (${name}):`,
      );
      distance = parseFloat(distanceInput ?? "");

      if (isNaN(distance) || distance <= 0) {
        console.error("Distance must be a valid number greater than 0.");
        distance = null;
      }
    } while (distance === null);

    const discountCodeName =
      prompt(
        `Please enter the discount code name for package ${i + 1} (or leave blank if none):`,
      ) || null;

    courierPackages.push({ name, weight, distance, discountCodeName });
  }

  return courierPackages;
}
