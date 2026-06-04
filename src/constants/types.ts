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
  type: "start" | "end" | "route_point";
};

export type TDocumentStatus = "PENDING" | "APPROVED" | "REJECTED";
