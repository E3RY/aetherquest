import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../lib/api";
import { type ChatEntry, useCampaignSocket } from "../hooks/useCampaignSocket";
import { Dice3D } from "../components/Dice3D";
import { type ThemeName } from "../store/theme";

interface Campaign {
  id: number;
  name: string;
  theme: ThemeName;
}

export function Session() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id ? Number(params.id) : null;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const { state, presence, log, sendAction, sendRoll } = useCampaignSocket({ campaignId });

  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  // Dice UI state
  const [diceSides, setDiceSides] = useState(20);
  const [diceModifier, setDiceModifier] = useState(0);
  const [diceReason, setDiceReason] = useState("");
  const [rolling, setRolling] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [rollKey, setRollKey] = useState(0);

  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!campaignId) return;
    api.get<Campaign>(`/campaigns/${campaignId}`).then((r) => setCampaign(r.data));
  }, [campaignId]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [log.length]);

  // Whenever a new roll arrives in the log, surface it in the dice display.
  useEffect(() => {
    const last = [...log].reverse().find((e) => e.kind === "roll") as Extract<ChatEntry, { kind: "roll" }> | undefined;
    if (last) {
      setDiceSides(last.sides);
      setRollResult(last.result);
      setRolling(false);
    }
  }, [log]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sendAction(text);
    setDraft("");
    setPending(true);
    // The DM response will arrive over the socket; clear pending once a narration appears.
  }

  // Clear pending state when the DM responds.
  useEffect(() => {
    if (pending && log.length > 0 && log[log.length - 1].kind === "narration") {
      setPending(false);
    }
  }, [log, pending]);

  function rollNow(sides: number, modifier: number, reason: string) {
    if (!sides) return;
    setRolling(true);
    setRollResult(null);
    setRollKey((k) => k + 1);
    sendRoll(sides, modifier, reason);
  }

  if (!campaignId) return <div className="text-text-dim">Invalid campaign.</div>;

  return (
    <div className="space-y-4" data-theme={campaign?.theme ?? "classic_fantasy"}>
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link to={`/campaigns/${campaignId}`} className="text-sm text-text-dim hover:text-text">
            ← back
          </Link>
          <h1 className="font-display text-3xl text-text mt-1">{campaign?.name ?? "Session"}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <ConnDot state={state} />
          <div className="flex items-center gap-1 text-text-dim">
            <span>at the table:</span>
            {presence.length === 0 ? (
              <span className="italic">just you</span>
            ) : (
              presence.map((u) => (
                <span key={u} className="px-2 py-0.5 rounded-full bg-surface-2 text-text">
                  {u}
                </span>
              ))
            )}
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4 min-h-[70vh]">
        {/* MAIN: narration log + action input */}
        <section className="flex flex-col rounded-2xl bg-surface border border-border overflow-hidden">
          <div ref={scroller} className="flex-1 overflow-y-auto p-5 space-y-3">
            <AnimatePresence initial={false}>
              {log.map((entry) => (
                <LogEntry key={entry.id} entry={entry} onRoll={rollNow} />
              ))}
            </AnimatePresence>
            {pending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-text-dim italic text-sm"
              >
                The DM is composing the next moment…
              </motion.div>
            )}
          </div>
          <form onSubmit={submit} className="border-t border-border p-3 flex gap-2 bg-surface-2/40">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="I push open the heavy oak door and step inside…"
              disabled={state !== "open"}
              className="flex-1 px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-text outline-none focus:border-accent transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={state !== "open" || !draft.trim()}
              className="px-5 py-2.5 rounded-lg bg-accent text-bg font-medium hover:brightness-110 transition disabled:opacity-40"
            >
              Act
            </button>
          </form>
        </section>

        {/* SIDEBAR: dice + roll controls */}
        <aside className="rounded-2xl bg-surface border border-border p-4 space-y-3">
          <h3 className="font-display text-lg text-text">Dice</h3>

          <Dice3D sides={diceSides} rollKey={rollKey} result={rollResult} rolling={rolling} />

          {rollResult !== null && !rolling && (
            <div className="text-center">
              <div className="text-3xl font-display text-accent">{rollResult}</div>
              {diceModifier !== 0 && (
                <div className="text-xs text-text-dim">
                  {diceModifier >= 0 ? `+${diceModifier}` : diceModifier} →{" "}
                  <span className="text-accent-2">{rollResult + diceModifier}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="block">
              <span className="text-xs text-text-dim">Sides</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[4, 6, 8, 10, 12, 20, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => setDiceSides(n)}
                    className={`px-2.5 py-1 rounded text-xs border transition ${
                      diceSides === n
                        ? "bg-accent text-bg border-accent"
                        : "border-border text-text-dim hover:text-text"
                    }`}
                  >
                    d{n}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="text-xs text-text-dim">Modifier</span>
              <input
                type="number"
                value={diceModifier}
                onChange={(e) => setDiceModifier(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded bg-surface-2 border border-border text-text text-sm outline-none focus:border-accent"
              />
            </label>

            <label className="block">
              <span className="text-xs text-text-dim">Reason</span>
              <input
                value={diceReason}
                onChange={(e) => setDiceReason(e.target.value)}
                placeholder="stealth check"
                className="w-full mt-1 px-3 py-1.5 rounded bg-surface-2 border border-border text-text text-sm outline-none focus:border-accent"
              />
            </label>

            <button
              onClick={() => rollNow(diceSides, diceModifier, diceReason)}
              disabled={state !== "open" || rolling}
              className="w-full py-2 rounded-lg bg-accent text-bg font-medium hover:brightness-110 transition disabled:opacity-40"
            >
              {rolling ? "Rolling…" : `Roll d${diceSides}`}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ConnDot({ state }: { state: "connecting" | "open" | "closed" }) {
  const color =
    state === "open" ? "bg-success" : state === "connecting" ? "bg-accent-2" : "bg-danger";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-dim">
      <span className={`w-2 h-2 rounded-full ${color} ${state === "open" ? "animate-pulse" : ""}`} />
      {state}
    </span>
  );
}

function LogEntry({
  entry,
  onRoll,
}: {
  entry: ChatEntry;
  onRoll: (sides: number, modifier: number, reason: string) => void;
}) {
  if (entry.kind === "narration") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-surface-2/60 border-l-4 border-accent"
      >
        <div className="text-xs uppercase tracking-wider text-accent mb-1">Dungeon Master</div>
        <p className="text-text leading-relaxed whitespace-pre-wrap">{entry.content}</p>
        {entry.suggestedRoll && (
          <button
            onClick={() => onRoll(entry.suggestedRoll!.sides, 0, entry.suggestedRoll!.reason)}
            className="mt-3 px-3 py-1.5 rounded-lg bg-accent text-bg text-sm font-medium hover:brightness-110 transition"
          >
            🎲 Roll d{entry.suggestedRoll.sides} ({entry.suggestedRoll.reason})
            {entry.suggestedRoll.dc !== undefined && (
              <span className="ml-2 text-bg/80">DC {entry.suggestedRoll.dc}</span>
            )}
          </button>
        )}
      </motion.div>
    );
  }
  if (entry.kind === "action") {
    const speaker = entry.speaker.startsWith("player:") ? entry.speaker.slice(7) : entry.speaker;
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pl-4">
        <div className="text-xs uppercase tracking-wider text-text-dim">{speaker}</div>
        <p className="text-text-dim italic">{entry.content}</p>
      </motion.div>
    );
  }
  // roll
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 text-sm text-text-dim"
    >
      <span className="px-2 py-1 rounded bg-surface-2 text-accent font-display text-base">
        {entry.result}
      </span>
      <span>
        <span className="text-text">{entry.speaker}</span> rolled d{entry.sides}
        {entry.modifier !== 0 && (
          <>
            {" "}
            {entry.modifier >= 0 ? "+" : ""}
            {entry.modifier} = <span className="text-accent-2">{entry.total}</span>
          </>
        )}
        {entry.reason && <span className="text-text-dim"> · {entry.reason}</span>}
      </span>
    </motion.div>
  );
}
