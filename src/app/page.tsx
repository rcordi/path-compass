"use client";

import { useState } from "react";
import { nodes } from "@/data/nodes";
import { edges } from "@/data/edges";
import { findRoute } from "@/lib/routeFinder";

export default function Home() {
  const [startId, setStartId] = useState("union-station");
  const [endId, setEndId] = useState("first-canadian-place");

  const route = findRoute(startId, endId, nodes, edges);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Path Compass
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Toronto PATH Navigator
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Plan indoor walking routes through Toronto&apos;s PATH network.
            This first version supports a small route between major PATH
            buildings and stations.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold">Find a route</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Start</span>
              <select
                value={startId}
                onChange={(event) => setStartId(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-slate-300">Destination</span>
              <select
                value={endId}
                onChange={(event) => setEndId(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold">Directions</h2>

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
                Estimated route distance score:{" "}
                <span className="font-semibold text-white">
                  {route.totalDistance}
                </span>
              </p>

              <ol className="mt-6 space-y-4">
                {route.steps.map((step, index) => (
                  <li
                    key={`${step.from.id}-${step.to.id}`}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="text-sm font-semibold text-cyan-300">
                      Step {index + 1}
                    </p>
                    <p className="mt-1 font-medium">
                      {step.from.name} → {step.to.name}
                    </p>
                    <p className="mt-2 text-slate-300">{step.instruction}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </section>
    </main>
  );
}