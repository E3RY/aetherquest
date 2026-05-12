import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { THEME_META, type ThemeName } from "../store/theme";

export function CampaignCreate() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<ThemeName>("classic_fantasy");
  const [levelCap, setLevelCap] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const resp = await api.post("/campaigns", {
        name,
        description: description || null,
        theme,
        level_cap: levelCap,
      });
      navigate(`/campaigns/${resp.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="font-display text-4xl text-text mb-2">New Campaign</h1>
      <p className="text-text-dim mb-8">Set the stage. Players join after.</p>

      <form onSubmit={submit} className="space-y-5">
        <Field label="Campaign name" value={name} onChange={setName} placeholder="The Hollow Crown" autoFocus />
        <label className="block">
          <span className="block text-sm text-text-dim mb-1.5">Short description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="A kingdom without a king, an heir without a memory."
            className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-text outline-none focus:border-accent transition"
          />
        </label>

        <div>
          <span className="block text-sm text-text-dim mb-2">Theme</span>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(THEME_META) as ThemeName[]).map((t) => {
              const meta = THEME_META[t];
              const selected = theme === t;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTheme(t)}
                  data-theme={t}
                  className={`text-left p-4 rounded-xl border transition ${
                    selected
                      ? "bg-surface-2 border-accent shadow-[var(--glow)]"
                      : "bg-surface border-border hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span className="text-text font-medium">{meta.label}</span>
                  </div>
                  <div className="text-xs text-text-dim mt-1">{meta.tagline}</div>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="block text-sm text-text-dim mb-1.5">
            Level cap: <span className="text-accent">{levelCap}</span>
          </span>
          <input
            type="range"
            min={1}
            max={99}
            value={levelCap}
            onChange={(e) => setLevelCap(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </label>

        {error && <div className="text-danger text-sm">{error}</div>}

        <button
          type="submit"
          disabled={submitting || !name}
          className="w-full py-3 rounded-lg bg-accent text-bg font-medium shadow-[var(--glow)] hover:brightness-110 transition disabled:opacity-40"
        >
          {submitting ? "Forging the world…" : "Forge Campaign"}
        </button>
      </form>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-text-dim mb-1.5">{label}</span>
      <input
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-text outline-none focus:border-accent transition"
        required
      />
    </label>
  );
}
