"""Session authentication for real accounts; demo personas remain development-only."""
import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.student import Student

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
SESSION_COOKIE = "projectspace_session"
CSRF_COOKIE = "projectspace_csrf"
SESSION_TTL_SECONDS = 60 * 60 * 12


class RegisterBody(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_]+$")
    email: str = Field(min_length=5, max_length=150)
    password: str = Field(min_length=12, max_length=128)

    @field_validator("name", "username", "email")
    @classmethod
    def trim_values(cls, value: str) -> str:
        return value.strip()

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.lower()

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Enter a valid email address")
        return value.lower()

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not (re.search(r"[a-z]", value) and re.search(r"[A-Z]", value) and re.search(r"\d", value)):
            raise ValueError("Password must include lowercase, uppercase, and numeric characters")
        return value


class LoginBody(BaseModel):
    identifier: str = Field(min_length=3, max_length=150)
    password: str = Field(min_length=1, max_length=128)


def _secret() -> bytes:
    configured = settings.AUTH_SECRET
    if settings.ENVIRONMENT.lower() == "production" and configured == "development-only-change-this-secret":
        raise RuntimeError("AUTH_SECRET must be configured in production")
    return configured.encode("utf-8")


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _token_for(user_id: str, session_version: int) -> str:
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64(json.dumps({"sub": user_id, "ver": session_version, "exp": int(time.time()) + SESSION_TTL_SECONDS}, separators=(",", ":")).encode())
    signing_input = f"{header}.{payload}".encode("ascii")
    signature = _b64(hmac.new(_secret(), signing_input, hashlib.sha256).digest())
    return f"{header}.{payload}.{signature}"


def _claims_from_token(token: str) -> Optional[dict]:
    try:
        header, payload, signature = token.split(".")
        signing_input = f"{header}.{payload}".encode("ascii")
        expected = _b64(hmac.new(_secret(), signing_input, hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            return None
        claims = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        if int(claims["exp"]) <= int(time.time()):
            return None
        return claims
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        return None


def get_session_user(request: Request, db: Session) -> Optional[Student]:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    claims = _claims_from_token(token)
    if not claims:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")
    user = db.query(Student).filter(Student.id == str(claims["sub"]), Student.password_hash.isnot(None)).first()
    if not user or int(claims.get("ver", -1)) != (user.session_version or 0):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")
    return user


def require_csrf(request: Request) -> None:
    cookie = request.cookies.get(CSRF_COOKIE, "")
    supplied = request.headers.get("X-CSRF-Token", "")
    if not cookie or not supplied or not hmac.compare_digest(cookie, supplied):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")


def public_user(user: Student) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "bio": user.bio,
        "interests": user.interests or [],
        "created_at": user.created_at,
    }


def set_session(response: Response, user: Student) -> str:
    csrf = secrets.token_urlsafe(32)
    response.set_cookie(
        SESSION_COOKIE,
        _token_for(user.id, user.session_version or 0),
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        secure=settings.ENVIRONMENT.lower() == "production",
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        CSRF_COOKIE,
        csrf,
        max_age=SESSION_TTL_SECONDS,
        httponly=False,
        secure=settings.ENVIRONMENT.lower() == "production",
        samesite="lax",
        path="/",
    )
    return csrf


def _hash_password(password: str, salt: Optional[bytes] = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"pbkdf2_sha256$310000${_b64(salt)}${_b64(digest)}"


def _verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, rounds, salt_text, digest_text = encoded.split("$")
        if scheme != "pbkdf2_sha256" or int(rounds) != 310_000:
            return False
        salt = base64.urlsafe_b64decode(salt_text + "=" * (-len(salt_text) % 4))
        expected = base64.urlsafe_b64decode(digest_text + "=" * (-len(digest_text) % 4))
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(rounds))
        return hmac.compare_digest(candidate, expected)
    except (ValueError, TypeError):
        return False


@router.get("/csrf")
def get_csrf_token(response: Response, request: Request):
    csrf = request.cookies.get(CSRF_COOKIE) or secrets.token_urlsafe(32)
    response.set_cookie(
        CSRF_COOKIE, csrf, max_age=SESSION_TTL_SECONDS, httponly=False,
        secure=settings.ENVIRONMENT.lower() == "production", samesite="lax", path="/",
    )
    return {"csrf_token": csrf}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterBody, response: Response, db: Session = Depends(get_db)):
    if db.query(Student).filter((Student.email == body.email) | (Student.username == body.username)).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or username is already registered")
    user = Student(name=body.name, username=body.username, email=body.email, password_hash=_hash_password(body.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or username is already registered")
    db.refresh(user)
    set_session(response, user)
    return {"user": public_user(user)}


@router.post("/login")
def login(body: LoginBody, response: Response, db: Session = Depends(get_db)):
    identifier = body.identifier.strip().lower()
    user = db.query(Student).filter(
        (Student.email == identifier) | (Student.username == identifier)
    ).first()
    if not user or not user.password_hash or not _verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username/email or password")
    set_session(response, user)
    return {"user": public_user(user)}


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    require_csrf(request)
    user = get_session_user(request, db)
    if user:
        user.session_version = (user.session_version or 0) + 1
        db.commit()
    response.delete_cookie(SESSION_COOKIE, path="/", httponly=True, secure=settings.ENVIRONMENT.lower() == "production", samesite="lax")
    response.delete_cookie(CSRF_COOKIE, path="/", secure=settings.ENVIRONMENT.lower() == "production", samesite="lax")
    return {"message": "Logged out"}


@router.get("/me")
def me(request: Request, db: Session = Depends(get_db)):
    user = get_session_user(request, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required")
    return {"user": public_user(user)}


class ProfileUpdateBody(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    bio: Optional[str] = Field(default=None, max_length=500)
    interests: Optional[list[str]] = Field(default=None, max_length=30)


@router.patch("/me")
def update_me(body: ProfileUpdateBody, request: Request, db: Session = Depends(get_db)):
    require_csrf(request)
    user = get_session_user(request, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required")
    if body.name is not None:
        user.name = body.name.strip()
    if body.bio is not None:
        user.bio = body.bio.strip()
    if body.interests is not None:
        user.interests = list(dict.fromkeys(value.strip()[:60] for value in body.interests if value.strip()))
    db.commit()
    db.refresh(user)
    return {"user": public_user(user)}
