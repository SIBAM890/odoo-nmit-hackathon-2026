"""
Database engine + session factory.

Using SQLite with check_same_thread=False so FastAPI's async handlers
(which may use a threadpool) can safely access the connection.
We keep a single file-based DB for the hackathon scope.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# connect_args is SQLite-specific; harmless on other engines
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session and closes it on teardown."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
