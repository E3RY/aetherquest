from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "Aetherquest"
    debug: bool = False

    database_url: str = "sqlite:///./aetherquest.db"

    secret_key: str = Field(..., min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    cors_origins: list[str] = ["http://localhost:5173"]

    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"


settings = Settings()
