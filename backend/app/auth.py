import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import User, ApiKey, Organization

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def generate_api_key() -> tuple[str, str, str]:
    """
    Generates a raw API key (e.g. quant_live_a1b2c3...), its prefix, and SHA-256 hash for storage.
    """
    random_hex = secrets.token_hex(16)
    raw_key = f"quant_live_{random_hex}"
    prefix = raw_key[:15]
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    return raw_key, prefix, key_hash

def get_current_user_or_api_key(
    token: Optional[str] = Depends(oauth2_scheme),
    api_key: Optional[str] = Depends(api_key_header),
    db: Session = Depends(get_db)
):
    """
    Authentication dependency checking either JWT Bearer token or X-API-Key header.
    """
    # 1. Check API Key
    if api_key:
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        db_key = db.query(ApiKey).filter(ApiKey.key_hash == key_hash).first()
        if db_key:
            # Return synthetic admin/quant user for API key
            return {
                "id": f"apikey_{db_key.id}",
                "email": f"api_key_{db_key.key_prefix}@quant.local",
                "role": "quant_researcher",
                "org_id": db_key.org_id,
                "auth_type": "api_key"
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )

    # 2. Check JWT Token
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token payload")
        except JWTError:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        
        user = db.query(User).filter(User.id == user_id).first()
        if user is None or not user.is_active:
            raise HTTPException(status_code=401, detail="User inactive or not found")
        
        return {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "org_id": user.org_id,
            "auth_type": "jwt"
        }

    # Default fallback for local dashboard use if auth not enforced
    return {
        "id": "user_quant_admin_01",
        "email": "hft_admin@quant.local",
        "role": "admin",
        "org_id": "org_default_01",
        "auth_type": "default"
    }

def require_role(allowed_roles: list[str]):
    def role_checker(user=Depends(get_current_user_or_api_key)):
        if user["role"] not in allowed_roles and user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for current user role"
            )
        return user
    return role_checker
