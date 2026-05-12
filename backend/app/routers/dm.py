from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Campaign, StoryEvent, User
from app.schemas import DMPromptRequest, DMResponse
from app.services.ollama import generate_dm_response

router = APIRouter()


@router.post("/narrate", response_model=DMResponse)
async def narrate(
    payload: DMPromptRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    campaign = db.get(Campaign, payload.campaign_id)
    if not campaign or campaign.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Persist the player action.
    db.add(
        StoryEvent(
            campaign_id=campaign.id,
            speaker=f"player:{current.id}",
            content=payload.player_action,
            kind="action",
        )
    )
    db.commit()

    # Build recent context (last 12 events).
    recent = (
        db.query(StoryEvent)
        .filter(StoryEvent.campaign_id == campaign.id)
        .order_by(StoryEvent.created_at.desc())
        .limit(12)
        .all()
    )
    history = [{"speaker": e.speaker, "content": e.content} for e in reversed(recent)]

    response = await generate_dm_response(
        theme=campaign.theme,
        campaign_name=campaign.name,
        history=history,
        player_action=payload.player_action,
    )

    db.add(
        StoryEvent(
            campaign_id=campaign.id,
            speaker="dm",
            content=response.narration,
            kind="narration",
        )
    )
    db.commit()
    return response
