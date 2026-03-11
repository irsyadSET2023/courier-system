export class DeliveryCostException extends Error {
  constructor(message: string, packageName: string) {
    super(message);
    this.name = "Delivery Cost Error";

    console.error(`Error calculating delivery cost for package ${packageName}`);
  }
}

export class InvalidDiscountCodeException extends Error {
  constructor(message: string, packageName: string) {
    super(message);
    this.name = "Invalid Discount Code Error";

    console.error(
      `Error checking discount validity for package ${packageName}`,
    );
  }
}
