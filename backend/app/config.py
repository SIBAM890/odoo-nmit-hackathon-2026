from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Docstring for Settings."""
    SECRET_KEY: str = "dayflow-super-secret-jwt-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/dayflow_db"
    UPLOAD_DIR: str = "uploads"

    class Config:
        """Docstring for Config."""
        env_file = ".env"


settings = Settings()

