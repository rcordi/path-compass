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
      <div className="flex h-[650px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-300">
        Loading map...
      </div>
    ),
  }
);

export default function Home() {
  const [startId, setStartId] = useState("union-station");
  const [endId, setEndId] = useState("first-canadian-place");
  const [routePreference, setRoutePreference] = useState<RoutePreference>("fastest");

  const route = findRoute(startId, endId, nodes, edges, routePreference);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Path Compass
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Toronto PATH Navigator
          </h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Search and plan indoor walking routes through Toronto&apos;s PATH
            network. This prototype starts with major PATH-connected buildings
            and stations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-6">
            <SearchPanel
                nodes={nodes}
                startId={startId}
                endId={endId}
                onStartChange={setStartId}
                onEndChange={setEndId}
              />
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold">Route options</h2>
          <p className="mt-2 text-sm text-slate-400">
            Choose how the route should be planned.
          </p>

          <div className="mt-4 grid gap-2">
            {[
              { label: "Fastest route", value: "fastest" },
              { label: "Accessible route", value: "accessible" },
              { label: "Avoid stairs", value: "avoid_stairs" },
              { label: "Stay indoors", value: "stay_indoors" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRoutePreference(option.value as RoutePreference)}
                className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  routePreference === option.value
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-950 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <h2 className="text-xl font-semibold">Route summary</h2>

              {!route ? (
                <p className="mt-4 text-red-300">
                  No route found between those locations yet.
                </p>
              ) : route.steps.length === 0 ? (
                <p className="mt-4 text-slate-300">
                  You are already at your destination.
                </p>
              ) : (
                <>
                  <p className="mt-4 text-slate-300">
                    Distance score:{" "}
                    <span className="font-semibold text-white">
                      {route.totalDistance}
                    </span>
                  </p>

                  <ol className="mt-4 space-y-3">
                    {route.steps.map((step, index) => (
                      <li
                        key={`${step.from.id}-${step.to.id}`}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-3"
                      >
                        <p className="text-xs font-semibold text-cyan-300">
                          Step {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {step.from.name} → {step.to.name}
                        </p>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </aside>

          <PathMap
            nodes={nodes}
            edges={edges}
            route={route}
            startId={startId}
            endId={endId}
          />
        </div>
      </section>
    </main>
  );
}