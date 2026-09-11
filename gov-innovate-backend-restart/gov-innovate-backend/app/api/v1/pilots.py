from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.models.application import Application
from app.models.pilot import Pilot
from app.models.user import User, UserRole
from app.schemas.pilot_schema import (
    PilotAnalyticsResponse,
    PilotCreate,
    PilotUpdate,
    PilotResponse,
)

router = APIRouter(prefix="/pilots", tags=["pilots"])


@router.get("", response_model=list[PilotResponse])
def list_pilots(db: Session = Depends(get_db)):
    """Public — powers the Pilot Project Monitoring page."""
    return db.query(Pilot).order_by(Pilot.created_at.desc()).all()


@router.post("", response_model=PilotResponse, status_code=status.HTTP_201_CREATED)
def create_pilot(
    payload: PilotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.government, UserRole.admin)),
):
    """Government-only — starts a pilot for a shortlisted application."""
    application = db.query(Application).filter(Application.id == payload.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    existing = db.query(Pilot).filter(Pilot.application_id == payload.application_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="A pilot already exists for this application")

    pilot = Pilot(
        application_id=payload.application_id,
        milestones=[m.model_dump() for m in payload.milestones],
        status=payload.status,
        progress=payload.progress,
    )
    db.add(pilot)
    db.commit()
    db.refresh(pilot)
    return pilot
@router.patch("/{pilot_id}", response_model=PilotResponse)
def update_pilot(
    pilot_id: int,
    payload: PilotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.government, UserRole.admin)
    ),
):
    pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()

    if not pilot:
        raise HTTPException(
            status_code=404,
            detail="Pilot not found"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pilot, field, value)

    db.commit()
    db.refresh(pilot)

    return pilot

@router.get("/{pilot_id}/analytics", response_model=PilotAnalyticsResponse)
def pilot_analytics(pilot_id: int, db: Session = Depends(get_db)):
    """Powers the progress ring / milestone counters on the Pilot Monitoring page."""
    pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
    if not pilot:
        raise HTTPException(status_code=404, detail="Pilot not found")

    completed = sum(1 for m in pilot.milestones if m.get("done"))
    return PilotAnalyticsResponse(
        application_id=pilot.application_id,
        status=pilot.status,
        progress=pilot.progress,
        completed_milestones=completed,
        total_milestones=len(pilot.milestones),
    )
