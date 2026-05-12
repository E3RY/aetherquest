import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../lib/api";
import {
  ALIGNMENTS,
  ARMOR,
  BACKGROUNDS,
  CLASSES,
  type Option,
  RACES,
  SECONDARIES,
  TOOLS,
  WEAPONS,
} from "../data/options";

const STEPS = [
  { id: "race", label: "Race" },
  { id: "class", label: "Class" },
  { id: "abilities", label: "Abilities" },
  { id: "background", label: "Background" },
  { id: "personality", label: "Personality" },
  { id: "alignment", label: "Alignment" },
  { id: "equipment", label: "Equipment" },
  { id: "gold", label: "Starting Gold" },
] as const;

const ABILITIES = [
  { key: "strength", label: "Strength" },
  { key: "dexterity", label: "Dexterity" },
  { key: "constitution", label: "Constitution" },
  { key: "intelligence", label: "Intelligence" },
  { key: "wisdom", label: "Wisdom" },
  { key: "charisma", label: "Charisma" },
] as const;

type AbilityKey = (typeof ABILITIES)[number]["key"];

interface FormState {
  name: string;
  race: string;
  char_class: string;
  abilities: Record<AbilityKey, number>;
  background: string;
  personality: string;
  alignment: string;
  equipment: { weapon: string; secondary: string; armor: string; tool: string };
  starting_gold: number;
}

const INITIAL: FormState = {
  name: "",
  race: "",
  char_class: "",
  abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  background: "",
  personality: "",
  alignment: "",
  equipment: { weapon: "", secondary: "", armor: "", tool: "" },
  starting_gold: 25,
};

export function CharacterCreate() {
  const [stepIdx, setStepIdx] = useState(0);
  const [state, setState] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const step = STEPS[stepIdx];

  const canAdvance = useMemo(() => {
    switch (step.id) {
      case "race": return !!state.race && state.name.trim().length > 0;
      case "class": return !!state.char_class;
      case "abilities": return true;
      case "background": return !!state.background;
      case "personality": return state.personality.trim().length > 0;
      case "alignment": return !!state.alignment;
      case "equipment":
        return !!state.equipment.weapon && !!state.equipment.armor;
      case "gold": return true;
    }
  }, [step.id, state]);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/characters", {
        name: state.name,
        race: state.race,
        char_class: state.char_class,
        background: state.background,
        alignment: state.alignment,
        personality: state.personality,
        abilities: state.abilities,
        equipment: state.equipment,
        starting_gold: state.starting_gold,
      });
      navigate("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0]?.msg : detail || "Failed to create character");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-8 min-h-[70vh]">
      {/* HEADER */}
      <h1 className="col-span-12 font-display text-4xl text-text">Create your Character</h1>

      {/* STEPPER */}
      <aside className="col-span-12 md:col-span-3">
        <ol className="relative space-y-3">
          <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" aria-hidden />
          {STEPS.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <li key={s.id} className="relative">
                <button
                  type="button"
                  onClick={() => i <= stepIdx && setStepIdx(i)}
                  className="flex items-center gap-3 group w-full text-left"
                >
                  <span
                    className={`relative z-10 w-7 h-7 rounded-full grid place-items-center text-xs font-bold border transition ${
                      done
                        ? "bg-accent border-accent text-bg"
                        : active
                        ? "bg-surface-2 border-accent text-accent shadow-[var(--glow)]"
                        : "bg-surface border-border text-text-dim"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span
                    className={`text-sm uppercase tracking-wider ${
                      active ? "text-text" : done ? "text-text-dim" : "text-text-dim/60"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* CONTENT */}
      <section className="col-span-12 md:col-span-9">
        <div className="rounded-2xl bg-surface/70 border border-border p-6 md:p-8 min-h-[60vh] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {step.id === "race" && (
                <RaceStep
                  name={state.name}
                  setName={(name) => setState((s) => ({ ...s, name }))}
                  value={state.race}
                  onChange={(race) => setState((s) => ({ ...s, race }))}
                />
              )}
              {step.id === "class" && (
                <CardGrid
                  title="Choose a Class"
                  options={CLASSES}
                  value={state.char_class}
                  onChange={(v) => setState((s) => ({ ...s, char_class: v }))}
                />
              )}
              {step.id === "abilities" && (
                <AbilitiesStep
                  abilities={state.abilities}
                  setAbility={(k, v) =>
                    setState((s) => ({ ...s, abilities: { ...s.abilities, [k]: v } }))
                  }
                />
              )}
              {step.id === "background" && (
                <CardGrid
                  title="Choose a Background"
                  options={BACKGROUNDS}
                  value={state.background}
                  onChange={(v) => setState((s) => ({ ...s, background: v }))}
                />
              )}
              {step.id === "personality" && (
                <PersonalityStep
                  value={state.personality}
                  onChange={(v) => setState((s) => ({ ...s, personality: v }))}
                />
              )}
              {step.id === "alignment" && (
                <CardGrid
                  title="Choose an Alignment"
                  options={ALIGNMENTS}
                  value={state.alignment}
                  onChange={(v) => setState((s) => ({ ...s, alignment: v }))}
                />
              )}
              {step.id === "equipment" && (
                <EquipmentStep
                  value={state.equipment}
                  onChange={(eq) => setState((s) => ({ ...s, equipment: eq }))}
                />
              )}
              {step.id === "gold" && (
                <GoldStep
                  value={state.starting_gold}
                  onChange={(v) => setState((s) => ({ ...s, starting_gold: v }))}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {error && <div className="text-danger text-sm mt-4">{error}</div>}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              className="px-4 py-2 rounded-lg text-text-dim border border-border hover:text-text disabled:opacity-40 transition"
            >
              ← Back
            </button>
            {stepIdx < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStepIdx((i) => i + 1)}
                disabled={!canAdvance}
                className="px-5 py-2 rounded-lg bg-accent text-bg font-medium shadow-[var(--glow)] hover:brightness-110 transition disabled:opacity-40"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canAdvance || submitting}
                className="px-5 py-2 rounded-lg bg-accent text-bg font-medium shadow-[var(--glow)] hover:brightness-110 transition disabled:opacity-40"
              >
                {submitting ? "Forging…" : "Forge Hero"}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============ STEP COMPONENTS ============ */

function CardGrid({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-text mb-4">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((o) => {
          const selected = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`text-left p-4 rounded-xl border transition ${
                selected
                  ? "bg-surface-2 border-accent shadow-[var(--glow)]"
                  : "bg-surface border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-text font-medium">{o.name}</span>
                {selected && <span className="text-accent text-xs">●</span>}
              </div>
              <div className="text-xs text-text-dim mt-1 leading-relaxed">{o.blurb}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RaceStep({
  name,
  setName,
  value,
  onChange,
}: {
  name: string;
  setName: (v: string) => void;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <label className="block max-w-md">
        <span className="block text-sm text-text-dim mb-1.5">Character name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Thalindra of the Silver Glade"
          className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-text outline-none focus:border-accent transition"
        />
      </label>
      <CardGrid title="Choose a Race" options={RACES} value={value} onChange={onChange} />
    </div>
  );
}

function AbilitiesStep({
  abilities,
  setAbility,
}: {
  abilities: Record<AbilityKey, number>;
  setAbility: (k: AbilityKey, v: number) => void;
}) {
  const total = Object.values(abilities).reduce((a, b) => a + b, 0);
  const POINT_BUDGET = 75;
  const remaining = POINT_BUDGET - total;

  function modifier(score: number) {
    return Math.floor((score - 10) / 2);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-2xl text-text">Distribute Abilities</h2>
        <div className="text-sm">
          <span className="text-text-dim">Points remaining:</span>{" "}
          <span className={remaining < 0 ? "text-danger" : "text-accent-2"}>{remaining}</span>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {ABILITIES.map((a) => {
          const score = abilities[a.key];
          const mod = modifier(score);
          return (
            <div
              key={a.key}
              className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border"
            >
              <div>
                <div className="text-text font-medium">{a.label}</div>
                <div className="text-xs text-text-dim">
                  Modifier: {mod >= 0 ? `+${mod}` : mod}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAbility(a.key, Math.max(3, score - 1))}
                  className="w-8 h-8 rounded-md bg-surface-2 border border-border text-text hover:border-accent transition"
                >
                  −
                </button>
                <span className="font-display text-2xl text-accent w-10 text-center">{score}</span>
                <button
                  type="button"
                  onClick={() => setAbility(a.key, Math.min(20, score + 1))}
                  className="w-8 h-8 rounded-md bg-surface-2 border border-border text-text hover:border-accent transition"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PersonalityStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-text mb-2">Define a Personality</h2>
      <p className="text-text-dim mb-4">
        A sentence or two. What drives them? What scares them? Speech, tics, mannerisms.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Quiet. Trusts animals more than people. Hums old songs when nervous. Carries a wooden token from a friend long dead."
        className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-text outline-none focus:border-accent transition resize-y"
      />
    </div>
  );
}

function EquipmentColumn({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl bg-surface border border-border p-3">
      <div className="text-xs uppercase tracking-wider text-text-dim mb-2 px-1">{title}</div>
      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
        {options.map((o) => {
          const selected = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md transition ${
                selected ? "bg-surface-2 text-text" : "text-text-dim hover:text-text hover:bg-surface-2/60"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full border ${
                  selected ? "bg-accent border-accent" : "border-border"
                }`}
              />
              <span className="text-sm uppercase tracking-wide">{o.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EquipmentStep({
  value,
  onChange,
}: {
  value: FormState["equipment"];
  onChange: (v: FormState["equipment"]) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-text mb-4">Pack your kit</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <EquipmentColumn title="Weapon" options={WEAPONS} value={value.weapon} onChange={(v) => onChange({ ...value, weapon: v })} />
        <EquipmentColumn title="Secondary" options={SECONDARIES} value={value.secondary} onChange={(v) => onChange({ ...value, secondary: v })} />
        <EquipmentColumn title="Armor" options={ARMOR} value={value.armor} onChange={(v) => onChange({ ...value, armor: v })} />
        <EquipmentColumn title="Tool & Ammo" options={TOOLS} value={value.tool} onChange={(v) => onChange({ ...value, tool: v })} />
      </div>
    </div>
  );
}

function GoldStep({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-text mb-4">Starting Gold</h2>
      <div className="flex items-center gap-6 max-w-2xl">
        <div className="font-display text-6xl text-accent-2 w-32 text-center">{value}</div>
        <input
          type="range"
          min={0}
          max={200}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[var(--accent)]"
        />
      </div>
      <p className="text-text-dim text-sm mt-4">
        Pouches of coin, hard-won or freshly inherited. Spend it on lodging, lockpicks, or favors —
        the DM will set the prices.
      </p>
    </div>
  );
}
