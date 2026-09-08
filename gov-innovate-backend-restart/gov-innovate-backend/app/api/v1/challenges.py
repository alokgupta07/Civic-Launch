from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.models.challenge import Challenge, ChallengeStatus
from app.models.user import User, UserRole
from app.schemas.challenge_schema import (
    ChallengeCreate,
    ChallengeResponse,
    ChallengeUpdate,
)

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.get("", response_model=list[ChallengeResponse])
def list_challenges(
    status_filter: ChallengeStatus | None = None,
    db: Session = Depends(get_db),
):
    """
    Public endpoint.
    Used by the Home page and Startup Portal opportunity list.
    """

    query = db.query(Challenge)

    if status_filter:
        query = query.filter(Challenge.status == status_filter)

    return query.order_by(Challenge.created_at.desc()).all()


@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
):
    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    return challenge


@router.post(
    "",
    response_model=ChallengeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_challenge(
    payload: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.government, UserRole.admin)
    ),
):
    """
    Government/Admin only.

    Creates a new challenge.
    created_by_id always comes from the authenticated user.
    """

    existing = (
        db.query(Challenge)
        .filter(
            Challenge.challenge_code == payload.challenge_code
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Challenge code already exists",
        )

    challenge_data = payload.model_dump()

    # Never accept created_by_id from the frontend.
    challenge = Challenge(
        **challenge_data,
        created_by_id=current_user.id,
    )

    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    return challenge


@router.patch(
    "/{challenge_id}",
    response_model=ChallengeResponse,
)
def update_challenge(
    challenge_id: int,
    payload: ChallengeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.government, UserRole.admin)
    ),
):
    """
    Government/Admin only.

    Updates an existing challenge/draft.
    """

    challenge = (
        db.query(Challenge)
        .filter(Challenge.id == challenge_id)
        .first()
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Prevent changing the challenge code to one already used
    # by another challenge.
    if "challenge_code" in update_data:
        new_code = update_data["challenge_code"]

        duplicate = (
            db.query(Challenge)
            .filter(
                Challenge.challenge_code == new_code,
                Challenge.id != challenge_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Challenge code already exists",
            )

    for field, value in update_data.items():
        setattr(challenge, field, value)

    db.commit()
    db.refresh(challenge)

    return challenge