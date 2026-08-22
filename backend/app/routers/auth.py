"""
Auth router — register, login, me, verify email.

Security notes:
- Login returns specific errors for "wrong email" vs "wrong password"
  so the UI can show targeted messages, but we deliberately do NOT
  distinguish them at the HTTP level to avoid user enumeration.
  (We do show specific messages here for hackathon demo clarity.)
- Passwords are NEVER stored or logged in plaintext.
- verify_token is a random URL-safe token stored on the user row;
  in production it would be emailed — here the register response
  includes it so the demo can show the flow.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.security import (
    create_access_token,
    generate_verify_token,
    hash_password,
    verify_password,
)
from app.database.db import get_db
from app.models.employee import Employee
from app.models.user import User, UserRole
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
    VerifyEmailResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Check uniqueness
    """Docstring for register."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    if db.query(User).filter(User.employee_id == payload.employee_id).first():
        raise HTTPException(status_code=409, detail="Employee ID already in use")

    verify_token = generate_verify_token()

    user = User(
        employee_id=payload.employee_id,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_verified=False,
        verify_token=verify_token,
    )
    db.add(user)
    db.flush()  # get user.id before creating employee profile

    # Auto-create an employee profile stub
    employee = Employee(user_id=user.id, full_name=payload.employee_id)
    db.add(employee)
    db.commit()
    db.refresh(user)

    return {
        "message": "Registration successful. Please verify your email.",
        "verify_token": verify_token,  # in production, this would be emailed
        "user_id": user.id,
    }


@router.get("/verify/{token}", response_model=VerifyEmailResponse)
def verify_email(token: str, db: Session = Depends(get_db)):
    """Docstring for verify_email."""
    user = db.query(User).filter(User.verify_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid or expired verification token")
    if user.is_verified:
        return VerifyEmailResponse(message="Email already verified", is_verified=True)

    user.is_verified = True
    user.verify_token = None  # consume the token
    db.commit()
    return VerifyEmailResponse(message="Email verified successfully", is_verified=True)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Docstring for login."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        role=user.role,
        employee_id=user.employee_id,
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Docstring for me."""
    return current_user

