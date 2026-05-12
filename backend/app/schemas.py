from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- auth ----------

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_-]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
    created_at: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ---------- characters ----------

class AbilityScores(BaseModel):
    strength: int = Field(ge=1, le=30, default=10)
    dexterity: int = Field(ge=1, le=30, default=10)
    constitution: int = Field(ge=1, le=30, default=10)
    intelligence: int = Field(ge=1, le=30, default=10)
    wisdom: int = Field(ge=1, le=30, default=10)
    charisma: int = Field(ge=1, le=30, default=10)


class Equipment(BaseModel):
    weapon: str | None = None
    secondary: str | None = None
    armor: str | None = None
    tool: str | None = None


class CharacterCreate(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    race: str = Field(min_length=1, max_length=40)
    char_class: str = Field(min_length=1, max_length=40)
    background: str = Field(min_length=1, max_length=40)
    alignment: str = Field(min_length=1, max_length=40)
    personality: str = ""
    abilities: AbilityScores = AbilityScores()
    equipment: Equipment = Equipment()
    starting_gold: int = Field(ge=0, le=10000, default=10)
    campaign_id: int | None = None


class CharacterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    race: str
    char_class: str
    background: str
    alignment: str
    personality: str
    level: int
    xp: int
    gold: int
    strength: int
    dexterity: int
    constitution: int
    intelligence: int
    wisdom: int
    charisma: int
    max_hp: int
    current_hp: int
    armor_class: int
    equipment_json: str
    campaign_id: int | None
    created_at: datetime


# ---------- campaigns ----------

ThemeName = Literal["classic_fantasy", "pirate", "futuristic", "post_apoc"]


class CampaignCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str | None = None
    theme: ThemeName = "classic_fantasy"
    level_cap: int = Field(ge=1, le=99, default=20)


class CampaignOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str | None
    theme: str
    level_cap: int
    owner_id: int
    is_active: bool
    created_at: datetime


# ---------- quests ----------

QuestKind = Literal["short", "long", "random"]
QuestStatus = Literal["active", "completed", "failed"]


class QuestCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = ""
    kind: QuestKind = "short"
    reward_gold: int = Field(ge=0, default=0)
    reward_xp: int = Field(ge=0, default=0)


class QuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    campaign_id: int
    title: str
    description: str
    kind: str
    status: str
    reward_gold: int
    reward_xp: int
    created_at: datetime
    completed_at: datetime | None


# ---------- dice ----------

class DiceRollRequest(BaseModel):
    sides: int = Field(ge=2, le=100, default=20)
    modifier: int = Field(ge=-50, le=50, default=0)
    reason: str = Field(max_length=200, default="")
    character_id: int | None = None
    campaign_id: int | None = None


class DiceRollOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    sides: int
    result: int
    modifier: int
    total: int
    reason: str
    created_at: datetime


# ---------- DM / narration ----------

class DMPromptRequest(BaseModel):
    campaign_id: int
    player_action: str = Field(min_length=1, max_length=2000)


class DMResponse(BaseModel):
    narration: str
    suggested_roll: dict | None = None  # {"sides": 20, "reason": "stealth check", "dc": 14}
