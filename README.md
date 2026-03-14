# Courier System

A CLI-based courier delivery system built with [Bun](https://bun.sh). Calculate delivery costs (with discount codes) and estimate delivery times for packages.

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
