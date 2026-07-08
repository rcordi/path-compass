import type { PathEdge, PathNode } from "@/types/path";
import type { RouteResult } from "@/lib/routeFinder";

type PathMapProps = {
  nodes: PathNode[];
  edges: PathEdge[];
  route: RouteResult | null;
  startId: string;
  endId: string;
  onSelectNode?: (nodeId: string) => void;
};

export function PathMap({
  nodes,
  edges,
  route,
  startId,
  endId,
  onSelectNode,
}: PathMapProps) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const routeEdgeKeys = new Set(
    route?.steps.map((step) => `${step.from.id}-${step.to.id}`) ?? []
  );

  const isRouteEdge = (edge: PathEdge) => {
    return (
      routeEdgeKeys.has(`${edge.from}-${edge.to}`) ||
      routeEdgeKeys.has(`${edge.to}-${edge.from}`)
    );
  };

  return (
    <div className="h-full rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">PATH Map</h2>
          <p className="text-sm text-slate-400">
            Prototype visual route map
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-cyan-200">
            Route
          </span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
            PATH
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <svg
          viewBox="0 0 100 100"
          className="h-[520px] w-full cursor-grab touch-none"
          role="img"
          aria-label="Interactive Toronto PATH route map prototype"
        >
          <rect width="100" height="100" fill="transparent" />

          {/* Background grid */}
          {Array.from({ length: 11 }).map((_, index) => (
            <g key={index}>
              <line
                x1={index * 10}
                y1="0"
                x2={index * 10}
                y2="100"
                stroke="rgba(148, 163, 184, 0.12)"
                strokeWidth="0.2"
              />
              <line
                x1="0"
                y1={index * 10}
                x2="100"
                y2={index * 10}
                stroke="rgba(148, 163, 184, 0.12)"
                strokeWidth="0.2"
              />
            </g>
          ))}

          {/* Existing PATH connections */}
          {edges.map((edge) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);

            if (!from || !to) return null;

            const highlighted = isRouteEdge(edge);

            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={highlighted ? "#22d3ee" : "#475569"}
                strokeWidth={highlighted ? 2.8 : 1.2}
                strokeLinecap="round"
                opacity={highlighted ? 1 : 0.55}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isStart = node.id === startId;
            const isEnd = node.id === endId;
            const isOnRoute =
              route?.steps.some(
                (step) => step.from.id === node.id || step.to.id === node.id
              ) ?? false;

            return (
              <g
                key={node.id}
                onClick={() => onSelectNode?.(node.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isStart || isEnd ? 2.6 : 2}
                  fill={
                    isStart
                      ? "#22c55e"
                      : isEnd
                      ? "#f97316"
                      : isOnRoute
                      ? "#22d3ee"
                      : "#cbd5e1"
                  }
                  stroke="#020617"
                  strokeWidth="0.8"
                />

                <text
                  x={node.x + 2.8}
                  y={node.y + 0.8}
                  fontSize="2.6"
                  fill="#e2e8f0"
                >
                  {node.name}
                </text>

                <text
                  x={node.x + 2.8}
                  y={node.y + 3.8}
                  fontSize="1.8"
                  fill="#94a3b8"
                >
                  {node.levels.join(", ")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
        <div>
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-500" />
          Start
        </div>
        <div>
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-orange-500" />
          Destination
        </div>
        <div>
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-cyan-400" />
          Route
        </div>
      </div>
    </div>
  );
}