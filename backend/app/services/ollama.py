import json
import re

import httpx

from app.config import settings
from app.schemas import DMResponse


_THEME_FLAVORS = {
    "classic_fantasy": (
        "a high-fantasy world of dragons, dungeons, ancient ruins, and arcane magic"
    ),
    "pirate": (
        "a swashbuckling pirate world of cursed seas, kraken-haunted depths, "
        "smuggler coves, cutlasses and flintlock pistols"
    ),
    "futuristic": (
        "a far-future sci-fi setting of mech suits, neon space stations, alien factions, "
        "laser pistols, and humming lightblades"
    ),
    "post_apoc": (
        "a scorched post-apocalyptic wasteland of ruined cities, mutated horrors, "
        "scavenged jury-rigged weapons, fallout zones, and roving raider gangs"
    ),
}


SYSTEM_PROMPT = """You are the Dungeon Master for a tabletop RPG. You narrate vividly in 2-4 sentences per response.

Rules you MUST follow:
- Never play the player characters. Their decisions belong to the human players.
- You may voice non-party characters (shopkeepers, foes, allies) briefly.
- When a player attempts something uncertain, request a dice roll using the JSON block below.
- Keep prose evocative but tight. Show, don't lecture.
- Honor the campaign's theme.

If a dice roll is needed, end your reply with EXACTLY this JSON block on a new line (and nothing after):
```json
{"roll": {"sides": <2-100>, "reason": "<short label>", "dc": <difficulty 5-30>}}
```
If no roll is needed, do not include any JSON.
"""


def _parse_roll_block(text: str) -> tuple[str, dict | None]:
    match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if not match:
        return text.strip(), None
    try:
        data = json.loads(match.group(1))
        suggested = data.get("roll")
        narration = text[: match.start()].strip()
        return narration, suggested
    except json.JSONDecodeError:
        return text.strip(), None


async def generate_dm_response(
    *,
    theme: str,
    campaign_name: str,
    history: list[dict],
    player_action: str,
) -> DMResponse:
    flavor = _THEME_FLAVORS.get(theme, _THEME_FLAVORS["classic_fantasy"])
    system = f"{SYSTEM_PROMPT}\n\nCampaign: {campaign_name}\nWorld: {flavor}"

    transcript = "\n".join(f"{e['speaker']}: {e['content']}" for e in history)
    prompt = f"{transcript}\nplayer: {player_action}\ndm:"

    payload = {
        "model": settings.ollama_model,
        "system": system,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.85, "num_predict": 400},
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(f"{settings.ollama_url}/api/generate", json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw = data.get("response", "").strip()
    except httpx.HTTPError as exc:
        return DMResponse(
            narration=(
                "(The DM's voice fades — the local Ollama service is unreachable. "
                f"Make sure Ollama is running and `{settings.ollama_model}` is pulled.) "
                f"[{exc.__class__.__name__}]"
            ),
            suggested_roll=None,
        )

    narration, suggested = _parse_roll_block(raw)
    return DMResponse(narration=narration or "...", suggested_roll=suggested)
