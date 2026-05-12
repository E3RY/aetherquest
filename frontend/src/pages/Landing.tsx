import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/auth";

const features = [
  {
    title: "AI Dungeon Master",
    body: "A local Llama-powered DM weaves your story. No external API costs. No data leaks. The DM never plays your party — every action is yours.",
  },
  {
    title: "Four Worlds, One Engine",
    body: "Classic Fantasy, High Seas, Neon Frontier, or Scorched Earth. Swap themes per campaign — palette, equipment, lore, all reskinned.",
  },
  {
    title: "Real Multiplayer",
    body: "Self-host on your machine, share the link with your friends. Persistent rooms, drop in and out, the campaign waits.",
  },
  {
    title: "Dice That Matter",
    body: "The DM calls for rolls when the moment is uncertain. d2 through d100, with character-stat modifiers. Outcomes change the story.",
  },
];

export function Landing() {
  const token = useAuthStore((s) => s.accessToken);

  return (
    <div className="space-y-24 py-8">
      <section className="text-center max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-6xl md:text-7xl text-text leading-tight"
        >
          Roll for{" "}
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            initiative.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-text-dim"
        >
          A multiplayer tabletop RPG with a local-AI Dungeon Master. Self-hosted, free,
          and the only NPC at the table is the world itself.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <Link
            to={token ? "/dashboard" : "/register"}
            className="px-6 py-3 rounded-lg bg-accent text-bg font-medium shadow-[var(--glow)] hover:brightness-110 transition"
          >
            {token ? "Open Dashboard" : "Begin Your Tale"}
          </Link>
          <Link
            to="/characters/new"
            className="px-6 py-3 rounded-lg border border-border text-text hover:border-accent transition"
          >
            Create a Character
          </Link>
        </motion.div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="p-6 rounded-2xl bg-surface/70 border border-border hover:border-accent/60 transition"
          >
            <h3 className="font-display text-xl text-text mb-2">{f.title}</h3>
            <p className="text-text-dim leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
