# Courier System

A CLI-based courier delivery system built with [Bun](https://bun.sh). Calculate delivery costs (with discount codes) and estimate delivery times for packages.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables (Optional)](#environment-variables-optional)
- [Running the App](#running-the-app)
  - [Example CLI Session — Delivery Cost Only](#example-cli-session--delivery-cost-only)
  - [Example CLI Session — Delivery Time Only](#example-cli-session--delivery-time-only)
  - [Available Discount Codes](#available-discount-codes)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Assumptions](#assumptions)
- [Tradeoffs](#tradeoffs)
- [Usage of AI Tools](#usage-of-ai-tools)
  - [What AI helped with](#what-ai-helped-with)
  - [What was done manually](#what-was-done-manually)
  - [AI tools used](#ai-tools-used)

## Prerequisites

- [Bun](https://bun.sh) v1.0 or later

## Setup

```bash
# Clone the repository
git clone <repository-url>
cd courier-system

# Install dependencies
bun install
```

## Environment Variables (Optional)

| Variable                  | Description                                                                           | Default |
| ------------------------- | ------------------------------------------------------------------------------------- | ------- |
| `PREFER_SHORTER_DISTANCE` | When packages have the same weight, prefer delivering shorter-distance packages first | `true`  |

## Running the App

```bash
# Start the CLI
bun run start

# Start in watch mode (auto-restarts on file changes)
bun run dev
```

### Example CLI Session — Delivery Cost Only

```
> Are you ready to calculate delivery costs? (yes/no): yes
> What would you like to calculate?
  1. Delivery Cost
  2. Delivery Time
  3. Both
> Please enter your choice (1/2/3): 1
> Please enter the base delivery cost (RM): 100
> Please enter the number of packages: 3
> Please enter the name for package 1: PKG1
> Please enter the weight for package 1 (PKG1): 5
> Please enter the distance for package 1 (PKG1): 5
> Please enter the discount code name for package 1 (or leave blank if none):
> Please enter the name for package 2: PKG2
> Please enter the weight for package 2 (PKG2): 15
> Please enter the distance for package 2 (PKG2): 5
> Please enter the discount code name for package 2 (or leave blank if none): OFR003
> Please enter the name for package 3: PKG3
> Please enter the weight for package 3 (PKG3): 10
> Please enter the distance for package 3 (PKG3): 100
> Please enter the discount code name for package 3 (or leave blank if none): OFR003

Package PKG1: Total Delivery Cost = 175, Discount Applied = 0
Package PKG2: Total Delivery Cost = 275, Discount Applied = 0
Package PKG3: Total Delivery Cost = 665, Discount Applied = 35

Total Delivery Cost for all packages: 1115
Total Discount Applied for all packages: 35
```

### Example CLI Session — Delivery Time Only

```
> Please enter your choice (1/2/3): 2
> Please enter the number of packages: 2
> Please enter the number of vehicles: 2
> Please enter the maximum speed (km/h) for vehicles: 70
> Please enter the maximum carry weight per vehicle (kg): 200
> (enter package details...)

Delivery time results for each package:
Package PKG1: Estimated Delivery Time = 1.42 hours
Package PKG2: Estimated Delivery Time = 2.85 hours
```

### Available Discount Codes

| Code   | Discount | Weight Range (kg) | Distance Range (km) |
| ------ | -------- | ----------------- | ------------------- |
| OFR001 | 10%      | 70–200            | 0 to <200           |
| OFR002 | 7%       | 100–250           | 50–150              |
| OFR003 | 5%       | 10–150            | 50–250              |

## Running Tests

```bash
bun test
```

To run a specific test file:

```bash
bun test src/services/__tests__/calculate-total-delivery-cost.test.ts
bun test src/services/__tests__/calculate-total-delivery-time.test.ts
bun test src/services/__tests__/calculate-vehicle-delivery-time.test.ts
bun test src/services/__tests__/get-discount.test.ts
```

## Project Structure

```
src/
├── index.ts                          # Entry point
├── terminal-prompt.ts                # CLI prompt handling
├── interfaces.ts                     # TypeScript interfaces
├── utils.ts                          # Utility functions
├── config/
│   ├── delivery-cost.ts              # Delivery cost config
│   └── delivery-time.ts              # Delivery time config
├── databases/
│   └── load-database.ts              # Loads discount codes from JSON
├── exceptions/
│   └── delivery-cost-exception.ts    # Custom exceptions
└── services/
    ├── calculate-delivery-cost-prompt.ts
    ├── calculate-total-delivery-cost.ts
    ├── calculate-total-delivery-time.ts
    ├── calculate-vehicle-delivery-time.ts
    ├── get-disccount.ts
    └── __tests__/                    # Test files
```

## Assumptions

1. **Tie-breaking for packages with the same weight but different distances:**
   When multiple packages have the same weight and only one can be delivered at a time, the system breaks the tie based on distance. The preference (shorter or longer distance first) is configurable via the `PREFER_SHORTER_DISTANCE` environment variable. By default, the system prioritises the package with the shorter distance.

2. **Tie-breaking for packages with the same weight and same distance:**
   When packages are identical in both weight and distance, priority is given to the package that appears earlier in the input order (i.e. lower index). This ensures deterministic and predictable delivery sequencing.

## Tradeoffs

1. **Combination generation is computationally expensive:**
   The `generatePossibleDeliveryPackageCombinations` function uses a recursive approach to generate all possible subsets of packages. This results in $O(2^n)$ time complexity, where $n$ is the number of remaining packages. While this guarantees finding the optimal combination for each delivery batch, it becomes impractical as the number of packages grows significantly.

2. **Future scalability — FIFO over optimal combinations:**
   In a multi-user or high-throughput scenario, computing the optimal combination for every batch would be prohibitively expensive. A more practical approach would be to adopt a FIFO-based strategy: first sort the packages by weight (descending) and distance (ascending or descending, based on configuration), then fill each vehicle by taking packages in order until the maximum carry weight is reached. The choice of sorting algorithm would also be evaluated — for nearly sorted or small datasets, algorithms like Timsort or insertion sort may outperform general-purpose sorts, while for larger volumes, a well-tuned quicksort or merge sort would be more appropriate. This trades combination optimality for predictable $O(n \log n)$ performance (dominated by the sort step) and simpler scheduling, which is more suitable for production systems handling large volumes of packages.

## Usage of AI Tools

AI tools were used selectively during the development of this project. Below is a breakdown of what was AI-assisted and what was done manually.

### What AI helped with

- **Code readability and arrangement:** Restructuring code around core functions to improve readability and maintainability.
- **Terminal prompt handling:** Upgrading the CLI prompt logic to properly validate and handle user inputs, including the menu-based selection for delivery cost, delivery time, or both.
- **Combination algorithm implementation:** The `generatePossibleDeliveryPackageCombinations` function was implemented with AI assistance after recalling the Combination algorithm ($^nC_r$) from Additional Mathematics. The recursive subset generation approach was suggested by AI based on this direction.
- **Test case generation:** AI generated comprehensive test cases covering both the core requirements and edge cases (e.g. same-weight ties, same-weight-and-distance ties, boundary discount code validation, floating-point rounding).
- **Documentation:** The README and inline documentation were generated with AI assistance.

### What was done manually

- **Project structure and folder organisation:** The directory layout, file naming, and module separation were all decided manually.
- **User flow and program design:** The overall flow — from the entry point to the terminal prompt, through to the service functions — was designed and dictated manually.
- **Function connectivity:** How the main functions connect to and delegate to sub-functions (e.g. `calculateTotalDeliveryTime` → `getMostSuitableCombination` → `generatePossibleDeliveryPackageCombinations`) was architected manually.
- **Core business logic:** The delivery cost formula, discount validation rules, vehicle scheduling logic, and tie-breaking strategies were all defined manually.

### AI tools used

1. **ChatGPT / Claude (browser):** Used for discussions, brainstorming, and collecting ideas before writing any code. This includes validating approaches, exploring algorithm options, and refining requirements.

2. **GitHub Copilot Agent (Claude Opus 4.6):** Used for auto-execution of finalised ideas — writing code, generating tests, and producing documentation. Only solid, well-defined tasks were passed to the agent for execution.

3. **Workflow rationale:** By separating ideation (browser-based AI) from execution (Copilot agent), the number of prompts sent to GitHub Copilot is minimised. Only finalised and validated ideas are executed through the agent, reducing unnecessary iterations and keeping the cost of the GitHub Copilot Pro subscription efficient.
