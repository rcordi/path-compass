import type { PathEdge } from "@/types/path";

export const edges: PathEdge[] = [
  {
    from: "union-station",
    to: "royal-bank-plaza",
    distance: 3,
    instruction: "From Union Station, follow the PATH signs toward Royal Bank Plaza.",
    accessible: true,
  },
  {
    from: "royal-bank-plaza",
    to: "brookfield-place",
    distance: 4,
    instruction: "Continue through Royal Bank Plaza toward Brookfield Place.",
    accessible: true,
  },
  {
    from: "brookfield-place",
    to: "commerce-court",
    distance: 5,
    instruction: "Walk north through the PATH from Brookfield Place toward Commerce Court.",
    accessible: true,
  },
  {
    from: "commerce-court",
    to: "first-canadian-place",
    distance: 3,
    instruction: "Continue west through Commerce Court toward First Canadian Place.",
    accessible: true,
  },
  {
    from: "first-canadian-place",
    to: "richmond-adelaide-centre",
    distance: 4,
    instruction: "From First Canadian Place, follow the PATH north toward Richmond-Adelaide Centre.",
    accessible: true,
  },
  {
    from: "richmond-adelaide-centre",
    to: "cf-eaton-centre",
    distance: 7,
    instruction: "Continue northeast through the PATH toward CF Toronto Eaton Centre.",
    accessible: true,
  },
];