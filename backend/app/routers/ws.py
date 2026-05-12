import secrets
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from app.database import SessionLocal
from app.models import Campaign, DiceRoll, StoryEvent, User
from app.security import decode_token
from app.services.ollama import generate_dm_response

router = APIRouter()


class Hub:
    """In-memory presence + broadcast hub. Sufficient for single-process self-hosting."""

    def __init__(self) -> None:
        self.rooms: dict[int, list[tuple[WebSocket, str]]] = {}

    async def join(self, campaign_id: int, ws: WebSocket, username: str) -> None:
        self.rooms.setdefault(campaign_id, []).append((ws, username))
        await self.broadcast_presence(campaign_id)

    async def leave(self, campaign_id: int, ws: WebSocket) -> None:
        room = self.rooms.get(campaign_id)
        if not room:
            return
        self.rooms[campaign_id] = [(w, u) for w, u in room if w is not ws]
        if not self.rooms[campaign_id]:
            self.rooms.pop(campaign_id, None)
        else:
            await self.broadcast_presence(campaign_id)

    async def broadcast(self, campaign_id: int, message: dict[str, Any]) -> None:
        room = self.rooms.get(campaign_id, [])
        dead: list[WebSocket] = []
        for ws, _ in list(room):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.leave(campaign_id, ws)

    async def broadcast_presence(self, campaign_id: int) -> None:
        users = sorted({u for _, u in self.rooms.get(campaign_id, [])})
        await self.broadcast(campaign_id, {"type": "presence", "users": users})


hub = Hub()


def _authenticate(token: str | None) -> tuple[int, str] | None:
    if not token:
        return None
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    sub = payload.get("sub")
    if not sub:
        return None
    db = SessionLocal()
    try:
        user = db.get(User, int(sub))
        return (user.id, user.username) if user else None
    finally:
        db.close()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.websocket("/campaigns/{campaign_id}")
async def campaign_session(websocket: WebSocket, campaign_id: int, token: str | None = None):
    auth = _authenticate(token)
    if not auth:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    user_id, username = auth

    # Verify the user has access to this campaign.
    db = SessionLocal()
    try:
        campaign = db.get(Campaign, campaign_id)
        if not campaign or campaign.owner_id != user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        campaign_theme = campaign.theme
        campaign_name = campaign.name
    finally:
        db.close()

    await websocket.accept()
    await hub.join(campaign_id, websocket, username)

    # Send recent history so newcomers can catch up.
    try:
        db = SessionLocal()
        try:
            recent = (
                db.query(StoryEvent)
                .filter(StoryEvent.campaign_id == campaign_id)
                .order_by(StoryEvent.created_at.desc())
                .limit(50)
                .all()
            )
        finally:
            db.close()
        history_events = [
            {
                "type": "narration" if e.kind == "narration" else "action",
                "speaker": e.speaker,
                "content": e.content,
                "id": e.id,
                "created_at": e.created_at.isoformat(),
            }
            for e in reversed(recent)
        ]
        await websocket.send_json({"type": "history", "events": history_events})
    except Exception:
        pass

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "action":
                content = str(data.get("content", "")).strip()
                if not content:
                    continue

                # Persist player action.
                db = SessionLocal()
                try:
                    db.add(
                        StoryEvent(
                            campaign_id=campaign_id,
                            speaker=f"player:{username}",
                            content=content,
                            kind="action",
                        )
                    )
                    db.commit()
                    recent = (
                        db.query(StoryEvent)
                        .filter(StoryEvent.campaign_id == campaign_id)
                        .order_by(StoryEvent.created_at.desc())
                        .limit(12)
                        .all()
                    )
                    history = [{"speaker": e.speaker, "content": e.content} for e in reversed(recent)]
                finally:
                    db.close()

                await hub.broadcast(campaign_id, {
                    "type": "action",
                    "speaker": f"player:{username}",
                    "content": content,
                    "created_at": _now_iso(),
                })

                # Ask the DM. This may take 5-30s on local Llama; that's OK.
                response = await generate_dm_response(
                    theme=campaign_theme,
                    campaign_name=campaign_name,
                    history=history,
                    player_action=content,
                )

                db = SessionLocal()
                try:
                    db.add(
                        StoryEvent(
                            campaign_id=campaign_id,
                            speaker="dm",
                            content=response.narration,
                            kind="narration",
                        )
                    )
                    db.commit()
                finally:
                    db.close()

                await hub.broadcast(campaign_id, {
                    "type": "narration",
                    "speaker": "dm",
                    "content": response.narration,
                    "suggested_roll": response.suggested_roll,
                    "created_at": _now_iso(),
                })

            elif msg_type == "roll":
                try:
                    sides = int(data.get("sides", 20))
                    modifier = int(data.get("modifier", 0))
                except (TypeError, ValueError):
                    continue
                if not (2 <= sides <= 100):
                    continue
                modifier = max(-50, min(50, modifier))
                reason = str(data.get("reason", ""))[:200]

                result = secrets.randbelow(sides) + 1

                db = SessionLocal()
                try:
                    db.add(
                        DiceRoll(
                            campaign_id=campaign_id,
                            sides=sides,
                            result=result,
                            modifier=modifier,
                            reason=reason,
                        )
                    )
                    db.commit()
                finally:
                    db.close()

                await hub.broadcast(campaign_id, {
                    "type": "roll",
                    "speaker": username,
                    "sides": sides,
                    "modifier": modifier,
                    "result": result,
                    "total": result + modifier,
                    "reason": reason,
                    "created_at": _now_iso(),
                })

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        await hub.leave(campaign_id, websocket)
