import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Character, User
from app.schemas import CharacterCreate, CharacterOut

router = APIRouter()


@router.get("", response_model=list[CharacterOut])
def list_my_characters(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    rows = db.execute(
        select(Character).where(Character.owner_id == current.id).order_by(Character.created_at.desc())
    ).scalars().all()
    return rows


@router.post("", response_model=CharacterOut, status_code=status.HTTP_201_CREATED)
def create_character(
    payload: CharacterCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    con_mod = (payload.abilities.constitution - 10) // 2
    starting_hp = max(1, 10 + con_mod)

    character = Character(
        name=payload.name,
        owner_id=current.id,
        campaign_id=payload.campaign_id,
        race=payload.race,
        char_class=payload.char_class,
        background=payload.background,
        alignment=payload.alignment,
        personality=payload.personality,
        strength=payload.abilities.strength,
        dexterity=payload.abilities.dexterity,
        constitution=payload.abilities.constitution,
        intelligence=payload.abilities.intelligence,
        wisdom=payload.abilities.wisdom,
        charisma=payload.abilities.charisma,
        gold=payload.starting_gold,
        max_hp=starting_hp,
        current_hp=starting_hp,
        armor_class=10 + (payload.abilities.dexterity - 10) // 2,
        equipment_json=json.dumps(payload.equipment.model_dump()),
    )
    db.add(character)
    db.commit()
    db.refresh(character)
    return character


@router.get("/{character_id}", response_model=CharacterOut)
def get_character(
    character_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    character = db.get(Character, character_id)
    if not character or character.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Character not found")
    return character


@router.patch("/{character_id}/campaign/{campaign_id}", response_model=CharacterOut)
def assign_to_campaign(
    character_id: int,
    campaign_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    character = db.get(Character, character_id)
    if not character or character.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Character not found")
    from app.models import Campaign  # local import to avoid cycle on autodoc
    campaign = db.get(Campaign, campaign_id)
    if not campaign or campaign.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Campaign not found")
    character.campaign_id = campaign_id
    db.commit()
    db.refresh(character)
    return character


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_character(
    character_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    character = db.get(Character, character_id)
    if not character or character.owner_id != current.id:
        raise HTTPException(status_code=404, detail="Character not found")
    db.delete(character)
    db.commit()
