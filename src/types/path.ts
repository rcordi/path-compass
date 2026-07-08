export type LocationType =
  | "station"
  | "building"
  | "mall"
  | "landmark"
  | "exit"
  | "food_court"
  | "washroom";

export type PathNode = {
  id: string;
  name: string;
  type: LocationType;
  description?: string;
};

export type PathEdge = {
  from: string;
  to: string;
  distance: number;
  instruction: string;
  accessible: boolean;
};