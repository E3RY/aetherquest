from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Campaign, User
from app.schemas import CampaignCreate, CampaignOut

router = APIRouter()


@router.get("", response_model=list[CampaignOut])
def list_my_campaigns(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    rows = db.execute(
        select(Campaign).where(Campaign.owner_id == current.id).order_by(Campaign.created_at.desc())
    ).scalars().all()
    return rows


@router.post("", response_model=CampaignOut, status_code=status.HTTP_201_CREATED)
def create_campaign(
    payload: CampaignCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    campaign = Campaign(
        name=payload.name,
        description=payload.description,
        theme=payload.theme,
        level_cap=payload.level_cap,
        owner_id=current.id,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@router.get("/{campaign_id}", response_model=CampaignOut)
def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    campaign = db.get(Campaign, campaign_id)
    if not campaign or campaign.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign
