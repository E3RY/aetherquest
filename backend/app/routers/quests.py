from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Campaign, Quest, User
from app.schemas import QuestCreate, QuestOut
from app.services.quest_gen import generate_random_quest

router = APIRouter()


def _own_campaign(campaign_id: int, db: Session, user: User) -> Campaign:
    campaign = db.get(Campaign, campaign_id)
    if not campaign or campaign.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


def _own_quest(quest_id: int, db: Session, user: User) -> Quest:
    quest = db.get(Quest, quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    campaign = db.get(Campaign, quest.campaign_id)
    if not campaign or campaign.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Quest not found")
    return quest


@router.get("/campaigns/{campaign_id}", response_model=list[QuestOut])
def list_quests(
    campaign_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    _own_campaign(campaign_id, db, current)
    return (
        db.execute(
            select(Quest)
            .where(Quest.campaign_id == campaign_id)
            .order_by(Quest.created_at.desc())
        )
        .scalars()
        .all()
    )


@router.post("/campaigns/{campaign_id}", response_model=QuestOut, status_code=status.HTTP_201_CREATED)
def create_quest(
    campaign_id: int,
    payload: QuestCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    _own_campaign(campaign_id, db, current)
    quest = Quest(
        campaign_id=campaign_id,
        title=payload.title,
        description=payload.description,
        kind=payload.kind,
        reward_gold=payload.reward_gold,
        reward_xp=payload.reward_xp,
    )
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return quest


@router.post(
    "/campaigns/{campaign_id}/random",
    response_model=QuestOut,
    status_code=status.HTTP_201_CREATED,
)
async def random_quest(
    campaign_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    campaign = _own_campaign(campaign_id, db, current)
    data = await generate_random_quest(theme=campaign.theme)
    quest = Quest(
        campaign_id=campaign_id,
        title=data["title"],
        description=data["description"],
        kind=data["kind"],
        reward_gold=data["reward_gold"],
        reward_xp=data["reward_xp"],
    )
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return quest


@router.patch("/{quest_id}/complete", response_model=QuestOut)
def complete_quest(
    quest_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    quest = _own_quest(quest_id, db, current)
    quest.status = "completed"
    quest.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(quest)
    return quest


@router.delete("/{quest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quest(
    quest_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    quest = _own_quest(quest_id, db, current)
    db.delete(quest)
    db.commit()
