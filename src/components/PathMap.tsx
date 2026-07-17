"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import { CRS, latLngBounds, LatLngExpression } from "leaflet";
import type {
  PathEdge,
  PathLevel,
  PathNode,
  RoutePreference,
} from "@/types/path";
import type { RouteResult } from "@/lib/routeFinder";

type PathMapProps = {
  nodes: PathNode[];
  edges: PathEdge[];
  route: RouteResult | null;
  startId: string;
  endId: string;
  routePreference: RoutePreference;
  fitRouteTrigger: number;
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

function getRouteLineStyle(edge: PathEdge, highlighted: boolean) {
  if (edge.hasStairs) {
    return {
      color: highlighted ? "#f43f5e" : "#fb7185",
      weight: highlighted ? 8 : 4,
      opacity: highlighted ? 1 : 0.5,
      dashArray: "4 6",
    };
  }

  if (edge.routeType === "accessible_alternative") {
    return {
      color: highlighted ? "#10b981" : "#14b8a6",
      weight: highlighted ? 8 : 4,
      opacity: highlighted ? 1 : 0.55,
      dashArray: "2 8",
    };
  }

  if (edge.routeType === "connecting") {
    return {
      color: highlighted ? "#facc15" : "#94a3b8",
      weight: highlighted ? 7 : 4,
      opacity: highlighted ? 0.95 : 0.45,
      dashArray: "8 8",
    };
  }

  return {
    color: highlighted ? "#2563eb" : "#64748b",
    weight: highlighted ? 8 : 4,
    opacity: highlighted ? 1 : 0.45,
    dashArray: undefined,
  };
}

function findMatchingEdge(
  routeStep: { from: PathNode; to: PathNode },
  edges: PathEdge[]
) {
  return edges.find(
    (edge) =>
      (edge.from === routeStep.from.id && edge.to === routeStep.to.id) ||
      (edge.from === routeStep.to.id && edge.to === routeStep.from.id)
  );
}

function FitMapToRoute({
  route,
  fitRouteTrigger,
}: {
  route: RouteResult | null;
  fitRouteTrigger: number;
}) {
  const map = useMap();
  const previousTriggerRef = useRef(fitRouteTrigger);

  useEffect(() => {
    if (previousTriggerRef.current === fitRouteTrigger) {
      return;
    }

    previousTriggerRef.current = fitRouteTrigger;

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
      padding: [90, 90],
      maxZoom: 5,
    });
  }, [fitRouteTrigger, map, route]);

  return null;
}

export function PathMap({
  nodes,
  edges,
  route,
  startId,
  endId,
  routePreference,
  fitRouteTrigger,
  onSelectNode,
}: PathMapProps) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const startNode = nodeMap.get(startId);
  const endNode = nodeMap.get(endId);

  const routePreferenceLabel =
    routePreference === "fastest"
      ? "Fastest route"
      : routePreference === "accessible"
      ? "Accessible route"
      : routePreference === "avoid_stairs"
      ? "Avoid stairs"
      : "Stay indoors";
    const routeEdges =
    route?.steps
      .map((step) => findMatchingEdge(step, edges))
      .filter((edge): edge is PathEdge => Boolean(edge)) ?? [];

  const routeUsesStairs = routeEdges.some((edge) => edge.hasStairs);
  const routeHasOutdoorSegment = routeEdges.some((edge) => edge.indoor === false);
  const routeUsesAccessibleAlternative = routeEdges.some(
    (edge) => edge.routeType === "accessible_alternative"
  );

  const routeChangesLevels =
    route?.steps.some((step) => {
      const fromLevels = step.from.levels;
      const toLevels = step.to.levels;

      return !fromLevels.some((level) => toLevels.includes(level));
    }) ?? false;

  const routeWarnings = [
    routeUsesStairs ? "This route uses stairs." : null,
    routeHasOutdoorSegment
      ? "This route includes an outdoor or street-level segment."
      : null,
    routeUsesAccessibleAlternative
      ? "This route uses an accessible alternative connection."
      : null,
    routeChangesLevels ? "This route may require changing levels." : null,
  ].filter((warning): warning is string => Boolean(warning));

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

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950">
      <div className="absolute left-4 top-4 z-[1000] rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 shadow-xl backdrop-blur">
        <p className="text-sm font-semibold text-white">PATH Map</p>
        <p className="text-xs text-slate-400">Zoom, drag, and select places</p>
      </div>

  {/* Route Card */}
  <div className="absolute right-4 top-24 z-[1000] w-[340px] rounded-3xl border border-slate-700 bg-slate-950/95 p-4 shadow-2xl backdrop-blur">
  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
    Current route
  </p>

  <div className="mt-3">
    <p className="text-sm text-slate-400">From</p>
    <p className="font-semibold text-white">
      {startNode?.name ?? "Select start"}
    </p>
  </div>

  <div className="my-3 h-px bg-slate-800" />

  <div>
    <p className="text-sm text-slate-400">To</p>
    <p className="font-semibold text-white">
      {endNode?.name ?? "Select destination"}
    </p>
  </div>

  <div className="mt-4 grid grid-cols-2 gap-3">
    <div className="rounded-xl bg-slate-900 p-3">
      <p className="text-xs text-slate-400">Distance score</p>
      <p className="mt-1 text-lg font-bold text-white">
        {route ? route.totalDistance : "—"}
      </p>
    </div>

    <div className="rounded-xl bg-slate-900 p-3">
      <p className="text-xs text-slate-400">Segments</p>
      <p className="mt-1 text-lg font-bold text-white">
        {route ? route.steps.length : "—"}
      </p>
    </div>
  </div>

  <div className="mt-3 rounded-xl bg-slate-900 p-3">
    <p className="text-xs text-slate-400">Route type</p>
    <p className="mt-1 text-sm font-semibold text-cyan-300">
      {routePreferenceLabel}
    </p>
  </div>

    <div className="mt-3 rounded-xl bg-slate-900 p-3">
    <p className="text-xs text-slate-400">Route notes</p>

    {!route || route.steps.length === 0 ? (
      <p className="mt-1 text-sm text-slate-400">
        Select a start and destination to see route notes.
      </p>
    ) : routeWarnings.length === 0 ? (
      <p className="mt-1 text-sm font-semibold text-emerald-300">
        No major warnings for this route.
      </p>
    ) : (
      <ul className="mt-2 space-y-1">
        {routeWarnings.map((warning) => (
          <li key={warning} className="text-sm text-amber-300">
            • {warning}
          </li>
        ))}
      </ul>
    )}
  </div>

   <div className="absolute right-4 bottom-4 z-[1000] flex flex-col gap-2">
  <button
    type="button"
    disabled
    className="rounded-full border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm font-semibold text-slate-400 shadow-xl backdrop-blur"
    title="Live location will be added later"
  >
    ◎ Live location
  </button>

  <button
    type="button"
    disabled
    className="rounded-full border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm font-semibold text-slate-400 shadow-xl backdrop-blur"
    title="Recenter will be added as a manual control later"
  >
    ⌖ Recenter
  </button>
</div>

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
      <div>
        <span className="mr-1 text-blue-500">━</span> Main route
      </div>
      <div>
        <span className="mr-1 text-yellow-300">┅</span> Connecting
      </div>
      <div>
        <span className="mr-1 text-emerald-400">┈</span> Accessible
      </div>
      <div>
        <span className="mr-1 text-rose-400">┅</span> Stairs
      </div>
    </div>
  </div>

      <MapContainer
        key="path-compass-map"
        crs={CRS.Simple}
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
        <FitMapToRoute route={route} fitRouteTrigger={fitRouteTrigger} />

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
              pathOptions={{...getRouteLineStyle(edge, highlighted),
                lineCap: "round",
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