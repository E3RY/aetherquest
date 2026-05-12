import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { THEME_META, type ThemeName } from "../store/theme";

interface Campaign {
  id: number;
  name: string;
  description: string | null;
  theme: ThemeName;
  level_cap: number;
  is_active: boolean;
  created_at: string;
}

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);

  useEffect(() => {
    api.get<Campaign[]>("/campaigns").then((r) => setCampaigns(r.data));
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-text">Campaigns</h1>
          <p className="text-text-dim mt-1">Worlds awaiting their players.</p>
        </div>
        <Link
          to="/campaigns/new"
          className="px-4 py-2 rounded-lg bg-accent text-bg font-medium shadow-[var(--glow)] hover:brightness-110 transition"
        >
          + New Campaign
        </Link>
      </header>

      {campaigns === null ? (
        <div className="text-text-dim">Loading…</div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-dashed border-border text-center">
          <div className="text-text-dim mb-3">No campaigns yet.</div>
          <Link to="/campaigns/new" className="text-accent hover:underline">
            Forge a world →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c, i) => {
            const meta = THEME_META[c.theme] ?? THEME_META.classic_fantasy;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/campaigns/${c.id}`}
                  className="block p-5 rounded-2xl bg-surface border border-border hover:border-accent transition"
                  data-theme={c.theme}
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-lg text-text">{c.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-dim">
                      {meta.label}
                    </span>
                  </div>
                  {c.description && (
                    <p className="text-sm text-text-dim mt-2 line-clamp-2">{c.description}</p>
                  )}
                  <div className="mt-4 text-xs text-text-dim">Level cap: {c.level_cap}</div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
