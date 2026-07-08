"use client";

import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import { CRS, latLngBounds, LatLngExpression } from "leaflet";
import type { PathEdge, PathLevel, PathNode } from "@/types/path";
import type { RouteResult } from "@/lib/routeFinder";

type PathMapProps = {
  nodes: PathNode[];
  edges: PathEdge[];
  route: RouteResult | null;
  startId: string;
  endId: string;
  onSelectNode?: (nodeId: string) => void;
};

function toMapPosition(node: PathNode): LatLngExpression {
  return [100 - node.y, node.x];
}

function getNodeStyle(node: PathNode, options: {
  isStart: boolean;
  isEnd: boolean;
  isOnRoute: boolean;
}) {
  if (options.isStart) {
    return {
      label: "Start",
      color: "#22c55e",
      emoji: "●",
      radius: 12,
    };
  }

  if (options.isEnd) {
    return {
      label: "Destination",
      color: "#f97316",
      emoji: "●",
      radius: 12,
    };
  }

  if (node.type === "station") {
    return {
      label: "Station",
      color: "#3b82f6",
      emoji: "🚇",
      radius: options.isOnRoute ? 11 : 9,
    };
  }

  if (node.type === "exit" || node.type === "entrance") {
    return {
      label: "Entrance / Exit",
      color: "#facc15",
      emoji: "↗",
      radius: options.isOnRoute ? 10 : 8,
    };
  }

  if (node.type === "concourse") {
    return {
      label: "Concourse",
      color: "#a855f7",
      emoji: "◆",
      radius: options.isOnRoute ? 10 : 8,
    };
  }

  if (node.type === "elevator" || node.type === "ramp") {
    return {
      label: "Accessible Route",
      color: "#14b8a6",
      emoji: "♿",
      radius: options.isOnRoute ? 10 : 8,
    };
  }

  if (node.type === "stairs" || node.type === "escalator") {
    return {
      label: "Level Change",
      color: "#fb7185",
      emoji: "⇅",
      radius: options.isOnRoute ? 10 : 8,
    };
  }

  if (node.type === "washroom") {
    return {
      label: "Washroom",
      color: "#38bdf8",
      emoji: "WC",
      radius: options.isOnRoute ? 10 : 8,
    };
  }

  if (node.type === "food_court") {
    return {
      label: "Food Court",
      color: "#f59e0b",
      emoji: "🍽",
      radius: options.isOnRoute ? 10 : 8,
    };
  }

  if (node.type === "mall") {
    return {
      label: "Mall",
      color: "#ec4899",
      emoji: "▣",
      radius: options.isOnRoute ? 11 : 9,
    };
  }

  if (node.type === "landmark") {
    return {
      label: "Landmark",
      color: "#84cc16",
      emoji: "★",
      radius: options.isOnRoute ? 10 : 8,
    };
  }

  return {
    label: "Building",
    color: options.isOnRoute ? "#22d3ee" : "#cbd5e1",
    emoji: "■",
    radius: options.isOnRoute ? 10 : 8,
  };
}

function FitMapToRoute({ route }: { route: RouteResult | null }) {
  const map = useMap();

  useEffect(() => {
    if (!route || route.steps.length === 0) {
      return;
    }

    const routePositions: LatLngExpression[] = [];

    for (const step of route.steps) {
      routePositions.push(toMapPosition(step.from));
      routePositions.push(toMapPosition(step.to));
    }

    if (routePositions.length < 2) {
      return;
    }

    const bounds = latLngBounds(routePositions);

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 5,
    });
  }, [map, route]);

  return null;
}

export function PathMap({
  nodes,
  edges,
  route,
  startId,
  endId,
  onSelectNode,
}: PathMapProps) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const [activeLevel, setActiveLevel] = useState<PathLevel>("lower");

  const visibleNodes = nodes.filter((node) =>
    node.levels.includes(activeLevel)
  );

  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));

  const visibleEdges = edges.filter(
    (edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)
  );

  const routeEdgeKeys = new Set(
    route?.steps.map((step) => `${step.from.id}-${step.to.id}`) ?? []
  );

  const isRouteEdge = (edge: PathEdge) => {
    return (
      routeEdgeKeys.has(`${edge.from}-${edge.to}`) ||
      routeEdgeKeys.has(`${edge.to}-${edge.from}`)
    );
  };

  const routePositions: LatLngExpression[] =
    route?.steps.flatMap((step) => [
      toMapPosition(step.from),
      toMapPosition(step.to),
    ]) ?? [];

  return (
    <div className="relative h-[650px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
      <div className="absolute left-4 top-4 z-[1000] rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 shadow-xl backdrop-blur">
        <p className="text-sm font-semibold text-white">PATH Map</p>
        <p className="text-xs text-slate-400">Zoom, drag, and select places</p>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] max-w-[520px] rounded-2xl border border-slate-700 bg-slate-950/90 p-3 shadow-xl backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Lower Level", value: "lower" },
            { label: "Retail Level", value: "retail" },
            { label: "Street Level", value: "street" },
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setActiveLevel(level.value as PathLevel)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                activeLevel === level.value
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-300 sm:grid-cols-3">
      <div>
        <span className="mr-1 text-green-400">●</span> Start
      </div>
      <div>
        <span className="mr-1 text-orange-400">●</span> Destination
      </div>
      <div>
        <span className="mr-1 text-blue-400">🚇</span> Station
      </div>
      <div>
        <span className="mr-1 text-yellow-300">↗</span> Entrance / Exit
      </div>
      <div>
        <span className="mr-1 text-purple-400">◆</span> Concourse
      </div>
      <div>
        <span className="mr-1 text-slate-300">■</span> Building
      </div>
    </div>
  </div>

      <MapContainer
        key="path-compass-map"
        crs={CRS.Simple}
        bounds={[
          [0, 0],
          [100, 100],
        ]}
        maxBounds={[
          [-20, -20],
          [120, 120],
        ]}
        center={[50, 50]}
        zoom={3}
        minZoom={2}
        maxZoom={6}
        scrollWheelZoom
        className="h-full w-full bg-slate-950"
      >
        <FitMapToRoute route={route} />

        {/* All PATH connections */}
        {visibleEdges.map((edge) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);

          if (!from || !to) return null;

          const highlighted = isRouteEdge(edge);

          return (
            <Polyline
              key={`${edge.from}-${edge.to}`}
              positions={[toMapPosition(from), toMapPosition(to)]}
              pathOptions={{
                color: highlighted
                  ? edge.hasStairs
                    ? "#fb7185"
                    : edge.routeType === "accessible_alternative"
                    ? "#14b8a6"
                    : "#22d3ee"
                  : edge.routeType === "connecting"
                  ? "#94a3b8"
                  : "#64748b",
                weight: highlighted ? 8 : 4,
                opacity: highlighted ? 0.95 : 0.45,
                lineCap: "round",
                dashArray:
                  edge.routeType === "connecting"
                    ? "8 8"
                    : edge.routeType === "accessible_alternative"
                    ? "2 8"
                    : undefined,
              }}
            />
          );
        })}

        {/* Location markers */}
        {visibleNodes.map((node) => {
          const isStart = node.id === startId;
          const isEnd = node.id === endId;
          const isOnRoute =
            route?.steps.some(
              (step) => step.from.id === node.id || step.to.id === node.id
            ) ?? false;

          const style = getNodeStyle(node, {
            isStart,
            isEnd,
            isOnRoute,
          });

          return (
            <CircleMarker
              key={node.id}
              center={toMapPosition(node)}
              radius={style.radius}
              eventHandlers={{
                click: () => onSelectNode?.(node.id),
              }}
              pathOptions={{
                color: "#020617",
                weight: 2,
                fillColor: style.color,
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} permanent={isStart || isEnd}>
                <span>
                  {style.emoji} {node.name}
                </span>
              </Tooltip>

              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">
                    {style.emoji} {node.name}
                  </p>
                  <p>Category: {style.label}</p>
                  <p>Type: {node.type.replaceAll("_", " ")}</p>
                  <p>Levels: {node.levels.join(", ")}</p>
                  {node.description && <p>{node.description}</p>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}