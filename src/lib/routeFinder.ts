import type { PathEdge, PathNode, RoutePreference } from "@/types/path";

export type RouteStep = {
  from: PathNode;
  to: PathNode;
  instruction: string;
  distance: number;
};

export type RouteResult = {
  steps: RouteStep[];
  totalDistance: number;
};

export function findRoute(
  startId: string,
  endId: string,
  nodes: PathNode[],
  edges: PathEdge[],
  preference: RoutePreference = "fastest"
): RouteResult | null {
  if (startId === endId) {
    return {
      steps: [],
      totalDistance: 0,
    };
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const filteredEdges = edges.filter((edge) => {
    if (preference === "accessible" && !edge.accessible) {
      return false;
    }

    if (preference === "avoid_stairs" && edge.hasStairs) {
      return false;
    }
    return true;
  });

  function getEdgeCost(edge: PathEdge) {
    let cost = edge.distance;

    if (preference === "stay_indoors" && edge.indoor === false) {
      cost += 10;
    }
    return cost;
  }

  const graph = new Map<string, PathEdge[]>();

  for (const edge of filteredEdges) {
    if (!graph.has(edge.from)) graph.set(edge.from, []);
    if (!graph.has(edge.to)) graph.set(edge.to, []);

    graph.get(edge.from)?.push(edge);

    graph.get(edge.to)?.push({
  from: edge.to,
  to: edge.from,
  distance: edge.distance,
  instruction: `Go back from ${nodeMap.get(edge.to)?.name} toward ${
    nodeMap.get(edge.from)?.name
  }.`,
  accessible: edge.accessible,
  routeType: edge.routeType,
});
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const node of nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }

  distances.set(startId, 0);

  while (unvisited.size > 0) {
    let current: string | null = null;

    for (const nodeId of unvisited) {
      if (current === null || distances.get(nodeId)! < distances.get(current)!) {
        current = nodeId;
      }
    }

    if (current === null || distances.get(current) === Infinity) break;

    if (current === endId) break;

    unvisited.delete(current);

    const neighbors = graph.get(current) ?? [];

    for (const edge of neighbors) {
      const newDistance = distances.get(current)! + getEdgeCost(edge);

      if (newDistance < distances.get(edge.to)!) {
        distances.set(edge.to, newDistance);
        previous.set(edge.to, current);
      }
    }
  }

  const path: string[] = [];
  let current: string | null = endId;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  if (path[0] !== startId) {
    return null;
  }

  const steps: RouteStep[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];

    const edge =
    filteredEdges.find((edge) => edge.from === fromId && edge.to === toId) ??
    filteredEdges.find((edge) => edge.from === toId && edge.to === fromId);

    const fromNode = nodeMap.get(fromId);
    const toNode = nodeMap.get(toId);

    if (!edge || !fromNode || !toNode) {
      return null;
    }

    steps.push({
      from: fromNode,
      to: toNode,
      instruction:
        edge.from === fromId
          ? edge.instruction
          : `Go back from ${fromNode.name} toward ${toNode.name}.`,
      distance: edge.distance,
    });
  }

  return {
    steps,
    totalDistance: distances.get(endId) ?? 0,
  };
}