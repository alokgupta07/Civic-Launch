"""
Central app configuration, read from environment variables (.env).
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "GovInnovate API"
    API_V1_PREFIX: str = "/api/v1"

    # Defaults to a local SQLite file so the API runs with zero setup.
    # Point this at Postgres in production, e.g.
    # postgresql://user:password@localhost:5432/gov_innovate
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./gov_innovate.db")

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-this-secret-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Comma-separated list of origins allowed to call this API from the browser.
    # The Vite dev server defaults to http://localhost:5173.
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")


settings = Settings()
