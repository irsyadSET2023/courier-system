import * as data from "../../data/discount-codes.json";
import type { DiscountCode } from "../interfaces";

export function getDiscountCodes(): DiscountCode[] {
  return data?.discount_codes || [];
}
