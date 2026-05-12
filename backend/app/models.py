from datetime import datetime, timezone

from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    characters: Mapped[list["Character"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    campaigns_owned: Mapped[list["Campaign"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    description: Mapped[str | None] = mapped_column(Text)
    theme: Mapped[str] = mapped_column(String(40), default="classic_fantasy")
    level_cap: Mapped[int] = mapped_column(Integer, default=20)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    owner: Mapped["User"] = relationship(back_populates="campaigns_owned")
    characters: Mapped[list["Character"]] = relationship(back_populates="campaign")
    quests: Mapped[list["Quest"]] = relationship(
        back_populates="campaign", cascade="all, delete-orphan"
    )
    story_events: Mapped[list["StoryEvent"]] = relationship(
        back_populates="campaign", cascade="all, delete-orphan"
    )


class Character(Base):
    __tablename__ = "characters"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(60))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    campaign_id: Mapped[int | None] = mapped_column(ForeignKey("campaigns.id"))

    race: Mapped[str] = mapped_column(String(40))
    char_class: Mapped[str] = mapped_column(String(40))
    background: Mapped[str] = mapped_column(String(40))
    alignment: Mapped[str] = mapped_column(String(40))
    personality: Mapped[str] = mapped_column(Text, default="")

    level: Mapped[int] = mapped_column(Integer, default=1)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    gold: Mapped[int] = mapped_column(Integer, default=0)

    strength: Mapped[int] = mapped_column(Integer, default=10)
    dexterity: Mapped[int] = mapped_column(Integer, default=10)
    constitution: Mapped[int] = mapped_column(Integer, default=10)
    intelligence: Mapped[int] = mapped_column(Integer, default=10)
    wisdom: Mapped[int] = mapped_column(Integer, default=10)
    charisma: Mapped[int] = mapped_column(Integer, default=10)

    max_hp: Mapped[int] = mapped_column(Integer, default=10)
    current_hp: Mapped[int] = mapped_column(Integer, default=10)
    armor_class: Mapped[int] = mapped_column(Integer, default=10)

    # JSON-serialized equipment slots: {"weapon": "...", "secondary": "...", "armor": "...", "tool": "..."}
    equipment_json: Mapped[str] = mapped_column(Text, default="{}")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    owner: Mapped["User"] = relationship(back_populates="characters")
    campaign: Mapped["Campaign | None"] = relationship(back_populates="characters")


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[int] = mapped_column(primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"))
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    kind: Mapped[str] = mapped_column(String(20), default="short")  # short | long | random
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | completed | failed
    reward_gold: Mapped[int] = mapped_column(Integer, default=0)
    reward_xp: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    campaign: Mapped["Campaign"] = relationship(back_populates="quests")


class StoryEvent(Base):
    __tablename__ = "story_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"))
    speaker: Mapped[str] = mapped_column(String(60))  # "dm" | "player:<id>" | "system"
    content: Mapped[str] = mapped_column(Text)
    kind: Mapped[str] = mapped_column(String(20), default="narration")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    campaign: Mapped["Campaign"] = relationship(back_populates="story_events")


class DiceRoll(Base):
    __tablename__ = "dice_rolls"

    id: Mapped[int] = mapped_column(primary_key=True)
    campaign_id: Mapped[int | None] = mapped_column(ForeignKey("campaigns.id"))
    character_id: Mapped[int | None] = mapped_column(ForeignKey("characters.id"))
    sides: Mapped[int] = mapped_column(Integer, default=20)
    result: Mapped[int] = mapped_column(Integer)
    modifier: Mapped[int] = mapped_column(Integer, default=0)
    reason: Mapped[str] = mapped_column(String(200), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
