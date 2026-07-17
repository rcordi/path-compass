"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { nodes } from "@/data/nodes";
import { edges } from "@/data/edges";
import { findRoute } from "@/lib/routeFinder";
import { SearchPanel } from "@/components/SearchPanel";
import type { RoutePreference } from "@/types/path";

const PathMap = dynamic(
  () => import("@/components/PathMap").then((mod) => mod.PathMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading map...
      </div>
    ),
  }
);



export default function Home() {
  const [startId, setStartId] = useState("union-station");
  const [endId, setEndId] = useState("first-canadian-place");
  const [mapClickMode, setMapClickMode] = useState<"start" | "destination">(
    "destination"
  );
  const [routePreference, setRoutePreference] = useState<RoutePreference>("fastest");

  const route = findRoute(startId, endId, nodes, edges, routePreference);
  const [fitRouteTrigger, setFitRouteTrigger] = useState(0);
  
  function updateRouteSelection(type: "start" | "destination", nodeId: string) {
    if (type === "start") {
      setStartId(nodeId);
    } else {
      setEndId(nodeId);
    }

    setFitRouteTrigger((current) => current + 1);
  }
  return (
  <main className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
    <div className="absolute inset-0">
      <PathMap
        nodes={nodes}
        edges={edges}
        route={route}
        startId={startId}
        endId={endId}
        routePreference={routePreference}
        fitRouteTrigger={fitRouteTrigger}
        onSelectNode={(nodeId: string) => {
          updateRouteSelection(mapClickMode, nodeId);
        }}
      />
    </div>

    <div className="absolute left-4 top-4 z-[1100] w-[380px] space-y-4">
      <SearchPanel
        nodes={nodes}
        startId={startId}
        endId={endId}
        onStartChange={(nodeId: string) => updateRouteSelection("start", nodeId)}
        onEndChange={(nodeId: string) =>
          updateRouteSelection("destination", nodeId)
        }
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-xl backdrop-blur">
        <h2 className="text-lg font-semibold">Map click mode</h2>
        <p className="mt-2 text-sm text-slate-400">
          Choose what happens when you click a location marker.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMapClickMode("start")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mapClickMode === "start"
                ? "bg-green-500 text-slate-950"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Set start
          </button>

          <button
            type="button"
            onClick={() => setMapClickMode("destination")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mapClickMode === "destination"
                ? "bg-orange-500 text-slate-950"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Set destination
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-xl backdrop-blur">
        <h2 className="text-lg font-semibold">Route options</h2>

        <div className="mt-3 grid gap-2">
          {[
            { label: "Fastest route", value: "fastest" },
            { label: "Accessible route", value: "accessible" },
            { label: "Avoid stairs", value: "avoid_stairs" },
            { label: "Stay indoors", value: "stay_indoors" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setRoutePreference(option.value as RoutePreference);
                setFitRouteTrigger((current) => current + 1);
              }}
              className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                routePreference === option.value
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </main>
);
}