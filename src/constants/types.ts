import type {
  APPROVED,
  END_POINT,
  PENDING,
  REJECTED,
  ROUTE_POINT,
  START_POINT,
} from "./labels.js";

export type TCar = {
  make: string;
  model: string;
  year: Number;
  color: String;
  seater: Number;
  licensePlate: String;
  rcNumber: String;
};

export type TUser = {
  userId: string;
  name: string;
};

export type TLocationPoint = {
  name: string;
  fullName?: string;
  lat: number;
  lon: number;
};

export type TRoutePoint = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: typeof START_POINT | typeof END_POINT | typeof ROUTE_POINT;
};

export type TDocumentStatus =
  | typeof PENDING
  | typeof APPROVED
  | typeof REJECTED;
