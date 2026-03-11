import { sleep } from "bun";

export function restartPrompt(functionToRestart: () => void) {
  console.clear();
  functionToRestart();
}

export async function handlePromptError(functionToRestart: () => void) {
  await sleep(2000);
  restartPrompt(functionToRestart);
}
