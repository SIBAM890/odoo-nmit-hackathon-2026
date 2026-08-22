"""
Dayflow HRMS — FastAPI application entry point.

Startup:
1. Creates all DB tables (SQLAlchemy DDL)
2. Seeds demo data
3. Mounts static file directory for uploaded profile pictures
4. Registers all routers
5. Adds CORS for the Vite dev server (localhost:5173)
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.db import engine
from app.database.seed import seed
from app.models import Base
from app.routers import auth, attendance, employees, leaves, payroll

# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Dayflow HRMS API",
    description="Human Resource Management System for Odoo x NMIT Hackathon 2026",
    version="1.0.0",
    # Disable default OpenAPI endpoints for production; keep for hackathon demo
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS — allow Vite dev server + any localhost port ─────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB init ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    # Create uploads directory for profile pictures
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    seed()


# ── Static files (profile picture uploads) ───────────────────────────────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(leaves.router)
app.include_router(payroll.router)


@app.get("/", tags=["health"])
def health():
    return {"status": "ok", "app": "Dayflow HRMS", "version": "1.0.0"}
