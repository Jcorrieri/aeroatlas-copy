from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_database_session
from app.models import User
from app.services.auth_service import AuthService
from app.services.trip_service import TripService


DatabaseDependency = Annotated[Session, Depends(get_database_session)]
SettingsDependency = Annotated[Settings, Depends(get_settings)]


def get_auth_service(
    database: DatabaseDependency,
    settings: SettingsDependency,
) -> AuthService:
    return AuthService(database, settings.session_days)


AuthServiceDependency = Annotated[AuthService, Depends(get_auth_service)]


def get_current_user(
    request: Request,
    service: AuthServiceDependency,
    settings: SettingsDependency,
) -> User:
    token = request.cookies.get(settings.session_cookie_name)
    user = service.get_user_for_token(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user


CurrentUserDependency = Annotated[User, Depends(get_current_user)]


def get_trip_service(database: DatabaseDependency) -> TripService:
    return TripService(database)


TripServiceDependency = Annotated[TripService, Depends(get_trip_service)]
