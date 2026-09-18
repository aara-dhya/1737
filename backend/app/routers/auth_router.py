import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import User, Organization, ApiKey
from backend.app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_api_key,
    get_current_user_or_api_key,
    require_role,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    org_name: Optional[str] = "Default Quantitative Org"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str

class ApiKeyCreateRequest(BaseModel):
    name: str = "Algorithmic Quant Key"

@router.post("/register", response_model=TokenResponse)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check existing email
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Get or create organization
    org = db.query(Organization).filter(Organization.name == req.org_name).first()
    if not org:
        org = Organization(id=f"org_{uuid.uuid4().hex[:8]}", name=req.org_name)
        db.add(org)
        db.commit()
        db.refresh(org)

    user = User(
        id=f"user_{uuid.uuid4().hex[:8]}",
        email=req.email,
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        role="quant_researcher",
        org_id=org.id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }

@router.post("/login", response_model=TokenResponse)
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }

@router.get("/me")
def get_me(user=Depends(get_current_user_or_api_key)):
    return user

@router.post("/apikeys")
def create_new_api_key(
    req: ApiKeyCreateRequest,
    user=Depends(require_role(["admin", "quant_researcher"])),
    db: Session = Depends(get_db)
):
    raw_key, prefix, key_hash = generate_api_key()
    api_key_obj = ApiKey(
        id=f"key_{uuid.uuid4().hex[:8]}",
        key_hash=key_hash,
        key_prefix=prefix,
        name=req.name,
        org_id=user["org_id"]
    )
    db.add(api_key_obj)
    db.commit()

    return {
        "api_key": raw_key,
        "key_prefix": prefix,
        "name": req.name,
        "message": "Store this API key securely. It will not be shown again."
    }

@router.get("/apikeys")
def list_api_keys(
    user=Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    keys = db.query(ApiKey).filter(ApiKey.org_id == user["org_id"]).all()
    return [{
        "id": k.id,
        "prefix": k.key_prefix,
        "name": k.name,
        "created_at": k.created_at
    } for k in keys]
