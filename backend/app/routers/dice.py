import secrets

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import DiceRoll, User
from app.schemas import DiceRollOut, DiceRollRequest

router = APIRouter()


def roll(sides: int) -> int:
    """Cryptographically-strong dice roll. Returns 1..sides inclusive."""
    return secrets.randbelow(sides) + 1


@router.post("/roll", response_model=DiceRollOut)
def roll_dice(
    payload: DiceRollRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    result = roll(payload.sides)
    record = DiceRoll(
        campaign_id=payload.campaign_id,
        character_id=payload.character_id,
        sides=payload.sides,
        result=result,
        modifier=payload.modifier,
        reason=payload.reason,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return DiceRollOut(
        id=record.id,
        sides=record.sides,
        result=record.result,
        modifier=record.modifier,
        total=record.result + record.modifier,
        reason=record.reason,
        created_at=record.created_at,
    )
