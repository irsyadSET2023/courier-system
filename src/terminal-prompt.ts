export function entryPointPrompt() {
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
      calculateDeliveryCostPrompt();
      // console.log(
      //   "No worries! Take your time. When you're ready, just run the program again.",
      // );
    }
  } catch (error) {
    console.error("An error occurred while processing your input:");
  }
}

function calculateDeliveryCostPrompt() {
  try {
    console.log("Great! Let's get started.");
  } catch (error) {
    console.error("An error occurred while calculating the delivery cost:");
  }
}
