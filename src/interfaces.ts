export interface BaseDeliveryCost {
  baseCost: number;
  numberOfPackages: number;
}

export interface CourierPackage {
  name: string;
  weight: number;
  distance: number;
  discountCodeName?: string;
}

export interface CourierDeliveryCost {
  packageName: string;
  discountValue: number;
  totalDeliveryCost: number;
}

export interface TotalDeliveryCost {
  totalDiscount: number;
  totalCost: number;
}

export interface DiscountCode {
  name: string;
  discountType: string;
  discountValue: number;
  minimumWeight: number;
  maximumWeight: number;
  minimumDistance: number;
  maximumDistance: number;
}

export interface DiscountValueAndType {
  discountType: string;
  discountValue: number;
}
