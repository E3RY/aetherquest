import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { OverworldMap } from "../components/OverworldMap";
import { type ThemeName } from "../store/theme";

interface Campaign {
  id: number;
  name: string;
  description: string | null;
  theme: ThemeName;
  level_cap: number;
}

interface Character {
  id: number;
  name: string;
  race: string;
  char_class: string;
  level: number;
  gold: number;
  campaign_id: number | null;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  kind: string;
  status: string;
  reward_gold: number;
  reward_xp: number;
}

export function CampaignPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id ? Number(params.id) : null;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [unassigned, setUnassigned] = useState<Character[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    api.get<Campaign>(`/campaigns/${campaignId}`).then((r) => setCampaign(r.data));
    api.get<Character[]>("/characters").then((r) => {
      setCharacters(r.data.filter((c) => c.campaign_id === campaignId));
      setUnassigned(r.data.filter((c) => c.campaign_id === null));
    });
    refreshQuests();
  }, [campaignId]);

  async function refreshQuests() {
    if (!campaignId) return;
    const r = await api.get<Quest[]>(`/quests/campaigns/${campaignId}`);
    setQuests(r.data);
  }

  async function generateQuest() {
    if (!campaignId) return;
    setGenerating(true);
    try {
      await api.post(`/quests/campaigns/${campaignId}/random`);
      await refreshQuests();
    } finally {
      setGenerating(false);
    }
  }

  async function completeQuest(id: number) {
    await api.patch(`/quests/${id}/complete`);
    await refreshQuests();
  }

  async function assignCharacter(characterId: number) {
    if (!campaignId) return;
    await api.patch(`/characters/${characterId}/campaign/${campaignId}`);
    const r = await api.get<Character[]>("/characters");
    setCharacters(r.data.filter((c) => c.campaign_id === campaignId));
    setUnassigned(r.data.filter((c) => c.campaign_id === null));
  }

  if (!campaign) return <div className="text-text-dim">Loading…</div>;

  return (
    <div className="space-y-8" data-theme={campaign.theme}>
      <header className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-display text-4xl text-text">{campaign.name}</h1>
          {campaign.description && (
            <p className="text-text-dim mt-2 max-w-2xl">{campaign.description}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-text-dim">
            <span className="px-2 py-0.5 rounded-full bg-surface-2">Level cap: {campaign.level_cap}</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-2">Theme: {campaign.theme}</span>
          </div>
        </div>
        <Link
          to={`/campaigns/${campaign.id}/session`}
          className="px-5 py-3 rounded-lg bg-accent text-bg font-medium shadow-[var(--glow)] hover:brightness-110 transition"
        >
          ▶ Enter Session
        </Link>
      </header>

      <OverworldMap
        theme={campaign.theme}
        markers={quests.filter((q) => q.status === "active").map((q, i) => ({
          id: q.id,
          label: q.title,
          x: ((i * 71) % 60) / 20 - 1.5,
          z: ((i * 53) % 60) / 20 - 1.5,
        }))}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-text">Quests</h2>
            <button
              onClick={generateQuest}
              disabled={generating}
              className="px-3 py-1.5 rounded-md text-sm bg-surface-2 border border-border hover:border-accent transition disabled:opacity-50"
            >
              {generating ? "Consulting the Oracle…" : "✨ Random Quest"}
            </button>
          </div>
          {quests.length === 0 ? (
            <div className="p-8 rounded-xl bg-surface border border-dashed border-border text-center text-text-dim">
              No quests yet. Generate one or let the DM weave them in play.
            </div>
          ) : (
            <ul className="space-y-3">
              {quests.map((q) => (
                <motion.li
                  key={q.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl bg-surface border ${
                    q.status === "completed" ? "border-success/50 opacity-70" : "border-border"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg text-text">{q.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-text-dim">
                      <span>{q.reward_gold}g · {q.reward_xp}xp</span>
                      {q.status === "active" && (
                        <button
                          onClick={() => completeQuest(q.id)}
                          className="px-2 py-0.5 rounded bg-surface-2 hover:text-success transition"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-text-dim mt-1">{q.description}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <h2 className="font-display text-2xl text-text">Party</h2>
          {characters.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface border border-dashed border-border text-text-dim text-sm">
              No characters in this campaign.
            </div>
          ) : (
            <ul className="space-y-2">
              {characters.map((c) => (
                <li key={c.id} className="p-3 rounded-lg bg-surface border border-border">
                  <div className="font-medium text-text">{c.name}</div>
                  <div className="text-xs text-text-dim">
                    Lv {c.level} {c.race} {c.char_class} · {c.gold}g
                  </div>
                </li>
              ))}
            </ul>
          )}

          {unassigned.length > 0 && (
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-text-dim mb-2">Add to campaign</div>
              <div className="space-y-1">
                {unassigned.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => assignCharacter(c.id)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-surface border border-dashed border-border hover:border-accent text-sm transition"
                  >
                    + {c.name} <span className="text-text-dim text-xs">({c.race} {c.char_class})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
