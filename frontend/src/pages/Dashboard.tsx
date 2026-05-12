import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";

interface Character {
  id: number;
  name: string;
  race: string;
  char_class: string;
  level: number;
  gold: number;
  alignment: string;
}

export function Dashboard() {
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [me, setMe] = useState<{ username: string } | null>(null);

  useEffect(() => {
    api.get("/auth/me").then((r) => setMe(r.data));
    api.get<Character[]>("/characters").then((r) => setCharacters(r.data));
  }, []);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl text-text">
          Welcome, <span className="text-accent">{me?.username ?? "…"}</span>
        </h1>
        <p className="text-text-dim mt-1">Your roster awaits.</p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-text">Characters</h2>
          <Link
            to="/characters/new"
            className="px-4 py-2 rounded-lg bg-accent text-bg text-sm font-medium hover:brightness-110 transition shadow-[var(--glow)]"
          >
            + New Character
          </Link>
        </div>

        {characters === null ? (
          <div className="text-text-dim">Loading…</div>
        ) : characters.length === 0 ? (
          <div className="p-12 rounded-2xl bg-surface border border-dashed border-border text-center">
            <div className="text-text-dim mb-3">No characters yet.</div>
            <Link to="/characters/new" className="text-accent hover:underline">
              Forge your first hero →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-surface border border-border hover:border-accent transition"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg text-text">{c.name}</h3>
                  <span className="text-xs text-text-dim">Lv {c.level}</span>
                </div>
                <div className="text-sm text-text-dim mt-1">
                  {c.race} · {c.char_class}
                </div>
                <div className="text-xs text-text-dim mt-2">{c.alignment}</div>
                <div className="mt-4 flex items-center gap-1 text-accent-2 text-sm">
                  <span>⊙</span> {c.gold} gold
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
