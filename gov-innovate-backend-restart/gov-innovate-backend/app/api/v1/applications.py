from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.application import Application
from app.models.challenge import Challenge
from app.models.user import User, UserRole
from app.schemas.application_schema import ApplicationCreate, ApplicationResponse, ApplicationUpdate

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationResponse])
def list_applications(
    challenge_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Government/evaluator users see all applications (optionally filtered by
    challenge, for the Shortlisting page). Startups see only their own.
    """
    query = db.query(Application)
    if challenge_id:
        query = query.filter(Application.challenge_id == challenge_id)
    if current_user.role == UserRole.startup:
        query = query.filter(Application.startup_id == current_user.id)
    return query.order_by(Application.created_at.desc()).all()


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.startup)),
):
    """Startup-only — used by the 'Apply Now' action on the Startup Portal."""
    challenge = db.query(Challenge).filter(Challenge.id == payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    application = Application(
        challenge_id=payload.challenge_id,
        startup_id=current_user.id,
        proposal=payload.proposal,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.government, UserRole.admin)),
):
    """Government-only — evaluators score applications but don't decide the shortlist."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)
    return application
