export interface BaseDeliveryCost {
  baseCost: number;
  numberOfPackages: number;
  maximumWeight?: number;
}

export interface CourierPackage {
  name: string;
  weight: number;
  distance: number;
  discountCodeName: string | null;
  deliveryTime?: number;
}

export interface CourierDeliveryCost {
  packageName: string;
  discountValue: number;
  totalDeliveryCost: number;
  deliveryTime?: number;
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
  includeMinimumWeight: boolean;
  includeMinimumDistance: boolean;
  includeMaximumWeight: boolean;
  includeMaximumDistance: boolean;
}

export interface DiscountValueAndType {
  discountType: string;
  discountValue: number;
}

export interface CourierDeliveryCostResult {
  totalDeliveryCost: TotalDeliveryCost;
  courierDeliveryCosts: CourierDeliveryCost[];
}

export interface RangeRule {
  min: number;
  max: number;
  includeMin: boolean;
  includeMax: boolean;
}

export interface DeliveryCapacity {
  numberOfVehicles: number;
  maxSpeed: number;
  maxCarryWeight: number;
}

export interface CourierPackageCombination {
  combination: CourierPackage[];
  totalWeight: number;
  totalNumberOfPackages: number;
}

export interface BatchDeliveryCourierPackage {
  totalDeliveryTime: number;
  courierPackages: CourierPackage[];
}

export interface VehicleDeliveryStatus {
  vehicleIndex: number;
  totalDeliveryTime: number;
  courierPackages: CourierPackage[] | null;
}
