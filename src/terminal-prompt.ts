import { calculateDeliveryCostPrompt } from "./services/calculate-delivery-cost-prompt";
import { handlePromptError, restartPrompt } from "./utils";

export async function startCourierSystem() {
  try {
    const isReady = prompt(
      "Hi Kiki! Welcome to the Courier System. Are you ready to calculate delivery costs? (yes/no):",
    );

    if (isReady?.toLowerCase() === "yes") {
      calculateDeliveryCostPrompt();
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
