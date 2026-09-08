from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.core.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.evaluation import Evaluation
from app.models.user import User, UserRole
from app.schemas.evaluation_schema import EvaluationCreate, EvaluationResponse
from app.services.scoring_service import calculate_total_score

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.get("/{application_id}", response_model=list[EvaluationResponse])
def list_evaluations_for_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application.evaluations


@router.post("", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
def submit_evaluation(
    payload: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.government, UserRole.evaluator, UserRole.admin)),
):
    """Evaluator-only — powers the Evaluator Dashboard's 'Submit Evaluation' action."""
    application = db.query(Application).filter(Application.id == payload.application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    total = calculate_total_score(payload.scores)
    evaluation = Evaluation(
        application_id=payload.application_id,
        evaluator_id=current_user.id,
        scores=payload.scores,
        total_score=total,
        remarks=payload.remarks,
    )
    db.add(evaluation)

    application.status = ApplicationStatus.UNDER_REVIEW
    db.commit()
    db.refresh(evaluation)
    return evaluation
