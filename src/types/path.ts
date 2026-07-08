export type LocationType =
  | "station"
  | "building"
  | "mall"
  | "landmark"
  | "exit"
  | "entrance"
  | "food_court"
  | "washroom"
  | "stairs"
  | "escalator"
  | "elevator"
  | "ramp"
  | "concourse";

export type PathLevel = "street" | "lower" | "retail";

export type RouteType = "main" | "connecting" | "accessible_alternative";

export type PathNode = {
  id: string;
  name: string;
  type: LocationType;
  levels: PathLevel[];
  x: number;
  y: number;
  description?: string;
};

export type PathEdge = {
  from: string;
  to: string;
  distance: number;
  instruction: string;
  accessible: boolean;
  routeType: RouteType;
};