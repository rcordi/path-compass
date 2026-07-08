"use client";

import { useEffect, useMemo, useState } from "react";
import type { PathNode } from "@/types/path";

type SearchPanelProps = {
  nodes: PathNode[];
  startId: string;
  endId: string;
  onStartChange: (nodeId: string) => void;
  onEndChange: (nodeId: string) => void;
};

type SearchBoxProps = {
  label: string;
  placeholder: string;
  nodes: PathNode[];
  selectedId: string;
  onSelect: (nodeId: string) => void;
};

function SearchBox({
  label,
  placeholder,
  nodes,
  selectedId,
  onSelect,
}: SearchBoxProps) {
  const selectedNode = nodes.find((node) => node.id === selectedId);
  const [query, setQuery] = useState(selectedNode?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => { setQuery(selectedNode?.name ?? ""); }, [selectedNode]);

  const results = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    if (!searchText) {
      return nodes.slice(0, 6);
    }

    return nodes
      .filter((node) => {
        const searchableText = [
          node.name,
          node.type,
          node.levels.join(" "),
          node.description ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchText);
      })
      .slice(0, 6);
  }, [nodes, query]);

  return (
    <div className="relative">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-300">{label}</span>

        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
        />
      </label>

      {isOpen && (
        <div className="absolute z-[1200] mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">
              No matching PATH locations yet.
            </p>
          ) : (
            results.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  onSelect(node.id);
                  setQuery(node.name);
                  setIsOpen(false);
                }}
                className="block w-full border-b border-slate-800 px-4 py-3 text-left last:border-b-0 hover:bg-slate-900"
              >
                <p className="font-medium text-white">{node.name}</p>
                <p className="mt-1 text-xs capitalize text-slate-400">
                  {node.type.replaceAll("_", " ")} · {node.levels.join(", ")}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function SearchPanel({
  nodes,
  startId,
  endId,
  onStartChange,
  onEndChange,
}: SearchPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <h2 className="text-xl font-semibold">Search PATH</h2>
      <p className="mt-2 text-sm text-slate-400">
        Search for buildings, stations, entrances, and PATH-connected places.
      </p>

      <div className="mt-6 grid gap-4">
        <SearchBox
          label="Start"
          placeholder="Search starting point..."
          nodes={nodes}
          selectedId={startId}
          onSelect={onStartChange}
        />

        <SearchBox
          label="Destination"
          placeholder="Search destination..."
          nodes={nodes}
          selectedId={endId}
          onSelect={onEndChange}
        />
      </div>
    </div>
  );
}