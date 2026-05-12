import json

import httpx

from app.config import settings


_THEME_FLAVORS = {
    "classic_fantasy": "a high-fantasy world of dragons, dungeons, and arcane ruins",
    "pirate": "a cursed pirate sea, kraken-haunted depths, and smuggler coves",
    "futuristic": "a neon space-faring future with mechs, alien factions, and lightblades",
    "post_apoc": "a scorched post-apocalyptic wasteland of ruins, raiders, and mutants",
}

_FALLBACKS = {
    "classic_fantasy": {
        "title": "A Whisper in the Tavern",
        "description": "An anxious stranger offers coin for a problem they won't name aloud. Meet them at dusk by the well.",
    },
    "pirate": {
        "title": "The Drowned Captain's Map",
        "description": "A waterlogged map surfaces from a drifting longboat. Three islands are circled; one is X'd through in red.",
    },
    "futuristic": {
        "title": "Static from the Wreckline",
        "description": "A derelict mining hauler broadcasts a distress loop on a dead frequency. Salvage rights are unclear.",
    },
    "post_apoc": {
        "title": "Smoke from the Old Highway",
        "description": "A trade caravan never reached the settlement. Their flare gun's last burn is still smouldering twelve miles east.",
    },
}


PROMPT_TEMPLATE = """Generate one short tabletop RPG quest as a JSON object.
Output ONLY the JSON object, no preamble or markdown.

Schema:
{{
  "title": "<3 to 7 words, evocative and specific>",
  "description": "<2 to 3 sentences setting up the hook, with a sense of stakes>",
  "kind": "short",
  "reward_gold": <integer 20 to 150>,
  "reward_xp": <integer 50 to 400>
}}

Theme: {flavor}
"""


async def generate_random_quest(*, theme: str) -> dict:
    flavor = _THEME_FLAVORS.get(theme, _THEME_FLAVORS["classic_fantasy"])
    prompt = PROMPT_TEMPLATE.format(flavor=flavor)
    fallback = _FALLBACKS.get(theme, _FALLBACKS["classic_fantasy"])

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{settings.ollama_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0.9, "num_predict": 250},
                },
            )
            resp.raise_for_status()
            raw = resp.json().get("response", "")
            data = json.loads(raw)
    except (httpx.HTTPError, json.JSONDecodeError, ValueError, TypeError):
        return {
            "title": fallback["title"],
            "description": fallback["description"],
            "kind": "short",
            "reward_gold": 50,
            "reward_xp": 150,
        }

    kind = data.get("kind", "short")
    if kind not in {"short", "long"}:
        kind = "short"
    return {
        "title": str(data.get("title") or fallback["title"])[:120],
        "description": str(data.get("description") or fallback["description"])[:1000],
        "kind": kind,
        "reward_gold": max(0, min(10000, int(data.get("reward_gold", 50) or 50))),
        "reward_xp": max(0, min(100000, int(data.get("reward_xp", 150) or 150))),
    }
