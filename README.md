# Aetherquest

A multiplayer, AI-DM'd custom tabletop RPG you can host yourself and play with friends.

## Features

- **AI Dungeon Master** — runs locally via Ollama + Llama 3, no external API costs
- **Real-time multiplayer** — WebSocket sessions, drop in/out of a campaign
- **Theme presets** — Classic Fantasy, Pirate, Futuristic, Post-Apocalyptic (palette, icons, lore, equipment swap)
- **Long-term progression** — customizable level cap per campaign
- **AI-driven dice rolls** — DM decides when to roll (d1–d20), outcomes shape the story
- **Quests** — long-term arcs + short-term jobs + randomly named encounters
- **3D overworld map** — Three.js, theme-aware
- **Player characters only** — no NPC party members; every action is a player choice

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Three.js, Zustand |
| Backend | Python 3.10, FastAPI, SQLAlchemy 2, Pydantic v2 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | Ollama + Llama 3 (local) |
| Realtime | WebSockets via FastAPI |
| Auth | Argon2id password hashing + JWT session tokens |

## Quick start

### Prereqs
- Node 20+
- Python 3.10+
- [Ollama](https://ollama.com) with `llama3` pulled

### Backend
```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # then edit .env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

### Ollama
```powershell
ollama pull llama3
# Ollama runs as a Windows service automatically.
```

## Security

- Passwords: **Argon2id** (PHC winner) — no SHA/MD5 ever.
- Sessions: signed **JWT** tokens, short-lived access + rotating refresh.
- SQL: queries go through SQLAlchemy ORM with bound parameters — no string interpolation, no `text()` with user input.
- Secrets: loaded from `.env`, validated at startup, never logged.
- CORS: locked to configured origins.
- TLS: terminate at the reverse proxy (Caddy / nginx) in production.
- Database-at-rest: enable SQLCipher in production, or use Postgres TDE.

## License

MIT.
