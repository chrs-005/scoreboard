import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Medal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1UAthrEnlT1k37Md3YbG31a-tEozkFq72zGoR98N-k6c/gviz/tq?tqx=out:csv&gid=0&range=H10:R10";
const POLL_INTERVAL_MS = 5000;

const initialTeams = [
  {
    id: "bison",
    name: "Bison",
    score: 0,
    colors: {
      from: "from-violet-800",
      to: "to-zinc-900",
      glow: "shadow-violet-500/30",
      text: "text-violet-100",
    },
  },
  {
    id: "leopard",
    name: "Leopard",
    score: 0,
    colors: {
      from: "from-orange-500",
      to: "to-rose-950",
      glow: "shadow-orange-500/30",
      text: "text-orange-100",
    },
  },
  {
    id: "faucon",
    name: "Faucon",
    score: 0,
    colors: {
      from: "from-red-500",
      to: "to-zinc-900",
      glow: "shadow-red-500/30",
      text: "text-red-100",
    },
  },
  {
    id: "panda",
    name: "Panda",
    score: 0,
    colors: {
      from: "from-zinc-900",
      to: "to-slate-100",
      glow: "shadow-white/20",
      text: "text-white",
    },
  },
  {
    id: "requin",
    name: "Requin",
    score: 0,
    colors: {
      from: "from-blue-500",
      to: "to-slate-500",
      glow: "shadow-blue-500/30",
      text: "text-blue-100",
    },
  },
  {
    id: "milan",
    name: "Milan",
    score: 0,
    colors: {
      from: "from-emerald-500",
      to: "to-zinc-950",
      glow: "shadow-emerald-500/30",
      text: "text-emerald-100",
    },
  },
  {
    id: "lynx",
    name: "Lynx",
    score: 0,
    colors: {
      from: "from-orange-500",
      to: "to-zinc-950",
      glow: "shadow-orange-500/30",
      text: "text-orange-100",
    },
  },
  {
    id: "loup",
    name: "Loup",
    score: 0,
    colors: {
      from: "from-red-500",
      to: "to-zinc-950",
      glow: "shadow-red-500/30",
      text: "text-red-100",
    },
  },
  {
    id: "beluga",
    name: "Beluga",
    score: 0,
    colors: {
      from: "from-slate-300",
      to: "to-zinc-950",
      glow: "shadow-slate-300/25",
      text: "text-slate-100",
    },
  },
  {
    id: "espadon",
    name: "Espadon",
    score: 0,
    colors: {
      from: "from-sky-400",
      to: "to-blue-950",
      glow: "shadow-sky-400/30",
      text: "text-sky-100",
    },
  },
  {
    id: "grizzly",
    name: "Grizzly",
    score: 0,
    colors: {
      from: "from-yellow-800",
      to: "to-zinc-950",
      glow: "shadow-yellow-800/30",
      text: "text-yellow-100",
    },
  },
];

const medalStyles = {
  1: {
    label: "1st",
    icon: "text-yellow-300",
    badge: "bg-yellow-400/15 text-yellow-200 border-yellow-300/30",
  },
  2: {
    label: "2nd",
    icon: "text-slate-300",
    badge: "bg-slate-200/15 text-slate-100 border-slate-200/30",
  },
  3: {
    label: "3rd",
    icon: "text-amber-700",
    badge: "bg-amber-700/15 text-amber-200 border-amber-700/30",
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseCsvRow(csv) {
  const row = csv.trim().split(/\r?\n/)[0] ?? "";
  const values = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    const nextChar = row[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value);
  return values;
}

function toSheetScore(value) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const score = Number(normalized);
  return Number.isFinite(score) ? clamp(score, 0, Number.POSITIVE_INFINITY) : 0;
}

export default function App() {
  const [teams, setTeams] = useState(initialTeams);
  const [syncState, setSyncState] = useState({
    status: "loading",
    message: "Syncing",
    lastUpdated: null,
  });

  const fetchSheetScores = useCallback(async () => {
    try {
      setSyncState((prev) => ({
        ...prev,
        status: prev.lastUpdated ? "refreshing" : "loading",
        message: prev.lastUpdated ? "Refreshing" : "Syncing",
      }));

      const response = await fetch(`${SHEET_CSV_URL}&cacheBust=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Sheet request failed with ${response.status}`);
      }

      const csv = await response.text();
      const scores = parseCsvRow(csv).slice(0, initialTeams.length).map(toSheetScore);

      if (scores.length !== initialTeams.length) {
        throw new Error(`Expected ${initialTeams.length} scores, found ${scores.length}`);
      }

      setTeams((prev) =>
        prev.map((team, index) => ({
          ...team,
          score: scores[index],
        }))
      );
      setSyncState({
        status: "synced",
        message: "Live",
        lastUpdated: new Date(),
      });
    } catch (error) {
      setSyncState((prev) => ({
        ...prev,
        status: "error",
        message: "Sheet unavailable",
      }));
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchSheetScores();
    const intervalId = window.setInterval(fetchSheetScores, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [fetchSheetScores]);

  const rankedIds = useMemo(
    () => [...teams].sort((a, b) => b.score - a.score).map((team) => team.id),
    [teams]
  );

  const highestScore = Math.max(...teams.map((team) => team.score), 1);

  const getRank = (teamId) => rankedIds.indexOf(teamId) + 1;
  const syncDotClass =
    syncState.status === "error"
      ? "bg-red-400"
      : syncState.status === "synced"
        ? "bg-emerald-400"
        : "bg-yellow-300";

  return (
    <main className="dark h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020617_35%,_#000000_100%)] text-white">
      <div className="mx-auto flex h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <span className={`h-2.5 w-2.5 rounded-full ${syncDotClass}`} />
            <span className="font-semibold">{syncState.message}</span>
            {syncState.lastUpdated ? (
              <span className="text-slate-400">
                {syncState.lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            ) : null}
          </div>

          <Button
            onClick={fetchSheetScores}
            variant="outline"
            className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
          <div className="flex min-h-0 flex-1 rounded-3xl border border-white/10 bg-black/20 p-3 shadow-xl sm:p-5">
            <div className="relative min-h-0 flex-1 overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.05]">
              <div className="relative flex h-full min-h-[460px] min-w-[1180px] items-end gap-3 overflow-hidden px-3 pb-5 pt-5 lg:min-w-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_20%] opacity-40" />

                {teams.map((team, idx) => {
                  const percentage = highestScore === 0 ? 0 : (team.score / highestScore) * 100;
                  const rank = getRank(team.id);
                  const medal = medalStyles[rank];

                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.04 }}
                      className="relative z-10 flex h-full min-w-[92px] flex-1 flex-col"
                    >
                      <div className="flex h-[108px] flex-col items-center justify-start gap-2 text-center">
                        <div className="flex min-h-[56px] flex-col items-center justify-start gap-1">
                          <span className={`text-base font-bold leading-tight ${team.colors.text}`}>{team.name}</span>
                          {medal ? (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${medal.badge}`}
                            >
                              <Medal className={`h-4 w-4 ${medal.icon}`} />
                              {medal.label}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex h-10 w-20 items-center justify-center rounded-md border border-white/10 bg-black/45 px-2 text-center text-base font-bold text-white">
                          {team.score}
                        </div>
                      </div>

                      <div className="relative mt-3 flex flex-1 items-end justify-center">
                        <div className="relative flex h-full w-full items-end justify-center overflow-hidden rounded-t-3xl border border-white/10 bg-transparent">
                          <motion.div
                            className={`absolute bottom-0 left-0 right-0 rounded-t-3xl bg-gradient-to-t ${team.colors.from} ${team.colors.to} ${team.colors.glow} shadow-2xl`}
                            animate={{ height: `${clamp(percentage, 0, 100)}%` }}
                            transition={{ type: "spring", stiffness: 90, damping: 18 }}
                          />
                          <motion.div
                            className="absolute left-1/2 z-10 -translate-x-1/2 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold backdrop-blur-sm"
                            animate={{ bottom: `calc(${clamp(percentage, 10, 88)}% + 8px)` }}
                            transition={{ type: "spring", stiffness: 110, damping: 16 }}
                          >
                            {team.score}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
