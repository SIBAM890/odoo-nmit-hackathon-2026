"""
PostgreSQL Database configuration and session manager.
Aliases db.py for convenience.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings
from app.database.db import Base, SessionLocal, engine, get_db, DATABASE_URL

__all__ = ["Base", "SessionLocal", "engine", "get_db", "DATABASE_URL"]
