import type { PathNode } from "@/types/path";

export const nodes: PathNode[] = [
  {
    id: "union-station",
    name: "Union Station",
    type: "station",
    description: "Major TTC, GO, VIA, and UP Express connection.",
  },
  {
    id: "royal-bank-plaza",
    name: "Royal Bank Plaza",
    type: "building",
    description: "PATH-connected office and retail complex near Union Station.",
  },
  {
    id: "brookfield-place",
    name: "Brookfield Place",
    type: "building",
    description: "PATH-connected complex near Front Street and Bay Street.",
  },
  {
    id: "commerce-court",
    name: "Commerce Court",
    type: "building",
    description: "PATH-connected office complex in the Financial District.",
  },
  {
    id: "first-canadian-place",
    name: "First Canadian Place",
    type: "building",
    description: "Major PATH-connected tower near King and Bay.",
  },
  {
    id: "richmond-adelaide-centre",
    name: "Richmond-Adelaide Centre",
    type: "building",
    description: "PATH-connected complex north of the Financial District core.",
  },
  {
    id: "cf-eaton-centre",
    name: "CF Toronto Eaton Centre",
    type: "mall",
    description: "Major shopping centre connected to the PATH near Queen Station.",
  },
];