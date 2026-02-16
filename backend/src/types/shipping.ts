/**
 * Shipping Types for Lagos Delivery System
 */

export type Zone =
  | "MAINLAND_A"
  | "MAINLAND_B"
  | "MAINLAND_C"
  | "MAINLAND_D"
  | "MAINLAND_E"
  | "MAINLAND_F"
  | "MAINLAND_G"
  | "ISLAND_A"
  | "ISLAND_B"
  | "ISLAND_C";

export type DeliveryMethod = "delivery" | "pickup";

export interface ShippingCalculationRequest {
  deliveryArea: string;
  deliveryMethod: DeliveryMethod;
}

export interface ShippingCalculationResponse {
  success: boolean;
  deliveryFee: number;
  zone: Zone;
  message?: string;
}

export interface DeliveryFeeRecord {
  _id?: string;
  fromZone: Zone;
  toZone: Zone;
  price: number;
  isActive: boolean;
  updatedAt?: Date;
}
