"use client";

import { useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  Rectangle,
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

function FitMapToRoute({ route }: { route: RouteResult | null }) {
  const map = useMap();

  if (!route || route.steps.length === 0) {
    return null;
  }

  const routePositions: LatLngExpression[] = [];

  for (const step of route.steps) {
    routePositions.push(toMapPosition(step.from));
    routePositions.push(toMapPosition(step.to));
  }

  if (routePositions.length < 2) {
    return null;
  }

  setTimeout(() => {
    const bounds = latLngBounds(routePositions);
    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 5,
    });
  }, 0);

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

      <div className="absolute bottom-4 left-4 z-[1000] flex gap-2 rounded-2xl border border-slate-700 bg-slate-950/90 p-2 shadow-xl backdrop-blur">
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

      <MapContainer
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

        {/* Simple downtown background blocks */}
        <Rectangle
          bounds={[
            [5, 5],
            [95, 95],
          ]}
          pathOptions={{
            color: "#1e293b",
            weight: 1,
            fillColor: "#0f172a",
            fillOpacity: 0.8,
          }}
        />

        <Rectangle
          bounds={[
            [65, 35],
            [92, 85],
          ]}
          pathOptions={{
            color: "#334155",
            weight: 1,
            fillColor: "#1e293b",
            fillOpacity: 0.5,
          }}
        />

        <Rectangle
          bounds={[
            [35, 35],
            [65, 75],
          ]}
          pathOptions={{
            color: "#334155",
            weight: 1,
            fillColor: "#1e293b",
            fillOpacity: 0.5,
          }}
        />

        <Rectangle
          bounds={[
            [10, 35],
            [35, 75],
          ]}
          pathOptions={{
            color: "#334155",
            weight: 1,
            fillColor: "#1e293b",
            fillOpacity: 0.5,
          }}
        />

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
                color: highlighted ? "#22d3ee" : "#64748b",
                weight: highlighted ? 8 : 4,
                opacity: highlighted ? 0.95 : 0.45,
                lineCap: "round",
              }}
            />
          );
        })}

        {/* Strong route overlay */}
        {routePositions.length > 0 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: "#06b6d4",
              weight: 4,
              opacity: 1,
              lineCap: "round",
            }}
          />
        )}

        {/* Location markers */}
        {visibleNodes.map((node) => {
          const isStart = node.id === startId;
          const isEnd = node.id === endId;
          const isOnRoute =
            route?.steps.some(
              (step) => step.from.id === node.id || step.to.id === node.id
            ) ?? false;

          return (
            <CircleMarker
              key={node.id}
              center={toMapPosition(node)}
              radius={isStart || isEnd ? 11 : isOnRoute ? 9 : 7}
              eventHandlers={{
                click: () => onSelectNode?.(node.id),
              }}
              pathOptions={{
                color: "#020617",
                weight: 2,
                fillColor: isStart
                  ? "#22c55e"
                  : isEnd
                  ? "#f97316"
                  : isOnRoute
                  ? "#22d3ee"
                  : "#cbd5e1",
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} permanent={isStart || isEnd}>
                {node.name}
              </Tooltip>

              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">{node.name}</p>
                  <p>Type: {node.type}</p>
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