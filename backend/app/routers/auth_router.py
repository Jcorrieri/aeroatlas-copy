from fastapi import APIRouter, HTTPException, Request, Response, status

from app.core.config import Settings
from app.core.dependencies import (
    AuthServiceDependency,
    CurrentUserDependency,
    SettingsDependency,
)
from app.schemas import LoginRequest, RegisterRequest, UserResponse
from app.services.auth_service import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
)


router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def set_session_cookie(response: Response, token: str, settings: Settings) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        max_age=settings.session_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    response: Response,
    service: AuthServiceDependency,
    settings: SettingsDependency,
) -> UserResponse:
    try:
        user, token = service.register(
            email=str(payload.email),
            display_name=payload.display_name,
            password=payload.password,
        )
    except EmailAlreadyRegisteredError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        ) from error

    set_session_cookie(response, token, settings)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=UserResponse)
def login(
    payload: LoginRequest,
    response: Response,
    service: AuthServiceDependency,
    settings: SettingsDependency,
) -> UserResponse:
    try:
        user, token = service.login(str(payload.email), payload.password)
    except InvalidCredentialsError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        ) from error

    set_session_cookie(response, token, settings)
    return UserResponse.model_validate(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    response: Response,
    service: AuthServiceDependency,
    settings: SettingsDependency,
) -> None:
    service.logout(request.cookies.get(settings.session_cookie_name))
    response.delete_cookie(
        key=settings.session_cookie_name,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


@router.get("/me", response_model=UserResponse)
def get_me(user: CurrentUserDependency) -> UserResponse:
    return UserResponse.model_validate(user)
