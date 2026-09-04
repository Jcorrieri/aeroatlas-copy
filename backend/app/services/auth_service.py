import hashlib
import secrets
from datetime import timedelta

from pwdlib import PasswordHash
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import AuthSession, User, utc_now


password_hash = PasswordHash.recommended()
dummy_password_hash = password_hash.hash("aeroatlas-dummy-password")


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


def normalize_email(email: str) -> str:
    return email.strip().casefold()


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:
    def __init__(self, database: Session, session_days: int) -> None:
        self.database = database
        self.session_days = session_days

    def register(self, email: str, display_name: str, password: str) -> tuple[User, str]:
        normalized_email = normalize_email(email)
        normalized_display_name = display_name.strip()
        if not normalized_display_name:
            raise ValueError("Display name cannot be blank")
        existing_user = self.database.scalar(
            select(User).where(User.email == normalized_email)
        )
        if existing_user is not None:
            raise EmailAlreadyRegisteredError

        user = User(
            email=normalized_email,
            display_name=normalized_display_name,
            password_hash=password_hash.hash(password),
        )
        self.database.add(user)

        try:
            self.database.flush()
            token = self._create_session(user)
            self.database.commit()
        except IntegrityError as error:
            self.database.rollback()
            raise EmailAlreadyRegisteredError from error

        self.database.refresh(user)
        return user, token

    def login(self, email: str, password: str) -> tuple[User, str]:
        user = self.database.scalar(
            select(User).where(User.email == normalize_email(email))
        )
        stored_hash = user.password_hash if user is not None else dummy_password_hash
        password_is_valid = password_hash.verify(password, stored_hash)
        if user is None or not password_is_valid:
            raise InvalidCredentialsError

        token = self._create_session(user)
        self.database.commit()
        return user, token

    def get_user_for_token(self, token: str | None) -> User | None:
        if not token:
            return None

        statement = (
            select(User)
            .join(AuthSession, AuthSession.user_id == User.id)
            .where(
                AuthSession.token_hash == hash_session_token(token),
                AuthSession.expires_at > utc_now(),
            )
        )
        return self.database.scalar(statement)

    def logout(self, token: str | None) -> None:
        if token:
            self.database.execute(
                delete(AuthSession).where(
                    AuthSession.token_hash == hash_session_token(token)
                )
            )
            self.database.commit()

    def _create_session(self, user: User) -> str:
        token = secrets.token_urlsafe(32)
        self.database.add(
            AuthSession(
                user_id=user.id,
                token_hash=hash_session_token(token),
                expires_at=utc_now() + timedelta(days=self.session_days),
            )
        )
        return token
